// Card.js
import React from "react";

const Card = ({ title, content, backgroundColor }) => {
  return (
    <div
      style={{
        backgroundColor: backgroundColor || "#0c6a68",
        borderRadius: "8px",
        padding: "20px",
        margin: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        color: "#fff",
        width: "100%", 
        minHeight: "500px",
      }}
    >

      <h3>{title}</h3>
   <div>{content}</div>
    </div>
  );
};

export default Card;
