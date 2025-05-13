import React, { useState, useEffect } from 'react';

const DelhiExport = () => {
  const [exportData, setExportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestTime, setLatestTime] = useState('');
  

  useEffect(() => {
    // Fetch data from API
    fetch('https://www.delhisldc.org/app-api/delhi-import')
      .then((response) => response.json())
      .then((data) => {
      
        if (data && data.data) {
        
          const filteredData = data.data.filter(item => item.DI_TYPE === 0);
          setExportData(filteredData);

          if (filteredData.length > 0) {
            const formattedTime = new Date(filteredData[0].DI_DATE).toLocaleTimeString();
            setLatestTime(formattedTime);
          } else {
            setLatestTime('No Data Available');
          }

        }else {
          setError('No data available');
        }
      })
      .catch((error) => {
        setError('Error fetching data: ' + error.message);
        console.error('Error fetching export data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="export-page">
      <h2 style = {{color: '#0c6a98' , fontWeight: 700 , textAlign: 'center'}}>DELHI EXPORT  {latestTime && `- ${latestTime}`} </h2>
      <table>
        <thead>
          <tr>
            <th>TRANSFORMER/Feeder</th>
            <th>MW</th>
            <th>MVAR</th>
          </tr>
        </thead>
        <tbody>
          {exportData.map((entry, index) => (
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

export default DelhiExport;
