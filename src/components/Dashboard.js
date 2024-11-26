import React from "react";
import { useLanguage } from "../Hoc/LanguageContext"; 
import Card from "./Card";  // Import the Card component

const Dashboard = () => {
  const { translations } = useLanguage();  // Access language and translations from context

  return (
    <div
      style={{
        width: "80%",
        margin: "0 auto",  
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#f9f9f9",  
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
        <div style={{ flex: "1" }}>
          <Card
            title={translations.latestNewsTitle}  // Use the title from translations
            content={translations.newsContent}   // Use the content from translations
            backgroundColor="#3b8e8c" 
          />
        </div>

        {/* Right Section: Dynamic Data */}
        <div style={{ flex: "1" }}>
          <Card
            title={translations.dynamicDataTitle}  // Use the title from translations
            content={translations.dynamicDataContent}   // Use the content from translations
            backgroundColor="#0c6a68"  
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
