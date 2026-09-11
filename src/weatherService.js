const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || "f1fed44ac2997179da8d24fd50688dcd";

const makeIconURL = (iconId) =>
  `https://openweathermap.org/img/wn/${iconId}@2x.png`;

const getFormattedWeatherData = async (city, units = "metric") => {
  try {
    const URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${units}`;

    const res = await fetch(URL);
    const data = await res.json();
    if (!res.ok || !data.main) {
      console.warn("Weather API message:", data.message || "Failed to fetch weather");
      return null;
    }

    const {
      weather,
      main: { temp, feels_like, temp_min, temp_max, pressure, humidity },
      wind: { speed },
      sys: { country },
      name,
    } = data;

    const { description, icon } = weather[0];

    return {
      description,
      iconURL: makeIconURL(icon),
      temp,
      feels_like,
      temp_min,
      temp_max,
      pressure,
      humidity,
      speed,
      country,
      name,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
};

export { getFormattedWeatherData };
