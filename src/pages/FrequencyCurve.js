import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';

const FrequencyCurve = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [pragatiData, setPragatiData] = useState([]);
  const [bawanaData, setBawanaData] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const ENTITIES = ["Freq-Bawana", "Freq-Pragati"];

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const formatDate = (date) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return (`${dd}/${mm}/${yyyy}`);
  }

  const fetchData = async (date) => {
    try {
      const formattedDate = formatDate(date);

      const apiURL1 =
        "https://delhisldc.org/app-api/get-data?table=dtl_completep&filters=" +
        encodeURIComponent(JSON.stringify({ TYPE: "HZ", FORDATE: formattedDate }));

      const response1 = await axios.get(apiURL1);
      const apiData1 = response1.data.result.rows;

      const formattedData = apiData1.map((row) => ({
        TIMESLOT: row[1],
        ENTITY: row[2],
        VALUE: parseFloat(row[4]),
      }));

      const sampledData = formattedData.filter((_, index) => index % 5 === 0);
      const times = [...new Set(sampledData.map((item) => item.TIMESLOT))];

      const pragati = sampledData.filter((item) => item.ENTITY === "Freq-Bawana").map((d) => d.VALUE);
      const bawana = sampledData.filter((item) => item.ENTITY === "Freq-Pragati").map((d) => d.VALUE);
      setTimeSlots(times);
      setBawanaData(bawana);
      setPragatiData(pragati);

      const apiURL2 = "https://delhisldc.org/app-api/get-data?table=dtl_webprofile";
      const response2 = await axios.get(apiURL2);

      if (!response2.data.result || !response2.data.result.rows) {
        console.error("Invalid API response format");
        return;
      }

      const apiData2 = response2.data.result.rows;

      const filteredTableData = apiData2
        .filter((row) => row[0] === formattedDate && ENTITIES.includes(row[1]))
        .map((row) => ({
          forDate: row[0],
          entity: row[1],
          type: row[2],
          counter: row[3],
          maxValue: row[4],
          minValue: row[5],
          avgValue: row[6],
          maxValTime: row[7],
          minValTime: row[8]
        }));
      setTableData(filteredTableData);
      console.log("Filtered Table Data:", filteredTableData);

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const chartOptions = (title, color) => ({
    chart: {
      type: "line",
      height: isMobile ? 300 : 400,
      toolbar: { 
        show: !isMobile,
        tools: {
          download: true,
          selection: false,
          zoom: !isMobile,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      },
      background: "transparent",
      animations: {
        enabled: !isMobile,
        easing: 'easeinout',
        speed: 800,
      }
    },
    stroke: {
      curve: "smooth",
      width: isMobile ? 2 : 3,
    },
    markers: {
      size: isMobile ? 3 : 4,
      colors: ["#FFF"],
      strokeWidth: 2,
      hover: {
        size: isMobile ? 5 : 6
      }
    },
    title: {
      text: title,
      align: "center",
      style: { 
        fontSize: isMobile ? "14px" : "18px", 
        fontWeight: "bold", 
        color: "#FFFFFF" 
      },
      margin: isMobile ? 10 : 20
    },
    xaxis: {
      categories: timeSlots.length ? timeSlots : ["00:00", "00:30", "01:00"],
      title: { 
        text: "Time Slot", 
        style: { 
          color: "#FFD700", 
          fontSize: isMobile ? "12px" : "16px", 
          fontWeight: "bold" 
        } 
      },
      labels: {
        style: {
          fontSize: isMobile ? "10px" : "12px",
          fontWeight: "bold",
          color: "#FFD700",
        },
        rotate: isMobile ? -45 : 0,
        trim: true,
        maxHeight: isMobile ? 60 : 80,
      },
      tickAmount: isMobile ? 6 : (timeSlots.length > 10 ? 10 : timeSlots.length),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: { 
        text: "Frequency (Hz)", 
        style: { 
          color: "#FFD700", 
          fontSize: isMobile ? "12px" : "16px", 
          fontWeight: "bold" 
        } 
      },
      labels: {
        style: {
          fontSize: isMobile ? "10px" : "12px",
          fontWeight: "bold",
          color: "#FFD700",
        },
        formatter: (value) => {
          return value ? value.toFixed(2) : '';
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      decimalsInFloat: 2,
    },
    grid: {
      borderColor: "#555",
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: !isMobile
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    tooltip: {
      theme: "dark",
      style: {
        fontSize: isMobile ? '12px' : '14px'
      },
      x: {
        show: true,
        format: 'HH:mm'
      },
      y: {
        formatter: (value) => {
          return value ? value.toFixed(2) + ' Hz' : '';
        }
      }
    },
    legend: {
      show: !isMobile,
      position: 'top',
      labels: {
        colors: '#FFD700'
      }
    },
    colors: [color],
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          height: 250
        },
        title: {
          style: {
            fontSize: '12px'
          }
        }
      }
    }, {
      breakpoint: 480,
      options: {
        chart: {
          height: 200
        },
        title: {
          style: {
            fontSize: '10px'
          }
        }
      }
    }]
  });

  const containerStyle = {
    padding: isMobile ? "10px" : "20px",
    textAlign: "center",
    backgroundColor: "#222",
    color: "#fff",
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box"
  };

  const titleStyle = {
    color: "#FFD700",
    fontSize: isMobile ? "18px" : "26px",
    fontWeight: "bold",
    marginBottom: isMobile ? "15px" : "20px",
    transition: "all 0.3s ease",
    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
    lineHeight: "1.2",
    padding: "0 10px"
  };

  const datePickerContainerStyle = {
    marginBottom: isMobile ? "15px" : "20px",
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    alignItems: "center",
    justifyContent: "center",
    gap: isMobile ? "8px" : "10px"
  };

  const datePickerLabelStyle = {
    fontSize: isMobile ? "14px" : "16px",
    fontWeight: "bold",
    color: "#FFD700",
  };

  const datePickerInputStyle = {
    padding: isMobile ? "8px" : "10px",
    fontSize: isMobile ? "14px" : "16px",
    borderRadius: "5px",
    border: "1px solid #FFD700",
    backgroundColor: "black",
    color: "#FFD700",
    textAlign: "center",
    width: isMobile ? "140px" : "150px",
    outline: "none"
  };

  const chartContainerStyle = (borderColor) => ({
    margin: isMobile ? "15px auto" : "20px auto",
    padding: isMobile ? "10px" : "20px",
    border: `${isMobile ? '2px' : '3px'} solid ${borderColor}`,
    borderRadius: "10px",
    boxShadow: `0px ${isMobile ? '4px 8px' : '6px 12px'} ${borderColor}50`,
    maxWidth: "100%",
    width: "100%",
    boxSizing: "border-box",
    overflow: "hidden"
  });

  const tableContainerStyle = {
    marginTop: isMobile ? "20px" : "30px",
    width: "100%",
    overflowX: "auto",
    boxSizing: "border-box"
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
    fontSize: isMobile ? "12px" : "14px",
    minWidth: isMobile ? "600px" : "auto"
  };

  const tableHeaderStyle = {
    backgroundColor: "#2C6A70",
    color: "#fff",
    textAlign: "center",
    padding: isMobile ? "8px 4px" : "12px 8px",
    fontSize: isMobile ? "11px" : "14px",
    fontWeight: "bold"
  };

  const tableCellStyle = {
    fontWeight: '500',
    color: 'black',
    padding: isMobile ? "6px 4px" : "8px",
    textAlign: "center",
    wordBreak: "break-word"
  };

  const entityCellStyle = {
    backgroundColor: '#f4a261',
    cursor: 'pointer',
    padding: isMobile ? "6px 4px" : "8px",
    textAlign: "center"
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>
        Frequency Curve For {selectedDate.toLocaleDateString("en-GB")}
      </h2>

      <div style={datePickerContainerStyle}>
        <label style={datePickerLabelStyle}>
          Select Date:
        </label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="dd/MM/yyyy"
          customInput={
            <input style={datePickerInputStyle} />
          }
          popperClassName="date-picker-popper"
          popperModifiers={{
            preventOverflow: {
              enabled: true,
              escapeWithReference: false,
              boundariesElement: 'viewport'
            }
          }}
        />
      </div>

      {/* Pragati Frequency Graph */}
      <div style={chartContainerStyle("#FF5733")}>
        <Chart
          options={chartOptions("Frequency Curve - Pragati", "#FF5733")}
          series={[{ name: "Freq-Pragati", data: pragatiData }]}
          type="line"
          height={isMobile ? 300 : 600}
        />
      </div>

      {/* Bawana Frequency Graph */}
      <div style={chartContainerStyle("#1E88E5")}>
        <Chart
          options={chartOptions("Frequency Curve - Bawana", "#1E88E5")}
          series={[{ name: "Freq-Bawana", data: bawanaData }]}
          type="line"
          height={isMobile ? 300 : 600}
        />
      </div>

      {!loading && tableData.length > 0 && (
        <div style={tableContainerStyle}>
          <h2 style={{ 
            textAlign: "center", 
            color: "#FF5733", 
            fontSize: isMobile ? "18px" : "24px", 
            fontWeight: "bold",
            marginBottom: "15px"
          }}>
            Data Analysis
          </h2>

          <div style={{ overflowX: "auto", width: "100%" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Entity</th>
                  <th style={tableHeaderStyle}>Peak Freq</th>
                  <th style={tableHeaderStyle}>Peak Time</th>
                  <th style={tableHeaderStyle}>Min. Freq</th>
                  <th style={tableHeaderStyle}>Min Time</th>
                  <th style={tableHeaderStyle}>Avg Freq</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index}>
                    <td style={entityCellStyle}>
                      <a 
                        onClick={() => navigate("/curve-details")} 
                        style={{ 
                          textDecoration: "none", 
                          color: "blue", 
                          fontWeight: "bold",
                          fontSize: isMobile ? "11px" : "14px"
                        }}
                      >
                        {row.entity}
                      </a>
                    </td>
                    <td style={tableCellStyle}>{row.maxValue}</td>
                    <td style={tableCellStyle}>{row.maxValTime}</td>
                    <td style={tableCellStyle}>{row.minValue}</td>
                    <td style={tableCellStyle}>{row.minValTime}</td>
                    <td style={tableCellStyle}>{row.avgValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add CSS for date picker responsiveness */}
      <style jsx>{`
        .date-picker-popper {
          z-index: 9999 !important;
        }
        
        @media (max-width: 768px) {
          .react-datepicker-wrapper {
            width: 100%;
          }
          
          .react-datepicker__input-container input {
            width: 100% !important;
          }
          
          .react-datepicker {
            font-size: 0.8rem;
          }
          
          .react-datepicker__header {
            padding: 8px 0;
          }
          
          .react-datepicker__day {
            width: 1.7rem;
            line-height: 1.7rem;
            margin: 0.166rem;
          }
        }
        
        @media (max-width: 480px) {
          .react-datepicker {
            font-size: 0.7rem;
          }
          
          .react-datepicker__day {
            width: 1.5rem;
            line-height: 1.5rem;
            margin: 0.1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FrequencyCurve;