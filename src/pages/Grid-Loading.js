import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const GridLoading = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [substationData, setSubstationData] = useState(null);

  useEffect(() => {
    // Fetch the grid loading data
    fetch('https://www.delhisldc.org/app-api/grid-loading')
      .then((response) => response.json())
      .then((data) => {
        // Modify the substation names here
        const modifiedData = data.data.map((item) => {
          return {
            ...item, // Keep all other properties of the item
            DG_GRID: item.DG_GRID.replace(/subzi mandi/i, 'Sabzi Mandi'), // Modify DG_GRID
          };
        });

        // Set the modified data to the state
        setData(modifiedData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Fetch substation data when clicked
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0'); // Adds leading zero if day < 10
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so we add 1
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="genco">
      <h2 style={{ color: '#0c6a98', fontWeight: 700 }}>GRID LOADING</h2>

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

      {/* MUI Modal to show substation data */}
      <Dialog open={modalVisible} onClose={closeModal}>
        <DialogTitle>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Date:</strong> {substationData ? formatDate(substationData[0]?.GD_DATE) : ''}
            </div>
            <div>
              <strong>Time:</strong> {substationData ? new Date(substationData[0]?.GD_DATE).toLocaleTimeString() : ''}
            </div>
          </div>
        </DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Substation</TableCell>
                <TableCell>MW</TableCell>
                <TableCell>MVAR</TableCell>
                <TableCell>Voltage 220kv</TableCell>
                <TableCell>Voltage 66/33kv</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {substationData &&
                substationData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{substationData ? item.GD_SUBSTATION : ''}</TableCell> 
                    <TableCell>{Math.round(item.GD_MW)}</TableCell>
                    <TableCell>{Math.round(item.GD_MVAR)}</TableCell>
                    <TableCell>{Math.round(item.GD_VOLTAGE)}</TableCell>
                    <TableCell>{Math.round(item.GD_VOLT66)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default GridLoading;
