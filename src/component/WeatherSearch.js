import React, { useState, useEffect, useRef } from "react";
import "./WeatherSearch.css";
import {
  FaSearch,
  FaTimes,
  FaMapMarkerAlt,
  FaLocationArrow,
  FaSun,
  FaMoon,
  FaExchangeAlt,
} from "react-icons/fa";
import { searchCitySuggestions } from "../weatherService";

function WeatherSearch({
  onSearch,
  onUseLocation,
  isLocating = false,
  units,
  onUnitToggle,
  theme = "dark",
  onThemeToggle,
  onOpenCompare,
  isLoading,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Debounced autocomplete search as user types
  useEffect(() => {
    const trimmed = searchTerm.trim();

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      setIsSearchingSuggestions(false);
      setSelectedIndex(-1);
      return;
    }

    setIsSearchingSuggestions(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchCitySuggestions(trimmed);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
        setSelectedIndex(-1);
      } catch (err) {
        console.error("Autocomplete search error:", err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 220);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // Click outside to dismiss suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    // If an item in the suggestions is active via keyboard, select that
    if (showDropdown && selectedIndex >= 0 && selectedIndex < suggestions.length) {
      handleSelectSuggestion(suggestions[selectedIndex]);
      return;
    }

    const trimmed = searchTerm.trim();
    if (trimmed) {
      setShowDropdown(false);
      onSearch(trimmed);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  const handleSelectSuggestion = (item) => {
    const cityQuery = item.queryTerm || item.name;
    setSearchTerm(item.name);
    setShowDropdown(false);
    setSelectedIndex(-1);
    onSearch(cityQuery);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setSuggestions([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div id="weather-search-container" className="weather-search-container" ref={containerRef}>
      <form id="weather-search-form" className="weather-search-form" onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <FaSearch className="search-field-icon" aria-hidden="true" />
          <input
            id="weather-search-input"
            ref={inputRef}
            type="text"
            role="combobox"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search city name (e.g., Paris, Tokyo, London)..."
            aria-label="City search input"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            aria-controls="city-autocomplete-list"
            disabled={isLoading}
            autoComplete="off"
          />
          {isSearchingSuggestions && (
            <span
              className="search-inline-spinner"
              title="Finding matching cities..."
              aria-label="Loading suggestions"
            />
          )}
          {searchTerm && (
            <button
              id="weather-search-clear-btn"
              type="button"
              className="search-clear-btn"
              onClick={handleClear}
              aria-label="Clear search input"
              title="Clear text"
            >
              <FaTimes />
            </button>
          )}

          {/* City Autocomplete / Suggestions Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <ul
              id="city-autocomplete-list"
              className="autocomplete-dropdown"
              role="listbox"
              aria-label="City suggestions"
            >
              {suggestions.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <li
                    key={`${item.name}-${item.country}-${item.state}-${index}`}
                    id={`autocomplete-item-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    className={`autocomplete-item ${isSelected ? "selected" : ""}`}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSuggestion(item);
                    }}
                  >
                    <div className="suggestion-icon-wrap">
                      <FaMapMarkerAlt className="suggestion-marker-icon" aria-hidden="true" />
                    </div>
                    <div className="suggestion-text-group">
                      <span className="suggestion-city-name">{item.name}</span>
                      <span className="suggestion-location-sub">
                        {item.state ? `${item.state}, ` : ""}
                        {item.country}
                      </span>
                    </div>
                    {item.country && (
                      <span className="suggestion-country-pill">{item.country}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Search Submit Button */}
        <button
          id="weather-search-submit-btn"
          type="submit"
          className="search-submit-btn"
          disabled={isLoading || !searchTerm.trim()}
          aria-label="Search weather"
        >
          <FaSearch className="submit-btn-icon" />
          <span>{isLoading ? "Searching..." : "Search"}</span>
        </button>

        {/* 'Use My Location' Button with Geolocation API */}
        <button
          id="weather-use-my-location-btn"
          type="button"
          className={`use-my-location-btn ${isLocating ? "locating" : ""}`}
          onClick={onUseLocation}
          disabled={isLoading || isLocating}
          title="Use current geolocation coordinates"
          aria-label="Use My Location"
        >
          <FaLocationArrow className={`location-btn-icon ${isLocating ? "pulse-anim" : ""}`} />
          <span className="location-btn-label">{isLocating ? "Locating..." : "My Location"}</span>
        </button>

        {/* Temperature Unit Toggle Button */}
        <button
          id="weather-unit-toggle-btn"
          type="button"
          className="unit-toggle-btn"
          onClick={onUnitToggle}
          title={`Switch to ${units === "metric" ? "Fahrenheit (°F)" : "Celsius (°C)"}`}
          aria-label="Toggle temperature unit"
        >
          {units === "metric" ? "°F" : "°C"}
        </button>

        {/* Compare Cities Button */}
        {onOpenCompare && (
          <button
            id="weather-compare-nav-btn"
            type="button"
            className="weather-compare-trigger-btn"
            onClick={onOpenCompare}
            title="Open side-by-side weather comparison"
            aria-label="Open side-by-side weather comparison"
          >
            <FaExchangeAlt className="compare-btn-icon" />
            <span className="compare-btn-label">Compare</span>
          </button>
        )}

        {/* Light / Dark Mode Theme Toggle Button */}
        <button
          id="weather-theme-toggle-btn"
          type="button"
          className={`theme-toggle-btn ${theme}`}
          onClick={onThemeToggle}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
          aria-label={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
        >
          {theme === "dark" ? (
            <FaSun className="theme-btn-icon sun-icon" />
          ) : (
            <FaMoon className="theme-btn-icon moon-icon" />
          )}
          <span className="theme-btn-text">{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
      </form>
    </div>
  );
}

export default WeatherSearch;
