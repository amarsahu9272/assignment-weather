import React, { useState, useMemo } from "react";
import "./ForecastChart.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { FaChartLine, FaSun, FaMoon } from "react-icons/fa";

/**
 * Custom glassmorphic tooltip for Recharts
 */
const CustomChartTooltip = ({ active, payload, label, units, viewMode }) => {
  if (!active || !payload || !payload.length) return null;

  const tempUnit = units === "metric" ? "°C" : "°F";
  const dataPoint = payload[0].payload;

  return (
    <div className="forecast-chart-tooltip">
      <div className="tooltip-header">
        <span className="tooltip-title">{label || dataPoint.displayLabel}</span>
        {dataPoint.condition && (
          <span className="tooltip-condition">{dataPoint.condition}</span>
        )}
      </div>

      <div className="tooltip-body">
        {viewMode === "daily" ? (
          <>
            <div className="tooltip-row high">
              <span className="tooltip-dot high" />
              <span className="tooltip-label">Max Temp:</span>
              <span className="tooltip-val">{dataPoint.maxTemp}{tempUnit}</span>
            </div>
            <div className="tooltip-row low">
              <span className="tooltip-dot low" />
              <span className="tooltip-label">Min Temp:</span>
              <span className="tooltip-val">{dataPoint.minTemp}{tempUnit}</span>
            </div>
          </>
        ) : (
          <div className="tooltip-row temp">
            <span className="tooltip-dot temp" />
            <span className="tooltip-label">Temperature:</span>
            <span className="tooltip-val">{dataPoint.temp}{tempUnit}</span>
          </div>
        )}

        {dataPoint.pop != null && dataPoint.pop > 0 && (
          <div className="tooltip-row rain">
            <span className="tooltip-label">Rain Chance:</span>
            <span className="tooltip-val">{dataPoint.pop}%</span>
          </div>
        )}
        {dataPoint.avgHumidity != null && (
          <div className="tooltip-row humidity">
            <span className="tooltip-label">Humidity:</span>
            <span className="tooltip-val">{dataPoint.avgHumidity}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

function ForecastChart({ forecast, units, theme = "dark" }) {
  const [viewMode, setViewMode] = useState("daily"); // "daily" | "hourly"
  const tempUnit = units === "metric" ? "°C" : "°F";
  const isLight = theme === "light";

  const gridStroke = isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.12)";
  const axisStroke = isLight ? "#475569" : "rgba(255, 255, 255, 0.75)";
  const axisLineStroke = isLight ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.2)";
  const legendColor = isLight ? "#0f172a" : "#ffffff";

  // Daily high / low data
  const dailyData = useMemo(() => {
    if (!forecast || !Array.isArray(forecast)) return [];
    return forecast.map((day, idx) => ({
      displayLabel: idx === 0 ? "Today" : day.dayName,
      subLabel: day.formattedDate,
      maxTemp: day.maxTemp,
      minTemp: day.minTemp,
      avgHumidity: day.avgHumidity,
      pop: day.pop,
      condition: day.condition,
    }));
  }, [forecast]);

  // Flattened 3-hourly data points for continuous timeline
  const hourlyData = useMemo(() => {
    if (!forecast || !Array.isArray(forecast)) return [];
    const list = [];
    forecast.forEach((day, dIdx) => {
      if (Array.isArray(day.hourly)) {
        day.hourly.forEach((hour) => {
          list.push({
            displayLabel: `${dIdx === 0 ? "Today" : day.dayName} ${hour.time}`,
            time: hour.time,
            dayName: day.dayName,
            temp: Number(hour.temp),
            pop: hour.pop,
            condition: hour.description,
          });
        });
      }
    });
    return list;
  }, [forecast]);

  if (!forecast || forecast.length === 0) return null;

  // Calculate domain padding for temperature axis
  const allTemps =
    viewMode === "daily"
      ? dailyData.flatMap((d) => [d.maxTemp, d.minTemp])
      : hourlyData.map((d) => d.temp).filter((t) => !isNaN(t));

  const minTemp = allTemps.length > 0 ? Math.min(...allTemps) - 2 : 0;
  const maxTemp = allTemps.length > 0 ? Math.max(...allTemps) + 2 : 40;

  return (
    <section id="forecast-temperature-chart" className="forecast-chart-section" aria-label="5-Day Temperature Forecast Chart">
      <div className="chart-header">
        <div className="chart-title-group">
          <FaChartLine className="chart-title-icon" aria-hidden="true" />
          <div>
            <h3 id="chart-heading" className="chart-title">
              Temperature Trend Visualization
            </h3>
            <p className="chart-subtitle">5-day temperature curve ({tempUnit})</p>
          </div>
        </div>

        <div className="chart-view-toggle" role="group" aria-label="Chart timescale view">
          <button
            id="chart-view-daily-btn"
            type="button"
            className={`view-btn ${viewMode === "daily" ? "active" : ""}`}
            onClick={() => setViewMode("daily")}
            aria-pressed={viewMode === "daily"}
          >
            Daily High / Low
          </button>
          <button
            id="chart-view-hourly-btn"
            type="button"
            className={`view-btn ${viewMode === "hourly" ? "active" : ""}`}
            onClick={() => setViewMode("hourly")}
            aria-pressed={viewMode === "hourly"}
          >
            3-Hour Flow
          </button>
        </div>
      </div>

      <div className="chart-body">
        <ResponsiveContainer width="100%" height={260}>
          {viewMode === "daily" ? (
            <LineChart
              data={dailyData}
              margin={{ top: 18, right: 18, left: -14, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridStroke}
                vertical={false}
              />
              <XAxis
                dataKey="displayLabel"
                stroke={axisStroke}
                tick={{ fill: axisStroke, fontSize: 12, fontWeight: 600 }}
                axisLine={{ stroke: axisLineStroke }}
                tickLine={false}
              />
              <YAxis
                domain={[minTemp, maxTemp]}
                stroke={axisStroke}
                tick={{ fill: axisStroke, fontSize: 12 }}
                tickFormatter={(val) => `${val}°`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={
                  <CustomChartTooltip units={units} viewMode="daily" />
                }
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 10, fontSize: "0.82rem", color: legendColor }}
              />
              <Line
                type="monotone"
                dataKey="maxTemp"
                name="High Temp"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ r: 5, fill: "#f97316", stroke: "#ffffff", strokeWidth: 2 }}
                activeDot={{ r: 7, fill: "#f97316", stroke: "#ffffff", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="minTemp"
                name="Low Temp"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ r: 5, fill: "#38bdf8", stroke: "#ffffff", strokeWidth: 2 }}
                activeDot={{ r: 7, fill: "#38bdf8", stroke: "#ffffff", strokeWidth: 2 }}
              />
            </LineChart>
          ) : (
            <LineChart
              data={hourlyData}
              margin={{ top: 18, right: 18, left: -14, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridStroke}
                vertical={false}
              />
              <XAxis
                dataKey="displayLabel"
                stroke={axisStroke}
                tick={{ fill: axisStroke, fontSize: 11 }}
                interval="preserveStartEnd"
                axisLine={{ stroke: axisLineStroke }}
                tickLine={false}
              />
              <YAxis
                domain={[minTemp, maxTemp]}
                stroke={axisStroke}
                tick={{ fill: axisStroke, fontSize: 12 }}
                tickFormatter={(val) => `${val}°`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={
                  <CustomChartTooltip units={units} viewMode="hourly" />
                }
              />
              <Line
                type="monotone"
                dataKey="temp"
                name="Temperature"
                stroke="#60a5fa"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#60a5fa" }}
                activeDot={{ r: 6, fill: "#3b82f6", stroke: "#ffffff", strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="chart-legend-footer">
        <div className="legend-chip high">
          <FaSun className="legend-icon high" />
          <span>Peak Daytime Temperatures</span>
        </div>
        <div className="legend-chip low">
          <FaMoon className="legend-icon low" />
          <span>Overnight Lows</span>
        </div>
      </div>
    </section>
  );
}

export default ForecastChart;
