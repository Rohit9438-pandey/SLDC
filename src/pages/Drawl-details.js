import React, { useEffect, useState } from 'react';
import useFetchGraphData from '../lib/getGraphData';
import { useParams } from 'react-router-dom';
import { Clock } from "lucide-react";

const DrawlDetails = () => {
  const params = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDiscom, setSelectedDiscom] = useState(params.discom);
  const [selectedRevisionNo, setSelectedRevisionNo] = useState('');
  const [gencoData, setGencoData] = useState([]);
  const [formattedTotalTableData, setFormattedTotalTableData] = useState([]);
  const [timeslotData, setTimeslotData] = useState([]);
  const [revisionDate, setRevisionDate] = useState('');

  const revisionNo = `${selectedRevisionNo}DS${selectedDiscom}${selectedDate}`;
  const tableFilter = { REVISIONNO: revisionNo };

  const queryParams = new URLSearchParams({
    table: "DTL_DRAWL_TOTAL",
    filters: JSON.stringify(tableFilter),
  }).toString();

  const { data: totalTableData, loading: totalTableLoading } = useFetchGraphData(`get-data?${queryParams}`);

  useEffect(() => {
    if (!totalTableLoading && totalTableData?.result?.metaData) {
      const columnNames = totalTableData.result.metaData.map(col => col.name);
      const rows = totalTableData.result.rows.map(row =>
        row.reduce((obj, value, index) => {
          obj[columnNames[index]] = value;
          return obj;
        }, {})
      );
      setFormattedTotalTableData(rows);
    }
  }, [totalTableData, totalTableLoading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://delhisldc.org/app-api/drawl-schedule-revision?fordate=${selectedDate}`
        );
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate) fetchData();
  }, [selectedDate]);

  useEffect(() => {
    const fetchGencoData = async () => {
      if (!selectedRevisionNo) return;
      setLoading(true);
      try {
        const response = await fetch(
          `https://delhisldc.org/app-api/discom-drawl-schedule?revisionno=${revisionNo}`
        );
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();
        setGencoData(result.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGencoData();
  }, [selectedRevisionNo, selectedDiscom, selectedDate]);

  useEffect(() => {
    const fetchTimeslotData = async () => {
      try {
        const response = await fetch('https://delhisldc.org/app-api/get-data?table=TIMESLOT');
        const result = await response.json();
        const timeslots = result?.result?.rows?.map(row => row[1]) || [];
        setTimeslotData(timeslots);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchTimeslotData();
  }, []);

  useEffect(() => {
    if (!revisionNo) return;
    const fetchRevisionDate = async () => {
      try {
        const url = `https://delhisldc.org/app-api/get-data?table=REVISION&filters=${encodeURIComponent(JSON.stringify({ REVISIONNO: revisionNo }))}`;
        const res = await fetch(url);
        const result = await res.json();
        const rows = result?.result?.rows || [];
        const meta = result?.result?.metaData || [];
        if (!rows.length) return;
        const revDateIndex = meta.findIndex(col => col.name === "REVISIONDATE");
        if (revDateIndex === -1) return;
        setRevisionDate(rows[0][revDateIndex]);
      } catch (err) {
        setRevisionDate('');
      }
    };
    fetchRevisionDate();
  }, [revisionNo]);

  useEffect(() => {
    if (data.length > 0) {
      const uniqueDiscoms = Array.from(new Set(
        data.map(ele => {
          const match = ele.REVISIONNO.match(/DS([A-Z]+)/);
          return match ? match[1] : null;
        })
      )).filter(Boolean);

      if (uniqueDiscoms.length > 0 && !selectedDiscom) {
        setSelectedDiscom(uniqueDiscoms[0]);
      }

      const filteredData = data.filter(ele =>
        ele.REVISIONNO.includes(`DS${selectedDiscom}`)
      );
      const revisionNos = filteredData
        .map(ele => `${ele.REVISIONNO[0]}${ele.REVISIONNO[1]}`)
        .sort((a, b) => b.localeCompare(a));

      if (revisionNos.length > 0) {
        setSelectedRevisionNo(revisionNos[0]);
      }
    }
  }, [data, selectedDiscom]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today.split("-").join("/"));
  }, []);

  const formatTableData = () => {
    const timeslotMap = {};
    gencoData.forEach(({ TIMESLOT, GENCOCODE, QUANTUM }) => {
      if (!timeslotMap[TIMESLOT]) timeslotMap[TIMESLOT] = {};
      timeslotMap[TIMESLOT][GENCOCODE] = QUANTUM;
    });
    return timeslotMap;
  };

  const getGencoCodes = () => {
    return Array.from(new Set(gencoData.map(entry => entry.GENCOCODE))).sort();
  };

  const mergeTablesData = () => {
    const timeslotMap = formatTableData();
    const gencos = getGencoCodes();

    return formattedTotalTableData.map((item, idx) => {
      const gencoRow = timeslotMap[item.TIMESLOT] || {};
      const combined = {
        TIMESLOT: item.TIMESLOT,
        ...item,
        ...gencos.reduce((acc, genco) => {
          acc[genco] = gencoRow[genco] || 0;
          return acc;
        }, {}),
      };
      return combined;
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const gencoCodes = getGencoCodes();
  const mergedData = mergeTablesData().sort((a, b) => a.TIMESLOT - b.TIMESLOT);

  return (
    <div className="container">
      <h2 style={{
        textAlign: 'center',
        backgroundImage: 'linear-gradient(45deg, #ff5733, #33c3ff)',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        fontSize: '28px',
        fontWeight: 'bold',
        marginTop: '20px'
      }}>
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
                 {discom === 'NDPL' ? 'TPDDL' : discom}
                </option>
              ))}
            </select>
          </div>
        </div>


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

        <div style={{ flex: '1 1 30%', marginBottom: '20px' }}>
          <p style={{
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: 'black',
            padding: '10px 20px',
            borderRadius: '8px',
            color: '#2980b9',
            marginBottom: '30px',
            marginTop: '40px',
          }}>
            Revision No:
            <select
              value={selectedRevisionNo}
              onChange={(e) => setSelectedRevisionNo(e.target.value)}
              style={{
                marginLeft: '10px',
                padding: '5px 10px',
                borderRadius: '4px',
                backgroundColor: '#ecf0f1',
              }}>
              {Array.from(new Set(data.map(ele => `${ele.REVISIONNO[0]}${ele.REVISIONNO[1]}`)))
                .sort((a, b) => b.localeCompare(a))
                .map((rev, i) => (
                  <option key={i} value={rev}>{rev}</option>
                ))}
            </select>
          </p>
        </div>

        <div>
          <p className="flex items-center gap-2 text-sm text-slate-700 font-bold">
            <Clock size={16} className="text-blue-600" />
            Issued on: <span className="font-bold">{revisionDate || 'Loading...'}</span>
          </p>
        </div>
      </div>

      <div className="table-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '20px'}}>
         <div className="table-container" style={{ overflowX: 'auto' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '10px' }}></h3>
          <table className="genco-table" style={{ width: '100%'}}>
            <thead>
              <tr>
              <th style={{ position: 'sticky', left: 0 , zIndex: 2 }}>Timeslot</th>{gencoCodes.map((genco) => (
                  <th key={genco}>{genco}</th>
                ))}
                <th>Total_Expp</th>
                <th>Open Access</th>
                <th>IDT</th>
                <th>LOSSES</th>
                <th>TOTAL</th>
                
              </tr>
            </thead>
            <tbody>
            {mergedData.map((rows, index) => (
      <tr key={index}>
        <td style={{ position: 'sticky', left: 0 , zIndex: 1 }}>{timeslotData[index]}</td> 
        {gencoCodes.map((genco) => (
          <td key={genco}>{rows[genco] || '0'}</td>
        ))}
        <td>{rows.TOTAL_EXPP}</td>
        <td>{rows.OPENACCESS}</td>
        <td>{rows.IDT}</td>
        <td>{rows.LOSSES}</td>
        <td>{rows.TOTAL}</td>
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
