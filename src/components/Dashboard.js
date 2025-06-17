import React, { useEffect, useState } from "react";
import { useLanguage } from "../Hoc/LanguageContext";
import Card from "./Card";
import useFetchData from "../lib/useFetchData";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { translations } = useLanguage();

  // Use the custom hook to fetch data
  const { data, loading, error } = useFetchData("dynamic-data");

  // Scroll state
  const [scroll, setScroll] = useState(false);

  useEffect(() => {
    const scrollInterval = setInterval(() => {
      setScroll((prev) => !prev);
    }, 5000);

    return () => clearInterval(scrollInterval);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Sample static news content
  const latestNews = [
    { id: "outage-plant", title: "Outage of Generation Plant within Delhi" },
    { id: "license-transmission", title: "License for Transmission and Bulk Supply of Electricity" },
    { id: "transmission-losses", title: "Transmission Losses with details of Input to Discoms from FY 07-08 to FY 16-17" },
    { id: "public-notice", title: "Public Notice" },
    { id: "Load-Curve-Details", title: "Load Curve Details" },
    { id: "Load-shedding-Details", title: "Load shedding Details" },
    { id: "Latest-Break-Down", title: "Latest Break Down Details" },
    { id: "Demand-Availability", title: "Demand-Availability Detail" },
  ];

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
      {/* Latest news and updates */}
        <div className="dashboard-cards-wrapper">
        <div style={{ flex: "1" }}>
          <Card
            title={translations.latestNewsTitle || "Latest News And Updates"}
            content={
              <div style={{ height: "200px", overflow: "hidden", position: "relative" }}>
                {/* Latest News Content */}
                <div
                  style={{
                    position: "relative",
                    transition: "top 3s ease-in-out",
                    top: scroll ? "-100%" : "0",
                  }}
                >
                  <ul>
                    {latestNews.map((newsItem) => (
                      <li key={newsItem.id}>
                        <Link
                          to={`/details/${newsItem.id}`}
                          className="latest-news-link"
                          style={{
                            color: "#B0C4DE",
                            fontSize: "16px",
                            textDecoration: "none",
                            padding: "5px 0",
                            display: "block",
                          }}
                        >
                          {translations[newsItem.id] || newsItem.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            }
            backgroundColor="#0c6a68"
          />
        </div>

        {/* Right Section: Dynamic Data */}
        <div style={{ flex: "1" }}>
          <Card
            title={translations.dynamicDataTitle}
            content={
              data && data[0] ? (
                <table className="dynamic-data-table">
                  <tbody>
                    <tr>
                      <td><strong>{translations.frequency}</strong></td>
                      <td>{Math.round(data[0]?.DD_FREQUENCY)}</td>
                    </tr>
                    <tr>
                      <td><strong>{translations.dsmRate}</strong></td>
                      <td>{data[0]?.DD_UI_RATE}</td>
                    </tr>
                    <tr>
                      <td><strong>{translations.delhiLoad}</strong></td>
                      <td>{Math.round(data[0]?.DD_CURR_LOAD)}</td>
                    </tr>
                    <tr>
                      <td><strong>{translations.delhiSchedule}</strong></td>
                      <td>{Math.round(data[0]?.DD_CURR_SCHEDULE)}</td>
                    </tr>
                    <tr>
                      <td><strong>{translations.delhiDrawal}</strong></td>
                      <td>{Math.round(data[0]?.DD_DRAWAL)}</td>
                    </tr>
                    <tr>
                      <td><strong>{translations.odUd}</strong></td>
                      <td>{data[0]?.DD_UI_RATE}</td>
                    </tr>
                    <tr>
                      <td><strong>{translations.delhiGeneration}</strong></td>
                      <td>{Math.round(data[0]?.DD_BTPS)}</td>
                    </tr>
                    <tr>
                      <td><strong>{translations.maxLoadToday}</strong></td>
                      <td>{Math.round(data[0]?.DD_PEAK_LOAD)} at {data[0]?.DD_PEAK_LOAD_TIME}</td>
                    </tr>
                    <tr>
                      <td><strong>{translations.minLoadToday}</strong></td>
                      <td>{Math.round(data[0]?.DD_MIN_LOAD)} at {data[0]?.DD_MIN_LOAD_TIME}</td>
                    </tr>
                    <tr>
                      <td><strong>{translations.maxLoadYesterday}</strong></td>
                      <td>{Math.round(data[0]?.DD_PEAK_LOAD_YESTERDAY)} at {data[0]?.DD_PEAK_YES_TIME}</td>
                    </tr>
                    <tr>
                      <td><strong>{translations.minLoadYesterday}</strong></td>
                      <td>{Math.round(data[0]?.DD_MIN_LOAD_YESTERDAY)} at {data[0]?.DD_MIN_YES_TIME}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div>{translations.noDataText || "No data available"}</div>
              )
            }
            backgroundColor="#0c6a68"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
