import React from "react";
import "./WeatherIcon.css";
import {
  WiDaySunny,
  WiNightClear,
  WiDayCloudy,
  WiNightAltCloudy,
  WiCloud,
  WiCloudy,
  WiDayRain,
  WiNightAltRain,
  WiRain,
  WiDayShowers,
  WiNightAltShowers,
  WiThunderstorm,
  WiDayThunderstorm,
  WiNightAltThunderstorm,
  WiSnow,
  WiDaySnow,
  WiNightAltSnow,
  WiFog,
  WiDust,
  WiSmoke,
  WiDayHaze,
} from "react-icons/wi";

/**
 * Returns weather icon component and theme class based on OpenWeather condition codes
 */
function getWeatherIconData(condition = "", conditionId = 800, iconCode = "01d") {
  const isNight = typeof iconCode === "string" && iconCode.endsWith("n");
  const mainLower = (condition || "").toLowerCase();
  const code = Number(conditionId) || 800;

  // 1. Thunderstorm (200 - 232)
  if ((code >= 200 && code < 300) || mainLower.includes("thunder")) {
    return {
      Icon: isNight ? WiNightAltThunderstorm : WiDayThunderstorm,
      FallbackIcon: WiThunderstorm,
      themeClass: "theme-thunderstorm",
      label: "Thunderstorm",
    };
  }

  // 2. Drizzle (300 - 321)
  if ((code >= 300 && code < 400) || mainLower.includes("drizzle")) {
    return {
      Icon: isNight ? WiNightAltShowers : WiDayShowers,
      FallbackIcon: WiRain,
      themeClass: "theme-drizzle",
      label: "Drizzle",
    };
  }

  // 3. Rain (500 - 531)
  if ((code >= 500 && code < 600) || mainLower.includes("rain")) {
    return {
      Icon: isNight ? WiNightAltRain : WiDayRain,
      FallbackIcon: WiRain,
      themeClass: "theme-rain",
      label: "Rain",
    };
  }

  // 4. Snow (600 - 622)
  if ((code >= 600 && code < 700) || mainLower.includes("snow")) {
    return {
      Icon: isNight ? WiNightAltSnow : WiDaySnow,
      FallbackIcon: WiSnow,
      themeClass: "theme-snow",
      label: "Snow",
    };
  }

  // 5. Atmosphere: Mist, Smoke, Haze, Dust, Fog, Sand, Ash, Squall, Tornado (700 - 781)
  if ((code >= 700 && code < 800) || mainLower.includes("mist") || mainLower.includes("fog") || mainLower.includes("haze")) {
    if (mainLower.includes("smoke")) {
      return { Icon: WiSmoke, FallbackIcon: WiFog, themeClass: "theme-fog", label: "Smoke" };
    }
    if (mainLower.includes("haze")) {
      return { Icon: WiDayHaze, FallbackIcon: WiFog, themeClass: "theme-haze", label: "Haze" };
    }
    if (mainLower.includes("dust") || mainLower.includes("sand")) {
      return { Icon: WiDust, FallbackIcon: WiFog, themeClass: "theme-dust", label: "Dust" };
    }
    return {
      Icon: WiFog,
      FallbackIcon: WiFog,
      themeClass: "theme-fog",
      label: "Fog & Mist",
    };
  }

  // 6. Clear (800)
  if (code === 800 || mainLower === "clear") {
    return {
      Icon: isNight ? WiNightClear : WiDaySunny,
      FallbackIcon: WiDaySunny,
      themeClass: isNight ? "theme-clear-night" : "theme-clear-day",
      label: isNight ? "Clear Night" : "Sunny",
    };
  }

  // 7. Clouds (801 - 804)
  if (code === 801 || code === 802 || mainLower.includes("few") || mainLower.includes("scattered")) {
    return {
      Icon: isNight ? WiNightAltCloudy : WiDayCloudy,
      FallbackIcon: WiCloud,
      themeClass: "theme-partly-cloudy",
      label: "Partly Cloudy",
    };
  }

  if (code >= 803 || mainLower.includes("cloud") || mainLower.includes("overcast")) {
    return {
      Icon: WiCloudy,
      FallbackIcon: WiCloud,
      themeClass: "theme-cloudy",
      label: "Overcast",
    };
  }

  // Default fallback
  return {
    Icon: isNight ? WiNightClear : WiDaySunny,
    FallbackIcon: WiDaySunny,
    themeClass: "theme-default",
    label: condition || "Weather",
  };
}

function WeatherIcon({
  condition = "Clear",
  conditionId = 800,
  iconCode = "01d",
  size = "md",
  className = "",
  showBadge = false,
  title = "",
}) {
  const { Icon, FallbackIcon, themeClass, label } = getWeatherIconData(
    condition,
    conditionId,
    iconCode
  );

  const SelectedIcon = Icon || FallbackIcon;

  return (
    <div
      className={`weather-icon-wrapper size-${size} ${themeClass} ${className}`}
      title={title || `${condition || label}`}
      aria-label={title || `${condition || label} weather icon`}
      role="img"
    >
      <SelectedIcon className="weather-icon-svg" />
      {showBadge && <span className="weather-icon-badge">{label}</span>}
    </div>
  );
}

export { getWeatherIconData };
export default WeatherIcon;
