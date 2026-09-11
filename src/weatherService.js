const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || "f1fed44ac2997179da8d24fd50688dcd";

const makeIconURL = (iconId) =>
  `https://openweathermap.org/img/wn/${iconId}@2x.png`;

// Popular cities database for instant fallback / local autocomplete matching
const POPULAR_CITIES = [
  { name: "Jamshedpur", country: "IN", state: "Jharkhand" },
  { name: "Mumbai", country: "IN", state: "Maharashtra" },
  { name: "Delhi", country: "IN", state: "Delhi" },
  { name: "Bangalore", country: "IN", state: "Karnataka" },
  { name: "Kolkata", country: "IN", state: "West Bengal" },
  { name: "Chennai", country: "IN", state: "Tamil Nadu" },
  { name: "Hyderabad", country: "IN", state: "Telangana" },
  { name: "Pune", country: "IN", state: "Maharashtra" },
  { name: "Ahmedabad", country: "IN", state: "Gujarat" },
  { name: "Jaipur", country: "IN", state: "Rajasthan" },
  { name: "London", country: "GB", state: "England" },
  { name: "New York", country: "US", state: "New York" },
  { name: "San Francisco", country: "US", state: "California" },
  { name: "Los Angeles", country: "US", state: "California" },
  { name: "Chicago", country: "US", state: "Illinois" },
  { name: "Seattle", country: "US", state: "Washington" },
  { name: "Miami", country: "US", state: "Florida" },
  { name: "Paris", country: "FR", state: "Île-de-France" },
  { name: "Tokyo", country: "JP", state: "Kanto" },
  { name: "Sydney", country: "AU", state: "New South Wales" },
  { name: "Melbourne", country: "AU", state: "Victoria" },
  { name: "Dubai", country: "AE", state: "Dubai" },
  { name: "Singapore", country: "SG", state: "" },
  { name: "Berlin", country: "DE", state: "Berlin" },
  { name: "Munich", country: "DE", state: "Bavaria" },
  { name: "Rome", country: "IT", state: "Lazio" },
  { name: "Madrid", country: "ES", state: "Madrid" },
  { name: "Barcelona", country: "ES", state: "Catalonia" },
  { name: "Amsterdam", country: "NL", state: "North Holland" },
  { name: "Toronto", country: "CA", state: "Ontario" },
  { name: "Vancouver", country: "CA", state: "British Columbia" },
  { name: "Montreal", country: "CA", state: "Quebec" },
  { name: "Seoul", country: "KR", state: "Seoul" },
  { name: "Bangkok", country: "TH", state: "Bangkok" },
  { name: "Cairo", country: "EG", state: "Cairo" },
  { name: "Istanbul", country: "TR", state: "Istanbul" },
  { name: "Buenos Aires", country: "AR", state: "Buenos Aires" },
  { name: "Sao Paulo", country: "BR", state: "Sao Paulo" },
  { name: "Mexico City", country: "MX", state: "CDMX" },
  { name: "Auckland", country: "NZ", state: "Auckland" },
  { name: "Zurich", country: "CH", state: "Zurich" },
  { name: "Vienna", country: "AT", state: "Vienna" },
  { name: "Dublin", country: "IE", state: "Leinster" },
];

/**
 * Autocomplete / city suggestion search.
 * Queries OpenWeatherMap Geo API and merges with popular cities.
 */
const searchCitySuggestions = async (query) => {
  const trimmed = typeof query === "string" ? query.trim() : "";
  if (!trimmed || trimmed.length < 2) return [];

  const lowerQuery = trimmed.toLowerCase();

  // Instant local matches
  const localMatches = POPULAR_CITIES.filter((item) =>
    item.name.toLowerCase().includes(lowerQuery)
  ).map((c) => ({
    name: c.name,
    country: c.country,
    state: c.state,
    label: c.state ? `${c.name}, ${c.state}, ${c.country}` : `${c.name}, ${c.country}`,
    queryTerm: c.name,
  }));

  try {
    const geoURL = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      trimmed
    )}&limit=6&appid=${API_KEY}`;

    const res = await fetch(geoURL);
    if (res.ok) {
      const apiResults = await res.json();
      if (Array.isArray(apiResults) && apiResults.length > 0) {
        const mappedApi = apiResults.map((item) => ({
          name: item.name,
          country: item.country || "",
          state: item.state || "",
          label: item.state
            ? `${item.name}, ${item.state}, ${item.country}`
            : item.country
            ? `${item.name}, ${item.country}`
            : item.name,
          queryTerm: item.state
            ? `${item.name}, ${item.state}, ${item.country}`
            : item.country
            ? `${item.name}, ${item.country}`
            : item.name,
        }));

        // Deduplicate with local matches
        const seen = new Set();
        const combined = [];
        for (const item of [...mappedApi, ...localMatches]) {
          const key = `${item.name.toLowerCase()}-${item.country.toLowerCase()}-${(item.state || "").toLowerCase()}`;
          if (!seen.has(key)) {
            seen.add(key);
            combined.push(item);
          }
        }
        return combined.slice(0, 6);
      }
    }
  } catch (err) {
    console.warn("Geocoding API suggestion fetch failed, using local suggestions:", err);
  }

  return localMatches.slice(0, 6);
};

/**
 * Parses raw OpenWeatherMap weather response into standardized object
 */
const parseWeatherData = (data, fallbackCity = "") => {
  const {
    coord,
    weather,
    main: { temp, feels_like, temp_min, temp_max, pressure, humidity },
    wind: { speed },
    sys: { country } = {},
    name,
  } = data;

  const weatherItem = Array.isArray(weather) && weather.length > 0 ? weather[0] : {};
  const {
    id: conditionId = 800,
    description = "clear sky",
    icon = "01d",
    main: conditionMain = "Clear",
  } = weatherItem;

  return {
    coord: coord || null,
    description,
    condition: conditionMain,
    conditionId,
    iconCode: icon,
    iconURL: makeIconURL(icon),
    temp,
    feels_like,
    temp_min,
    temp_max,
    pressure,
    humidity,
    speed,
    country: country || "",
    name: name || fallbackCity,
  };
};

/**
 * Parses raw OpenWeatherMap forecast response into 5 daily items
 */
const parseForecastData = (data) => {
  if (!data || !Array.isArray(data.list)) return [];

  // Group list entries by date string (YYYY-MM-DD)
  const dailyMap = new Map();

  data.list.forEach((item) => {
    const dateKey = item.dt_txt
      ? item.dt_txt.split(" ")[0]
      : new Date(item.dt * 1000).toISOString().split("T")[0];
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, []);
    }
    dailyMap.get(dateKey).push(item);
  });

  const days = [];
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  dailyMap.forEach((entries, dateKey) => {
    const dateObj = new Date(entries[0].dt * 1000);
    const dayOfWeek = weekdays[dateObj.getDay()];
    const monthName = months[dateObj.getMonth()];
    const dayOfMonth = dateObj.getDate();

    let minTemp = Infinity;
    let maxTemp = -Infinity;
    let humiditySum = 0;
    let maxPop = 0;
    let windSum = 0;

    let representative = entries[0];
    let bestHourDiff = Infinity;

    entries.forEach((entry) => {
      if (entry.main) {
        if (entry.main.temp_min < minTemp) minTemp = entry.main.temp_min;
        if (entry.main.temp_max > maxTemp) maxTemp = entry.main.temp_max;
        humiditySum += entry.main.humidity || 0;
      }
      if (entry.pop && entry.pop > maxPop) {
        maxPop = entry.pop;
      }
      if (entry.wind && entry.wind.speed) {
        windSum += entry.wind.speed;
      }

      const entryHour = new Date(entry.dt * 1000).getHours();
      const diff = Math.abs(entryHour - 12);
      if (diff < bestHourDiff) {
        bestHourDiff = diff;
        representative = entry;
      }
    });

    const weatherItem =
      Array.isArray(representative.weather) && representative.weather.length > 0
        ? representative.weather[0]
        : {};

    const hourlyBreakdown = entries.map((e) => {
      const hTime = new Date(e.dt * 1000).toLocaleTimeString([], { hour: "numeric", hour12: true });
      const hWeather = Array.isArray(e.weather) && e.weather.length > 0 ? e.weather[0] : {};
      return {
        time: hTime,
        temp: e.main ? Math.round(e.main.temp) : "--",
        iconCode: hWeather.icon || "01d",
        iconURL: makeIconURL(hWeather.icon || "01d"),
        condition: hWeather.main || "Clear",
        conditionId: hWeather.id || 800,
        description: hWeather.description || "",
        pop: Math.round((e.pop || 0) * 100),
      };
    });

    days.push({
      date: dateKey,
      dayName: dayOfWeek,
      formattedDate: `${monthName} ${dayOfMonth}`,
      minTemp: Math.round(minTemp),
      maxTemp: Math.round(maxTemp),
      avgHumidity: Math.round(humiditySum / entries.length),
      avgWind: Math.round(windSum / entries.length),
      pop: Math.round(maxPop * 100),
      condition: weatherItem.main || "Clear",
      conditionId: weatherItem.id || 800,
      iconCode: weatherItem.icon || "01d",
      description: weatherItem.description || "Clear",
      iconURL: makeIconURL(weatherItem.icon || "01d"),
      hourly: hourlyBreakdown,
    });
  });

  return days.slice(0, 5);
};

/**
 * Fetch Current Weather by City Name
 */
const getFormattedWeatherData = async (city, units = "metric") => {
  const trimmedCity = typeof city === "string" ? city.trim() : "";
  if (!trimmedCity) {
    return {
      success: false,
      error: "Please enter a valid city name.",
    };
  }

  try {
    const URL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      trimmedCity
    )}&appid=${API_KEY}&units=${units}`;

    const res = await fetch(URL);
    const data = await res.json();

    if (!res.ok || !data.main) {
      let errorMessage = "Could not retrieve weather data. Please try again.";
      if (res.status === 404 || data.cod === "404" || data.cod === 404) {
        errorMessage = `City "${trimmedCity}" was not found. Please check the spelling and try again.`;
      } else if (res.status === 401 || data.cod === 401) {
        errorMessage = "Invalid API key or unauthorized request. Please verify your OpenWeatherMap API key.";
      } else if (res.status === 429 || data.cod === 429) {
        errorMessage = "Weather API request limit reached. Please wait a few seconds before searching again.";
      } else if (data.message) {
        errorMessage = data.message.charAt(0).toUpperCase() + data.message.slice(1) + ".";
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    return {
      success: true,
      data: parseWeatherData(data, trimmedCity),
    };
  } catch (error) {
    console.error("Network or parsing error while fetching weather data:", error);
    return {
      success: false,
      error: "Network error: Unable to connect to the weather service. Please check your internet connection.",
    };
  }
};

/**
 * Fetch Current Weather by Coordinates (Browser Geolocation API)
 */
const getWeatherByCoords = async (lat, lon, units = "metric") => {
  if (lat == null || lon == null) {
    return {
      success: false,
      error: "Latitude and longitude are required.",
    };
  }

  try {
    const URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
    const res = await fetch(URL);
    const data = await res.json();

    if (!res.ok || !data.main) {
      return {
        success: false,
        error: data.message || "Failed to retrieve weather for your coordinates.",
      };
    }

    return {
      success: true,
      data: parseWeatherData(data, "My Location"),
    };
  } catch (error) {
    console.error("Error fetching weather by coords:", error);
    return {
      success: false,
      error: "Unable to retrieve weather for your location. Please check your network connection.",
    };
  }
};

/**
 * Fetch 5-Day Weather Forecast by City Name
 */
const get5DayForecast = async (city, units = "metric") => {
  const trimmedCity = typeof city === "string" ? city.trim() : "";
  if (!trimmedCity) {
    return {
      success: false,
      error: "City is required to fetch forecast.",
    };
  }

  try {
    const URL = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
      trimmedCity
    )}&appid=${API_KEY}&units=${units}`;

    const res = await fetch(URL);
    const data = await res.json();

    if (!res.ok || !Array.isArray(data.list)) {
      return {
        success: false,
        error: data.message || "Failed to fetch forecast data.",
      };
    }

    return {
      success: true,
      data: parseForecastData(data),
    };
  } catch (error) {
    console.error("Error fetching 5-day forecast:", error);
    return {
      success: false,
      error: "Unable to retrieve 5-day forecast. Please try again later.",
    };
  }
};

/**
 * Fetch 5-Day Weather Forecast by Coordinates
 */
const get5DayForecastByCoords = async (lat, lon, units = "metric") => {
  if (lat == null || lon == null) {
    return {
      success: false,
      error: "Latitude and longitude are required.",
    };
  }

  try {
    const URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
    const res = await fetch(URL);
    const data = await res.json();

    if (!res.ok || !Array.isArray(data.list)) {
      return {
        success: false,
        error: data.message || "Failed to fetch forecast data for your coordinates.",
      };
    }

    return {
      success: true,
      data: parseForecastData(data),
    };
  } catch (error) {
    console.error("Error fetching forecast by coords:", error);
    return {
      success: false,
      error: "Unable to retrieve 5-day forecast for your location.",
    };
  }
};

/**
 * Classifies warning severity levels for visual styling and badge labeling.
 */
const classifySeverity = (eventName = "", desc = "") => {
  const text = `${eventName} ${desc}`.toLowerCase();
  if (
    text.includes("warning") ||
    text.includes("danger") ||
    text.includes("severe") ||
    text.includes("tornado") ||
    text.includes("hurricane") ||
    text.includes("extreme")
  ) {
    return "warning"; // High / Critical (red/amber)
  }
  if (
    text.includes("watch") ||
    text.includes("gale") ||
    text.includes("flood") ||
    text.includes("storm")
  ) {
    return "watch"; // Medium / High awareness (orange)
  }
  return "advisory"; // Information / Precautionary (yellow/cyan)
};

/**
 * Fetches active weather warnings using OpenWeatherMap One Call API or relevant alerts endpoint,
 * complemented with meteorological condition evaluation from current and forecast data feeds.
 */
const getWeatherAlerts = async (
  lat = null,
  lon = null,
  currentWeather = null,
  forecastData = [],
  units = "metric"
) => {
  const alertsList = [];
  let oneCallQueried = false;
  let oneCallSucceeded = false;

  // 1. Attempt to fetch official warnings from OpenWeatherMap One Call API
  if (lat != null && lon != null) {
    oneCallQueried = true;
    try {
      const oneCallURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily&appid=${API_KEY}`;
      const res = await fetch(oneCallURL);
      if (res.ok) {
        const data = await res.json();
        oneCallSucceeded = true;
        if (Array.isArray(data.alerts) && data.alerts.length > 0) {
          data.alerts.forEach((alert, idx) => {
            alertsList.push({
              id: `onecall-${idx}-${alert.start || Date.now()}`,
              event: alert.event || "Active Weather Warning",
              senderName: alert.sender_name || "National Weather Service",
              start: alert.start ? new Date(alert.start * 1000).toLocaleString() : "Active Now",
              end: alert.end ? new Date(alert.end * 1000).toLocaleString() : "Until further notice",
              description: alert.description || "Active weather alert issued for this region.",
              tags: Array.isArray(alert.tags) ? alert.tags : [],
              severity: classifySeverity(alert.event, alert.description),
              source: "OpenWeatherMap One Call API",
              isOfficial: true,
            });
          });
        }
      }
    } catch (err) {
      console.warn("One Call API alert fetch error/unsupported:", err);
    }
  }

  // 2. If no official One Call alerts were returned, perform meteorological analysis
  // of current weather conditions and upcoming forecast to identify active warnings
  if (alertsList.length === 0 && currentWeather) {
    const cityName = currentWeather.name || "this location";
    const temp = Number(currentWeather.temp);
    const feelsLike = Number(currentWeather.feels_like);
    const windSpeed = Number(currentWeather.speed);
    const condId = Number(currentWeather.conditionId) || 800;
    const condMain = (currentWeather.condition || "").toLowerCase();

    // Check: Severe Thunderstorm
    if ((condId >= 200 && condId < 300) || condMain.includes("thunder")) {
      alertsList.push({
        id: `computed-thunder-${Date.now()}`,
        event: "Severe Thunderstorm Warning",
        senderName: "Meteorological Alert Center",
        start: "Active Now",
        end: "Next 2–4 Hours",
        description: `Active thunderstorm cluster detected in ${cityName}. Frequent cloud-to-ground lightning and localized intense downpours are occurring. Stay away from windows and remain indoors.`,
        tags: ["Thunderstorm", "Lightning Safety", "Severe Weather"],
        severity: "warning",
        source: "Live Observation Analysis",
        isOfficial: false,
      });
    }

    // Check: High Wind / Gale Warning
    const highWindThreshold = units === "metric" ? 13.9 : 31; // ~50 km/h or 31 mph
    if (windSpeed >= highWindThreshold) {
      alertsList.push({
        id: `computed-wind-${Date.now()}`,
        event: "High Wind Advisory",
        senderName: "Meteorological Alert Center",
        start: "Active Now",
        end: "Through Today",
        description: `Hazardous sustained winds of ${windSpeed} ${units === "metric" ? "m/s" : "mph"} recorded in ${cityName}. Secure loose patio furniture and exercise caution when operating high-profile vehicles.`,
        tags: ["High Winds", "Gale Advisory", "Wind Gusts"],
        severity: "watch",
        source: "Live Observation Analysis",
        isOfficial: false,
      });
    }

    // Check: Excessive Heat Warning
    const heatThreshold = units === "metric" ? 37 : 98;
    const feelsLikeHeatThreshold = units === "metric" ? 40 : 104;
    if (temp >= heatThreshold || feelsLike >= feelsLikeHeatThreshold) {
      alertsList.push({
        id: `computed-heat-${Date.now()}`,
        event: "Excessive Heat Warning",
        senderName: "Public Health & Weather Advisory",
        start: "Current",
        end: "Through Evening",
        description: `Dangerous heat index of ${Math.round(feelsLike)}°${units === "metric" ? "C" : "F"} observed in ${cityName}. Prolonged outdoor exertion significantly increases risk of heat exhaustion or heat stroke. Stay hydrated and avoid peak sun hours.`,
        tags: ["Excessive Heat", "UV Safety", "Health Risk"],
        severity: "warning",
        source: "Live Observation Analysis",
        isOfficial: false,
      });
    }

    // Check: Freeze / Frost Warning
    const freezingThreshold = units === "metric" ? 0 : 32;
    if (temp <= freezingThreshold) {
      alertsList.push({
        id: `computed-freeze-${Date.now()}`,
        event: "Freeze & Frost Warning",
        senderName: "Agricultural & Safety Advisory",
        start: "Effective Now",
        end: "Through Morning",
        description: `Sub-freezing temperatures of ${Math.round(temp)}°${units === "metric" ? "C" : "F"} recorded in ${cityName}. Frost and ice buildup may impact road surfaces, delicate greenery, and exposed plumbing.`,
        tags: ["Freeze Warning", "Frost Hazard", "Cold Weather"],
        severity: "advisory",
        source: "Live Observation Analysis",
        isOfficial: false,
      });
    }

    // Check: Torrential Rain / Flood Advisory
    if ([502, 503, 504, 522].includes(condId)) {
      alertsList.push({
        id: `computed-flood-${Date.now()}`,
        event: "Heavy Rain & Urban Flood Advisory",
        senderName: "Hydrological Safety Advisory",
        start: "Active",
        end: "Next 3–6 Hours",
        description: `Torrential rainfall rates in effect for ${cityName}. Rapid water accumulation may cause ponding on urban highways and localized low-lying flooding. Never drive through flooded roadways.`,
        tags: ["Torrential Rain", "Flood Advisory", "Road Hazard"],
        severity: "watch",
        source: "Live Observation Analysis",
        isOfficial: false,
      });
    }

    // Check: Dense Fog / Visibility Hazard
    if (condId === 741 || condId === 711) {
      alertsList.push({
        id: `computed-fog-${Date.now()}`,
        event: "Dense Fog & Low Visibility Advisory",
        senderName: "Transportation Weather Safety",
        start: "Active",
        end: "Next 2–4 Hours",
        description: `Dense fog and particulate haze severely limiting horizontal visibility in ${cityName}. Maintain ample braking distance and use low beams.`,
        tags: ["Dense Fog", "Low Visibility", "Driving Advisory"],
        severity: "advisory",
        source: "Live Observation Analysis",
        isOfficial: false,
      });
    }

    // Check: Upcoming forecast thunderstorm / extreme weather
    if (alertsList.length === 0 && Array.isArray(forecastData) && forecastData.length > 1) {
      const upcomingStorm = forecastData.slice(1).find(
        (day) =>
          (day.conditionId >= 200 && day.conditionId < 300) ||
          (day.condition || "").toLowerCase().includes("thunder")
      );
      if (upcomingStorm) {
        alertsList.push({
          id: `forecast-storm-${upcomingStorm.date}`,
          event: "Upcoming Thunderstorm Watch",
          senderName: "Extended Forecast Advisory",
          start: upcomingStorm.dayName || upcomingStorm.formattedDate,
          end: "End of Day",
          description: `Potential for severe thunderstorms identified for ${upcomingStorm.dayName || upcomingStorm.formattedDate} with rain probability of ${upcomingStorm.pop || 50}%. Keep abreast of latest radar updates.`,
          tags: ["Forecast Watch", "Thunderstorm Risk"],
          severity: "advisory",
          source: "5-Day Forecast Model",
          isOfficial: false,
        });
      }
    }
  }

  return {
    success: true,
    alerts: alertsList,
    checkedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    oneCallQueried,
    oneCallSucceeded,
  };
};

export {
  getFormattedWeatherData,
  getWeatherByCoords,
  get5DayForecast,
  get5DayForecastByCoords,
  getWeatherAlerts,
  searchCitySuggestions,
  makeIconURL,
};
