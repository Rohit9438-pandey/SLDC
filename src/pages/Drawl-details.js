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

    const sortedTimeslotData = Object.keys(timeslotData)
      .sort()
      .reduce((acc, key) => {
        acc[key] = timeslotData[key];
        return acc;
      }, {});

    return sortedTimeslotData;
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
    <h2>Drawl Schedule of Discoms from Generating Stations (in MW)</h2>
  
    <div className="form-row">
      <div className="form-group">
        <div className="select-container">
          <select
            value={selectedConstituent}
            onChange={(e) => setSelectedConstituent(e.target.value)}
            className="form-select"
          >
            <option value="BRPL">BRPL</option>
            <option value="BYPL">BYPL</option>
            <option value="MES">MES</option>
            <option value="NDMC">NDMC</option>
            <option value="NDPL">NDPL</option>
            <option value="RAILWAYS">RAILWAYS</option>
          </select>
        </div>
      </div>
  
      <div className="form-group">
        <p><strong>Constituent:</strong> {selectedConstituent}</p>
      </div>
  
      <div className="form-group">
        <p><strong>Issued on:</strong> {new Date().toLocaleString()}</p>
      </div>
  
      <div className="form-group inline-form">
        <p><strong>For Date:</strong></p>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="form-input"
        />
      </div>
  
      <div className="form-group">
        <p><strong>Revision No:</strong> {revisionNo}</p>
      </div>
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
  
  );
};

export default DrawlDetails;
