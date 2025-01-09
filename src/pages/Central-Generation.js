import React, { useState, useEffect } from 'react';

const CentralGeneration = () => {
  // State to store data and loading/error state
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

 
  useEffect(() => {
    // Fetch the data when the component mounts
    fetch('https://www.delhisldc.org/app-api/sector-gen')
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




  return (
    <div className='sector'>
      <h2> CENTRAL SECTOR GENERATION</h2>
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

export default  CentralGeneration;
