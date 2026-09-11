import React, { useState } from "react";
import "./WeatherAlerts.css";
import {
  FaExclamationTriangle,
  FaShieldAlt,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaBell,
  FaInfoCircle,
} from "react-icons/fa";

function WeatherAlerts({
  alerts = [],
  isLoading = false,
  locationName = "",
  checkedAt = "",
  units = "metric",
}) {
  const [expandedAlertId, setExpandedAlertId] = useState(null);
  const [isTestMode, setIsTestMode] = useState(false);

  // Simulated severe weather warning for testing and verification
  const testAlerts = [
    {
      id: "simulated-test-alert",
      event: "Severe Thunderstorm & Flash Flood Warning",
      senderName: "National Weather Service / One Call API",
      start: "Immediate",
      end: "4 Hours from now",
      description:
        "Doppler radar indicates a severe thunderstorm cluster capable of producing destructive wind gusts in excess of 60 mph, frequent cloud-to-ground lightning, and localized torrential rainfall leading to sudden flash flooding. Move to an interior room on the lowest floor of a sturdy building.",
      tags: ["Thunderstorm", "Flash Flood", "High Wind", "Dangerous"],
      severity: "warning",
      source: "One Call API / Test Simulation",
      isOfficial: true,
    },
  ];

  const displayAlerts = isTestMode ? testAlerts : alerts;
  const hasAlerts = displayAlerts && displayAlerts.length > 0;

  const toggleExpand = (id) => {
    setExpandedAlertId((prev) => (prev === id ? null : id));
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "warning":
        return <span className="alert-severity-badge danger">CRITICAL WARNING</span>;
      case "watch":
        return <span className="alert-severity-badge watch">WEATHER WATCH</span>;
      default:
        return <span className="alert-severity-badge advisory">ADVISORY</span>;
    }
  };

  return (
    <section
      id="weather-alerts-section"
      className={`weather-alerts-section ${hasAlerts ? "has-active-alerts" : "all-clear"}`}
      aria-label="Weather Alerts and Warnings"
    >
      <div className="alerts-header">
        <div className="alerts-title-group">
          <div className={`alerts-icon-wrap ${hasAlerts ? "alert-icon-active" : "alert-icon-safe"}`}>
            {hasAlerts ? <FaExclamationTriangle /> : <FaShieldAlt />}
          </div>
          <div>
            <h3 id="weather-alerts-heading" className="alerts-title">
              Weather Alerts & Advisories
            </h3>
            <span className="alerts-location-sub">
              {locationName ? `For ${locationName}` : "Local area"}
              {checkedAt && ` • Updated at ${checkedAt}`}
            </span>
          </div>
        </div>

        <div className="alerts-actions-group">
          {/* Simulation Toggle Button for interactive verification */}
          <button
            id="alerts-toggle-test-btn"
            type="button"
            className={`test-alert-toggle-btn ${isTestMode ? "active" : ""}`}
            onClick={() => setIsTestMode((prev) => !prev)}
            title="Toggle simulated severe warning for testing"
            aria-pressed={isTestMode}
          >
            <FaBell className="btn-bell-icon" />
            <span>{isTestMode ? "Exit Test Alert" : "Test Alert Preview"}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="alerts-loading-state">
          <span className="alerts-spinner" />
          <p>Checking active weather warnings & One Call feeds...</p>
        </div>
      ) : hasAlerts ? (
        <div className="alerts-list" role="list">
          {displayAlerts.map((alert, index) => {
            const isExpanded = expandedAlertId === alert.id || index === 0;
            return (
              <div
                key={alert.id || index}
                id={`alert-card-${index}`}
                className={`alert-card severity-${alert.severity || "warning"}`}
                role="listitem"
              >
                <div className="alert-card-top">
                  <div className="alert-header-info">
                    <div className="alert-badge-row">
                      {getSeverityBadge(alert.severity)}
                      {alert.source && (
                        <span className="alert-source-tag">
                          <FaInfoCircle className="source-icon" />
                          {alert.source}
                        </span>
                      )}
                    </div>
                    <h4 className="alert-event-title">{alert.event}</h4>
                    <div className="alert-meta-details">
                      <span className="alert-sender">
                        <strong>Issued by:</strong> {alert.senderName}
                      </span>
                      <span className="alert-timeframe">
                        <strong>Valid:</strong> {alert.start} – {alert.end}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="alert-expand-btn"
                    onClick={() => toggleExpand(alert.id)}
                    aria-expanded={isExpanded}
                    aria-label="Toggle alert details"
                  >
                    <span>{isExpanded ? "Collapse" : "Details"}</span>
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>

                {/* Detailed Description */}
                {isExpanded && (
                  <div className="alert-body-expanded">
                    <p className="alert-description-text">{alert.description}</p>

                    {alert.tags && alert.tags.length > 0 && (
                      <div className="alert-tags-row">
                        {alert.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="alert-tag-pill">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Reassuring All-Clear Card */
        <div id="alerts-all-clear-card" className="alerts-all-clear-card">
          <FaCheckCircle className="all-clear-icon" aria-hidden="true" />
          <div className="all-clear-text-group">
            <h4 className="all-clear-title">No Active Weather Alerts</h4>
            <p className="all-clear-desc">
              All atmospheric metrics, winds, and 5-day projections are within normal safety
              parameters for {locationName || "this region"}.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default WeatherAlerts;
