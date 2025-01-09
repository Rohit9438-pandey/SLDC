import React, { useState, useEffect } from 'react';

const StateDrawl = () => {
  // State to store data and loading/error state
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  


  useEffect(() => {
    // Fetch the data when the component mounts
    fetch('https://www.delhisldc.org/app-api/state-drawl')
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
    <div className='genco'>
      <h2 style ={{color: '#0c6a98' , fontWeight: 700}}> STATES DRAWL</h2>
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
                <td>{Math.round(item.DS_LOAD)}</td>
                <td>{Math.round(item.DS_OD_UD)}</td>

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

export default  StateDrawl;
