import React, { useEffect, useState } from 'react';
import useFetchGraphData from '../lib/getGraphData';

const DrawlDetails = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDiscom, setSelectedDiscom] = useState('');
  const [selectedRevisionNo, setSelectedRevisionNo] = useState('');
  const [gencoData, setGencoData] = useState([]); // Initialized as an empty array
  const [formattedTotalTableData, setFormattedTotalTableData] = useState([]); // Initialized as an empty array

  const revisionNo = `${selectedRevisionNo}DS${selectedDiscom}${selectedDate}`;

  const tableFilter = {
    REVISIONNO: revisionNo,
  };

  // Serialize tableFilter into a query string
  const queryParams = new URLSearchParams({
    table: "DTL_DRAWL_TOTAL",
    filters: JSON.stringify(tableFilter),
  }).toString();

  // Fetch total table data
  const {
    data: totalTableData,
    loading: totalTableLoading,
    error: totalTableError,
  } = useFetchGraphData(`get-data?${queryParams}`);

  useEffect(() => {
    if (!totalTableLoading && totalTableData?.result?.metaData) {
      const columnNames = totalTableData.result.metaData.map((col) => col.name);
      const data = totalTableData.result.rows.map((row) => {
        return row.reduce((obj, value, index) => {
          obj[columnNames[index]] = value; // Map each value to the corresponding column name
          return obj;
        }, {});
      });
      setFormattedTotalTableData(data);
    }
  }, [totalTableData, totalTableLoading]);

  // Fetch general data based on selected date
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

  // Fetch genco data based on selected revision number
  useEffect(() => {
    const fetchGencoData = async () => {
      if (!selectedRevisionNo) return;

      setLoading(true);
      try {
        const response = await fetch(
          `https://delhisldc.org/app-api/discom-drawl-schedule?revisionno=${revisionNo}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        setGencoData(result.data || []); // If result.data is undefined, set to empty array
        console.log("Genco Data:", result.data);  // Check the genco data in console
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGencoData();
  }, [selectedRevisionNo, selectedDiscom, selectedDate]);

  // Format genco data into a timeslot-based structure
  const formatTableData = () => {
    const timeslotData = {};
    gencoData.forEach((entry) => {
      const { TIMESLOT, GENCOCODE, QUANTUM } = entry;
      if (!timeslotData[TIMESLOT]) {
        timeslotData[TIMESLOT] = {};
      }
      timeslotData[TIMESLOT][GENCOCODE] = QUANTUM; // Store Quantum value for each GENCOCODE
    });
    return timeslotData;
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

  // Combine genco data with formatted total table data
  const mergeTablesData = () => {
    const timeslotData = formatTableData();
    const gencoCodes = getGencoCodes();

    return formattedTotalTableData.map((formattedItem, index) => {
      const timeslotRow = timeslotData[formattedItem.TIMESLOT] || {};
      const rowData = {
        TIMESLOT: formattedItem.TIMESLOT,
        ...formattedItem,
        ...gencoCodes.reduce((acc, genco) => {
          acc[genco] = timeslotRow[genco] || 0; // Merge the genco data into the row
          return acc;
        }, {}),
      };
      return rowData;
    });
  };

  const mergedData = mergeTablesData().sort((a, b) => {
    // Numeric comparison for TIMESLOT
    return a.TIMESLOT - b.TIMESLOT;
  });
    const gencoCodes = getGencoCodes();

  // Set the default selectedDiscom and maximum revision number when data is fetched
  useEffect(() => {
    if (data.length > 0) {
      const uniqueDiscoms = Array.from(
        new Set(
          data.map((ele) => {
            const match = ele.REVISIONNO.match(/DS([A-Z]+)/);
            return match ? match[1] : null;
          })
        )
      ).filter(Boolean);

      if (uniqueDiscoms.length > 0 && !selectedDiscom) {
        setSelectedDiscom(uniqueDiscoms[0]);
      }

      const filteredData = data.filter(
        (ele) => ele.REVISIONNO.includes(`DS${selectedDiscom}`)
      );
      const revisionNos = filteredData
        .map((ele) => `${ele.REVISIONNO[0]}${ele.REVISIONNO[1]}`)
        .sort((a, b) => b.localeCompare(a));
      if (revisionNos.length > 0) {
        setSelectedRevisionNo(revisionNos[0]);
      }
    }
  }, [data, selectedDiscom]);

  // Set the default selectedDate to today's date (formatted as yyyy/mm/dd)
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today.split("-").join("/"));
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="container">
      <h2
        style={{
          color: 'royalblue',
          fontWeight: 'bold',
          textAlign: 'center',
          marginTop: '10px',
        }}
      >
        Drawl Schedule of Discoms from Generating Stations (in MW)
      </h2>

      {/* Filter Section for Revision No, Constituent, and Date */}
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
            <strong>Constituent:</strong>
            <select
              value={selectedDiscom}
              onChange={(e) => setSelectedDiscom(e.target.value)}
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
              {/* Render unique Discoms */}
              {Array.from(new Set(
                data.map((ele) => {
                  const match = ele.REVISIONNO.match(/DS([A-Z]+)/);
                  return match ? match[1] : null;
                })
              )).filter(Boolean).map((discom, i) => (
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
            onChange={(e) => setSelectedDate(e.target.value.split("-").join("/"))}
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

        {/* Revision No. Dropdown */}
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
              onChange={(e) => setSelectedRevisionNo(e.target.value)}
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
              {/* Render unique revision numbers */}
              {Array.from(new Set(
                data.map((ele) => `${ele.REVISIONNO[0]}${ele.REVISIONNO[1]}`)
              )).sort((a, b) => b.localeCompare(a)).map((revisionNo, i) => (
                <option key={i} value={revisionNo}>
                  {revisionNo}
                </option>
              ))}
            </select>
          </p>
        </div>
      </div>

      {/* Merged Data Table */}
      <div className="table-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '20px'}}>
        <div className="table-container">
          <h3 style={{ textAlign: 'center', marginBottom: '10px' }}></h3>
          <table className="genco-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Timeslot</th>
                {gencoCodes.map((genco) => (
                  <th key={genco}>{genco}</th>
                ))}
                <th>Total Expenditure</th>
                <th>Open Access</th>
                <th>IDT</th>
                <th>LOSSES</th>
                <th>IDTEXBIL</th>
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {mergedData.map((item, index) => (
                <tr key={index}>
                  <td>{item.TIMESLOT}</td>
                  {gencoCodes.map((genco) => (
                    <td key={genco}>{item[genco] || 0}</td>
                  ))}
                  <td>{item.TOTAL_EXPP}</td>
                  <td>{item.OPENACCESS}</td>
                  <td>{item.IDT}</td>
                  <td>{item.LOSSES}</td>
                  <td>{item.IDTEXBIL}</td>
                  <td>{item.TOTAL}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DrawlDetails;
