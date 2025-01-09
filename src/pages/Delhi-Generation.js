import React, { useState, useEffect } from 'react';

const DelhiGeneration = () => {
  // State to store data and loading/error state
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    // Fetch the data when the component mounts
    fetch('https://www.delhisldc.org/app-api/genco')
      .then((response) => response.json())
      .then((data) => {
        setData(data.data);  // Store the fetched data
        setLoading(false);  // Set loading to false when data is fetched
      })
      .catch((err) => {
        setError(err.message);  // Set error message in case of failure
        setLoading(false);
      });
  }, []);  // Empty dependency array means it runs once when the component mounts

  // Handling loading and error states
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



  return (
    <div className='genco'>
      <h2 style={{color: '#0c6a98' , fontWeight: 700}}>DELHI GENERATION</h2>
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
                <td>{item.DG_GENCO}</td>
                <td>{Math.round(item.DG_SCHEDULE)}</td>
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

export default  DelhiGeneration;
