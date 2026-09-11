import React, { useState, useEffect, useCallback, useRef } from "react";
import "./WeatherCompare.css";
import {
  FaExchangeAlt,
  FaSearch,
  FaTimes,
  FaLocationArrow,
  FaTemperatureHigh,
  FaTemperatureLow,
  FaWind,
  FaSun,
  FaMoon,
  FaCheckCircle,
} from "react-icons/fa";
import { MdOutlineWaterDrop, MdCompress, MdLocationOn } from "react-icons/md";
import { BiHappy } from "react-icons/bi";
import WeatherIcon from "./WeatherIcon";
import {
  getFormattedWeatherData,
  getWeatherByCoords,
  searchCitySuggestions,
} from "../weatherService";

// Popular city matchup presets for quick 1-click comparison
const POPULAR_MATCHUPS = [
  { city1: "London", city2: "New York", label: "London vs New York" },
  { city1: "Tokyo", city2: "Paris", label: "Tokyo vs Paris" },
  { city1: "Mumbai", city2: "Dubai", label: "Mumbai vs Dubai" },
  { city1: "Sydney", city2: "Singapore", label: "Sydney vs Singapore" },
  { city1: "San Francisco", city2: "Toronto", label: "SF vs Toronto" },
];

// Quick city suggestions for individual city inputs
const QUICK_CITIES = [
  "London",
  "Tokyo",
  "New York",
  "Paris",
  "Mumbai",
  "Dubai",
  "Sydney",
  "Toronto",
];

function CitySearchInput({
  idPrefix,
  label,
  value,
  onChange,
  onSearch,
  onUseLocation,
  isLocating,
  placeholder,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const trimmed = (value || "").trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      setIsSearching(false);
      setSelectedIndex(-1);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchCitySuggestions(trimmed);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
        setSelectedIndex(-1);
      } catch (err) {
        console.error("Suggestions error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        onSearch(value);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        const sel = suggestions[selectedIndex];
        onChange(sel.name);
        setShowDropdown(false);
        onSearch(sel.queryTerm || sel.name);
      } else {
        setShowDropdown(false);
        onSearch(value);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleSelectSuggestion = (item) => {
    onChange(item.name);
    setShowDropdown(false);
    onSearch(item.queryTerm || item.name);
  };

  return (
    <div className="compare-input-group" ref={containerRef} id={`${idPrefix}-group`}>
      <label htmlFor={`${idPrefix}-input`} className="compare-input-label">
        {label}
      </label>
      <div className="compare-input-wrapper">
        <FaSearch className="compare-input-icon search-icon" aria-hidden="true" />
        <input
          id={`${idPrefix}-input`}
          type="text"
          className="compare-input-field"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          placeholder={placeholder || "Enter city..."}
          autoComplete="off"
        />

        {value && (
          <button
            id={`${idPrefix}-clear-btn`}
            type="button"
            className="compare-inline-btn clear-btn"
            onClick={() => {
              onChange("");
              setSuggestions([]);
              setShowDropdown(false);
            }}
            title="Clear city"
            aria-label="Clear city"
          >
            <FaTimes />
          </button>
        )}

        <button
          id={`${idPrefix}-loc-btn`}
          type="button"
          className={`compare-inline-btn loc-btn ${isLocating ? "locating" : ""}`}
          onClick={onUseLocation}
          title="Use My Location"
          aria-label="Use My Location"
          disabled={isLocating}
        >
          <FaLocationArrow className={isLocating ? "pulse-anim" : ""} />
        </button>

        <button
          id={`${idPrefix}-submit-btn`}
          type="button"
          className="compare-search-action-btn"
          onClick={() => {
            setShowDropdown(false);
            onSearch(value);
          }}
          title="Search city"
        >
          Search
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <ul id={`${idPrefix}-suggestions-list`} className="compare-suggestions-dropdown" role="listbox">
          {suggestions.map((item, idx) => (
            <li
              key={`${item.name}-${item.country}-${idx}`}
              className={`compare-suggestion-item ${idx === selectedIndex ? "selected" : ""}`}
              onClick={() => handleSelectSuggestion(item)}
              role="option"
              aria-selected={idx === selectedIndex}
            >
              <div className="suggestion-main">
                <span className="suggestion-name">{item.name}</span>
                {item.state && <span className="suggestion-state">, {item.state}</span>}
              </div>
              <span className="suggestion-country">{item.country}</span>
            </li>
          ))}
        </ul>
      )}

      {isSearching && (
        <div className="compare-searching-indicator">
          <span>Finding cities...</span>
        </div>
      )}
    </div>
  );
}

function WeatherCompare({
  initialCity1 = "Jamshedpur",
  initialCity2 = "London",
  units = "metric",
  onUnitToggle,
  theme = "dark",
  onThemeToggle,
  onBackToSingle,
}) {
  const [city1Input, setCity1Input] = useState(initialCity1);
  const [city2Input, setCity2Input] = useState(initialCity2);

  const [weather1, setWeather1] = useState(null);
  const [weather2, setWeather2] = useState(null);

  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const [locating1, setLocating1] = useState(false);
  const [locating2, setLocating2] = useState(false);

  const [error1, setError1] = useState(null);
  const [error2, setError2] = useState(null);

  const tempUnit = units === "metric" ? "°C" : "°F";
  const speedUnit = units === "metric" ? "m/s" : "mph";

  // Fetch weather for city 1
  const fetchCity1 = useCallback(
    async (cityName) => {
      const trimmed = (cityName || "").trim();
      if (!trimmed) return;
      setLoading1(true);
      setError1(null);
      try {
        const res = await getFormattedWeatherData(trimmed, units);
        if (res.success && res.data) {
          setWeather1(res.data);
          setCity1Input(res.data.name);
        } else {
          setError1(res.error || `City "${trimmed}" could not be found.`);
        }
      } catch (err) {
        setError1("Failed to fetch weather data for City 1.");
      } finally {
        setLoading1(false);
      }
    },
    [units]
  );

  // Fetch weather for city 2
  const fetchCity2 = useCallback(
    async (cityName) => {
      const trimmed = (cityName || "").trim();
      if (!trimmed) return;
      setLoading2(true);
      setError2(null);
      try {
        const res = await getFormattedWeatherData(trimmed, units);
        if (res.success && res.data) {
          setWeather2(res.data);
          setCity2Input(res.data.name);
        } else {
          setError2(res.error || `City "${trimmed}" could not be found.`);
        }
      } catch (err) {
        setError2("Failed to fetch weather data for City 2.");
      } finally {
        setLoading2(false);
      }
    },
    [units]
  );

  // Initial load
  useEffect(() => {
    fetchCity1(initialCity1);
    fetchCity2(initialCity2);
  }, [fetchCity1, fetchCity2, initialCity1, initialCity2]);

  // Re-fetch when units change
  useEffect(() => {
    if (weather1?.name) {
      fetchCity1(weather1.name);
    }
    if (weather2?.name) {
      fetchCity2(weather2.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units]);

  // Geolocation for City 1
  const handleUseLocation1 = () => {
    if (!navigator.geolocation) {
      setError1("Geolocation is not supported by your browser.");
      return;
    }
    setLocating1(true);
    setError1(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await getWeatherByCoords(
            pos.coords.latitude,
            pos.coords.longitude,
            units
          );
          if (res.success && res.data) {
            setWeather1(res.data);
            setCity1Input(res.data.name);
          } else {
            setError1(res.error || "Could not retrieve weather for your coordinates.");
          }
        } catch (err) {
          setError1("Error fetching weather for coordinates.");
        } finally {
          setLocating1(false);
        }
      },
      (err) => {
        setLocating1(false);
        setError1("Geolocation permission denied or timed out.");
      },
      { timeout: 10000 }
    );
  };

  // Geolocation for City 2
  const handleUseLocation2 = () => {
    if (!navigator.geolocation) {
      setError2("Geolocation is not supported by your browser.");
      return;
    }
    setLocating2(true);
    setError2(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await getWeatherByCoords(
            pos.coords.latitude,
            pos.coords.longitude,
            units
          );
          if (res.success && res.data) {
            setWeather2(res.data);
            setCity2Input(res.data.name);
          } else {
            setError2(res.error || "Could not retrieve weather for your coordinates.");
          }
        } catch (err) {
          setError2("Error fetching weather for coordinates.");
        } finally {
          setLocating2(false);
        }
      },
      (err) => {
        setLocating2(false);
        setError2("Geolocation permission denied or timed out.");
      },
      { timeout: 10000 }
    );
  };

  // Swap City 1 and City 2
  const handleSwapCities = () => {
    const tempName = city1Input;
    const tempWeather = weather1;
    const tempErr = error1;

    setCity1Input(city2Input);
    setWeather1(weather2);
    setError1(error2);

    setCity2Input(tempName);
    setWeather2(tempWeather);
    setError2(tempErr);
  };

  // Select a preset matchup
  const handleSelectMatchup = (m) => {
    setCity1Input(m.city1);
    setCity2Input(m.city2);
    fetchCity1(m.city1);
    fetchCity2(m.city2);
  };

  // Comparison metrics calculations
  const tempDiff =
    weather1 && weather2 && weather1.temp !== undefined && weather2.temp !== undefined
      ? Math.round(weather1.temp - weather2.temp)
      : null;

  const feelsDiff =
    weather1 &&
    weather2 &&
    weather1.feels_like !== undefined &&
    weather2.feels_like !== undefined
      ? Math.round(weather1.feels_like - weather2.feels_like)
      : null;

  const humidityDiff =
    weather1 &&
    weather2 &&
    weather1.humidity !== undefined &&
    weather2.humidity !== undefined
      ? Math.round(weather1.humidity - weather2.humidity)
      : null;

  const windDiff =
    weather1 && weather2 && weather1.speed !== undefined && weather2.speed !== undefined
      ? Math.round((weather1.speed - weather2.speed) * 10) / 10
      : null;

  // Derive takeaway narrative
  const getComparisonTakeaway = () => {
    if (!weather1 || !weather2) return null;

    let tempText = "";
    if (tempDiff === 0) {
      tempText = `Both ${weather1.name} and ${weather2.name} share the exact same temperature of ${Math.round(weather1.temp)}${tempUnit}.`;
    } else if (tempDiff > 0) {
      tempText = `${weather1.name} is ${Math.abs(tempDiff)}${tempUnit} warmer than ${weather2.name}.`;
    } else {
      tempText = `${weather2.name} is ${Math.abs(tempDiff)}${tempUnit} warmer than ${weather1.name}.`;
    }

    let conditionText = "";
    const cond1 = (weather1.condition || "").toLowerCase();
    const cond2 = (weather2.condition || "").toLowerCase();

    if (cond1 === cond2) {
      conditionText = `Both cities are currently experiencing ${cond1} conditions.`;
    } else {
      conditionText = `${weather1.name} has ${weather1.description.toLowerCase()}, while ${weather2.name} is observing ${weather2.description.toLowerCase()}.`;
    }

    return { tempText, conditionText };
  };

  const takeaway = getComparisonTakeaway();

  return (
    <section id="side-by-side-weather-compare" className="weather-compare-section">
      {/* Top Header & View Controls */}
      <header className="compare-header">
        <div className="compare-title-area">
          <div className="compare-badge">Side-by-Side View</div>
          <h2 id="compare-main-title" className="compare-title">
            Weather Comparison
          </h2>
          <p className="compare-subtitle">
            Compare real-time temperatures, conditions, and meteorology between any two cities
          </p>
        </div>

        <div className="compare-header-controls">
          {onBackToSingle && (
            <button
              id="back-to-single-btn"
              type="button"
              className="compare-nav-btn"
              onClick={onBackToSingle}
              title="Return to Single City Forecast"
            >
              ← Single City View
            </button>
          )}

          {onUnitToggle && (
            <button
              id="compare-unit-toggle-btn"
              type="button"
              className="compare-ctrl-btn unit-btn"
              onClick={onUnitToggle}
              title={`Switch to ${units === "metric" ? "Fahrenheit" : "Celsius"}`}
            >
              {units === "metric" ? "°F" : "°C"}
            </button>
          )}

          {onThemeToggle && (
            <button
              id="compare-theme-toggle-btn"
              type="button"
              className="compare-ctrl-btn theme-btn"
              onClick={onThemeToggle}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
            >
              {theme === "dark" ? <FaSun /> : <FaMoon />}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          )}
        </div>
      </header>

      {/* Preset Matchups Row */}
      <div className="compare-presets-bar">
        <span className="presets-label">Popular Matchups:</span>
        <div className="presets-scroll">
          {POPULAR_MATCHUPS.map((m) => (
            <button
              key={m.label}
              type="button"
              className="preset-chip-btn"
              onClick={() => handleSelectMatchup(m)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* City Selectors & Swap Row */}
      <div className="compare-selectors-grid">
        {/* City 1 Input */}
        <CitySearchInput
          idPrefix="city1"
          label="First City (Left)"
          value={city1Input}
          onChange={setCity1Input}
          onSearch={fetchCity1}
          onUseLocation={handleUseLocation1}
          isLocating={locating1}
          placeholder="e.g. London, Tokyo, New York"
        />

        {/* Center Swap Action */}
        <div className="compare-swap-wrapper">
          <button
            id="compare-swap-cities-btn"
            type="button"
            className="compare-swap-btn"
            onClick={handleSwapCities}
            title="Swap City 1 and City 2"
            aria-label="Swap City 1 and City 2"
          >
            <FaExchangeAlt className="swap-icon" />
            <span className="swap-label">Swap</span>
          </button>
        </div>

        {/* City 2 Input */}
        <CitySearchInput
          idPrefix="city2"
          label="Second City (Right)"
          value={city2Input}
          onChange={setCity2Input}
          onSearch={fetchCity2}
          onUseLocation={handleUseLocation2}
          isLocating={locating2}
          placeholder="e.g. Paris, Sydney, Mumbai"
        />
      </div>

      {/* Quick City Suggestion Chips for Fast Switching */}
      <div className="quick-cities-row">
        <span className="quick-cities-tag">Quick Pick:</span>
        <div className="quick-cities-list">
          {QUICK_CITIES.map((c) => (
            <div key={c} className="quick-city-pair">
              <button
                type="button"
                className="quick-city-btn btn-c1"
                onClick={() => {
                  setCity1Input(c);
                  fetchCity1(c);
                }}
                title={`Set City 1 to ${c}`}
              >
                1: {c}
              </button>
              <button
                type="button"
                className="quick-city-btn btn-c2"
                onClick={() => {
                  setCity2Input(c);
                  fetchCity2(c);
                }}
                title={`Set City 2 to ${c}`}
              >
                2: {c}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Takeaway Hero Banner */}
      {takeaway && !error1 && !error2 && (
        <div id="compare-takeaway-banner" className="compare-takeaway-card">
          <div className="takeaway-badge">
            <FaCheckCircle className="takeaway-check-icon" />
            <span>Comparison Summary</span>
          </div>
          <div className="takeaway-content">
            <h3 className="takeaway-headline">{takeaway.tempText}</h3>
            <p className="takeaway-description">{takeaway.conditionText}</p>
          </div>
          {tempDiff !== null && (
            <div
              className={`takeaway-diff-pill ${
                tempDiff > 0 ? "c1-warmer" : tempDiff < 0 ? "c2-warmer" : "neutral"
              }`}
            >
              {tempDiff === 0
                ? "Identical Temp"
                : `${Math.abs(tempDiff)}${tempUnit} ${tempDiff > 0 ? `${weather1.name} warmer` : `${weather2.name} warmer`}`}
            </div>
          )}
        </div>
      )}

      {/* Side-by-Side Weather Cards */}
      <div className="compare-cards-container">
        {/* City 1 Card */}
        <div
          id="compare-card-city1"
          className={`compare-city-card ${loading1 ? "is-loading" : ""}`}
        >
          <div className="city-card-tag">City 1</div>

          {loading1 && (
            <div className="city-card-loading">
              <div className="compare-spinner" />
              <p>Fetching weather for {city1Input || "City 1"}...</p>
            </div>
          )}

          {error1 && !loading1 && (
            <div className="city-card-error">
              <h4>Location Error</h4>
              <p>{error1}</p>
              <button
                type="button"
                className="city-retry-btn"
                onClick={() => fetchCity1(city1Input)}
              >
                Retry
              </button>
            </div>
          )}

          {weather1 && !loading1 && !error1 && (
            <div className="city-card-content">
              <div className="city-card-header">
                <div className="city-name-group">
                  <MdLocationOn className="city-pin" />
                  <h3 className="compare-city-heading">
                    {weather1.name}
                    {weather1.country ? `, ${weather1.country}` : ""}
                  </h3>
                </div>
                <span className="compare-condition-pill">{weather1.condition}</span>
              </div>

              {/* Main Temperature & Weather Icon */}
              <div className="city-card-hero">
                <div className="compare-temp-block">
                  <div className="compare-temp-row">
                    <span className="compare-temp-number">
                      {Math.round(weather1.temp)}
                    </span>
                    <span className="compare-temp-unit">{tempUnit}</span>
                  </div>
                  <div className="compare-feels-like">
                    Feels like{" "}
                    <strong>
                      {Math.round(weather1.feels_like)}
                      {tempUnit}
                    </strong>
                  </div>
                  <div className="compare-high-low">
                    <span>
                      <FaTemperatureLow className="icon-low" /> {Math.round(weather1.temp_min)}
                      {tempUnit}
                    </span>
                    <span className="sep">/</span>
                    <span>
                      <FaTemperatureHigh className="icon-high" /> {Math.round(weather1.temp_max)}
                      {tempUnit}
                    </span>
                  </div>
                </div>

                <div className="compare-icon-block">
                  <div className="compare-icon-wrap">
                    <WeatherIcon
                      condition={weather1.condition}
                      conditionId={weather1.conditionId}
                      iconCode={weather1.iconCode}
                      size="lg"
                    />
                  </div>
                  <span className="compare-desc-text">{weather1.description}</span>
                </div>
              </div>

              {/* Meteorological Metric Grid */}
              <div className="compare-metrics-grid">
                <div className="metric-chip">
                  <div className="metric-chip-label">
                    <MdOutlineWaterDrop className="chip-icon humidity-icon" />
                    <span>Humidity</span>
                  </div>
                  <span className="metric-chip-val">{weather1.humidity}%</span>
                </div>

                <div className="metric-chip">
                  <div className="metric-chip-label">
                    <FaWind className="chip-icon wind-icon" />
                    <span>Wind</span>
                  </div>
                  <span className="metric-chip-val">
                    {Math.round(weather1.speed)} {speedUnit}
                  </span>
                </div>

                <div className="metric-chip">
                  <div className="metric-chip-label">
                    <MdCompress className="chip-icon pressure-icon" />
                    <span>Pressure</span>
                  </div>
                  <span className="metric-chip-val">{weather1.pressure} hPa</span>
                </div>

                <div className="metric-chip">
                  <div className="metric-chip-label">
                    <BiHappy className="chip-icon condition-icon" />
                    <span>Comfort</span>
                  </div>
                  <span className="metric-chip-val">
                    {weather1.humidity < 30
                      ? "Dry"
                      : weather1.humidity <= 60
                      ? "Comfortable"
                      : "Humid"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* City 2 Card */}
        <div
          id="compare-card-city2"
          className={`compare-city-card ${loading2 ? "is-loading" : ""}`}
        >
          <div className="city-card-tag">City 2</div>

          {loading2 && (
            <div className="city-card-loading">
              <div className="compare-spinner" />
              <p>Fetching weather for {city2Input || "City 2"}...</p>
            </div>
          )}

          {error2 && !loading2 && (
            <div className="city-card-error">
              <h4>Location Error</h4>
              <p>{error2}</p>
              <button
                type="button"
                className="city-retry-btn"
                onClick={() => fetchCity2(city2Input)}
              >
                Retry
              </button>
            </div>
          )}

          {weather2 && !loading2 && !error2 && (
            <div className="city-card-content">
              <div className="city-card-header">
                <div className="city-name-group">
                  <MdLocationOn className="city-pin" />
                  <h3 className="compare-city-heading">
                    {weather2.name}
                    {weather2.country ? `, ${weather2.country}` : ""}
                  </h3>
                </div>
                <span className="compare-condition-pill">{weather2.condition}</span>
              </div>

              {/* Main Temperature & Weather Icon */}
              <div className="city-card-hero">
                <div className="compare-temp-block">
                  <div className="compare-temp-row">
                    <span className="compare-temp-number">
                      {Math.round(weather2.temp)}
                    </span>
                    <span className="compare-temp-unit">{tempUnit}</span>
                  </div>
                  <div className="compare-feels-like">
                    Feels like{" "}
                    <strong>
                      {Math.round(weather2.feels_like)}
                      {tempUnit}
                    </strong>
                  </div>
                  <div className="compare-high-low">
                    <span>
                      <FaTemperatureLow className="icon-low" /> {Math.round(weather2.temp_min)}
                      {tempUnit}
                    </span>
                    <span className="sep">/</span>
                    <span>
                      <FaTemperatureHigh className="icon-high" /> {Math.round(weather2.temp_max)}
                      {tempUnit}
                    </span>
                  </div>
                </div>

                <div className="compare-icon-block">
                  <div className="compare-icon-wrap">
                    <WeatherIcon
                      condition={weather2.condition}
                      conditionId={weather2.conditionId}
                      iconCode={weather2.iconCode}
                      size="lg"
                    />
                  </div>
                  <span className="compare-desc-text">{weather2.description}</span>
                </div>
              </div>

              {/* Meteorological Metric Grid */}
              <div className="compare-metrics-grid">
                <div className="metric-chip">
                  <div className="metric-chip-label">
                    <MdOutlineWaterDrop className="chip-icon humidity-icon" />
                    <span>Humidity</span>
                  </div>
                  <span className="metric-chip-val">{weather2.humidity}%</span>
                </div>

                <div className="metric-chip">
                  <div className="metric-chip-label">
                    <FaWind className="chip-icon wind-icon" />
                    <span>Wind</span>
                  </div>
                  <span className="metric-chip-val">
                    {Math.round(weather2.speed)} {speedUnit}
                  </span>
                </div>

                <div className="metric-chip">
                  <div className="metric-chip-label">
                    <MdCompress className="chip-icon pressure-icon" />
                    <span>Pressure</span>
                  </div>
                  <span className="metric-chip-val">{weather2.pressure} hPa</span>
                </div>

                <div className="metric-chip">
                  <div className="metric-chip-label">
                    <BiHappy className="chip-icon condition-icon" />
                    <span>Comfort</span>
                  </div>
                  <span className="metric-chip-val">
                    {weather2.humidity < 30
                      ? "Dry"
                      : weather2.humidity <= 60
                      ? "Comfortable"
                      : "Humid"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Head-to-Head Metric Comparison Table & Bars */}
      {weather1 && weather2 && !error1 && !error2 && (
        <div id="head-to-head-breakdown" className="head-to-head-card">
          <div className="head-to-head-header">
            <h3 className="h2h-title">Head-to-Head Metric Breakdown</h3>
            <span className="h2h-subtitle">
              Comparing {weather1.name} vs {weather2.name}
            </span>
          </div>

          <div className="h2h-rows-container">
            {/* Temperature Row */}
            <div className="h2h-row">
              <div className="h2h-city1-val">
                <span className="h2h-val-text">
                  {Math.round(weather1.temp)}
                  {tempUnit}
                </span>
                <span className="h2h-city-tag">{weather1.name}</span>
              </div>

              <div className="h2h-center-meter">
                <div className="h2h-meter-label">Temperature</div>
                <div className="h2h-dual-bar">
                  <div
                    className="dual-fill fill-c1"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          (units === "metric"
                            ? (weather1.temp + 20) / 70
                            : (weather1.temp - 0) / 120) * 100,
                          5
                        ),
                        95
                      )}%`,
                    }}
                  />
                  <div
                    className="dual-fill fill-c2"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          (units === "metric"
                            ? (weather2.temp + 20) / 70
                            : (weather2.temp - 0) / 120) * 100,
                          5
                        ),
                        95
                      )}%`,
                    }}
                  />
                </div>
                <span className="h2h-delta-text">
                  {tempDiff === 0
                    ? "Tied"
                    : tempDiff > 0
                    ? `${weather1.name} is +${Math.abs(tempDiff)}${tempUnit}`
                    : `${weather2.name} is +${Math.abs(tempDiff)}${tempUnit}`}
                </span>
              </div>

              <div className="h2h-city2-val">
                <span className="h2h-val-text">
                  {Math.round(weather2.temp)}
                  {tempUnit}
                </span>
                <span className="h2h-city-tag">{weather2.name}</span>
              </div>
            </div>

            {/* Feels Like Row */}
            <div className="h2h-row">
              <div className="h2h-city1-val">
                <span className="h2h-val-text">
                  {Math.round(weather1.feels_like)}
                  {tempUnit}
                </span>
                <span className="h2h-city-tag">{weather1.name}</span>
              </div>

              <div className="h2h-center-meter">
                <div className="h2h-meter-label">Feels Like</div>
                <span className="h2h-delta-text">
                  {feelsDiff === 0
                    ? "Tied"
                    : feelsDiff > 0
                    ? `${weather1.name} feels +${Math.abs(feelsDiff)}${tempUnit} warmer`
                    : `${weather2.name} feels +${Math.abs(feelsDiff)}${tempUnit} warmer`}
                </span>
              </div>

              <div className="h2h-city2-val">
                <span className="h2h-val-text">
                  {Math.round(weather2.feels_like)}
                  {tempUnit}
                </span>
                <span className="h2h-city-tag">{weather2.name}</span>
              </div>
            </div>

            {/* Relative Humidity Row */}
            <div className="h2h-row">
              <div className="h2h-city1-val">
                <span className="h2h-val-text">{weather1.humidity}%</span>
                <span className="h2h-city-tag">{weather1.name}</span>
              </div>

              <div className="h2h-center-meter">
                <div className="h2h-meter-label">Relative Humidity</div>
                <div className="h2h-dual-bar">
                  <div
                    className="dual-fill fill-c1"
                    style={{ width: `${Math.min(Math.max(weather1.humidity, 5), 100)}%` }}
                  />
                  <div
                    className="dual-fill fill-c2"
                    style={{ width: `${Math.min(Math.max(weather2.humidity, 5), 100)}%` }}
                  />
                </div>
                <span className="h2h-delta-text">
                  {humidityDiff === 0
                    ? "Equal humidity"
                    : humidityDiff > 0
                    ? `${weather1.name} is +${Math.abs(humidityDiff)}% more humid`
                    : `${weather2.name} is +${Math.abs(humidityDiff)}% more humid`}
                </span>
              </div>

              <div className="h2h-city2-val">
                <span className="h2h-val-text">{weather2.humidity}%</span>
                <span className="h2h-city-tag">{weather2.name}</span>
              </div>
            </div>

            {/* Wind Speed Row */}
            <div className="h2h-row">
              <div className="h2h-city1-val">
                <span className="h2h-val-text">
                  {Math.round(weather1.speed)} {speedUnit}
                </span>
                <span className="h2h-city-tag">{weather1.name}</span>
              </div>

              <div className="h2h-center-meter">
                <div className="h2h-meter-label">Wind Speed</div>
                <div className="h2h-dual-bar">
                  <div
                    className="dual-fill fill-c1"
                    style={{
                      width: `${Math.min(Math.max((weather1.speed / 20) * 100, 5), 100)}%`,
                    }}
                  />
                  <div
                    className="dual-fill fill-c2"
                    style={{
                      width: `${Math.min(Math.max((weather2.speed / 20) * 100, 5), 100)}%`,
                    }}
                  />
                </div>
                <span className="h2h-delta-text">
                  {windDiff === 0
                    ? "Same wind speed"
                    : windDiff > 0
                    ? `${weather1.name} windier (+${Math.abs(windDiff)} ${speedUnit})`
                    : `${weather2.name} windier (+${Math.abs(windDiff)} ${speedUnit})`}
                </span>
              </div>

              <div className="h2h-city2-val">
                <span className="h2h-val-text">
                  {Math.round(weather2.speed)} {speedUnit}
                </span>
                <span className="h2h-city-tag">{weather2.name}</span>
              </div>
            </div>

            {/* Atmospheric Condition Summary */}
            <div className="h2h-row condition-row">
              <div className="h2h-city1-val">
                <span className="h2h-condition-badge">{weather1.condition}</span>
                <span className="h2h-desc">{weather1.description}</span>
              </div>

              <div className="h2h-center-meter">
                <div className="h2h-meter-label">Weather Condition</div>
                <span className="h2h-delta-text">
                  {weather1.condition.toLowerCase() === weather2.condition.toLowerCase()
                    ? "Identical weather condition"
                    : `${weather1.condition} vs ${weather2.condition}`}
                </span>
              </div>

              <div className="h2h-city2-val">
                <span className="h2h-condition-badge">{weather2.condition}</span>
                <span className="h2h-desc">{weather2.description}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default WeatherCompare;
