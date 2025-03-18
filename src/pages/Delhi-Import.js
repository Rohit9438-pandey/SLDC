import React, { useState, useEffect } from 'react';

const DelhiImport = () => {
  const [importData, setImportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestTime, setLatestTime] = useState('');

  useEffect(() => {
    fetch('https://www.delhisldc.org/app-api/delhi-import')
      .then((response) => response.json())
      .then((data) => {
      
        
        if (data && data.data) {
        
          const filteredData = data.data.filter(item => item.DI_TYPE === 1);
          setImportData(filteredData);

        
          if (filteredData.length > 0) {
            const formattedTime = new Date(filteredData[0].DI_DATE).toLocaleTimeString();
            setLatestTime(formattedTime);
          } else {
            setLatestTime('No Data Available');
          }
        } else {
          setError('No data available');
        }
      })
      .catch((error) => {
        setError('Error fetching data: ' + error.message);
        console.error('Error fetching import data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="import-page">
      <h2 style={{ color: '#0c6a98', fontWeight: 700 }}>
        DELHI IMPORT {latestTime && `- ${latestTime}`}
      </h2>
      
      <table >
        <thead>
          <tr>
          <th>TRANSFORMER/Feeder</th>
          <th>MW</th>
          <th>MVAR</th>          
          </tr>
        </thead>
        <tbody>
          {importData.map((entry, index) => (
            <tr key={index}>
            <td>{entry.DI_FEEDER}</td>          
             <td>{entry.DI_MW}</td>
              <td>{entry.DI_MVAR}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DelhiImport;
