import React, { useMemo } from "react";
import "./HumidityGauge.css";
import { MdOutlineWaterDrop } from "react-icons/md";

/**
 * Polar coordinate helper: 0 deg is 12 o'clock, sweeping clockwise.
 */
const getPointOnArc = (cx, cy, r, angleDeg) => {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.sin(rad),
    y: cy - r * Math.cos(rad),
  };
};

/**
 * Calculates Dew Point in current units using Magnus-Tetens formula
 */
export const calculateDewPoint = (temp, humidity, units = "metric") => {
  if (temp === undefined || humidity === undefined || humidity <= 0) return null;

  // Convert temp to Celsius if imperial
  const tempC = units === "imperial" ? ((temp - 32) * 5) / 9 : Number(temp);
  const rh = Math.min(100, Math.max(1, Number(humidity)));

  const a = 17.27;
  const b = 237.7;
  const alpha = (a * tempC) / (b + tempC) + Math.log(rh / 100);
  const dewPointC = (b * alpha) / (a - alpha);

  if (isNaN(dewPointC)) return null;

  if (units === "imperial") {
    return Math.round((dewPointC * 9) / 5 + 32);
  }
  return Math.round(dewPointC);
};

/**
 * Qualitative humidity classification and visual theme configuration
 */
export const getHumidityDetails = (humidity) => {
  const h = Number(humidity);
  if (isNaN(h) || h === undefined || h === null) {
    return {
      status: "Unknown",
      category: "unknown",
      description: "Atmospheric moisture data unavailable",
      colorStart: "#94a3b8",
      colorEnd: "#64748b",
      badgeColor: "#94a3b8",
      glowColor: "rgba(148, 163, 184, 0.4)",
      comfortLabel: "--",
    };
  }

  if (h < 30) {
    return {
      status: "Dry",
      category: "dry",
      description: "Low moisture: air may feel dry or cause static electricity",
      colorStart: "#fbbf24",
      colorEnd: "#f59e0b",
      badgeColor: "#f59e0b",
      glowColor: "rgba(245, 158, 11, 0.45)",
      comfortLabel: "Dry Air",
    };
  }
  if (h <= 60) {
    return {
      status: "Comfortable",
      category: "comfortable",
      description: "Optimal moisture level for human comfort and respiratory health",
      colorStart: "#38bdf8",
      colorEnd: "#10b981",
      badgeColor: "#10b981",
      glowColor: "rgba(16, 185, 129, 0.45)",
      comfortLabel: "Ideal Comfort",
    };
  }
  if (h <= 80) {
    return {
      status: "Humid",
      category: "humid",
      description: "Noticeable moisture: air feels muggy and sticky",
      colorStart: "#38bdf8",
      colorEnd: "#6366f1",
      badgeColor: "#6366f1",
      glowColor: "rgba(99, 102, 241, 0.45)",
      comfortLabel: "Humid",
    };
  }
  return {
    status: "Very Humid",
    category: "very-humid",
    description: "High saturation: heavy mugginess with potential rain or condensation",
    colorStart: "#818cf8",
    colorEnd: "#c084fc",
    badgeColor: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.45)",
    comfortLabel: "High Moisture",
  };
};

function HumidityGauge({
  value,
  temp,
  units = "metric",
  size = "md", // "sm", "md", "lg"
  showDewPoint = true,
  showScaleTicks = true,
  title = "Relative Humidity",
}) {
  const humidity = typeof value === "number" ? Math.min(100, Math.max(0, value)) : null;
  const details = useMemo(() => getHumidityDetails(humidity), [humidity]);
  const dewPoint = useMemo(
    () => calculateDewPoint(temp, humidity, units),
    [temp, humidity, units]
  );

  // SVG Geometry Settings (viewBox 0 0 200 175)
  // Arc sweeps 240 degrees: from -120 deg (8 o'clock) to +120 deg (4 o'clock)
  const cx = 100;
  const cy = 96;
  const r = 68;
  const startAngle = -120;
  const endAngle = 120;
  const sweepAngle = endAngle - startAngle; // 240

  // Start and End points for the full arc
  const startPt = getPointOnArc(cx, cy, r, startAngle);
  const endPt = getPointOnArc(cx, cy, r, endAngle);

  // Background arc SVG path
  const bgArcPath = `M ${startPt.x} ${startPt.y} A ${r} ${r} 0 1 1 ${endPt.x} ${endPt.y}`;

  // Comfort zone arc (30% to 60%)
  const comfortStartDeg = startAngle + (30 / 100) * sweepAngle; // -120 + 72 = -48
  const comfortEndDeg = startAngle + (60 / 100) * sweepAngle; // -120 + 144 = +24
  const comfortStartPt = getPointOnArc(cx, cy, r - 7, comfortStartDeg);
  const comfortEndPt = getPointOnArc(cx, cy, r - 7, comfortEndDeg);
  const comfortArcPath = `M ${comfortStartPt.x} ${comfortStartPt.y} A ${r - 7} ${r - 7} 0 0 1 ${comfortEndPt.x} ${comfortEndPt.y}`;

  // Current value marker calculations
  const validVal = humidity !== null ? humidity : 0;
  const currentAngleDeg = startAngle + (validVal / 100) * sweepAngle;
  const markerPt = getPointOnArc(cx, cy, r, currentAngleDeg);

  // Ticks at 0%, 25%, 50%, 75%, 100%
  const ticks = useMemo(() => {
    return [0, 25, 50, 75, 100].map((pct) => {
      const angle = startAngle + (pct / 100) * sweepAngle;
      const inner = getPointOnArc(cx, cy, r - 9, angle);
      const outer = getPointOnArc(cx, cy, r + 5, angle);
      return { pct, inner, outer };
    });
  }, [cx, cy, r, startAngle, sweepAngle]);

  const tempUnit = units === "metric" ? "°C" : "°F";

  return (
    <div
      id="humidity-circular-gauge"
      className={`humidity-gauge-component size-${size} category-${details.category}`}
      role="region"
      aria-label={`Current Humidity: ${humidity !== null ? `${humidity}%` : "Unavailable"}, Status: ${details.status}`}
    >
      {title && (
        <div className="gauge-header">
          <div className="gauge-title-group">
            <MdOutlineWaterDrop className="gauge-header-icon" aria-hidden="true" />
            <span className="gauge-title-text">{title}</span>
          </div>
          <span
            id="humidity-gauge-status-badge"
            className="gauge-status-badge"
            style={{
              backgroundColor: `${details.badgeColor}22`,
              borderColor: `${details.badgeColor}55`,
              color: details.badgeColor,
            }}
          >
            {details.status}
          </span>
        </div>
      )}

      {/* SVG Circular Gauge Canvas */}
      <div className="gauge-svg-wrapper">
        <svg
          className="gauge-svg"
          viewBox="0 0 200 175"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            {/* Dynamic Linear Gradient along the stroke */}
            <linearGradient id="humidityGaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={details.colorStart} />
              <stop offset="100%" stopColor={details.colorEnd} />
            </linearGradient>

            {/* Glowing filter for the marker tip */}
            <filter id="gaugeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={details.glowColor} />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d={bgArcPath}
            fill="none"
            className="gauge-track-bg"
            strokeWidth="11"
            strokeLinecap="round"
          />

          {/* Comfort Band (30% - 60%) */}
          <path
            d={comfortArcPath}
            fill="none"
            className="gauge-comfort-band"
            strokeWidth="3"
            strokeDasharray="2 3"
            title="Optimal comfort range (30-60%)"
          />

          {/* Tick Marks */}
          {showScaleTicks &&
            ticks.map(({ pct, inner, outer }) => (
              <line
                key={pct}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                className={`gauge-tick-line ${pct === 50 ? "mid-tick" : ""}`}
                strokeWidth={pct === 0 || pct === 50 || pct === 100 ? "2" : "1.2"}
              />
            ))}

          {/* Active Progress Arc using pathLength=100 */}
          <path
            d={bgArcPath}
            fill="none"
            className="gauge-progress-arc"
            stroke="url(#humidityGaugeGradient)"
            strokeWidth="11"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - validVal}
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.34, 1.25, 0.64, 1)",
            }}
          />

          {/* Glowing Indicator Orb / Pointer Tip */}
          {humidity !== null && (
            <g
              className="gauge-pointer-group"
              style={{
                transition: "all 0.8s cubic-bezier(0.34, 1.25, 0.64, 1)",
              }}
            >
              <circle
                cx={markerPt.x}
                cy={markerPt.y}
                r="7"
                fill="#ffffff"
                stroke={details.colorEnd}
                strokeWidth="2.5"
                filter="url(#gaugeGlow)"
              />
              <circle cx={markerPt.x} cy={markerPt.y} r="2.5" fill={details.colorEnd} />
            </g>
          )}

          {/* Bottom Scale Markers (0% and 100%) */}
          <text x="36" y="156" className="gauge-scale-label" textAnchor="middle">
            0%
          </text>
          <text x="100" y="24" className="gauge-scale-label mid" textAnchor="middle">
            50%
          </text>
          <text x="164" y="156" className="gauge-scale-label" textAnchor="middle">
            100%
          </text>
        </svg>

        {/* Center Content Overlay */}
        <div className="gauge-center-content">
          <div className="gauge-center-icon-wrap" style={{ color: details.colorEnd }}>
            <MdOutlineWaterDrop className="gauge-center-icon" aria-hidden="true" />
          </div>
          <div className="gauge-value-row">
            <span id="humidity-gauge-percentage" className="gauge-primary-number">
              {humidity !== null ? humidity : "--"}
            </span>
            <span className="gauge-percent-sign">%</span>
          </div>
          <span className="gauge-comfort-text">{details.comfortLabel}</span>
        </div>
      </div>

      {/* Description & Dew Point Readout */}
      <div className="gauge-footer-meta">
        <p className="gauge-desc-text">{details.description}</p>
        {showDewPoint && dewPoint !== null && (
          <div
            id="humidity-dew-point-tag"
            className="gauge-dew-point-pill"
            title="The temperature to which air must be cooled to become saturated with water vapor"
          >
            <span className="dew-label">Dew Point:</span>
            <strong className="dew-val">
              {dewPoint}
              {tempUnit}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
}

export default HumidityGauge;
