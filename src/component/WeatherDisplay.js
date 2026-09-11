import React from "react";
import "./WeatherDisplay.css";
import { MdOutlineWaterDrop, MdLocationOn } from "react-icons/md";
import { FaTemperatureHigh, FaTemperatureLow } from "react-icons/fa";
import WeatherIcon from "./WeatherIcon";

function WeatherDisplay({ weather, units }) {
  if (!weather) return null;

  const tempUnit = units === "metric" ? "°C" : "°F";

  // Compute humidity comfort indicator
  const getHumidityFeedback = (humidity) => {
    if (humidity < 30) return "Dry";
    if (humidity <= 60) return "Comfortable";
    if (humidity <= 80) return "Humid";
    return "Very Humid";
  };

  return (
    <section id="current-weather-display" className="weather-display-card" aria-label="Current Weather Details">
      {/* Top bar with location and main condition */}
      <div className="weather-display-header">
        <div className="location-info">
          <MdLocationOn className="location-pin-icon" aria-hidden="true" />
          <h2 id="weather-city-name" className="city-title">
            {weather.name}{weather.country ? `, ${weather.country}` : ""}
          </h2>
        </div>
        <span id="weather-condition-badge" className="condition-pill">
          {weather.condition || "Weather"}
        </span>
      </div>

      {/* Main grid: Temperature + Weather Icon & Condition */}
      <div className="weather-main-grid">
        <div className="temp-hero">
          <div className="temp-number-row">
            <span id="weather-temp-value" className="temp-value">
              {weather.temp !== undefined ? Math.round(weather.temp) : "--"}
            </span>
            <span className="temp-unit">{tempUnit}</span>
          </div>
          <div className="temp-details-row">
            <span className="feels-like-text">
              Feels like <strong>{weather.feels_like !== undefined ? Math.round(weather.feels_like) : "--"}{tempUnit}</strong>
            </span>
            <div className="high-low-box">
              <span className="high-low-item" title="Minimum Temperature">
                <FaTemperatureLow className="temp-range-icon low" />
                {weather.temp_min !== undefined ? Math.round(weather.temp_min) : "--"}{tempUnit}
              </span>
              <span className="divider">/</span>
              <span className="high-low-item" title="Maximum Temperature">
                <FaTemperatureHigh className="temp-range-icon high" />
                {weather.temp_max !== undefined ? Math.round(weather.temp_max) : "--"}{tempUnit}
              </span>
            </div>
          </div>
        </div>

        <div className="condition-hero">
          <div className="condition-icon-badge-wrap">
            <WeatherIcon
              condition={weather.condition}
              conditionId={weather.conditionId}
              iconCode={weather.iconCode}
              size="xl"
              title={weather.description || weather.condition}
            />
          </div>
          <h3 id="weather-condition-desc" className="condition-description">
            {weather.description}
          </h3>
        </div>
      </div>

      {/* Prominent Humidity Highlight Card */}
      <div id="weather-humidity-highlight" className="humidity-highlight-card">
        <div className="humidity-header">
          <div className="humidity-title-group">
            <MdOutlineWaterDrop className="humidity-icon" aria-hidden="true" />
            <span className="humidity-label">Relative Humidity</span>
          </div>
          <span className="humidity-status-tag">{getHumidityFeedback(weather.humidity)}</span>
        </div>

        <div className="humidity-metrics">
          <span id="weather-humidity-value" className="humidity-number">
            {weather.humidity}%
          </span>
          <div className="humidity-progress-track">
            <div
              className="humidity-progress-fill"
              style={{ width: `${Math.min(Math.max(weather.humidity || 0, 0), 100)}%` }}
              role="progressbar"
              aria-valuenow={weather.humidity}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default WeatherDisplay;
