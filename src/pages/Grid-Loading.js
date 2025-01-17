import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 


const GridLoading = () => {
  // State to store data and loading/error state
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  


  useEffect(() => {
    // Fetch the data when the component mounts
    fetch('https://www.delhisldc.org/app-api/grid-loading')
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
      <h2 style= {{color: '#0c6a98' , fontWeight: 700}}> GRID LOADING</h2>
      {data.length > 0 ? (
        <table className="grid-table">
          <thead>
            <tr>
              <th>Sub-Stations</th>
              <th>RTU</th>
              <th>MW</th>
              <th>Mvar</th>
              <th>Voltage</th>

            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td><Link to={`${item.DG_GRID}`} target="_blank">{item.DG_GRID}</Link></td>
                <td>{item.DG_STTS}</td>
                <td>{Math.round(item.DG_MW)}</td>
                <td>{Math.round(item.DG_MVAR)}</td>
                <td>{Math.round(item.DG_VOLTAGE)}</td>

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

export default  GridLoading;
