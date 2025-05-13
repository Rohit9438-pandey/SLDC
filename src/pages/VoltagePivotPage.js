import React, { useState, useEffect } from 'react';

function VoltagePivotPage() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(""); // Don't auto-load
  const [pivotData, setPivotData] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateStr) => {
    const [yyyy, mm, dd] = dateStr.split('-');
    return `${dd}/${mm}/${yyyy}`;
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const formattedDate = formatDate(selectedDate);
        const url = `https://delhisldc.org/app-api/get-data?table=dtl_completep&filters=${encodeURIComponent(
          JSON.stringify({ TYPE: 'kV', FORDATE: formattedDate })
        )}`;

        const response = await fetch(url);
        const data = await response.json();

        const columns = data.result.metaData.map((col) => col.name);
        const rows = data.result.rows;

        const pivot = {};

        rows.forEach((row) => {
          const rowObj = Object.fromEntries(columns.map((col, i) => [col, row[i]]));
          const time = rowObj.TIMESLOT;
          const entity = rowObj.ENTITY;
          const value = rowObj.VALUE;

          if (!pivot[time]) pivot[time] = { TIMESLOT: time };
          pivot[time][entity] = value;
        });

        const pivotArray = Object.values(pivot).sort((a, b) => {
          const toMinutes = (t) => {
            const [hh, mm] = t.split(':').map(Number);
            return hh * 60 + mm;
          };
          return toMinutes(a.TIMESLOT) - toMinutes(b.TIMESLOT);
        });

        const uniqueEntities = new Set();
        pivotArray.forEach((row) => {
          Object.keys(row).forEach((key) => {
            if (key !== 'TIMESLOT') uniqueEntities.add(key);
          });
        });

        const allEntities = [...uniqueEntities].sort();
        setEntities(allEntities);
        setPivotData(pivotArray);
      } catch (error) {
        console.error('Error fetching voltage data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (selectedDate) fetchData();
  }, [selectedDate]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 className="text-center text-2xl font-semibold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 py-3 px-4 rounded-lg shadow-md mb-4">
        Voltage Data
      </h1>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>
          Select Date:
        </label>
        <input
          type="date"
          value={selectedDate}
          placeholder={today}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      {!selectedDate ? (
        <p className='font-bold'>Please select a date to view the data.</p>
      ) : loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ overflowX: 'auto', maxHeight: '70vh' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.9rem',
              backgroundColor: '#fff',
            }}
          >
            <thead
              style={{
                position: 'sticky',
                top: 0,
                backgroundColor: '#007BFF',
                color: '#fff',
                zIndex: 2,
              }}
            >
              <tr>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Time Slot</th>
                {entities.map((entity) => (
                  <th key={entity} style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {entity}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pivotData.map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px', border: '1px solid #eee', fontWeight: 'bold' }}>
                    {row.TIMESLOT}
                  </td>
                  {entities.map((entity) => (
                    <td key={entity} style={{ padding: '8px', border: '1px solid #eee' }}>
                      {row[entity] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default VoltagePivotPage;
