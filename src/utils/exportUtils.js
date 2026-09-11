/**
 * Utility functions for formatting and exporting weather reports and forecasts
 * as formatted plain text and structured JSON summaries, with clipboard copy
 * and file download capabilities.
 */

/**
 * Generates an ASCII/plain text summary of current weather and 5-day forecast.
 */
export const generateTextSummary = (weather, forecast = [], units = "metric") => {
  if (!weather) return "";

  const tempUnit = units === "metric" ? "°C" : "°F";
  const speedUnit = units === "metric" ? "m/s" : "mph";
  const now = new Date();
  const dateStr = now.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  let text = `========================================\n`;
  text += ` WEATHER REPORT: ${weather.name}${weather.country ? `, ${weather.country}` : ""}\n`;
  text += ` Generated: ${dateStr} at ${timeStr}\n`;
  text += `========================================\n\n`;

  text += `CURRENT CONDITIONS:\n`;
  text += `• Temperature: ${Math.round(weather.temp)}${tempUnit}\n`;
  text += `• Feels Like:  ${Math.round(weather.feels_like)}${tempUnit}\n`;
  text += `• Condition:   ${weather.condition} (${weather.description})\n`;
  text += `• High / Low:  ${Math.round(weather.temp_max)}${tempUnit} / ${Math.round(weather.temp_min)}${tempUnit}\n`;
  text += `• Humidity:    ${weather.humidity}%\n`;
  text += `• Wind Speed:  ${weather.speed} ${speedUnit}\n`;
  text += `• Pressure:    ${weather.pressure} hPa\n\n`;

  if (forecast && forecast.length > 0) {
    text += `5-DAY FORECAST:\n`;
    text += `----------------------------------------\n`;
    forecast.forEach((day, i) => {
      const dayLabel = i === 0 ? "Today" : day.dayName || day.date;
      const rainInfo = day.pop != null && day.pop > 0 ? ` | Rain: ${day.pop}%` : "";
      text += `• ${dayLabel.padEnd(9)}: ${Math.round(day.maxTemp)}${tempUnit} / ${Math.round(day.minTemp)}${tempUnit} — ${day.condition}${rainInfo}\n`;
    });
    text += `----------------------------------------\n`;
  }

  text += `\nExported from Weather App\n`;
  return text;
};

/**
 * Generates a clean, formatted JSON summary of current weather and 5-day forecast.
 */
export const generateJsonSummary = (weather, forecast = [], units = "metric") => {
  if (!weather) return "{}";

  const exportData = {
    exportedAt: new Date().toISOString(),
    location: {
      city: weather.name,
      country: weather.country || "",
      coordinates: weather.coord || null,
    },
    units: {
      temperature: units === "metric" ? "°C" : "°F",
      windSpeed: units === "metric" ? "m/s" : "mph",
      pressure: "hPa",
      system: units,
    },
    current: {
      temperature: Math.round(weather.temp),
      feelsLike: Math.round(weather.feels_like),
      tempMin: Math.round(weather.temp_min),
      tempMax: Math.round(weather.temp_max),
      condition: weather.condition,
      description: weather.description,
      humidity: weather.humidity,
      windSpeed: weather.speed,
      pressure: weather.pressure,
      iconCode: weather.iconCode,
    },
    forecast: (forecast || []).map((day, idx) => ({
      dayIndex: idx,
      date: day.date,
      dayName: idx === 0 ? "Today" : day.dayName,
      formattedDate: day.formattedDate,
      condition: day.condition,
      description: day.description,
      highTemp: day.maxTemp,
      lowTemp: day.minTemp,
      precipitationProbabilityPercent: day.pop,
      humidityPercent: day.avgHumidity,
      windSpeed: day.avgWind,
    })),
  };

  return JSON.stringify(exportData, null, 2);
};

/**
 * Robust clipboard copy utility supporting navigator.clipboard with execCommand fallback.
 */
export const copyToClipboard = async (content) => {
  if (!content) return false;

  // Try modern Clipboard API first
  if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch (err) {
      console.warn("navigator.clipboard failed, attempting fallback copy:", err);
    }
  }

  // Fallback using textarea + execCommand for iframes or restricted environments
  try {
    const textArea = document.createElement("textarea");
    textArea.value = content;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.setAttribute("readonly", "");
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (fallbackErr) {
    console.error("Fallback clipboard copy failed:", fallbackErr);
    return false;
  }
};

/**
 * Downloads text or JSON content as a file to the user's computer.
 */
export const downloadFile = (filename, content, mimeType = "text/plain;charset=utf-8") => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error("Download failed:", err);
    return false;
  }
};
