import React, { useEffect, useState } from "react";
import axios from "axios";

const CurveDetails = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Check device type
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 480);
      setIsTablet(width > 480 && width <= 768);
    };
    
    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const formatDate = (date) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const fetchData = async (date) => {
    try {
      setLoading(true);
      const formattedDate = formatDate(date);

      const apiURL =
        "https://delhisldc.org/app-api/get-data?table=dtl_completep&filters=" +
        encodeURIComponent(JSON.stringify({ TYPE: "HZ", FORDATE: formattedDate }));

      const response = await axios.get(apiURL);
      const apiData = response.data.result.rows;

      const formattedData = apiData.map((row) => ({
        TIMESLOT: row[1],
        ENTITY: row[2],
        VALUE: parseFloat(row[4]),
      }));

      const tableDataMap = {};
      formattedData.forEach(({ TIMESLOT, ENTITY, VALUE }) => {
        if (!tableDataMap[TIMESLOT]) {
          tableDataMap[TIMESLOT] = { TIMESLOT };
        }
        tableDataMap[TIMESLOT][ENTITY] = VALUE;
      });

      // Convert object to array and sort by TIMESLOT
      const sortedData = Object.values(tableDataMap).sort((a, b) => {
        const timeA = a.TIMESLOT.split(":").map(Number);
        const timeB = b.TIMESLOT.split(":").map(Number);
        return timeA[0] - timeB[0] || timeA[1] - timeB[1];
      });

      setTableData(sortedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  // Responsive styles
  const containerStyle = {
    padding: isMobile ? "10px" : isTablet ? "15px" : "20px",
    textAlign: "center",
    backgroundColor: "#1E1E1E",
    color: "#E0E0E0",
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box"
  };

  const titleStyle = {
    color: "#FFD700",
    fontSize: isMobile ? "18px" : isTablet ? "22px" : "26px",
    fontWeight: "bold",
    marginBottom: isMobile ? "15px" : "20px",
    lineHeight: "1.2",
    padding: "0 10px",
    wordBreak: "break-word"
  };

  const datePickerContainerStyle = {
    marginBottom: isMobile ? "15px" : "20px",
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    alignItems: "center",
    justifyContent: "center",
    gap: isMobile ? "10px" : "15px",
    padding: "0 10px"
  };

  const datePickerLabelStyle = {
    fontSize: isMobile ? "14px" : "16px",
    fontWeight: "bold",
    color: "#FFD700",
    textAlign: isMobile ? "center" : "left"
  };

  const datePickerInputStyle = {
    padding: isMobile ? "8px 12px" : "10px 15px",
    fontSize: isMobile ? "14px" : "16px",
    borderRadius: "5px",
    border: "1px solid #FFD700",
    backgroundColor: "#333",
    color: "#FFD700",
    width: isMobile ? "100%" : "auto",
    maxWidth: isMobile ? "200px" : "none",
    outline: "none",
    cursor: "pointer"
  };

  const loadingStyle = {
    color: "#FFD700",
    fontSize: isMobile ? "16px" : "20px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px"
  };

  const tableContainerStyle = {
    maxHeight: isMobile ? "60vh" : isTablet ? "65vh" : "70vh",
    overflowY: "auto",
    overflowX: "auto",
    border: "1px solid #FFD700",
    borderRadius: "8px",
    margin: "0 auto",
    maxWidth: "100%",
    boxShadow: "0 4px 8px rgba(255, 215, 0, 0.2)"
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: isMobile ? "300px" : "auto",
    fontSize: isMobile ? "12px" : isTablet ? "13px" : "14px"
  };

  const headerRowStyle = {
    position: "sticky",
    top: 0,
    backgroundColor: "#FFD700",
    zIndex: 90,
    color: "#1E1E1E"
  };

  const headerCellStyle = {
    padding: isMobile ? "8px 6px" : isTablet ? "10px 8px" : "12px 10px",
    border: "1px solid #444",
    fontWeight: "bold",
    fontSize: isMobile ? "11px" : isTablet ? "12px" : "14px",
    textAlign: "center",
    wordBreak: "break-word",
    minWidth: isMobile ? "80px" : "100px"
  };

  const getRowStyle = (index) => ({
    textAlign: "center",
    backgroundColor: index % 2 === 0 ? "#333" : "#444",
    transition: "background-color 0.2s ease",
    cursor: "pointer"
  });

  const tableCellStyle = {
    padding: isMobile ? "6px 4px" : isTablet ? "8px 6px" : "10px 8px",
    borderBottom: "1px solid #555",
    fontWeight: "500",
    fontSize: isMobile ? "11px" : isTablet ? "12px" : "14px",
    wordBreak: "break-word",
    minWidth: isMobile ? "70px" : "90px"
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div style={loadingStyle}>
      <div style={{
        width: isMobile ? "20px" : "24px",
        height: isMobile ? "20px" : "24px",
        border: "3px solid #444",
        borderTop: "3px solid #FFD700",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }}></div>
      Loading data...
    </div>
  );

  // Format value for display
  const formatValue = (value) => {
    if (value === null || value === undefined) return "N/A";
    return typeof value === 'number' ? value.toFixed(2) : value;
  };

  return (
    <div style={containerStyle}>
      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .table-container {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        .table-row:hover {
          background-color: #555 !important;
          transform: scale(1.01);
        }
        
        /* Custom scrollbar for webkit browsers */
        .table-container::-webkit-scrollbar {
          width: ${isMobile ? '6px' : '8px'};
          height: ${isMobile ? '6px' : '8px'};
        }
        
        .table-container::-webkit-scrollbar-track {
          background: #333;
          border-radius: 4px;
        }
        
        .table-container::-webkit-scrollbar-thumb {
          background: #FFD700;
          border-radius: 4px;
        }
        
        .table-container::-webkit-scrollbar-thumb:hover {
          background: #FFA500;
        }
        
        /* Responsive font adjustments */
        @media (max-width: 320px) {
          .table-cell {
            font-size: 10px !important;
            padding: 4px 2px !important;
          }
        }
        
        /* Touch-friendly improvements */
        @media (hover: none) and (pointer: coarse) {
          .table-row {
            min-height: 44px;
          }
        }
      `}</style>

      <h2 style={titleStyle}>
        Frequency Data for {selectedDate.toLocaleDateString("en-GB")}
      </h2>

      {/* Date Picker */}
      <div style={datePickerContainerStyle}>
        <label style={datePickerLabelStyle}>
          Select Date:
        </label>
        <input
          type="date"
          value={selectedDate.toISOString().split("T")[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          style={datePickerInputStyle}
          max={new Date().toISOString().split("T")[0]} // Prevent future dates
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : tableData.length === 0 ? (
        <div style={{
          color: "#FFD700",
          fontSize: isMobile ? "14px" : "16px",
          padding: "40px 20px",
          textAlign: "center",
          backgroundColor: "#333",
          borderRadius: "8px",
          margin: "20px auto",
          maxWidth: "400px"
        }}>
          <p>No data available for selected date</p>
          <p style={{ fontSize: isMobile ? "12px" : "14px", marginTop: "10px", color: "#CCC" }}>
            Please try selecting a different date
          </p>
        </div>
      ) : (
        <div style={tableContainerStyle} className="table-container">
          <table style={tableStyle}>
            <thead>
              <tr style={headerRowStyle}>
                <th style={headerCellStyle}>
                  {isMobile ? "Time" : "Time Slot"}
                </th>
                <th style={headerCellStyle}>
                  {isMobile ? "Pragati" : "Freq-Pragati"}
                </th>
                <th style={headerCellStyle}>
                  {isMobile ? "Bawana" : "Freq-Bawana"}
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr 
                  key={index} 
                  style={getRowStyle(index)}
                  className="table-row"
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.backgroundColor = "#555";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#333" : "#444";
                    }
                  }}
                >
                  <td style={tableCellStyle} className="table-cell">
                    <strong style={{color: "#FFD700"}}>{row.TIMESLOT}</strong>
                  </td>
                  <td style={tableCellStyle} className="table-cell">
                    <span style={{color: "#FF5733", fontWeight: "600"}}>
                      {formatValue(row["Freq-Pragati"])}
                    </span>
                  </td>
                  <td style={tableCellStyle} className="table-cell">
                    <span style={{color: "#1E88E5", fontWeight: "600"}}>
                      {formatValue(row["Freq-Bawana"])}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Data summary for mobile */}
      {!loading && tableData.length > 0 && isMobile && (
        <div style={{
          marginTop: "15px",
          padding: "10px",
          backgroundColor: "#333",
          borderRadius: "8px",
          fontSize: "12px",
          color: "#CCC"
        }}>
          <p>📊 Total Records: <strong style={{color: "#FFD700"}}>{tableData.length}</strong></p>
          <p>💡 Swipe horizontally to view all columns</p>
        </div>
      )}
    </div>
  );
};

export default CurveDetails;