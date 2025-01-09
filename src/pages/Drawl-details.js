import React, { useEffect, useState } from 'react';

const DrawlDetails = () => {
  const [revisionNo, setRevisionNo] = useState('');
  const [gencoData, setGencoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConstituent, setSelectedConstituent] = useState('BRPL');
  const [selectedDate, setSelectedDate] = useState('');

  // Function to get current date in format yyyy/MM/dd
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  // Fetch revision number
  const fetchRevisionNo = async () => {
    const currentDate = getCurrentDate();
    const response = await fetch(
      `https://delhisldc.org/app-api/revisionno?date=${currentDate}&searchQuery=${selectedConstituent}`
    );
    const data = await response.json();
    setRevisionNo(data.maxRevisionno);
  };

  // Fetch genco data
  const fetchData = async () => {
    if (!revisionNo) return;

    try {
      const response = await fetch(
        `https://delhisldc.org/app-api/discom-drawl-schedule?revisionno=${revisionNo}&gencocode=AP41PL_BHDL`
      );
      const data = await response.json();

      if (data.data && Array.isArray(data.data)) {
        setGencoData(data.data);
      } else {
        setGencoData([]);
      }
    } catch (error) {
      setGencoData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevisionNo();
  }, [selectedConstituent]);

  useEffect(() => {
    if (revisionNo) {
      fetchData();
    }
  }, [revisionNo]);

  // Format the table data into a timeslot-based structure
  const formatTableData = () => {
    const timeslotData = {};
    gencoData.forEach((entry) => {
      const { TIMESLOT, GENCOCODE, QUANTUM } = entry;
      if (!timeslotData[TIMESLOT]) {
        timeslotData[TIMESLOT] = {};
      }
      timeslotData[TIMESLOT][GENCOCODE] = QUANTUM;
    });
    return timeslotData; // Return the data here
  };

  // Get the unique genco codes
  const getGencoCodes = () => {
    const gencoCodes = [];
    gencoData.forEach((entry) => {
      if (!gencoCodes.includes(entry.GENCOCODE)) {
        gencoCodes.push(entry.GENCOCODE);
      }
    });
    return gencoCodes.sort();
  };

  const tableData = formatTableData();
  const gencoCodes = getGencoCodes();

  return (
    <div className="container">
      <h2 style={{color: 'royalblue' , fontWeight : 'bold' , textAlign : 'center'}}>Drawl Schedule of Discoms from Generating Stations (in MW)</h2>

      <div className="form-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
  {/* Constituent Dropdown */}
  <div className="form-group" style={{ flex: 1 }}>
    <div className="select-container" style={{ 
      padding: '15px',
      backgroundColor: '#f9f9f9', 
      borderRadius: '8px', 
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      width: '100%',
    }}>
      <p style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 'bold', color: '#2c3e50' }}>
        <strong>Constituent:</strong> {selectedConstituent}
      </p>

      <select
        value={selectedConstituent}
        onChange={(e) => setSelectedConstituent(e.target.value)}
        className="form-select"
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          color: '#34495e',
          backgroundColor: '#ecf0f1',
          border: '2px solid #ccc',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'border-color 0.3s, background-color 0.3s',
        }}
      >
        <option value="BRPL" style={{ padding: '10px' }}>BRPL</option>
        <option value="BYPL" style={{ padding: '10px' }}>BYPL</option>
        <option value="MES" style={{ padding: '10px' }}>MES</option>
        <option value="NDMC" style={{ padding: '10px' }}>NDMC</option>
        <option value="NDPL" style={{ padding: '10px' }}>NDPL</option>
        <option value="RAILWAYS" style={{ padding: '10px' }}>RAILWAYS</option>
      </select>
    </div>
  </div>



  <div className="form-group" style={{ display: 'flex', alignItems: 'center', flex: 1, marginTop: '20px' }}>
  <p style={{ marginRight: '10px', marginBottom: 0, fontSize: '16px', fontWeight: 'bold', color: '#2c3e50' }}>
    <strong>Date:</strong>
  </p>
  <input
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    className="form-input"
    style={{
      marginLeft: '10px',
      marginBottom: '10px',
      padding: '10px',
      fontSize: '16px',
      color: '#34495e',
      backgroundColor: '#ecf0f1',
      border: '2px solid #ccc',
      borderRadius: '8px',
      outline: 'none',
      transition: 'border-color 0.3s, background-color 0.3s',
    }}
  />
</div>



{/* Revision No. */}
<div className="form-group" style={{ flex: 1, marginTop: '20px' }}>
  <p style={{
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50',
    backgroundColor: '#f7f7f7',
    padding: '10px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'inline-block',
    transition: 'all 0.3s ease',
  }}>
    <strong style={{ color: '#2980b9' }}>Revision No:</strong> 
    <span style={{ color: '#e74c3c' }}>{revisionNo}</span>
  </p>
</div>


 {/* Issued On with Date and Time */}
<div
  className="form-group"
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end', // Position to the right
    marginTop: '20px', // Add some space from the content above
    color: 'blue', // Change the color of the text
  }}
>
  {/* Date with Calendar Icon */}
  <span style={{ marginRight: '20px' }}>
    <i className="fa fa-calendar-alt" aria-hidden="true" style={{ color: 'orange', marginLeft: '700px' }}></i>
    <strong>Date:</strong> {new Date().toLocaleDateString()}
  </span>
  
  {/* Time with Clock Icon */}
  <span>
    <i className="fa fa-clock" aria-hidden="true" style={{ color: 'green', marginLeft: '700px' }}></i>
    <strong>Time:</strong> {new Date().toLocaleTimeString()}
  </span>
</div>



      <div className="table-wrapper">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-container">
            {gencoData.length === 0 ? (
              <p>No data available for the selected revision.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th className="fixed-column">Timeslot</th>
                    {gencoCodes.map((genco) => (
                      <th key={genco} className="fixed-column">{genco}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(tableData).map((timeslot) => (
                    <tr key={timeslot}>
                      <td className="fixed-column">{timeslot}</td>
                      {gencoCodes.map((genco) => (
                        <td key={genco}>{tableData[timeslot][genco] || 0}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default DrawlDetails;
