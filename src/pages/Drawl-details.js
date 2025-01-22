import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const DrawlDetails = () => {
  const [data, setData] = useState([]); // Holds the general drawl schedule data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDiscom, setSelectedDiscom] = useState('');
  const [selectedRevisionNo, setSelectedRevisionNo] = useState('');
  const [gencoData, setGencoData] = useState([]); // Holds the genco-specific data for the revision

  const revisionNo = `${selectedRevisionNo}DS${selectedDiscom}${selectedDate}`;

  // Fetch the general data (schedule revision data based on selected date)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://delhisldc.org/app-api/drawl-schedule-revision?fordate=${selectedDate}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate) {
      fetchData();
    }
  }, [selectedDate]);

  // Fetch the genco data based on selected revision number
  useEffect(() => {
    const fetchGencoData = async () => {
      if (!selectedRevisionNo) return; // Don't fetch unless a revision number is selected

      setLoading(true); // Start loading before fetching data
      try {
        const response = await fetch(
          `https://delhisldc.org/app-api/discom-drawl-schedule?revisionno=${revisionNo}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        setGencoData(result.data || []); // Ensure we set empty array if no data is available
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGencoData();
  }, [selectedRevisionNo, selectedDiscom, selectedDate]); // Trigger when revision number, date or discom changes

  useEffect(() => {
    // Set the default selectedDiscom to the first Discom option after data is fetched
    if (data.length > 0) {
      const uniqueDiscoms = Array.from(
        new Set(
          data.map((ele) => {
            const match = ele.REVISIONNO.match(/DS([A-Z]+)/);
            return match ? match[1] : null; // Extract the abbreviation or null
          })
        )
      ).filter(Boolean); // Remove null values

      if (uniqueDiscoms.length > 0) {
        setSelectedDiscom(uniqueDiscoms[0]); // Set the default selected Discom to the first one
      }
    }

    // Set selectedRevisionNo based on the fetched data (lowest revision number)
    if (data.length > 0) {
      const revisionNos = data
        .map((ele) => `${ele.REVISIONNO[0]}${ele.REVISIONNO[1]}`)
        .sort((a, b) => a.localeCompare(b)); // Sort revision numbers
      setSelectedRevisionNo(revisionNos[0]); // Set the default to the lowest revision number
    }
  }, [data]);

  // Set the default selectedDate to today's date (formatted as yyyy/mm/dd)
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in yyyy-mm-dd format
    setSelectedDate(today.split("-").join("/")); // Set it as yyyy/mm/dd
  }, []);

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

  const handleSelectChange = (event) => {
    setSelectedDiscom(event.target.value); // Update selected Discom
  };

  const handleDateChange = (event) => {
    const formattedDate = event.target.value.split("-").join("/"); // Format date to yyyy/mm/dd
    setSelectedDate(formattedDate);
  };

  const handleRevisionChange = (event) => {
    setSelectedRevisionNo(event.target.value);
  };

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Error: {error}</p>;
  }

  const uniqueDiscoms = Array.from(
    new Set(
      data.map((ele) => {
        const match = ele.REVISIONNO.match(/DS([A-Z]+)/);
        return match ? match[1] : null; // Extract the abbreviation or null
      })
    )
  ).filter(Boolean); // Remove null values

  const uniqueRevisionNos = Array.from(
    new Set(data.map((ele) => `${ele.REVISIONNO[0]}${ele.REVISIONNO[1]}`))
  ).sort((a, b) => a.localeCompare(b)); // Sort the revision numbers from low to high

  return (
    <div className="container">
      <h2 style={{ color: 'royalblue', fontWeight: 'bold', textAlign: 'center', marginTop: '10px' }}>
        Drawl Schedule of Discoms from Generating Stations (in MW)
      </h2>

      <div
        className="form-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '20px',
          flexWrap: 'wrap',
          border: '3px solid #ccc',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          borderColor: 'rgba(0, 255, 0, 0.5)',
        }}
      >
        {/* Constituent Dropdown */}
        <div className="form-group" style={{ flex: '1 1 30%', marginBottom: '20px' }}>
          <div className="select-container"
            style={{
              padding: '15px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              width: '100%',
            }}
          >
            <strong>Constituent:</strong> {selectedDiscom}
            <select
              value={selectedDiscom}
              onChange={handleSelectChange}
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
              {uniqueDiscoms.map((discom, i) => (
                <option key={i} value={discom}>
                  {discom}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Picker */}
        <div className="form-group" style={{ flex: '1 1 30%', marginBottom: '20px' }}>
          <p
            style={{
              marginBottom: '3px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#2c3e50',
            }}
          >
            <strong>Date:</strong>
          </p>
          <input
            type="date"
            value={selectedDate.split("/").join("-")}
            onChange={handleDateChange}
            className="form-input"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              color: '#34495e',
              backgroundColor: '#ecf0f1',
              border: '2px solid #ccc',
              borderRadius: '5px',
              outline: 'none',
              transition: 'border-color 0.3s, background-color 0.3s',
            }}
          />
        </div>

        {/* Revision No. */}
        <div className="form-group" style={{ flex: '1 1 30%', marginBottom: '20px' }}>
          <p
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: 'black',
              padding: '10px 20px',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              display: 'inline-block',
              transition: 'all 0.3s ease',
              marginLeft: '70px',
              marginBottom: '30px',
              marginTop: '40px',
            }}
          >
            <strong style={{ color: '#2980b9' }}>Revision No:</strong>
            <select
              value={selectedRevisionNo}
              onChange={handleRevisionChange}
              style={{
                marginLeft: '10px',
                padding: '5px 10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '16px',
                color: '#34495e',
                backgroundColor: '#ecf0f1',
                cursor: 'pointer',
              }}
            >
              {uniqueRevisionNos.map((revisionNo, i) => (
                <option key={i} value={revisionNo}>
                  {revisionNo}
                </option>
              ))}
            </select>
          </p>
        </div>
      </div>

      {/* Table displaying the data */}
      <div className="table-wrapper">
        {gencoData.length === 0 ? (
          <p>No data available for the selected revision.</p>
        ) : (
          <div className="table-container">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawlDetails;
