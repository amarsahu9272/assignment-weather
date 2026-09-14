import React from "react";
import "./WeatherDisplay.css";
import {
  MdLocationOn,
  MdVisibility,
  MdAccessTime,
  MdNavigation,
} from "react-icons/md";
import {
  FaTemperatureHigh,
  FaTemperatureLow,
  FaWind,
} from "react-icons/fa";
import WeatherIcon from "./WeatherIcon";
import HumidityGauge from "./HumidityGauge";
import {
  getWindDirection,
  getWindBeaufort,
  formatVisibility,
  formatSunTime,
} from "../weatherService";

function WeatherDisplay({ weather, units = "metric" }) {
  if (!weather) return null;

  const tempUnit = units === "metric" ? "°C" : "°F";
  const speedUnit = units === "metric" ? "m/s" : "mph";

  // Wind direction & speed calculations
  const windInfo = getWindDirection(weather.windDeg);
  const windBeaufort = getWindBeaufort(weather.speed, units);
  const speedKmh =
    units === "metric"
      ? (Number(weather.speed || 0) * 3.6).toFixed(1)
      : (Number(weather.speed || 0) * 1.60934).toFixed(1);

  // Visibility formatting & quality rating
  const visInfo = formatVisibility(weather.visibility, units);
  const visPercent = Math.min(100, Math.max(6, ((visInfo.meters || 10000) / 10000) * 100));

  // Sunrise & Sunset solar calculations
  const nowSec = Math.floor(Date.now() / 1000);
  const sunriseTimeStr = formatSunTime(weather.sunrise, weather.timezone);
  const sunsetTimeStr = formatSunTime(weather.sunset, weather.timezone);
  const cityLocalTimeStr = formatSunTime(nowSec, weather.timezone);

  let daylightText = "--";
  let solarStatusText = "Daylight cycle";
  let solarProgressPct = 50;
  let isSunUp = true;

  if (weather.sunrise && weather.sunset) {
    const daylightSec = Math.max(0, weather.sunset - weather.sunrise);
    const dlHours = Math.floor(daylightSec / 3600);
    const dlMinutes = Math.floor((daylightSec % 3600) / 60);
    daylightText = `${dlHours}h ${dlMinutes}m`;

    if (nowSec >= weather.sunrise && nowSec <= weather.sunset) {
      isSunUp = true;
      solarProgressPct = Math.min(100, Math.max(0, ((nowSec - weather.sunrise) / daylightSec) * 100));
      const remSec = weather.sunset - nowSec;
      const remH = Math.floor(remSec / 3600);
      const remM = Math.floor((remSec % 3600) / 60);
      solarStatusText = `Sun is up · ${remH > 0 ? `${remH}h ` : ""}${remM}m until sunset`;
    } else if (nowSec < weather.sunrise) {
      isSunUp = false;
      solarProgressPct = 0;
      const preSec = weather.sunrise - nowSec;
      const preH = Math.floor(preSec / 3600);
      const preM = Math.floor((preSec % 3600) / 60);
      solarStatusText = `Pre-dawn · Sunrise in ${preH > 0 ? `${preH}h ` : ""}${preM}m`;
    } else {
      isSunUp = false;
      solarProgressPct = 100;
      solarStatusText = `Nighttime · Sunset was at ${sunsetTimeStr}`;
    }
  }

  return (
    <section
      id="current-weather-display"
      className="weather-display-card"
      aria-label="Current Weather Details"
    >
      {/* Top Header Bar: Location, City Local Time, and Condition Pill */}
      <div className="weather-display-header">
        <div className="location-info">
          <MdLocationOn className="location-pin-icon" aria-hidden="true" />
          <h2 id="weather-city-name" className="city-title">
            {weather.name}
            {weather.country ? `, ${weather.country}` : ""}
          </h2>
          {weather.timezone !== undefined && (
            <span className="city-local-time-tag" title="Local time in searched city">
              <MdAccessTime className="local-time-icon" aria-hidden="true" />
              <span>{cityLocalTimeStr} local</span>
            </span>
          )}
        </div>
        <span id="weather-condition-badge" className="condition-pill">
          {weather.condition || "Weather"}
        </span>
      </div>

      {/* Main Hero: Temperature Readings & Animated Condition Graphic */}
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
              Feels like{" "}
              <strong>
                {weather.feels_like !== undefined ? Math.round(weather.feels_like) : "--"}
                {tempUnit}
              </strong>
            </span>
            <div className="high-low-box">
              <span className="high-low-item" title="Minimum Temperature">
                <FaTemperatureLow className="temp-range-icon low" />
                {weather.temp_min !== undefined ? Math.round(weather.temp_min) : "--"}
                {tempUnit}
              </span>
              <span className="divider">/</span>
              <span className="high-low-item" title="Maximum Temperature">
                <FaTemperatureHigh className="temp-range-icon high" />
                {weather.temp_max !== undefined ? Math.round(weather.temp_max) : "--"}
                {tempUnit}
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

      {/* Atmospheric Metrics Highlights Grid: Wind & Direction, Visibility, Humidity */}
      <div className="atmospheric-metrics-grid">
        {/* Card 1: Wind Speed & Direction with Compass Dial */}
        <div id="weather-wind-card" className="atmospheric-card wind-card">
          <div className="atmospheric-card-header">
            <div className="card-title-group">
              <FaWind className="card-header-icon wind" aria-hidden="true" />
              <span className="card-label">Wind & Direction</span>
            </div>
            <span className="card-status-badge wind-badge">{windBeaufort}</span>
          </div>

          <div className="wind-content-body">
            <div className="wind-speed-col">
              <div className="wind-value-row">
                <span id="weather-wind-speed-value" className="atmospheric-primary-val">
                  {weather.speed !== undefined ? Number(weather.speed).toFixed(1) : "--"}
                </span>
                <span className="atmospheric-unit-val">{speedUnit}</span>
              </div>
              <span className="wind-kmh-subtext">~{speedKmh} km/h</span>
              {weather.windGust && (
                <span className="wind-gust-subtext">
                  Gusts up to {Number(weather.windGust).toFixed(1)} {speedUnit}
                </span>
              )}
            </div>

            {/* Compass Bearing Indicator with Dynamic Rotation */}
            <div
              id="weather-wind-compass-dial"
              className="compass-indicator-box"
              title={`Wind coming from ${windInfo.label} (${windInfo.degrees}°)`}
            >
              <div className="compass-dial">
                <span className="cardinal cardinal-n">N</span>
                <span className="cardinal cardinal-e">E</span>
                <span className="cardinal cardinal-s">S</span>
                <span className="cardinal cardinal-w">W</span>
                <div
                  className="compass-needle-wrap"
                  style={{ transform: `rotate(${windInfo.degrees}deg)` }}
                >
                  <MdNavigation className="compass-pointer-icon" aria-hidden="true" />
                </div>
              </div>
              <div className="compass-bearing-details">
                <span id="weather-wind-direction-value" className="bearing-abbr">
                  {windInfo.abbr}
                </span>
                <span className="bearing-degrees">{windInfo.degrees}°</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Visibility Data with Distance Scale */}
        <div id="weather-visibility-card" className="atmospheric-card visibility-card">
          <div className="atmospheric-card-header">
            <div className="card-title-group">
              <MdVisibility className="card-header-icon visibility" aria-hidden="true" />
              <span className="card-label">Visibility</span>
            </div>
            <span id="weather-visibility-status" className="card-status-badge vis-badge">
              {visInfo.quality}
            </span>
          </div>

          <div className="visibility-content-body">
            <div className="vis-value-row">
              <span id="weather-visibility-value" className="atmospheric-primary-val">
                {visInfo.formatted}
              </span>
            </div>
            <p className="vis-caption">
              {visInfo.meters >= 10000
                ? "Optimal horizon clarity"
                : visInfo.meters >= 5000
                ? "Good clear range"
                : visInfo.meters >= 2000
                ? "Moderate haze observed"
                : "Reduced atmospheric clarity"}
            </p>

            <div className="metric-progress-track">
              <div
                className="metric-progress-fill visibility-fill"
                style={{ width: `${visPercent}%` }}
                role="progressbar"
                aria-valuenow={visPercent}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label={`Visibility level: ${visInfo.quality}`}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Relative Humidity Circular Gauge Chart Component */}
        <div id="weather-humidity-card" className="atmospheric-card humidity-card">
          <HumidityGauge
            value={weather.humidity}
            temp={weather.temp}
            units={units}
            size="md"
            title="Relative Humidity"
          />
        </div>
      </div>

      {/* Sunrise & Sunset Time Indicators and Daylight Solar Cycle */}
      <div id="weather-sun-cycle-card" className="sun-cycle-card">
        <div className="sun-cycle-header">
          <div className="sun-cycle-title-row">
            <span className="sun-cycle-main-title">Sun & Daylight Cycle</span>
            <span className="sun-cycle-daylight-pill">
              Daylight: <strong>{daylightText}</strong>
            </span>
          </div>
          <span className="sun-cycle-status-text">{solarStatusText}</span>
        </div>

        <div className="sun-times-row">
          {/* Sunrise Tile */}
          <div className="sun-event-tile sunrise-tile">
            <div className="sun-event-icon-wrap sunrise-icon-wrap">
              <svg
                className="sun-svg-icon sunrise-svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2v6" />
                <path d="M4.93 10.93l1.41 1.41" />
                <path d="M2 18h2" />
                <path d="M20 18h2" />
                <path d="M17.66 12.34l1.41-1.41" />
                <path d="M16 18a4 4 0 0 0-8 0" />
                <path d="M12 12l2.5 2.5" />
                <path d="M12 12l-2.5 2.5" />
              </svg>
            </div>
            <div className="sun-event-data">
              <span className="sun-event-label">Sunrise</span>
              <span id="weather-sunrise-time" className="sun-event-time">
                {sunriseTimeStr}
              </span>
              <span className="sun-event-caption">Dawn</span>
            </div>
          </div>

          {/* Center Solar Arc Progress Meter */}
          <div className="solar-arc-track-container" aria-hidden="true">
            <div className="solar-track-line">
              <div
                className="solar-track-fill"
                style={{ width: `${solarProgressPct}%` }}
              />
              <div
                id="weather-solar-progress-bar"
                className={`solar-orb-marker ${isSunUp ? "day" : "night"}`}
                style={{ left: `${solarProgressPct}%` }}
                title={`Current solar progression: ${Math.round(solarProgressPct)}%`}
              >
                {isSunUp ? "☀️" : "🌙"}
              </div>
            </div>
            <div className="solar-track-labels">
              <span>Sunrise</span>
              <span className="daylight-duration-mid">{daylightText}</span>
              <span>Sunset</span>
            </div>
          </div>

          {/* Sunset Tile */}
          <div className="sun-event-tile sunset-tile">
            <div className="sun-event-icon-wrap sunset-icon-wrap">
              <svg
                className="sun-svg-icon sunset-svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 10v6" />
                <path d="M4.93 10.93l1.41 1.41" />
                <path d="M2 18h20" />
                <path d="M17.66 12.34l1.41-1.41" />
                <path d="M16 18a4 4 0 0 0-8 0" />
                <polyline points="9 13 12 16 15 13" />
              </svg>
            </div>
            <div className="sun-event-data">
              <span className="sun-event-label">Sunset</span>
              <span id="weather-sunset-time" className="sun-event-time">
                {sunsetTimeStr}
              </span>
              <span className="sun-event-caption">Dusk</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WeatherDisplay;
