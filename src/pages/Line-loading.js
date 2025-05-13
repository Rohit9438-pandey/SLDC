import React, { useState, useEffect } from 'react';

const LineLoading = () => {
  // State to store data, loading/error state, and table visibility
  const [delhiData, setDelhiData] = useState([]);
  const [northernRegionData, setNorthernRegionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDelhiButtonClicked, setIsDelhiButtonClicked] = useState(false); // State to toggle Delhi table visibility
  const [isNorthernRegionButtonClicked, setIsNorthernRegionButtonClicked] = useState(false); // State to toggle Northern Region table visibility

  useEffect(() => {
    // Fetch data for both APIs when the component mounts
    fetch('https://www.delhisldc.org/app-api/line-data')
      .then((response) => response.json())
      .then((data) => {
        setDelhiData(data.data); // Store the fetched data for Delhi circuits
        setLoading(false); // Set loading to false
      })
      .catch((err) => {
        setError(err.message); // Handle error
        setLoading(false);
      });

    fetch('https://delhisldc.org/app-api/ir-line')
      .then((response) => response.json())
      .then((data) => {
        setNorthernRegionData(data.data); // Store the fetched data for Northern Region circuits
      })
      .catch((err) => {
        setError(err.message); // Handle error
      });
  }, []); // Empty dependency array ensures this runs once when the component mounts

  // Handling loading and error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Toggle function for Delhi button
  const handleDelhiButtonClick = () => {
    setIsDelhiButtonClicked((prevState) => !prevState); // Toggle visibility of Delhi data
  };

  // Toggle function for Northern Region button
  const handleNorthernRegionButtonClick = () => {
    setIsNorthernRegionButtonClicked((prevState) => !prevState); // Toggle visibility of Northern Region data
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);

    // Get the day, month, and year
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();

    // Get the hours, minutes, and seconds
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Return the formatted string
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const latestDelhiDate = delhiData.length > 0 ? delhiData[0].LD_DATE : null;

  return (
    <div className="genco">
        <h2 style={{
                textAlign: 'center',
                backgroundImage: 'linear-gradient(45deg, #ff5733, #33c3ff)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontSize: '28px',
                fontWeight: 'bold',
                marginTop: '30px'
            }}>Real Time Loadings on 400/220kV Circuit</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>

        {/* Button for Delhi Transmission Circuits */}
        <button
          onClick={handleDelhiButtonClick}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#0c6a98',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginLeft: '20px',
            marginTop:'20px',
          }}
        >
          Transmission Circuits of Delhi
        </button>

        {/* Button for Northern Region Transmission Circuits */}
        <button
          onClick={handleNorthernRegionButtonClick}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#0c6a98',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginRight: '20px',
            marginTop: '20px',
          }}
        >
          Major Transmission Circuits of Northern Region
        </button>
      </div>

      {/* Conditionally render the data tables */}
      <div>
        {/* Display Delhi Circuits table */}
        {isDelhiButtonClicked && (
          <div>
            <h3 style={{ textAlign: 'center', color: '#008000' }}>
              Updated on : {latestDelhiDate ? formatDateTime(latestDelhiDate) : 'No data available'}
            </h3>
            {delhiData.length > 0 ? (
              <table className="genco-table" style={{ marginTop: '20px' }}>
                <thead>
                  <tr>
                    <th>400/220 kV Transmission Circuit</th>
                    <th>MW</th>
                    <th>MVAR</th>
                  </tr>
                </thead>
                <tbody>
                  {delhiData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.LD_LINE}</td>
                      <td>{Math.round(item.LD_MW)}</td>
                      <td>{Math.round(item.LD_MVAR)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No data available</p>
            )}
          </div>
        )}

        {/* Display Northern Region Circuits table */}
        {isNorthernRegionButtonClicked && (
          <div>
            {northernRegionData.length > 0 ? (
              <table className="genco-table" style={{ marginTop: '20px' }}>
                <thead>
                  <tr>
                    <th>Inter Regional/ NR Circuit</th>
                    <th>MW</th>
                    <th>MVAR</th>
                  </tr>
                </thead>
                <tbody>
                  {northernRegionData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.DI_LINE}</td>
                      <td>{Math.round(item.DI_MW)}</td>
                      <td>{Math.round(item.DI_MVAR)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No data available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LineLoading;
