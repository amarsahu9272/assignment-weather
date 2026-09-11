import React from "react";
import "./ErrorMessage.css";
import { FaExclamationTriangle, FaTimes, FaRedo } from "react-icons/fa";

const POPULAR_CITIES = ["London", "New York", "Tokyo", "Paris", "Jamshedpur"];

function ErrorMessage({ error, onDismiss, onRetry, onSelectSuggestion }) {
  if (!error) return null;

  return (
    <div id="weather-error-banner" className="error-banner" role="alert">
      <div className="error-banner-top">
        <div className="error-message-content">
          <FaExclamationTriangle className="error-icon" aria-hidden="true" />
          <div className="error-texts">
            <h4 className="error-title">Unable to Load Weather</h4>
            <p className="error-description">{error}</p>
          </div>
        </div>

        <div className="error-actions">
          {onRetry && (
            <button
              id="weather-retry-btn"
              type="button"
              className="error-action-btn retry"
              onClick={onRetry}
              title="Retry fetching weather"
            >
              <FaRedo />
              <span>Retry</span>
            </button>
          )}
          {onDismiss && (
            <button
              id="weather-dismiss-btn"
              type="button"
              className="error-action-btn dismiss"
              onClick={onDismiss}
              aria-label="Dismiss error"
              title="Dismiss error"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {onSelectSuggestion && (
        <div className="error-suggestions">
          <span className="suggestions-label">Try searching for:</span>
          <div className="suggestions-chips">
            {POPULAR_CITIES.map((cityName) => (
              <button
                key={cityName}
                type="button"
                className="suggestion-chip"
                onClick={() => onSelectSuggestion(cityName)}
              >
                {cityName}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ErrorMessage;
