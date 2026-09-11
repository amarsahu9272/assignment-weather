import hotBg from "../assets/hot.jpg";
import coldBg from "../assets/cold.jpg";
import hot1Bg from "../assets/hot1.jpg";
import cold1Bg from "../assets/cold1.jpg";
import hot11Bg from "../assets/hot11.jpg";

/**
 * Returns weather condition category and atmospheric background configurations
 * based on the OpenWeatherMap condition, code, day/night flag, and light/dark theme.
 */
export const getWeatherBackgroundConfig = (weather, theme = "dark") => {
  if (!weather) {
    // Default fallback
    return {
      category: "default",
      label: "Standard Weather",
      theme,
      backgroundImage:
        theme === "light"
          ? `linear-gradient(135deg, #38bdf8 0%, #60a5fa 50%, #93c5fd 100%)`
          : `linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #020617 100%)`,
      overlayColor:
        theme === "light" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.35)",
    };
  }

  const cond = (weather.condition || "").toLowerCase();
  const desc = (weather.description || "").toLowerCase();
  const code = Number(weather.conditionId) || 800;
  const isNight = Boolean(weather.iconCode && weather.iconCode.includes("n"));
  const isLight = theme === "light";

  // 1. THUNDERSTORM (200 - 232)
  if ((code >= 200 && code < 300) || cond.includes("thunder")) {
    return {
      category: "thunderstorm",
      label: "Severe Thunderstorm",
      theme,
      isNight,
      backgroundImage: isLight
        ? `linear-gradient(135deg, rgba(30, 27, 75, 0.82) 0%, rgba(76, 29, 149, 0.72) 50%, rgba(30, 41, 59, 0.85) 100%), url(${cold1Bg})`
        : `linear-gradient(135deg, rgba(9, 9, 11, 0.92) 0%, rgba(59, 7, 100, 0.85) 50%, rgba(15, 23, 42, 0.92) 100%), url(${cold1Bg})`,
      overlayColor: isLight ? "rgba(0, 0, 0, 0.22)" : "rgba(0, 0, 0, 0.45)",
    };
  }

  // 2. DRIZZLE (300 - 321)
  if ((code >= 300 && code < 400) || cond.includes("drizzle")) {
    return {
      category: "drizzle",
      label: "Gentle Drizzle",
      theme,
      isNight,
      backgroundImage: isLight
        ? `linear-gradient(135deg, rgba(56, 189, 248, 0.75) 0%, rgba(71, 85, 105, 0.72) 50%, rgba(14, 165, 233, 0.75) 100%), url(${coldBg})`
        : `linear-gradient(135deg, rgba(12, 74, 110, 0.88) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(30, 41, 59, 0.9) 100%), url(${coldBg})`,
      overlayColor: isLight ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.38)",
    };
  }

  // 3. RAINY / SHOWERS (500 - 531)
  if ((code >= 500 && code < 600) || cond.includes("rain")) {
    return {
      category: "rainy",
      label: "Rain Showers",
      theme,
      isNight,
      backgroundImage: isLight
        ? `linear-gradient(135deg, rgba(29, 78, 216, 0.75) 0%, rgba(3, 105, 161, 0.72) 45%, rgba(51, 65, 85, 0.78) 100%), url(${coldBg})`
        : `linear-gradient(135deg, rgba(2, 6, 23, 0.9) 0%, rgba(12, 74, 110, 0.85) 45%, rgba(15, 23, 42, 0.92) 100%), url(${coldBg})`,
      overlayColor: isLight ? "rgba(0, 0, 0, 0.18)" : "rgba(0, 0, 0, 0.42)",
    };
  }

  // 4. SNOWY / FLURRIES (600 - 622)
  if ((code >= 600 && code < 700) || cond.includes("snow")) {
    return {
      category: "snowy",
      label: "Snow & Frost",
      theme,
      isNight,
      backgroundImage: isLight
        ? `linear-gradient(135deg, rgba(186, 230, 253, 0.78) 0%, rgba(147, 197, 253, 0.7) 45%, rgba(224, 242, 254, 0.8) 100%), url(${cold1Bg})`
        : `linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 58, 138, 0.85) 45%, rgba(3, 105, 161, 0.88) 100%), url(${cold1Bg})`,
      overlayColor: isLight ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.35)",
    };
  }

  // 5. ATMOSPHERE / MIST / FOG / HAZE / SMOKE (700 - 781)
  if (
    (code >= 700 && code < 800) ||
    cond.includes("mist") ||
    cond.includes("fog") ||
    cond.includes("haze") ||
    cond.includes("smoke") ||
    cond.includes("dust")
  ) {
    return {
      category: "foggy",
      label: "Mist & Fog",
      theme,
      isNight,
      backgroundImage: isLight
        ? `linear-gradient(135deg, rgba(203, 213, 225, 0.85) 0%, rgba(148, 163, 184, 0.8) 50%, rgba(226, 232, 240, 0.85) 100%), url(${coldBg})`
        : `linear-gradient(135deg, rgba(30, 41, 59, 0.92) 0%, rgba(15, 23, 42, 0.92) 50%, rgba(51, 65, 85, 0.88) 100%), url(${coldBg})`,
      overlayColor: isLight ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.35)",
    };
  }

  // 6. CLOUDY / OVERCAST (801 - 804)
  if (code > 800 && code <= 804) {
    const isOvercast = code >= 803 || desc.includes("overcast") || desc.includes("broken");
    return {
      category: "cloudy",
      label: isOvercast ? "Overcast Clouds" : "Partly Cloudy",
      theme,
      isNight,
      backgroundImage: isNight
        ? `linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(2, 6, 23, 0.94) 100%), url(${coldBg})`
        : isLight
        ? `linear-gradient(135deg, rgba(148, 163, 184, 0.78) 0%, rgba(203, 213, 225, 0.72) 45%, rgba(100, 116, 139, 0.8) 100%), url(${hot11Bg})`
        : `linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.85) 50%, rgba(15, 23, 42, 0.92) 100%), url(${hot11Bg})`,
      overlayColor: isLight ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.38)",
    };
  }

  // 7. CLEAR SKY / SUNNY (800)
  if (isNight) {
    return {
      category: "clear_night",
      label: "Clear Night Sky",
      theme,
      isNight: true,
      backgroundImage: isLight
        ? `linear-gradient(135deg, rgba(30, 27, 75, 0.85) 0%, rgba(15, 23, 42, 0.88) 50%, rgba(49, 46, 129, 0.82) 100%), url(${coldBg})`
        : `linear-gradient(135deg, rgba(2, 6, 23, 0.92) 0%, rgba(15, 23, 42, 0.9) 40%, rgba(30, 27, 75, 0.88) 100%), url(${coldBg})`,
      overlayColor: "rgba(0, 0, 0, 0.4)",
    };
  }

  // Sunny / Clear Day
  return {
    category: "sunny",
    label: "Sunny & Clear Sky",
    theme,
    isNight: false,
    backgroundImage: isLight
      ? `linear-gradient(135deg, rgba(14, 165, 233, 0.72) 0%, rgba(56, 189, 248, 0.65) 40%, rgba(251, 191, 36, 0.62) 100%), url(${hot1Bg})`
      : `linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 58, 138, 0.82) 50%, rgba(245, 158, 11, 0.45) 100%), url(${hotBg})`,
    overlayColor: isLight ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.32)",
  };
};
