import React from "react";
import "./Description.css";

import { FaArrowUp, FaArrowDown, FaWind } from "react-icons/fa";
import { BiHappy } from "react-icons/bi";
import { MdCompress, MdOutlineWaterDrop } from "react-icons/md";

function Description({ weather, units }) {
  if (!weather) return null;

  const tempUnit = units === "metric" ? "°C" : "°F";
  const windUnit = units === "metric" ? "m/s" : "m/h";

  const formatNumber = (val) => {
    if (val === undefined || val === null || isNaN(val)) return "--";
    return Math.round(val);
  };

  const cards = [
    {
      id: 1,
      icon: <FaArrowDown aria-hidden="true" />,
      title: "min temp",
      data: formatNumber(weather.temp_min),
      unit: tempUnit,
    },
    {
      id: 2,
      icon: <FaArrowUp aria-hidden="true" />,
      title: "max temp",
      data: formatNumber(weather.temp_max),
      unit: tempUnit,
    },
    {
      id: 3,
      icon: <BiHappy aria-hidden="true" />,
      title: "feels like",
      data: formatNumber(weather.feels_like),
      unit: tempUnit,
    },
    {
      id: 4,
      icon: <MdCompress aria-hidden="true" />,
      title: "pressure",
      data: weather.pressure ?? "--",
      unit: "hPa",
    },
    {
      id: 5,
      icon: <MdOutlineWaterDrop aria-hidden="true" />,
      title: "humidity",
      data: weather.humidity ?? "--",
      unit: "%",
    },
    {
      id: 6,
      icon: <FaWind aria-hidden="true" />,
      title: "wind speed",
      data: formatNumber(weather.speed),
      unit: windUnit,
    },
  ];

  return (
    <div id="weather-description-metrics" className="section section__descriptions" aria-label="Detailed Weather Metrics">
      {cards.map(({ id, icon, title, data, unit }) => (
        <div key={id} className="card" id={`metric-card-${id}`}>
          <div className="description__card-icon">
            {icon}
            <small>{title}</small>
          </div>
          <h2>{`${data} ${unit}`}</h2>
        </div>
      ))}
    </div>
  );
}

export default Description;
