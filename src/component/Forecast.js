import React, { useState } from "react";
import "./Forecast.css";
import { FaCalendarAlt, FaChevronDown, FaChevronUp, FaWind } from "react-icons/fa";
import { MdOutlineWaterDrop } from "react-icons/md";
import WeatherIcon from "./WeatherIcon";

function Forecast({ forecast, units }) {
  const [expandedDay, setExpandedDay] = useState(null);

  if (!forecast || forecast.length === 0) return null;

  const tempUnit = units === "metric" ? "°C" : "°F";
  const windUnit = units === "metric" ? "m/s" : "mph";

  const toggleExpand = (dateKey) => {
    setExpandedDay((prev) => (prev === dateKey ? null : dateKey));
  };

  return (
    <section id="weather-5day-forecast" className="forecast-section" aria-label="5-Day Weather Forecast">
      <div className="forecast-header">
        <div className="forecast-title-group">
          <FaCalendarAlt className="forecast-header-icon" aria-hidden="true" />
          <h3 id="forecast-heading" className="forecast-title">
            5-Day Weather Forecast
          </h3>
        </div>
        <span className="forecast-subtitle">Daily overview & trends</span>
      </div>

      <div className="forecast-grid" role="list">
        {forecast.map((day, index) => {
          const isExpanded = expandedDay === day.date;
          const isToday = index === 0;

          return (
            <div
              key={day.date}
              id={`forecast-card-${index}`}
              className={`forecast-card ${isToday ? "today-card" : ""} ${isExpanded ? "expanded" : ""}`}
              role="listitem"
            >
              {/* Card Header: Day & Date */}
              <div className="forecast-card-date">
                <span className="forecast-day-name">
                  {isToday ? "Today" : day.dayName}
                </span>
                <span className="forecast-date-str">{day.formattedDate}</span>
              </div>

              {/* Weather Condition Icon & Name */}
              <div className="forecast-condition-box">
                <WeatherIcon
                  condition={day.condition}
                  conditionId={day.conditionId}
                  iconCode={day.iconCode}
                  size="md"
                  title={day.description || day.condition}
                />
                <span className="forecast-condition-text">{day.condition}</span>
                {day.pop > 10 && (
                  <span className="forecast-rain-tag" title="Precipitation Probability">
                    <MdOutlineWaterDrop className="rain-drop-icon" />
                    {day.pop}%
                  </span>
                )}
              </div>

              {/* High & Low Temperature Range */}
              <div className="forecast-temp-range">
                <div className="forecast-temp-item max">
                  <span className="temp-label">High</span>
                  <span className="temp-val">{day.maxTemp}{tempUnit}</span>
                </div>
                <div className="temp-bar-container" title={`Low: ${day.minTemp}${tempUnit} | High: ${day.maxTemp}${tempUnit}`}>
                  <span className="forecast-temp-min-text">{day.minTemp}°</span>
                  <div className="temp-bar-pill" />
                  <span className="forecast-temp-max-text">{day.maxTemp}°</span>
                </div>
                <div className="forecast-temp-item min">
                  <span className="temp-label">Low</span>
                  <span className="temp-val">{day.minTemp}{tempUnit}</span>
                </div>
              </div>

              {/* Secondary Details: Humidity & Wind */}
              <div className="forecast-card-details">
                <div className="detail-item" title="Average Humidity">
                  <MdOutlineWaterDrop className="detail-icon humidity" />
                  <span>{day.avgHumidity}%</span>
                </div>
                <div className="detail-item" title="Average Wind Speed">
                  <FaWind className="detail-icon wind" />
                  <span>{day.avgWind} {windUnit}</span>
                </div>
              </div>

              {/* 3-Hourly breakdown toggle */}
              {day.hourly && day.hourly.length > 0 && (
                <button
                  id={`forecast-expand-btn-${index}`}
                  type="button"
                  className="forecast-expand-btn"
                  onClick={() => toggleExpand(day.date)}
                  aria-expanded={isExpanded}
                  title="Toggle 3-hourly breakdown"
                >
                  <span>{isExpanded ? "Hide Hours" : "3-Hour View"}</span>
                  {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              )}

              {/* Expanded 3-Hour timeline */}
              {isExpanded && day.hourly && (
                <div className="forecast-hourly-strip">
                  {day.hourly.map((hourItem, hIdx) => (
                    <div key={hIdx} className="hourly-mini-col">
                      <span className="hourly-time">{hourItem.time}</span>
                      <WeatherIcon
                        condition={hourItem.condition}
                        conditionId={hourItem.conditionId}
                        iconCode={hourItem.iconCode}
                        size="xs"
                        title={hourItem.description || hourItem.condition}
                      />
                      <span className="hourly-temp">{hourItem.temp}{tempUnit}</span>
                      {hourItem.pop > 10 && (
                        <span className="hourly-pop">{hourItem.pop}%</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Forecast;
