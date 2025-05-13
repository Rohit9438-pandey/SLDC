import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

  const apiURL = `https://delhisldc.org/app-api/get-data?${queryParams}`;
  
  const formatTime = (timeString) => {
    const date = new Date(timeString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const period = hours >= 12 ? "PM" : "AM";

    const formattedTime = `${((hours + 11) % 12 + 1)}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} ${period}`;
    return formattedTime;
  };
  
  const { data, loading, error } = useFetchData(apiURL);
  // Handle the loading and error states
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const extractedDate = data[0][0].split('T')[0];

  const formattedTime = formatTime(data[0][0]);

  return (
    <div className="discom-feeder-table">
   <h3 style={{
                textAlign: 'center',
                backgroundImage: 'linear-gradient(45deg, #ff5733, #33c3ff)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontSize: '28px',
                fontWeight: 'bold',
                marginBottom: '20px'
            }}>
  Feeder wise load of {discom === 'NDPL' ? 'TPDDL' : discom} at {extractedDate} {formattedTime}
</h3>
      
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
              <td>{row[1] === 'NDPL' ? 'TPDDL' : row[1]}</td>
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
