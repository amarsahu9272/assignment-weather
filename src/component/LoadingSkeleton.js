import React from "react";
import "./LoadingSkeleton.css";

function LoadingSkeleton({ message = "Fetching weather and forecast data..." }) {
  return (
    <div id="weather-loading-skeleton" className="loading-skeleton-container" aria-live="polite" aria-busy="true">
      {/* Loading indicator bar */}
      <div className="skeleton-spinner-row">
        <div className="loading-spinner" role="status" aria-label="Loading">
          <span className="sr-only">Loading</span>
        </div>
        <p className="loading-text">{message}</p>
      </div>

      {/* Main weather card skeleton */}
      <div className="skeleton-main-card">
        <div className="skeleton-header">
          <div className="skeleton-line skeleton-city pulse" />
          <div className="skeleton-line skeleton-pill pulse" />
        </div>

        <div className="skeleton-content-row">
          <div className="skeleton-temp-block">
            <div className="skeleton-line skeleton-temp pulse" />
            <div className="skeleton-line skeleton-subtext pulse" />
          </div>
          <div className="skeleton-icon-block">
            <div className="skeleton-circle pulse" />
            <div className="skeleton-line skeleton-desc pulse" />
          </div>
        </div>

        <div className="skeleton-humidity-block pulse" />
      </div>

      {/* Temperature Trend Chart Skeleton */}
      <div className="skeleton-chart-card pulse">
        <div className="skeleton-line skeleton-chart-title" />
        <div className="skeleton-chart-graph" />
      </div>

      {/* 5-Day Forecast Skeleton */}
      <div className="skeleton-forecast-card">
        <div className="skeleton-line skeleton-forecast-title pulse" />
        <div className="skeleton-forecast-grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-forecast-item pulse">
              <div className="skeleton-line skeleton-f-day" />
              <div className="skeleton-circle skeleton-f-icon" />
              <div className="skeleton-line skeleton-f-temp" />
            </div>
          ))}
        </div>
      </div>

      {/* Metric cards skeleton */}
      <div className="skeleton-metrics-grid">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="skeleton-card pulse">
            <div className="skeleton-line skeleton-card-title" />
            <div className="skeleton-line skeleton-card-value" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoadingSkeleton;
