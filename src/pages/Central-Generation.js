import React, { useState, useEffect } from 'react';

const CentralGeneration = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
  const [latestTime, setLatestTime] = useState('');

  useEffect(() => {
    fetch('https://www.delhisldc.org/app-api/sector-gen')
      .then((response) => response.json())
      .then((data) => {
        if (data && data.data.length > 0) {
          setData(data.data);

          // Find the latest valid date entry
          const latestRecord = data.data.find(item => item.DC_DATE); 
          
          if (latestRecord && latestRecord.DC_DATE) {
            const parsedDate = new Date(latestRecord.DC_DATE);
            
            if (!isNaN(parsedDate)) {
              setLatestTime(parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            } else {
              setLatestTime('Invalid Date');
            }
          } else {
            setLatestTime('No Date Available');
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
    <div className="sector">
      <h2> CENTRAL SECTOR GENERATION - {latestTime} </h2>
      {data.length > 0 ? (
        <table className="sector-table">
          <thead>
            <tr>
              <th>GENCO NAME</th>
              <th>Schedule</th>
              <th>Actual</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.DC_GENCONAME}</td>
                <td>{Math.round(item.DC_SCHEDULE)}</td>
                <td>{Math.round(item.DC_ACTUAL)}</td>
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

export default CentralGeneration;
