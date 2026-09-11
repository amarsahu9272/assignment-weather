import React, { useState } from "react";
import "./ExportWeather.css";
import {
  FaShareAlt,
  FaCopy,
  FaCheck,
  FaFileCode,
  FaFileAlt,
  FaDownload,
  FaTimes,
} from "react-icons/fa";
import {
  generateTextSummary,
  generateJsonSummary,
  copyToClipboard,
  downloadFile,
} from "../utils/exportUtils";

function ExportWeather({ weather, forecast = [], units = "metric" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("text"); // "text" | "json"
  const [copyStatus, setCopyStatus] = useState(null); // "copied-text" | "copied-json" | "failed" | null

  if (!weather) return null;

  const textSummary = generateTextSummary(weather, forecast, units);
  const jsonSummary = generateJsonSummary(weather, forecast, units);

  const handleCopy = async (type) => {
    const content = type === "json" ? jsonSummary : textSummary;
    const success = await copyToClipboard(content);

    if (success) {
      setCopyStatus(type === "json" ? "copied-json" : "copied-text");
      setTimeout(() => setCopyStatus(null), 2500);
    } else {
      setCopyStatus("failed");
      setTimeout(() => setCopyStatus(null), 3000);
    }
  };

  const handleDownload = (type) => {
    const citySlug = (weather.name || "weather").toLowerCase().replace(/[^a-z0-9]/g, "_");
    const dateSlug = new Date().toISOString().slice(0, 10);

    if (type === "json") {
      downloadFile(`${citySlug}_weather_forecast_${dateSlug}.json`, jsonSummary, "application/json");
    } else {
      downloadFile(`${citySlug}_weather_forecast_${dateSlug}.txt`, textSummary, "text/plain");
    }
  };

  return (
    <div id="export-weather-container" className="export-weather-container">
      {/* Quick Action Bar */}
      <div className="export-quick-bar">
        <button
          id="export-open-modal-btn"
          type="button"
          className="export-main-btn"
          onClick={() => setIsOpen(true)}
          title="Open Weather Report Export dialog"
          aria-label="Export Weather and Forecast Report"
        >
          <FaShareAlt className="export-btn-icon" />
          <span>Export Report</span>
        </button>

        <div className="quick-copy-group">
          <button
            id="quick-copy-text-btn"
            type="button"
            className={`quick-copy-btn ${copyStatus === "copied-text" ? "copied" : ""}`}
            onClick={() => handleCopy("text")}
            title="Quick copy formatted text summary"
            aria-label="Quick Copy Text Summary"
          >
            {copyStatus === "copied-text" ? <FaCheck /> : <FaCopy />}
            <span>{copyStatus === "copied-text" ? "Copied Text!" : "Copy Text"}</span>
          </button>

          <button
            id="quick-copy-json-btn"
            type="button"
            className={`quick-copy-btn ${copyStatus === "copied-json" ? "copied" : ""}`}
            onClick={() => handleCopy("json")}
            title="Quick copy structured JSON data"
            aria-label="Quick Copy JSON Summary"
          >
            {copyStatus === "copied-json" ? <FaCheck /> : <FaFileCode />}
            <span>{copyStatus === "copied-json" ? "Copied JSON!" : "Copy JSON"}</span>
          </button>
        </div>
      </div>

      {/* Floating toast notification for quick copy actions */}
      {copyStatus && (
        <div
          id="export-toast-notification"
          className={`export-toast ${copyStatus === "failed" ? "error" : "success"}`}
          role="status"
          aria-live="polite"
        >
          {copyStatus === "failed" ? (
            <span>Could not copy to clipboard automatically. Please select and copy manually.</span>
          ) : (
            <span>
              <FaCheck className="toast-check-icon" />
              {copyStatus === "copied-json"
                ? "Weather JSON summary copied to clipboard!"
                : "Formatted weather report copied to clipboard!"}
            </span>
          )}
        </div>
      )}

      {/* Export Modal Dialog */}
      {isOpen && (
        <div
          id="export-modal-backdrop"
          className="export-modal-backdrop"
          onClick={() => setIsOpen(false)}
        >
          <div
            id="export-modal-dialog"
            className="export-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-dialog-title"
          >
            {/* Modal Header */}
            <div className="export-modal-header">
              <div className="export-modal-title-group">
                <FaShareAlt className="modal-title-icon" />
                <div>
                  <h3 id="export-dialog-title" className="export-modal-title">
                    Export Weather Summary
                  </h3>
                  <span className="export-modal-subtitle">
                    {weather.name}{weather.country ? `, ${weather.country}` : ""} • Current & 5-Day Forecast
                  </span>
                </div>
              </div>
              <button
                id="export-modal-close-btn"
                type="button"
                className="export-modal-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close export dialog"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Format Tabs */}
            <div className="export-tabs-row" role="tablist">
              <button
                id="export-tab-text"
                type="button"
                role="tab"
                aria-selected={activeTab === "text"}
                className={`export-tab-btn ${activeTab === "text" ? "active" : ""}`}
                onClick={() => setActiveTab("text")}
              >
                <FaFileAlt />
                <span>Formatted Text</span>
              </button>
              <button
                id="export-tab-json"
                type="button"
                role="tab"
                aria-selected={activeTab === "json"}
                className={`export-tab-btn ${activeTab === "json" ? "active" : ""}`}
                onClick={() => setActiveTab("json")}
              >
                <FaFileCode />
                <span>Structured JSON</span>
              </button>
            </div>

            {/* Code / Text Preview Card */}
            <div className="export-preview-container">
              <pre
                id="export-preview-content"
                className={`export-preview-box ${activeTab === "json" ? "json-box" : "text-box"}`}
                tabIndex={0}
              >
                {activeTab === "json" ? jsonSummary : textSummary}
              </pre>
            </div>

            {/* Modal Footer with Actions */}
            <div className="export-modal-footer">
              <div className="footer-info-text">
                <span>
                  {activeTab === "text"
                    ? "Ready to paste into notes, messages, or emails."
                    : "Standard JSON object ready for APIs or documentation."}
                </span>
              </div>

              <div className="footer-btn-group">
                <button
                  id="export-download-btn"
                  type="button"
                  className="modal-action-btn secondary"
                  onClick={() => handleDownload(activeTab)}
                  title={`Download as .${activeTab === "json" ? "json" : "txt"} file`}
                >
                  <FaDownload />
                  <span>Download .{activeTab === "json" ? "json" : "txt"}</span>
                </button>

                <button
                  id="export-copy-active-btn"
                  type="button"
                  className="modal-action-btn primary"
                  onClick={() => handleCopy(activeTab)}
                >
                  <FaCopy />
                  <span>
                    {copyStatus === `copied-${activeTab}`
                      ? "Copied!"
                      : `Copy ${activeTab.toUpperCase()} to Clipboard`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExportWeather;
