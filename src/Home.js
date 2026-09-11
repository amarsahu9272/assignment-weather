import React, { useEffect, useState, useCallback, useMemo } from "react";
import "./Home.css";
import {
  getFormattedWeatherData,
  get5DayForecast,
  getWeatherByCoords,
  get5DayForecastByCoords,
  getWeatherAlerts,
} from "./weatherService";
import { getWeatherBackgroundConfig } from "./utils/weatherBackgrounds";
import WeatherSearch from "./component/WeatherSearch";
import WeatherDisplay from "./component/WeatherDisplay";
import ForecastChart from "./component/ForecastChart";
import Forecast from "./component/Forecast";
import Description from "./component/Description";
import LoadingSkeleton from "./component/LoadingSkeleton";
import ErrorMessage from "./component/ErrorMessage";
import WeatherAlerts from "./component/WeatherAlerts";
import ExportWeather from "./component/ExportWeather";
import WeatherCompare from "./component/WeatherCompare";

function App() {
  const [city, setCity] = useState("Jamshedpur");
  const [coords, setCoords] = useState(null); // { lat, lon } when using geolocation
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [alertsCheckedAt, setAlertsCheckedAt] = useState("");
  const [units, setUnits] = useState("metric");
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("single"); // "single" | "compare"

  // Light / Dark mode theme preference persisted in localStorage
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("weather_app_theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
      }
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches
      ) {
        return "light";
      }
    } catch (e) {
      console.warn("Error reading theme from localStorage:", e);
    }
    return "dark";
  });

  // Sync theme to localStorage and document root
  useEffect(() => {
    try {
      localStorage.setItem("weather_app_theme", theme);
    } catch (e) {
      console.warn("Error saving theme to localStorage:", e);
    }
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  // Dynamic atmospheric background gradient & image based on weather condition & theme
  const bgConfig = useMemo(() => {
    return getWeatherBackgroundConfig(weather, theme);
  }, [weather, theme]);

  const fetchWeather = useCallback(async (targetCity, targetUnits, targetCoords = null) => {
    setIsLoading(true);
    setError(null);

    try {
      let currentRes;
      let forecastRes;

      if (targetCoords) {
        [currentRes, forecastRes] = await Promise.all([
          getWeatherByCoords(targetCoords.lat, targetCoords.lon, targetUnits),
          get5DayForecastByCoords(targetCoords.lat, targetCoords.lon, targetUnits),
        ]);
      } else {
        [currentRes, forecastRes] = await Promise.all([
          getFormattedWeatherData(targetCity, targetUnits),
          get5DayForecast(targetCity, targetUnits),
        ]);
      }

      if (currentRes.success && currentRes.data) {
        setWeather(currentRes.data);
        setError(null);

        // Update forecast state if available
        const forecastData =
          forecastRes.success && Array.isArray(forecastRes.data) ? forecastRes.data : [];
        setForecast(forecastData);

        // Fetch active weather alerts/warnings via One Call API / meteorological observation
        setIsLoadingAlerts(true);
        const lat = targetCoords?.lat ?? currentRes.data.coord?.lat;
        const lon = targetCoords?.lon ?? currentRes.data.coord?.lon;

        try {
          const alertsRes = await getWeatherAlerts(
            lat,
            lon,
            currentRes.data,
            forecastData,
            targetUnits
          );
          setAlerts(alertsRes.alerts || []);
          setAlertsCheckedAt(alertsRes.checkedAt || "");
        } catch (alertErr) {
          console.warn("Failed to fetch weather alerts:", alertErr);
          setAlerts([]);
        } finally {
          setIsLoadingAlerts(false);
        }
      } else {
        setError(currentRes.error || "Could not retrieve weather information. Please try again.");
      }
    } catch (err) {
      console.error("Fetch weather error:", err);
      setError("An unexpected error occurred while fetching weather data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(city, units, coords);
  }, [city, units, coords, fetchWeather]);

  const handleSearch = (searchedCity) => {
    setCoords(null);
    setCity(searchedCity);
  };

  const handleUnitToggle = () => {
    setUnits((prev) => (prev === "metric" ? "imperial" : "metric"));
  };

  const handleRetry = () => {
    fetchWeather(city, units, coords);
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleSelectSuggestion = (suggestedCity) => {
    setCoords(null);
    setCity(suggestedCity);
  };

  /**
   * Geolocation API: Use user's current GPS coordinates
   */
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });
      },
      (geoError) => {
        setIsLocating(false);
        let msg = "Unable to retrieve your location.";
        if (geoError.code === 1) {
          msg = "Location permission was denied. Please allow location access in your browser or search for a city.";
        } else if (geoError.code === 2) {
          msg = "Location position is currently unavailable. Please verify GPS or search for a city.";
        } else if (geoError.code === 3) {
          msg = "Location request timed out. Please try again.";
        }
        setError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <div
      id="weather-app"
      className={`app theme-${theme} condition-${bgConfig.category}`}
      data-theme={theme}
      style={{
        backgroundImage: bgConfig.backgroundImage,
      }}
    >
      <main
        className="overlay"
        style={{
          backgroundColor: bgConfig.overlayColor,
        }}
      >
        <div className="container">
          {/* Active Atmospheric Condition & Theme Status Indicator */}
          <header id="weather-atmosphere-status" className="atmosphere-status-bar">
            <div className="atmosphere-badge-left">
              <span className="atmosphere-indicator-dot" />
              <span>Atmosphere: {bgConfig.label}</span>
            </div>
            <span className="atmosphere-theme-tag">
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </span>
          </header>

          {/* Primary View Switcher: Single City Forecast vs Side-by-Side Weather Comparison */}
          <nav id="weather-view-mode-nav" className="weather-view-nav" aria-label="Weather view selection">
            <button
              id="nav-single-city-view"
              type="button"
              className={`view-nav-tab ${activeView === "single" ? "active" : ""}`}
              onClick={() => setActiveView("single")}
            >
              <span className="tab-icon">☀️</span>
              <span>Current Weather</span>
            </button>
            <button
              id="nav-compare-cities-view"
              type="button"
              className={`view-nav-tab ${activeView === "compare" ? "active" : ""}`}
              onClick={() => setActiveView("compare")}
            >
              <span className="tab-icon">⚖️</span>
              <span>Compare Two Cities</span>
              <span className="tab-pill">Side-by-Side</span>
            </button>
          </nav>

          {/* Side-by-Side Weather Comparison View */}
          {activeView === "compare" && (
            <WeatherCompare
              initialCity1={weather?.name || city || "Jamshedpur"}
              initialCity2="London"
              units={units}
              onUnitToggle={handleUnitToggle}
              theme={theme}
              onThemeToggle={handleThemeToggle}
              onBackToSingle={() => setActiveView("single")}
            />
          )}

          {/* Single City Weather Forecast View */}
          {activeView === "single" && (
            <>
              {/* Weather Search Component with autocomplete, 'Use My Location', and search button */}
              <WeatherSearch
                onSearch={handleSearch}
                onUseLocation={handleUseLocation}
                isLocating={isLocating}
                units={units}
                onUnitToggle={handleUnitToggle}
                theme={theme}
                onThemeToggle={handleThemeToggle}
                onOpenCompare={() => setActiveView("compare")}
                isLoading={isLoading}
              />

              {/* Error handling banner for city not found, geolocation denied, or API failure */}
              <ErrorMessage
                error={error}
                onDismiss={handleDismissError}
                onRetry={handleRetry}
                onSelectSuggestion={handleSelectSuggestion}
              />

              {/* Loading spinner and skeleton screen */}
              {isLoading && (
                <LoadingSkeleton
                  message={
                    isLocating
                      ? "Detecting location..."
                      : coords
                      ? "Fetching weather for your coordinates..."
                      : `Fetching weather & forecast for ${city}...`
                  }
                />
              )}

              {/* Current Weather Display, Alerts, Export, Forecast Chart, 5-Day Forecast, and Detailed Metrics */}
              {!isLoading && weather && (
                <>
                  {/* Quick Compare CTA Banner */}
                  <div className="single-view-compare-cta">
                    <div className="compare-cta-text">
                      <span className="compare-cta-icon">⚖️</span>
                      <span>Compare {weather.name} with another city side-by-side</span>
                    </div>
                    <button
                      id="single-view-open-compare-btn"
                      type="button"
                      className="compare-launch-btn"
                      onClick={() => setActiveView("compare")}
                    >
                      Compare Cities →
                    </button>
                  </div>

                  {/* Quick Export & Copy Bar (Text and JSON Clipboard Export) */}
                  <ExportWeather weather={weather} forecast={forecast} units={units} />

                  {/* Active Weather Warnings & Advisories Section (One Call API / Meteorological Observation) */}
                  <WeatherAlerts
                    alerts={alerts}
                    isLoading={isLoadingAlerts}
                    locationName={`${weather.name}${weather.country ? `, ${weather.country}` : ""}`}
                    checkedAt={alertsCheckedAt}
                    units={units}
                  />

                  {/* Current Temperature, Humidity, Condition with Weather Iconography */}
                  <WeatherDisplay weather={weather} units={units} />

                  {/* 5-Day Temperature Forecast Line Chart (Recharts) */}
                  {forecast.length > 0 && (
                    <ForecastChart forecast={forecast} units={units} theme={theme} />
                  )}

                  {/* 5-Day Weather Forecast Component with Condition Icons */}
                  {forecast.length > 0 && (
                    <Forecast forecast={forecast} units={units} />
                  )}

                  {/* Weather Details (wind, pressure, feels like, min/max) */}
                  <Description weather={weather} units={units} />
                </>
              )}

              {/* Fallback empty view when no weather is loaded and no error */}
              {!isLoading && !weather && !error && (
                <div id="weather-empty-state" className="empty-weather-state">
                  <p>Type a city name or use your current location to check weather conditions.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
