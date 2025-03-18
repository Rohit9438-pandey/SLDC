import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const GridLoading = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [substationData, setSubstationData] = useState(null);
  const [time, setTime] = useState("");  

  useEffect(() => {
    fetch('https://www.delhisldc.org/app-api/grid-loading')
      .then((response) => response.json())
      .then((data) => {
        const modifiedData = data.data.map((item) => ({
          ...item,
          DG_GRID: item.DG_GRID.replace(/subzi mandi/i, 'Sabzi Mandi'),
        }));

        setData(modifiedData);
        setLoading(false);

        if (data.data.length > 0) {
          const dateTime = new Date(data.data[0].DG_DATE);
          const formattedTime = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setTime(formattedTime);
        }
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const fetchSubstationData = (substation) => {
    const encodedSubstation = encodeURIComponent(substation);

    fetch(`https://delhisldc.org/app-api/grid-data?substation=${encodedSubstation}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          setSubstationData(data.data);
          setModalVisible(true);
        } else {
          setSubstationData(null);
        }
      })
      .catch((err) => {
        console.error('Error fetching substation data:', err);
        setSubstationData(null);
      });
  };

  const closeModal = () => {
    setModalVisible(false);
    setSubstationData(null);
  };

  return (
    <div className="genco">
      <h2 style={{ color: '#0c6a98', fontWeight: 700 }}>
        GRID LOADING - {time || "No Time Available"}
      </h2>

      {data.length > 0 ? (
        <table className="grid-table">
          <thead>
            <tr>
              <th>Sub-Stations</th>
              <th>RTU</th>
              <th>MW</th>
              <th>Mvar</th>
              <th>Voltage</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>
                  <Link to="#" onClick={() => fetchSubstationData(item.DG_GRID)}>
                    {item.DG_GRID}
                  </Link>
                </td>
                <td>{item.DG_STTS}</td>
                <td>{Math.round(item.DG_MW)}</td>
                <td>{Math.round(item.DG_MVAR)}</td>
                <td>{Math.round(item.DG_VOLTAGE)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available</p>
      )}

<Dialog open={modalVisible} onClose={closeModal} maxWidth="md" fullWidth>
  <DialogTitle style={{ backgroundColor: "#0c6a98", color: "white", fontWeight: "bold", textAlign: "center" }}>
    Substation Details
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Date:</strong> {substationData ? new Date(substationData[0]?.GD_DATE).toLocaleDateString() : ''}
            </div>
            <div>
              <strong>Time:</strong> {substationData ? new Date(substationData[0]?.GD_DATE).toLocaleTimeString() : ''}
            </div>
          </div>
  </DialogTitle>
  <DialogContent style={{ padding: "20px", backgroundColor: "#f9f9f9" }}>
    <Table style={{ minWidth: 600, borderRadius: "8px", overflow: "hidden" }}>
      <TableHead>
        <TableRow style={{ backgroundColor: "#0c6a98" }}>
          <TableCell style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Substation</TableCell>
          <TableCell style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>MW</TableCell>
          <TableCell style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>MVAR</TableCell>
          <TableCell style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Voltage 220kv</TableCell>
          <TableCell style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Voltage 66/33kv</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {substationData &&
          substationData.map((item, index) => (
            <TableRow
              key={index}
              style={{
                backgroundColor: index % 2 === 0 ? "#eef7fc" : "white",
                transition: "background 0.3s",
              }}
            >
              <TableCell style={{ textAlign: "center", fontWeight: "500" }}>{item.GD_SUBSTATION}</TableCell>
              <TableCell style={{ textAlign: "center", fontWeight: "500" }}>{Math.round(item.GD_MW)}</TableCell>
              <TableCell style={{ textAlign: "center", fontWeight: "500" }}>{Math.round(item.GD_MVAR)}</TableCell>
              <TableCell style={{ textAlign: "center", fontWeight: "500" }}>{Math.round(item.GD_VOLTAGE)}</TableCell>
              <TableCell style={{ textAlign: "center", fontWeight: "500" }}>{Math.round(item.GD_VOLT66)}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  </DialogContent>
  <DialogActions style={{ justifyContent: "center", padding: "10px 20px" }}>
    <Button
      onClick={closeModal}
      style={{
        backgroundColor: "#0c6a98",
        color: "white",
        fontWeight: "bold",
        borderRadius: "6px",
        padding: "8px 16px",
        textTransform: "none",
      }}
    >
      Close
    </Button>
  </DialogActions>
</Dialog>

    </div>
  );
};

export default GridLoading;
