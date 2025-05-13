import React, { useEffect, useState } from "react";
import ApexChart from "react-apexcharts";
import axios from "axios";
import dayjs from "dayjs";
import { Bold } from "lucide-react";

const ENTITIES = ["Delhi","BRPL", "BYPL", "TPDDL", "NDMC"];

const ODUDCurve = () => {
  const [data, setData] = useState([]);
  const [entity, setEntity] = useState("BRPL");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const formattedDateAPI = dayjs(date).format("DD/MM/YYYY");
      const formattedDateRev = dayjs(date).format("YYYY/MM/DD");

      try {
        let mergedData = [];

        // 👇 This makes TPDDL behave like NDPL internally
        const actualEntity = entity === "TPDDL" ? "NDPL" : entity;

        if (entity === "Delhi") {
          const url =
            "https://delhisldc.org/app-api/get-data?table=dtl_completep&filters=" +
            encodeURIComponent(
              JSON.stringify({ TYPE: "MW", FORDATE: formattedDateAPI })
            );
          const res = await axios.get(url);
          const rows = res?.data?.result?.rows;

          if (!Array.isArray(rows)) throw new Error("Invalid Delhi data format");

          const delhiRows = rows
            .filter((row) => row[2] === "Delhi_ODUD")
            .sort((a, b) => {
              const [h1, m1] = a[1].split(":").map(Number);
              const [h2, m2] = b[1].split(":").map(Number);
              return h1 * 60 + m1 - (h2 * 60 + m2);
            });

          mergedData = delhiRows.map((row) => ({
            time: row[1],
            odud: Math.round(row[4]),
          }));
        } else {
          const revRes = await axios.get(
            `https://delhisldc.org/app-api/revisionno?searchQuery=${actualEntity}&date=${formattedDateRev}`
          );
          const revisionKey = revRes?.data?.maxRevisionno;
          if (!revisionKey) throw new Error("No revision number found.");

          const scheduleUrl = `https://delhisldc.org/app-api/get-data?table=DTL_DRAWL_TOTAL&filters=${encodeURIComponent(
            JSON.stringify({ REVISIONNO: revisionKey })
          )}`;
          const schedRes = await axios.get(scheduleUrl);
          const scheduleRowsRaw = schedRes?.data?.result?.rows;

          if (!Array.isArray(scheduleRowsRaw))
            throw new Error("Schedule data invalid.");

          scheduleRowsRaw.sort((a, b) => a[0] - b[0]);

          const scheduleMap = {};
          scheduleRowsRaw.forEach((row, i) => {
            const hour = Math.floor(i / 4);
            const quarter = i % 4;
            const hh = String(hour).padStart(2, "0");
            const mm = String(quarter * 15).padStart(2, "0");
            const time = `${hh}:${mm}`;
            scheduleMap[time] = parseFloat(row[6]) || 0;
          });

          const loadUrl =
            "https://delhisldc.org/app-api/get-data?table=dtl_completep&filters=" +
            encodeURIComponent(
              JSON.stringify({ TYPE: "MW", FORDATE: formattedDateAPI })
            );
          const loadRes = await axios.get(loadUrl);
          const loadRowsRaw = loadRes?.data?.result?.rows;

          if (!Array.isArray(loadRowsRaw)) throw new Error("Load data invalid.");

          const loadRows = loadRowsRaw
            .filter((row) => row[2] === actualEntity)
            .sort((a, b) => {
              const [h1, m1] = a[1].split(":").map(Number);
              const [h2, m2] = b[1].split(":").map(Number);
              return h1 * 60 + m1 - (h2 * 60 + m2);
            });

          mergedData = loadRows.map((row) => {
            const [hh, mm] = row[1].split(":").map(Number);
            const roundedMinutes = Math.floor(mm / 15) * 15;
            const scheduleTime = `${String(hh).padStart(2, "0")}:${String(
              roundedMinutes
            ).padStart(2, "0")}`;
            const schedule = scheduleMap[scheduleTime] ?? 0;
            const load = parseFloat(row[4]) || 0;

            return {
              time: row[1],
              load: Math.round(load),
              schedule: Math.round(schedule),
              odud: Math.round(load - schedule),
            };
          });
        }

        setData(mergedData);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(`Error: ${err.message}`);
        setData([]);
      }
    };

    fetchData();
  }, [entity, date]);

const chartOptions = {
  chart: {
    id: "odud-curve",
    toolbar: { show: false },
  },
  xaxis: {
    categories: data.map((d) => d.time),
    title: { text: "Time (HH:mm)", style: { fontSize: "16px", fontWeight: 700 } },
    labels: { rotate: 0, style: { fontSize: "12px" } },
    tickPlacement: "on",
    tickAmount: Math.floor(data.length / 12),
  },
  yaxis: {
    title: {
      text: "OD/UD (MW)",
      style: { fontSize: "16px", fontWeight: 700 },
    },
    min: Math.min(...data.map((d) => d.odud), 0) - 10,
    max: Math.max(...data.map((d) => d.odud), 0) + 10,
  },
  annotations: {
    yaxis: [
      {
        y: 0,
        borderColor: "#000",
        strokeDashArray: 4,
        label: {
          text: "0 MW",
          style: {
            color: "#000",
            background: "#fff",
            fontWeight: 600,
          },
        },
      },
    ],
  },
  tooltip: {
    shared: true,
    y: {
      formatter: (val) => `${Math.round(val)} MW`,
    },
  },
  stroke: { width: 2, curve: "smooth" },
  markers: { size: 3 },
  legend: { position: "top", fontSize: "14px" },
  colors: ["#e63946"],
};


  const chartSeries = [
    {
      name: "OD/UD",
      data: data.map((d) => d.odud),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <h1 className="text-center text-2xl font-semibold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 py-3 px-4 rounded-lg shadow-md mb-4">
        OD/UD Curve for {entity} on {dayjs(date).format("DD MMM YYYY")}
      </h1>

      <div className="flex flex-wrap items-end justify-center gap-6 mb-8">
        <div className="flex flex-col">
          <label className="text-lime-500 text-lg font-bold mb-1">Select Constituent</label>
          <select
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded shadow-sm focus:ring focus:ring-blue-200 mr-40"
          >
            {ENTITIES.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-lime-500 text-lg font-bold mb-1">Select Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded shadow-sm focus:ring focus:ring-blue-200"
          />
        </div>
      </div>

      {error ? (
        <div className="text-red-600 text-center font-medium">{error}</div>
      ) : (
        <ApexChart
          options={chartOptions}
          series={chartSeries}
          type="line"
          height={500}
        />
      )}
    </div>
  );
};

export default ODUDCurve;
