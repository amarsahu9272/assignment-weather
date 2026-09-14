/**
 * Error Classification and Helper Utilities for Weather Application
 * Formats raw error strings or exceptions into actionable, structured error objects.
 */

export const ERROR_TYPES = {
  CITY_NOT_FOUND: "CITY_NOT_FOUND",
  GEO_DENIED: "GEO_DENIED",
  GEO_UNAVAILABLE: "GEO_UNAVAILABLE",
  GEO_TIMEOUT: "GEO_TIMEOUT",
  NETWORK_OFFLINE: "NETWORK_OFFLINE",
  RATE_LIMIT: "RATE_LIMIT",
  API_KEY_ERROR: "API_KEY_ERROR",
  EMPTY_SEARCH: "EMPTY_SEARCH",
  DATA_UNAVAILABLE: "DATA_UNAVAILABLE",
  SERVER_ERROR: "SERVER_ERROR",
  UNKNOWN: "UNKNOWN",
};

export const POPULAR_VERIFIED_CITIES = [
  "London",
  "New York",
  "Tokyo",
  "Paris",
  "Sydney",
  "Dubai",
  "Singapore",
  "San Francisco",
];

/**
 * Parses and categorizes any raw error into a structured error notification
 * @param {string|Error|object} rawError 
 * @param {object} context - { searchedCity, coords, targetUnits, retryFn }
 * @returns {object} Standardized structured error object
 */
export const formatWeatherError = (rawError, context = {}) => {
  const searchedCity = context.searchedCity || "";
  let rawMsg = "";

  if (typeof rawError === "string") {
    rawMsg = rawError;
  } else if (rawError && typeof rawError.message === "string") {
    rawMsg = rawError.message;
  } else if (rawError && rawError.error) {
    rawMsg = String(rawError.error);
  }

  const lower = rawMsg.toLowerCase();
  let type = ERROR_TYPES.UNKNOWN;
  let title = "Weather Data Unavailable";
  let message = rawMsg || "Could not retrieve weather information. Please try again.";
  let tips = [];
  let severity = "error"; // "error" | "warning" | "info"

  // 1. Empty search query
  if (
    lower.includes("enter a valid city") ||
    lower.includes("empty") ||
    (!searchedCity && lower.includes("city"))
  ) {
    type = ERROR_TYPES.EMPTY_SEARCH;
    title = "City Name Required";
    message = "Please enter a valid city name or airport code before searching.";
    tips = [
      "Type a city name such as 'London', 'Tokyo', or 'New York'.",
      "You can also use your current device GPS location using the arrow button.",
    ];
    severity = "warning";
  }
  // 2. City not found (404)
  else if (
    lower.includes("not found") ||
    lower.includes("404") ||
    lower.includes("city not found")
  ) {
    type = ERROR_TYPES.CITY_NOT_FOUND;
    title = "City Not Found";
    message = searchedCity
      ? `We couldn't find any location matching "${searchedCity}".`
      : "The requested city could not be found.";
    tips = [
      "Check the spelling of the city name.",
      "Try adding the state or 2-letter country code (e.g., 'Paris, FR' or 'Portland, OR').",
      "Search for a larger nearby metropolitan city or regional airport.",
      "Select one of the verified cities below.",
    ];
    severity = "error";
  }
  // 3. Geolocation permission denied
  else if (lower.includes("permission was denied") || lower.includes("permission denied")) {
    type = ERROR_TYPES.GEO_DENIED;
    title = "Location Access Denied";
    message = "Your browser blocked access to device location coordinates.";
    tips = [
      "Click the lock/settings icon next to your browser URL bar and allow Location access.",
      "Alternatively, type any city name manually in the search box above.",
    ];
    severity = "warning";
  }
  // 4. Geolocation unavailable
  else if (lower.includes("position is currently unavailable") || lower.includes("coordinates")) {
    type = ERROR_TYPES.GEO_UNAVAILABLE;
    title = "Location Unavailable";
    message = "Could not determine your physical GPS coordinates.";
    tips = [
      "Ensure GPS or device location services are switched on.",
      "Try searching for your city or district by name instead.",
    ];
    severity = "warning";
  }
  // 5. Geolocation timeout
  else if (lower.includes("request timed out") || lower.includes("timeout")) {
    type = ERROR_TYPES.GEO_TIMEOUT;
    title = "Location Request Timed Out";
    message = "The GPS satellite or Wi-Fi location check took too long to respond.";
    tips = [
      "Tap 'Retry' to attempt obtaining GPS coordinates again.",
      "Or enter your city manually in the search bar.",
    ];
    severity = "warning";
  }
  // 6. Network connection / offline
  else if (
    lower.includes("network") ||
    lower.includes("offline") ||
    lower.includes("failed to fetch") ||
    lower.includes("unable to connect") ||
    !navigator.onLine
  ) {
    type = ERROR_TYPES.NETWORK_OFFLINE;
    title = "Connection Lost / Offline";
    message = "Unable to reach the weather server. Please check your internet connection.";
    tips = [
      "Check your Wi-Fi or mobile data connection.",
      "The app will automatically re-fetch weather as soon as your connection is restored.",
    ];
    severity = "error";
  }
  // 7. Rate limit (429)
  else if (lower.includes("limit") || lower.includes("429") || lower.includes("too many requests")) {
    type = ERROR_TYPES.RATE_LIMIT;
    title = "Request Limit Reached";
    message = "The weather API request limit has been reached temporarily.";
    tips = [
      "Please wait a few moments before submitting another search.",
      "Cached weather data may continue to display in the meantime.",
    ];
    severity = "warning";
  }
  // 8. Unauthorized / API Key error (401)
  else if (lower.includes("unauthorized") || lower.includes("api key") || lower.includes("401")) {
    type = ERROR_TYPES.API_KEY_ERROR;
    title = "API Authorization Issue";
    message = "Weather service authorization failed. Please check API credentials.";
    tips = [
      "Verify your OpenWeatherMap API key in the configuration settings.",
    ];
    severity = "error";
  }
  // 9. Generic / Server error
  else {
    type = ERROR_TYPES.SERVER_ERROR;
    title = "Weather Service Error";
    message = rawMsg || "An unexpected error occurred while communicating with the weather provider.";
    tips = [
      "Click 'Retry' to request the latest weather observations.",
      "If the issue persists, try searching again in a few moments.",
    ];
  }

  return {
    id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type,
    title,
    message,
    tips,
    searchedCity,
    severity,
    timestamp: Date.now(),
    canRetry: type !== ERROR_TYPES.EMPTY_SEARCH,
    suggestions: POPULAR_VERIFIED_CITIES,
  };
};
