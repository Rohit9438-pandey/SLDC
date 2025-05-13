import React, { useEffect, useState } from "react";
import axios from "axios";

const CurveDetails = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

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
      const timeA = a.TIMESLOT.split(":").map(Number); // Convert "HH:mm" to [HH, mm]
      const timeB = b.TIMESLOT.split(":").map(Number);
      return timeA[0] - timeB[0] || timeA[1] - timeB[1]; // Sort by hours, then minutes
    });

    setTableData(sortedData);
    setLoading(false);
  } catch (error) {
    console.error("Error fetching data:", error);
    setLoading(false);
  }
};

  return (
    <div style={{ padding: "20px", textAlign: "center", backgroundColor: "#1E1E1E", color: "#E0E0E0" }}>
      <h2 style={{ color: "#FFD700", fontSize: "26px", fontWeight: "bold", marginBottom: "20px" }}>
        Frequency Data for {selectedDate.toLocaleDateString("en-GB")}
      </h2>

      {/* Date Picker */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            marginRight: "10px",
            color: "#FFD700",
          }}
        >
          Select Date:
        </label>
        <input
          type="date"
          value={selectedDate.toISOString().split("T")[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          style={{
            padding: "5px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "1px solid #FFD700",
            backgroundColor: "#333",
            color: "#FFD700",
          }}
        />
      </div>

      {loading ? (
        <p style={{ color: "#FFD700", fontSize: "20px" }}>Loading data...</p>
      ) : (
        <div style={{ maxHeight: "500px", overflowY: "auto", border: "1px solid #FFD700" }}>
  <table style={{ width: "100%", borderCollapse: "collapse" }}>
    <thead style={{ position: "sticky", top: 0, backgroundColor: "#FFD700", zIndex: 90 }}>
      <tr>
        <th style={{ padding: "10px", border: "1px solid #444" }}>Time Slot</th>
        <th style={{ padding: "10px", border: "1px solid #444" }}>Freq-Pragati</th>
        <th style={{ padding: "10px", border: "1px solid #444" }}>Freq-Bawana</th>
      </tr>
    </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index} style={{ textAlign: "center", backgroundColor: index % 2 === 0 ? "#333" : "#444" }}>
                  <td style={{ padding: "10px", borderBottom: "1px solid #555" , fontWeight:'500'}}>{row.TIMESLOT}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #555" , fontWeight:'500'}}>{row["Freq-Pragati"] || "N/A"}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #555" , fontWeight:'500'}}>{row["Freq-Bawana"] || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CurveDetails;
