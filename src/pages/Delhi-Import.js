import React, { useEffect, useState } from 'react';

const DelhiImport=()=> {
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
  

  
  

  useEffect(() => {
    // Fetch data from API
    fetch('https://www.delhisldc.org/app-api/delhi-import')
      .then(response => response.json()) // Parse the JSON data from the response
      .then(data => {
        setData(data.data); // Store the data in state
        setLoading(false); // Set loading to false once data is fetched
      })
      .catch(error => {
        console.error("Error fetching data: ", error);
        setLoading(false); // Set loading to false in case of error
      });
  }, []); // Empty dependency array to run only once when the component mounts

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className='import'>
      <h2 style= {{color: '#0c6a98' , fontWeight: 700}}> DELHI IMPORT</h2>
      {data.length > 0 ? (
        <table className="table table-bordered import-table">
          <thead>
            <tr>
              <th>TRANSFORMER/FEEDER</th>
              <th>MW</th>
              <th>MVAR</th>

            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.DI_FEEDER}</td>
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
  );
};

export default DelhiImport;