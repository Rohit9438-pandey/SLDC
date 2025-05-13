import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DelhiGeneration = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState("");  

  useEffect(() => {
    fetch('https://www.delhisldc.org/app-api/genco')
      .then((response) => response.json())
      .then((data) => {
        setData(data.data);
        setLoading(false);

        // Extract time from DG_DATE and format it
        if (data.data.length > 0) {
          const dateTime = new Date(data.data[0].DG_DATE);
          const formattedTime = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setTime(formattedTime);
        }
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const totals = data.reduce(
    (acc, item) => {
      acc.scheduleTotal += item.DG_SCHEDULE;
      acc.actualTotal += item.DG_ACTUAL;
      acc.uiTotal += item.DG_UI;
      return acc;
    },
    { scheduleTotal: 0, actualTotal: 0, uiTotal: 0 }
  );

  const handleOpenDrawlDetails = (genco) => {
    const url = `/delhi-generation/${genco}`;
    window.open(url, '_blank');
  };

  return (
    <div className='genco'>
      <h2 style={{ color: '#0c6a98', fontWeight: 700 }}>
        DELHI GENERATION - {time || "No Time Available"}
      </h2>

      {data.length > 0 ? (
        <table className="genco-table">
          <thead>
            <tr>
              <th>GENCO</th>
              <th>Schedule</th>
              <th>Actual</th>
              <th>UI</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>
                  <Link to={`${item.DG_GENCO}`} target="_blank">{item.DG_GENCO}</Link>
                </td>
                <td>
                  <button
                    onClick={() => handleOpenDrawlDetails(item.DG_SCHEDULE)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: '#f1f1f1',
                      border: 'none',
                      padding: '5px 10px',
                      color: "#0c6a98",
                      textDecoration: "underline"
                    }}
                  >
                    {Math.round(item.DG_SCHEDULE)}
                  </button>
                </td>
                <td>{Math.round(item.DG_ACTUAL)}</td>
                <td>{Math.round(item.DG_UI)}</td>
              </tr>
            ))}
            <tr>
              <td><strong>Total:</strong></td>
              <td><strong>{totals.scheduleTotal.toFixed(2)}</strong></td>
              <td><strong>{totals.actualTotal.toFixed(2)}</strong></td>
              <td><strong>{totals.uiTotal.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default DelhiGeneration;
