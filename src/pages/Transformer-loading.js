import React, { useState, useEffect } from 'react';

const TransformerLoading = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // State to store the search input

  useEffect(() => {
    // Fetch the data when the component mounts
    fetch('https://www.delhisldc.org/app-api/transformer-loading')
      .then((response) => response.json())
      .then((data) => {
        setData(data.data);  
        setLoading(false); 
      })
      .catch((err) => {
        setError(err.message); 
        setLoading(false);
      });
  }, []);  

  // Handling loading and error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Filter the data based on the search term
const filteredData = data.filter(item =>
  item.GD_SUBSTATION &&
  item.GD_SUBSTATION.toLowerCase().includes(searchTerm.toLowerCase())
);


  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0'); // Add leading 0 if day is less than 10
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so we add 1
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return {
      date: `${day}/${month}/${year}`,  // formatted date: dd/mm/yyyy
      time: `${hours}:${minutes}:${seconds}`  // formatted time: hh:mm:ss
    };
  };


  const headerDate = data.length > 0 ? formatDateTime(data[0].GD_DATE).date : '';
  const headerTime = data.length > 0 ? formatDateTime(data[0].GD_DATE).time : '';

  return (
    <div className='genco'>
  <h2 style={{
                textAlign: 'center',
                backgroundImage: 'linear-gradient(45deg, #ff5733, #33c3ff)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontSize: '28px',
                fontWeight: 'bold',
                marginTop: '30px'
            }}>
        Transformer Loading 
        <br />
        <span style={{ fontSize: '17px', fontWeight: 'normal', color: '#008000' }}>
          Date: {headerDate} | Time: {headerTime}
        </span>
      </h2>
      
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by Transformer Name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} // Update the search term
        style={{ padding: '10px', width: '20%', marginBottom: '20px', fontSize: '16px' ,marginLeft: '80%' , padding:'10px'}}
      />

      {/* Table */}
      {filteredData.length > 0 ? (
        <table className="genco-table">
          <thead>
            <tr>
              <th>Grid/Transformer/Capacity(MVA)</th>
              <th>MW</th>
              <th>MVAR</th>
              <th>Voltage 220KV</th>
              <th>220KV Voltage 66KV/33KV</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td>{item.GD_SUBSTATION}</td>
                <td>{Math.round(item.GD_MW)}</td>
                <td>{Math.round(item.GD_MVAR)}</td>
                <td>{Math.round(item.GD_VOLTAGE)}</td>
                <td>{Math.round(item.GD_VOLT66)}</td>
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

export default TransformerLoading;
