import React from "react";
import { useParams } from "react-router-dom";

const Details = () => {
  const { newsId } = useParams(); // Get the dynamic route parameter

  const getNewsDetails = (id) => {
    // Return details based on the newsId
    const details = {
      "outage-plant": "Details about the outage of generation plants within Delhi.",
      "license-transmission": "Details about the license for transmission and bulk supply of electricity.",
      "transmission-losses": "Details about transmission losses from FY 07-08 to FY 16-17.",
      "public-notice": "Details about the Public Notice.",
      "Load-curve": "Details About load curve .",
      "Load-shedding-Details":"Details about Load-shedding.",
      "Latest-Break-Down":"Details about Latest Break Down",
      "Demand-Availability":"Details about Demand Availability"
    };
    return details[id] || "No details available.";
  };

  return (
    <div
      style={{
        width: "80%",
        margin: "0 auto",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        color: "#808080",
      }}
    >
      <h1>{getNewsDetails(newsId)}</h1>
    </div>
  );
};

export default Details;
