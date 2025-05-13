import React, { useState, useEffect } from 'react';

const StateDrawl = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestTime, setLatestTime] = useState('');

  useEffect(() => {
    fetch('https://www.delhisldc.org/app-api/state-drawl')
      .then((response) => response.json())
      .then((data) => {
        if (data && data.data.length > 0) {
          setData(data.data);

          // Find the latest valid date entry
          const latestRecord = data.data.find(item => item.DS_DATE); 
          
          if (latestRecord && latestRecord.DS_DATE) {
            const parsedDate = new Date(latestRecord.DS_DATE);
            
            if (!isNaN(parsedDate)) {
              setLatestTime(parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            } else {
              setLatestTime('Invalid Time');
            }
          } else {
            setLatestTime('No Time Available');
          }
        } else {
          setError('No data available');
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="genco">
      <h2 style={{ color: '#0c6a98', fontWeight: 700 }}>
        STATE DRAWL - {latestTime}
      </h2>
      {data.length > 0 ? (
        <table className="genco-table">
          <thead>
            <tr>
              <th>STATE</th>
              <th>Schedule</th>
              <th>Drawl</th>
              <th>OD/UD</th>
              <th>Load</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.DS_STATE}</td>
                <td>{Math.round(item.DS_SCHEDULE)}</td>
                <td>{Math.round(item.DS_DRAWL)}</td>
                <td>{Math.round(item.DS_OD_UD)}</td>
                <td>{Math.round(item.DS_LOAD)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default StateDrawl;
