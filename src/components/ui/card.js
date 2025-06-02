import React from "react";

export const Card = ({ children }) => (
  <div style={{
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "16px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    marginBottom: "1rem"
  }}>
    {children}
  </div>
);

export const CardContent = ({ children }) => (
  <div style={{ padding: "8px 0" }}>
    {children}
  </div>
);
