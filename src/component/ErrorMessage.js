import React, { useState, useMemo } from "react";
import "./ErrorMessage.css";
import {
  FaTimes,
  FaRedo,
  FaSearchLocation,
  FaWifi,
  FaLock,
  FaClock,
  FaExclamationTriangle,
  FaLightbulb,
  FaChevronDown,
  FaChevronUp,
  FaLocationArrow,
} from "react-icons/fa";
import { formatWeatherError, ERROR_TYPES, POPULAR_VERIFIED_CITIES } from "../utils/errorUtils";

function ErrorMessage({
  error,
  searchedCity = "",
  onDismiss,
  onRetry,
  onSelectSuggestion,
  onUseLocation,
}) {
  const [showTips, setShowTips] = useState(true);

  // Normalize error to rich structured error object
  const errorObj = useMemo(() => {
    if (!error) return null;
    if (typeof error === "object" && error.title && error.type) {
      return error;
    }
    return formatWeatherError(error, { searchedCity });
  }, [error, searchedCity]);

  if (!errorObj) return null;

  const { title, message, type, tips, canRetry, severity } = errorObj;

  const renderIcon = () => {
    switch (type) {
      case ERROR_TYPES.CITY_NOT_FOUND:
        return <FaSearchLocation className="error-hero-icon not-found" aria-hidden="true" />;
      case ERROR_TYPES.NETWORK_OFFLINE:
        return <FaWifi className="error-hero-icon offline" aria-hidden="true" />;
      case ERROR_TYPES.GEO_DENIED:
        return <FaLock className="error-hero-icon denied" aria-hidden="true" />;
      case ERROR_TYPES.GEO_TIMEOUT:
        return <FaClock className="error-hero-icon timeout" aria-hidden="true" />;
      default:
        return <FaExclamationTriangle className="error-hero-icon warning" aria-hidden="true" />;
    }
  };

  const getBadgeLabel = () => {
    switch (type) {
      case ERROR_TYPES.CITY_NOT_FOUND:
        return "404 · City Not Found";
      case ERROR_TYPES.NETWORK_OFFLINE:
        return "Network Disconnected";
      case ERROR_TYPES.GEO_DENIED:
        return "Location Permission Denied";
      case ERROR_TYPES.GEO_UNAVAILABLE:
        return "GPS Unavailable";
      case ERROR_TYPES.GEO_TIMEOUT:
        return "Location Timeout";
      case ERROR_TYPES.RATE_LIMIT:
        return "Rate Limit Exceeded";
      case ERROR_TYPES.EMPTY_SEARCH:
        return "Input Required";
      default:
        return "Service Error";
    }
  };

  return (
    <section
      id="weather-error-banner"
      className={`error-banner severity-${severity} type-${type}`}
      role="alert"
      aria-live="assertive"
    >
      {/* Top Bar: Icon, Title, Badge & Dismiss Button */}
      <div className="error-banner-top">
        <div className="error-message-content">
          <div className="error-icon-box">{renderIcon()}</div>
          <div className="error-texts">
            <div className="error-badge-row">
              <span className="error-category-badge">{getBadgeLabel()}</span>
            </div>
            <h3 id="weather-error-title" className="error-title">
              {title}
            </h3>
            <p id="weather-error-description" className="error-description">
              {message}
            </p>
          </div>
        </div>

        <div className="error-top-actions">
          {onDismiss && (
            <button
              id="weather-dismiss-btn"
              type="button"
              className="error-action-btn dismiss"
              onClick={onDismiss}
              aria-label="Dismiss error banner"
              title="Dismiss error"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons: Retry Search & Use My Location */}
      <div className="error-primary-actions">
        {onRetry && canRetry !== false && (
          <button
            id="weather-retry-btn"
            type="button"
            className="error-btn retry"
            onClick={onRetry}
            title="Retry weather request"
          >
            <FaRedo className="btn-icon" />
            <span>Retry Search</span>
          </button>
        )}

        {onUseLocation && (
          <button
            id="error-use-location-btn"
            type="button"
            className="error-btn use-location"
            onClick={onUseLocation}
            title="Attempt to locate using GPS coordinates"
          >
            <FaLocationArrow className="btn-icon" />
            <span>Use Current Location</span>
          </button>
        )}
      </div>

      {/* Expandable Troubleshooting Guidance */}
      {tips && tips.length > 0 && (
        <div className="error-troubleshooting-section">
          <button
            type="button"
            className="troubleshooting-toggle-btn"
            onClick={() => setShowTips((prev) => !prev)}
            aria-expanded={showTips}
          >
            <div className="toggle-left">
              <FaLightbulb className="tips-icon" />
              <span>Troubleshooting Tips ({tips.length})</span>
            </div>
            {showTips ? <FaChevronUp /> : <FaChevronDown />}
          </button>

          {showTips && (
            <ul className="troubleshooting-list">
              {tips.map((tip, idx) => (
                <li key={idx} className="troubleshooting-item">
                  <span className="tip-bullet">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Suggested Verified Cities for Fast Recovery */}
      {onSelectSuggestion && (
        <div className="error-suggestions">
          <span className="suggestions-label">Try searching a verified city:</span>
          <div className="suggestions-chips">
            {POPULAR_VERIFIED_CITIES.map((cityName) => (
              <button
                key={cityName}
                type="button"
                className="suggestion-chip"
                onClick={() => onSelectSuggestion(cityName)}
                title={`Search weather in ${cityName}`}
              >
                {cityName}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default ErrorMessage;
