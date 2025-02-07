import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// Custom hook to fetch data from the API
const useFetchData = (url) => {
    
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const result = await response.json();
        setData(result.result.rows);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);

  return { data, loading, error };
};


const DiscomFeeders = () => {
    const {discom} = useParams()
    const filter = {
        "DD_DISCOM":discom
    }
    const queryParams = new URLSearchParams({
        table: "DTL_DISCOM_FEEDER",
        filters: JSON.stringify(filter),
      }).toString();
    console.log(discom);
  const apiURL = `https://delhisldc.org/app-api/get-data?${queryParams}`;
  
  const { data, loading, error } = useFetchData(apiURL);
  // Handle the loading and error states
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="discom-feeder-table">
      <h2 style={{textAlign:'center', color:'#0d6efd'}}>Discom Feeder Data at {data[0][0]} </h2>
      
      <table className="genco-table">
        <thead>
          <tr>
            
            <th>Discom</th>
            <th>Station</th>
            <th>Feeder</th>
            <th>Load</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row[1]}</td>
              <td>{row[2]}</td>
              <td>{row[3]}</td>
              <td>{row[4]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DiscomFeeders;
