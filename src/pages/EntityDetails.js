import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaExternalLinkAlt } from "react-icons/fa";

const ENTITIES = ["BRPL", "BYPL", "Delhi", "NDMC", "NDPL", "MES", "ALL"];

const EntityDetails = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEntity, setSelectedEntity] = useState("ALL");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (entity, date) => {
    try {
      setLoading(true);
      setError(null);
      const formattedDate = date.toLocaleDateString("en-GB").split("/").join("/");

      if (entity === "ALL") {
        const allData = {};
        const allTimeslots = new Set();

        for (const ent of ENTITIES.filter((e) => e !== "ALL")) {
          const response = await axios.get(
            `https://delhisldc.org/app-api/load-curve?fordate=${formattedDate}&entity=${ent}`
          );
          let entityData = response.data.map((item) => ({
            TIMESLOT: item.TIMESLOT,
            VALUE: Number(item.VALUE),
          }));
          entityData.sort((a, b) => parseTime(a.TIMESLOT) - parseTime(b.TIMESLOT));
          allData[ent] = entityData;
          entityData.forEach((item) => allTimeslots.add(item.TIMESLOT));
        }
        const unifiedData = generateUnifiedData(allData, Array.from(allTimeslots).sort());
        setData(unifiedData);
      } else {
        const response = await axios.get(
          `https://delhisldc.org/app-api/load-curve?fordate=${formattedDate}&entity=${entity}`
        );
        let entityData = response.data.map((item) => ({
          TIMESLOT: item.TIMESLOT,
          [entity]: Number(item.VALUE),
        }));
        entityData.sort((a, b) => parseTime(a.TIMESLOT) - parseTime(b.TIMESLOT));
        setData(entityData);
      }
    } catch (err) {
      setError(`Failed to fetch data for ${entity}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedEntity, selectedDate);
  }, [selectedEntity, selectedDate]);

  const generateUnifiedData = (allData, sortedTimeslots) => {
    return sortedTimeslots.map((TIMESLOT) => {
      const row = { TIMESLOT };
      for (const entity of Object.keys(allData)) {
        const match = allData[entity].find((d) => d.TIMESLOT === TIMESLOT);
        row[entity] = match ? match.VALUE : null;
      }
      return row;
    });
  };

  function parseTime(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  const openInNewTab = () => {
    const url = window.location.href;
    window.open(url, "_blank");
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <div className="flex justify-between items-center mb-6">
      <h2 style={{
                textAlign: 'center',
                backgroundImage: 'linear-gradient(45deg, #ff5733, #33c3ff)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontSize: '28px',
                fontWeight: 'bold',
                marginBottom: '20px',
                marginLeft: '550px'
            }}>
                SCADA LOAD 
            </h2>
        <button
          onClick={openInNewTab}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          Open in New Tab <FaExternalLinkAlt />
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 15, marginBottom: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <label style={{ marginBottom: 5, color: '#2a9d8f', fontWeight: 'bold' }}>Select Date</label>
      <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="dd/MM/yyyy"
            className="p-2 border border-gray-300 rounded w-full"
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ marginBottom: 5, color: '#e63946', fontWeight: 'bold' }}>Select Constituent</label>
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            style={{ width: '200px', padding: '5px' }}
          >
            {ENTITIES.map((entity) => (
              <option key={entity} value={entity}>
                {entity}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="text-center text-blue-500">Loading data...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && data.length > 0 && (
        <div className="overflow-y-auto max-h-[500px] border border-gray-300 rounded-lg shadow-md">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <thead className="bg-blue-600 text-white sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 border">Time Slot</th>
                {selectedEntity === "ALL"
                  ? ENTITIES.filter((e) => e !== "ALL").map((entity) => (
                      <th key={entity} className="py-3 px-4 border">
                        {entity}
                      </th>
                    ))
                  : (
                      <th className="py-3 px-4 border">{selectedEntity}</th>
                    )}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  } hover:bg-gray-200`}
                >
                  <td className="py-2 px-4 border">{row.TIMESLOT}</td>
                  {selectedEntity === "ALL"
                    ? ENTITIES.filter((e) => e !== "ALL").map((entity) => (
                        <td key={entity} className="py-2 px-4 border">
                          {row[entity] || "-"}
                        </td>
                      ))
                    : (
                        <td className="py-2 px-4 border">{row[selectedEntity] || "-"}</td>
                      )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EntityDetails;
