import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

const VoltageProfileTable = () => {
  const [data, setData] = useState([]);
  const [date, setDate] = useState(dayjs().format("DD/MM/YYYY"));
  const navigate = useNavigate();

  const fetchVoltageData = async (selectedDate) => {
    try {
      const filter = encodeURIComponent(
        JSON.stringify({ TYPE: "kV", FORDATE: selectedDate })
      );
      const response = await axios.get(
        `https://delhisldc.org/app-api/get-data?table=dtl_webprofile&filters=${filter}`
      );
      const rows = response.data.result.rows;

      const parsed = rows.map((row) => ({
        entity: row[1],
        maxValue: row[4],
        minValue: row[5],
        avgValue: row[6],
        maxTime: row[7],
        minTime: row[8],
      }));

      setData(parsed);
    } catch (err) {
      console.error("Error fetching voltage profile:", err);
    }
  };

  useEffect(() => {
    fetchVoltageData(date);
  }, [date]);

  const inputDate = dayjs(date, "DD/MM/YYYY").format("YYYY-MM-DD");

  const handleDateChange = (e) => {
    const selected = dayjs(e.target.value).format("DD/MM/YYYY");
    setDate(selected);
  };

  return (
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 py-2 px-4 rounded-lg shadow-md text-center w-full sm:w-auto">
          Voltage Profile for {date}
        </h1>

        <div className="w-full sm:w-auto">
          <input
            type="date"
            className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={inputDate}
            max={dayjs().format("YYYY-MM-DD")}
            onChange={handleDateChange}
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
        <table className="min-w-full text-sm text-center">
          <thead className="bg-blue-100 text-gray-700">
            <tr className="whitespace-nowrap">
              <th className="py-3 px-4 text-white bg-blue-500">Line</th>
              <th className="py-3 px-4 text-white bg-blue-500">Peak Voltage</th>
              <th className="py-3 px-4 text-white bg-blue-500">Peak Time</th>
              <th className="py-3 px-4 text-white bg-blue-500">Min Voltage</th>
              <th className="py-3 px-4 text-white bg-blue-500">Min Time</th>
              <th className="py-3 px-4 text-white bg-blue-500">Avg Voltage</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <tr
                  key={item.entity}
                  className="hover:bg-blue-50 transition cursor-pointer whitespace-nowrap"
                  onClick={() =>
                    navigate("/voltage-detail-page", {
                      state: { entity: item.entity },
                    })
                  }
                >
                  <td className="py-2 px-4 text-blue-700 font-medium">
                    {item.entity}
                  </td>
                  <td className="py-2 px-4">{Math.round(item.maxValue)}</td>
                  <td className="py-2 px-4">{item.maxTime}</td>
                  <td className="py-2 px-4">{Math.round(item.minValue)}</td>
                  <td className="py-2 px-4">{item.minTime}</td>
                  <td className="py-2 px-4">{Math.round(item.avgValue)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-gray-500 py-4 italic"
                >
                  No data available for {date}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VoltageProfileTable;
