import React, { useState, useEffect } from 'react';

const DelhiImport = () => {
  const [importData, setImportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from API
    fetch('https://www.delhisldc.org/app-api/delhi-import')
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched data:', data);  // Debugging step to see raw response
        if (data && data.data) {
          // Filter import data where DI_TYPE = 1
          const filteredData = data.data.filter(item => item.DI_TYPE === 1);
          setImportData(filteredData);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="import-page">
      <h2 style= {{color: '#0c6a98' , fontWeight: 700}}>DELHI IMPORT</h2>
      <table>
        <thead>
          <tr>
            <th>TRANSFORMER/Feeder</th>
            <th>MW</th>
            <th>MVAR</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {importData.map((entry, index) => (
            <tr key={index}>
              <td>{entry.DI_FEEDER}</td>
              <td>{entry.DI_MW}</td>
              <td>{entry.DI_MVAR}</td>
              <td>{new Date(entry.DI_DATE).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DelhiImport;
