import React, { useState, useEffect, useRef } from "react";
import "./ToastNotification.css";
import {
  FaTimes,
  FaRedo,
  FaWifi,
  FaExclamationTriangle,
  FaLock,
  FaClock,
  FaSearchLocation,
  FaInfoCircle,
  FaCheckCircle,
} from "react-icons/fa";
import { ERROR_TYPES } from "../utils/errorUtils";

function ToastItem({ toast, onDismiss, onRetry, onSelectSuggestion }) {
  const { id, title, message, type, severity = "error", searchedCity } = toast;
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const durationMs = toast.duration || 6500;
  const remainingTimeRef = useRef(durationMs);
  const animFrameRef = useRef(null);

  // Auto-dismiss timer with pause-on-hover support
  useEffect(() => {
    let lastTick = Date.now();

    const updateTimer = () => {
      const now = Date.now();
      const delta = now - lastTick;
      lastTick = now;

      if (!isPaused) {
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - delta);
        const pct = (remainingTimeRef.current / durationMs) * 100;
        setProgress(pct);

        if (remainingTimeRef.current <= 0) {
          onDismiss(id);
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(updateTimer);
    };

    animFrameRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [id, isPaused, durationMs, onDismiss]);

  // Determine icon by error type
  const renderIcon = () => {
    switch (type) {
      case ERROR_TYPES.CITY_NOT_FOUND:
        return <FaSearchLocation className="toast-icon not-found" aria-hidden="true" />;
      case ERROR_TYPES.NETWORK_OFFLINE:
        return <FaWifi className="toast-icon offline" aria-hidden="true" />;
      case ERROR_TYPES.GEO_DENIED:
        return <FaLock className="toast-icon denied" aria-hidden="true" />;
      case ERROR_TYPES.GEO_TIMEOUT:
        return <FaClock className="toast-icon timeout" aria-hidden="true" />;
      case "SUCCESS":
        return <FaCheckCircle className="toast-icon success" aria-hidden="true" />;
      case "INFO":
        return <FaInfoCircle className="toast-icon info" aria-hidden="true" />;
      default:
        return <FaExclamationTriangle className="toast-icon warning" aria-hidden="true" />;
    }
  };

  return (
    <div
      id={`toast-item-${id}`}
      className={`toast-item severity-${severity} type-${type || "general"}`}
      role="alert"
      aria-live="assertive"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="toast-header-row">
        <div className="toast-title-group">
          {renderIcon()}
          <span className="toast-title">{title}</span>
        </div>
        <button
          type="button"
          className="toast-close-btn"
          onClick={() => onDismiss(id)}
          aria-label="Dismiss notification"
          title="Dismiss notification"
        >
          <FaTimes />
        </button>
      </div>

      <div className="toast-body">
        <p className="toast-message">{message}</p>
        {searchedCity && type === ERROR_TYPES.CITY_NOT_FOUND && (
          <span className="toast-meta-tag">Query: "{searchedCity}"</span>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="toast-actions-row">
        {onRetry && toast.canRetry !== false && (
          <button
            type="button"
            className="toast-action-btn retry-btn"
            onClick={() => {
              onDismiss(id);
              onRetry(toast);
            }}
          >
            <FaRedo className="action-icon" />
            <span>Retry Search</span>
          </button>
        )}

        {type === ERROR_TYPES.CITY_NOT_FOUND && onSelectSuggestion && (
          <div className="toast-suggestions-quick">
            <span className="quick-label">Try:</span>
            {["London", "Tokyo", "New York"].map((city) => (
              <button
                key={city}
                type="button"
                className="toast-quick-chip"
                onClick={() => {
                  onDismiss(id);
                  onSelectSuggestion(city);
                }}
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Auto-dismiss countdown bar */}
      <div className="toast-progress-track">
        <div
          className="toast-progress-bar"
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function ToastNotification({ toasts = [], onDismiss, onRetry, onSelectSuggestion }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <aside
      id="weather-toast-container"
      className="weather-toast-container"
      aria-label="System Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          onRetry={onRetry}
          onSelectSuggestion={onSelectSuggestion}
        />
      ))}
    </aside>
  );
}

export default ToastNotification;
