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
  const navigate = useNavigate();
  const ENTITIES = ["Freq-Bawana", "Freq-Pragati"];


 

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const formatDate = (date) => {
    const dd= String(date.getDate()).padStart(2, "0");
    const mm= String(date.getMonth() + 1).padStart(2, "0");
    const yyyy= date.getFullYear();
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


 



  const chartOptions = (title, color, bgColor) => ({
    chart: {
      type: "line",
      height: 400,
      toolbar: { show: false },
      background: "transparent",
    },
    stroke: {
      curve: "smooth",
      width: 3, 
    },
    markers: {
      size: 4,   
      colors: ["#FFF"],
    },

    title: {
      text: title,
      align: "center",
      style: { fontSize: "18px", fontWeight: "bold", color: "#FFFFFF" },
    },

    xaxis: {
      categories: timeSlots.length ? timeSlots : ["00:00", "00:30", "01:00"],
      title: { text: "Time Slot", style: { color: "#FFD700", fontSize: "16px", fontWeight: "bold" } },
      labels: {
        style: {
          fontSize: "18px",
          fontWeight: "bold",
          color: "#00000",

        },
        rotate: 0,
        trim: false,
      },
      tickAmount: timeSlots.length > 10 ? 10 : timeSlots.length,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },

    yaxis: {
      title: { text: "Frequency (Hz)", style: { color: "#FFD700", fontSize: "16px", fontWeight: "bold" } },
      labels: {
        style: {
          fontSize: "18px",
          fontWeight: "bold",
          color: "#FFD700",

        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      decimalsInFloat: 2,
    },
    stroke: {
      curve: "smooth",
      width: 4,
    },
    markers: {
      size: 6,
      colors: ["#FFF"],
    },
    grid: {
      borderColor: "#555",
      strokeDashArray: 4,
    },

    tooltip: {
      theme: "dark",
    },

    colors: [color],
  });

  return (
    <div style={{ padding: "20px", textAlign: "center", backgroundColor: "#222", color: "#fff" }}>
      <h2
        style={{
          color: "#FFD700",
          fontSize: "26px",
          fontWeight: "bold",
          marginBottom: "20px",
          transition: "all 0.3s ease",
          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
        }}
      >
        Frequency Curve For {selectedDate.toLocaleDateString("en-GB")}
      </h2>

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
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        dateFormat="dd/MM/yyyy"
        customInput={
          <input
            style={{
              padding: "5px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "1px solid #FFD700",
              backgroundColor: "black",
              color: "#FFD700",
              textAlign: "center",
              width: "120px",
            }}
          />
        }
      />
    </div>


      {/* Pragati Frequency Graph */}
      <div style={styles.pragatiContainer}>
        <Chart
          options={chartOptions("Frequency Curve - Pragati", "#FF5733", "#333")}
          series={[{ name: "Freq-Pragati", data: pragatiData }]}
          type="line"
          height={600}
        />
      </div>

      {/* Bawana Frequency Graph */}
      <div style={styles.bawanaContainer}>
        <Chart
          options={chartOptions("Frequency Curve - Bawana", "#1E88E5")}
          series={[{ name: "Freq-Bawana", data: bawanaData }]}
          type="line"
          height={600}
        />
      </div>


      {!loading && tableData.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h2 style={{ textAlign: "center", color: "#FF5733", fontSize: "24px", fontWeight: "bold" }}>
            Data Analysis 
          </h2>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
              <thead>
                <tr style={{ backgroundColor: "#2C6A70", color: "#fff", textAlign: "center" }}>
                  <th>Entity</th>
                  <th>Peak Freq</th>
                  <th>Peak Freq Time</th>
                  <th>Min. Freq</th>
                  <th>Min Freq Time</th>
                  <th>Avg Freq</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (

                  <tr key={index} style={{ textAlign: "center" }}>
                    <td style = {{backgroundColor: '#f4a261', cursor: 'pointer'}}>
                      <a onClick={() => navigate("/curve-details")} style={{ textDecoration: "none", color: "blue", fontWeight: "bold" }}>
                        {row.entity}
                      </a>
                    </td>

                    <td style={{fontWeight:'500' , color:'black'}}>{row.maxValue}</td>
                    <td style= {{fontWeight:'500' , color:'black'}}>{row.maxValTime}</td>
                    <td style= {{fontWeight:'500' , color:'black'}}>{row.minValue}</td>
                    <td style= {{fontWeight:'500' , color:'black'}}>{row.minValTime}</td>
                    <td style= {{fontWeight:'500' , color:'black'}}>{row.avgValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};








const styles = {
  pragatiContainer: {
    margin: "20px auto",
    padding: "20px",
    border: "3px solid #FF5733",
    borderRadius: "10px",
    boxShadow: "0px 6px 12px rgba(255, 87, 51, 0.5)",
    maxWidth: "90%",

  },
  bawanaContainer: {
    margin: "20px auto",
    padding: "20px",
    border: "3px solid #1E88E5",
    borderRadius: "10px",
    boxShadow: "0px 6px 12px rgba(30, 136, 229, 0.5)",
    maxWidth: "90%",

  },





};

export default FrequencyCurve;   