import React, { useState, useEffect } from 'react';

const OpenAccessSchedule = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [buyerSellerOptions, setBuyerSellerOptions] = useState([]);
  const [discomMapping, setDiscomMapping] = useState({});
  const [allMappingData, setAllMappingData] = useState([]);
  const [issueTime, setIssueTime] = useState('');

  const mainDiscoms = ['BRPL', 'BYPL', 'TPDDL', 'NDPL', 'MES', 'NDMC'];

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const currentDate = getCurrentDate();
    setSelectedDate(currentDate);
  }, []);

  const formatDateForAPI = (date) => date.replace(/-/g, '/');

  // Function to convert slot number to time range
  const convertSlotToTimeRange = (slot) => {
    const slotNumber = parseInt(slot);
    const startMinutes = (slotNumber - 1) * 15;
    const endMinutes = slotNumber * 15;
    
    const startHour = Math.floor(startMinutes / 60);
    const startMin = startMinutes % 60;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    
    const formatTime = (hour, minute) => {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    };
    
    return `${formatTime(startHour, startMin)}-${formatTime(endHour, endMin)}`;
  };

  const fetchDiscomMapping = async () => {
    try {
      const res = await fetch('https://delhisldc.org/app-api/get-data?table=DTL_MAPPING');
      const result = await res.json();
      if (result.result?.rows) {
        const mapping = {};
        const allData = result.result.rows;
        
        setAllMappingData(allData);
        
        // Create main DISCOM mapping
        allData.forEach(row => {
          const localCode = row[0]; 
          const remoteCode = row[1]; 
          if (mainDiscoms.includes(localCode)) {
            mapping[localCode] = remoteCode;
          }
        });
        
        setDiscomMapping(mapping);
        console.log('DISCOM Mapping:', mapping);
        console.log('All mapping data rows:', allData.length);
      }
    } catch (err) {
      console.error('Error fetching DISCOM mapping:', err);
    }
  };

  const getMappedBuyers = (discom) => {
    const mappedBuyers = [];
    
    allMappingData.forEach(row => {
      const localCode = row[0]; 
      const remoteCode = row[1]; 
      
      if (remoteCode === discom) {
        mappedBuyers.push(localCode);
      }
      
      if (localCode === discom) {
        mappedBuyers.push(remoteCode);
      }
    });
    
    mappedBuyers.push(discom);
    
    const uniqueBuyers = [...new Set(mappedBuyers)];
    console.log(`Mapped buyers for ${discom}:`, uniqueBuyers);
    return uniqueBuyers;
  };

  const fetchBuyerSellerOptions = async () => {
    try {
      const formattedDate = formatDateForAPI(selectedDate);
      
      const res = await fetch(`https://delhisldc.org/app-api/get-data?table=DTL_OASCHEDULE&filters=${encodeURIComponent(JSON.stringify({ FORDATE: formattedDate }))}`);
      const result = await res.json();
      
      if (result.result?.rows) {
        const uniqueEntities = new Set();
        
        result.result.rows.forEach(row => {
          if (row[3]) uniqueEntities.add(row[3]); // BUYER
          if (row[4]) uniqueEntities.add(row[4]); // SELLER
        });
        
        let entitiesArray = Array.from(uniqueEntities).sort();
        
        if (entitiesArray.includes('TPDDL') && entitiesArray.includes('NDPL')) {
          entitiesArray = entitiesArray.filter(entity => entity !== 'TPDDL');
        } else if (entitiesArray.includes('TPDDL') && !entitiesArray.includes('NDPL')) {
          entitiesArray = entitiesArray.map(entity => entity === 'TPDDL' ? 'NDPL' : entity);
        }
        
        entitiesArray = [...new Set(entitiesArray)].sort();
        
        setBuyerSellerOptions(entitiesArray);
        
        if (!selectedEntity) {
          if (entitiesArray.includes('BRPL')) {
            setSelectedEntity('BRPL');
          } else if (entitiesArray.length > 0) {
            setSelectedEntity(entitiesArray[0]);
          }
        } else {
          if (!entitiesArray.includes(selectedEntity)) {
            if (entitiesArray.includes('BRPL')) {
              setSelectedEntity('BRPL');
            } else if (entitiesArray.length > 0) {
              setSelectedEntity(entitiesArray[0]);
            } else {
              setSelectedEntity('');
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching buyer/seller options:', err);
    }
  };

  const getRelatedEntities = (entity) => {
    let entities = [entity];
    
    if (entity === 'NDPL') {
      entities.push('TPDDL');
    }
    
    if (discomMapping[entity]) {
      entities.push(discomMapping[entity]);
    }
    
    const localCode = Object.keys(discomMapping).find(key => discomMapping[key] === entity);
    if (localCode && !entities.includes(localCode)) {
      entities.push(localCode);
    }
    
    return [...new Set(entities)];
  };

  const fetchData = async () => {
    if (!selectedEntity || allMappingData.length === 0) return;
    
    setLoading(true);
    setError('');
    try {
      const formattedDate = formatDateForAPI(selectedDate);
      
      console.log('Fetching data for entity:', selectedEntity);
      
      // Check if selected entity is a main DISCOM
      const isMainDiscom = mainDiscoms.includes(selectedEntity);
      
      // Fetch ALL data for the selected date
      const res = await fetch(`https://delhisldc.org/app-api/get-data?table=DTL_OASCHEDULE&filters=${encodeURIComponent(JSON.stringify({ FORDATE: formattedDate }))}`);
      const result = await res.json();
      
      if (result.result?.rows) {
        console.log('Total rows fetched:', result.result.rows.length);
        
        let filteredRows;
        
        if (isMainDiscom) {
          const mappedBuyers = getMappedBuyers(selectedEntity);
          const relatedEntities = getRelatedEntities(selectedEntity);
          const allRelatedEntities = [...new Set([...mappedBuyers, ...relatedEntities])];
          
          console.log('Main DISCOM - All related entities:', allRelatedEntities);
          
          filteredRows = result.result.rows.filter(row => {
            const buyer = row[3];
            const seller = row[4];
            
            return allRelatedEntities.some(entity => 
              buyer === entity || seller === entity
            );
          });
        } else {
          console.log('Specific buyer - showing only transactions for:', selectedEntity);
          
          filteredRows = result.result.rows.filter(row => {
            const buyer = row[3];
            const seller = row[4];
            
            return buyer === selectedEntity || seller === selectedEntity;
          });
        }
        
        console.log('Filtered rows for', selectedEntity, ':', filteredRows.length);
        console.log('Sample filtered data:', filteredRows.slice(0, 3));
        
        const uniqueRows = filteredRows.filter((row, index, self) => 
          index === self.findIndex(r => 
            r[0] === row[0] && 
            r[1] === row[1] && 
            r[3] === row[3] &&
            r[4] === row[4]    
          )
        );

        
        const uniqueApprovals = [...new Set(uniqueRows.map(row => row[1]))].filter(Boolean);
        
        const uniqueBuyers = [...new Set(uniqueRows.map(row => row[3]))].filter(Boolean);
        
        const uniqueSellers = [...new Set(uniqueRows.map(row => row[4]))].filter(Boolean);
        
        const uniqueTraders = [...new Set(uniqueRows.map(row => row[5]))].filter(Boolean);
        
        setData(uniqueRows);

        if (uniqueRows.length > 0) {
          setIssueTime(uniqueRows[0][7] || '');
        } else {
          setIssueTime('');
        }
      } else {
        setData([]);
      }
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscomMapping();
  }, []);

  useEffect(() => {
    if (Object.keys(discomMapping).length > 0 && selectedDate) {
      fetchBuyerSellerOptions();
    }
  }, [selectedDate, discomMapping]);

  useEffect(() => {
    if (selectedEntity && allMappingData.length > 0) {
      fetchData();
    }
  }, [selectedEntity, selectedDate, allMappingData]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  
  const handleEntityChange = (e) => setSelectedEntity(e.target.value);

  const getUniqueApprovalNumbers = () => {
    const approvals = [...new Set(data.map(row => row[1]))].filter(Boolean).sort();
    return approvals;
  };

  const getUniqueTimeslots = () => {
    const timeslots = [...new Set(data.map(row => row[0]))].sort((a, b) => parseInt(a) - parseInt(b));
    return timeslots;
  };

  const createTableData = () => {
    const approvalNumbers = getUniqueApprovalNumbers();
    const timeslots = getUniqueTimeslots();

    const sellerRow = ['Seller', ...approvalNumbers.map(app => {
      const row = data.find(r => r[1] === app);
      return row?.[4] || '';  
    }), 'Total'];

    const buyerRow = ['Buyer', ...approvalNumbers.map(app => {
      const row = data.find(r => r[1] === app);
      return row?.[3] || '';  
    }), ''];

    const traderRow = ['Trader', ...approvalNumbers.map(app => {
      const row = data.find(r => r[1] === app);
      return row?.[5] || '';  
    }), ''];

    const dataRows = timeslots.map(slot => {
      const timeRange = convertSlotToTimeRange(slot);
      const row = [timeRange];
      let rowTotal = 0;
      let debugInfo = [];
      
      approvalNumbers.forEach(app => {
        const matchingRow = data.find(r => r[0] === slot && r[1] === app);
        const value = matchingRow ? parseFloat(matchingRow[6] || 0) : 0;  
        row.push(value.toFixed(2));
        
        // For total calculation
        if (matchingRow) {
          const seller = matchingRow[4];
          const buyer = matchingRow[3];
          
          if (mainDiscoms.includes(selectedEntity)) {
            if (seller === selectedEntity) {
              rowTotal -= value;
              debugInfo.push(`${app}: -${value} (${selectedEntity} selling to ${buyer})`);
            } 
            else if (buyer === selectedEntity) {
              rowTotal += value;
              debugInfo.push(`${app}: +${value} (${selectedEntity} buying from ${seller})`);
            }
            else {
              const mappedBuyers = getMappedBuyers(selectedEntity);
              
              if (mappedBuyers.includes(buyer) && !mappedBuyers.includes(seller)) {
                rowTotal += value;
                debugInfo.push(`${app}: +${value} (${buyer} buying for ${selectedEntity})`);
              }
              else if (mappedBuyers.includes(seller) && !mappedBuyers.includes(buyer)) {
                rowTotal -= value;
                debugInfo.push(`${app}: -${value} (${seller} selling for ${selectedEntity})`);
              }
              else {
                debugInfo.push(`${app}: 0 (${buyer} ← ${seller}, not related to ${selectedEntity})`);
              }
            }
          } else {
            rowTotal += value;
          }
        }
      });
      
      if (slot <= 3) {
        console.log(`Slot ${slot} (${timeRange}) calculation for ${selectedEntity}:`, debugInfo, `Total: ${rowTotal.toFixed(2)}`);
      }
      
      row.push(rowTotal.toFixed(2));
      return row;
    });

    return { 
      headers: ['Timeslot', ...approvalNumbers, 'Total'], 
      sellerRow, 
      buyerRow, 
      traderRow, 
      dataRows 
    };
  };

  const downloadExcel = () => {
    if (!data.length) return;
    
    const tableData = createTableData();
    const { headers, sellerRow, buyerRow, traderRow, dataRows } = tableData;
    
    const csvRows = [];
    
    csvRows.push([`Open Access Schedule - ${selectedEntity} - ${selectedDate}`]);
    csvRows.push([]); 
    
    csvRows.push(headers);
    
    csvRows.push(sellerRow);
    csvRows.push(buyerRow);
    csvRows.push(traderRow);
    
    dataRows.forEach(row => csvRows.push(row));
    
    const csvContent = csvRows.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `OpenAccessSchedule_${selectedEntity}_${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tableData = data.length > 0 ? createTableData() : null;

  return (
    <div style={{ 
      fontFamily: "'Inter', 'Segoe UI', sans-serif", 
      padding: "3px", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
      minHeight: "100vh",
      boxSizing: "border-box"
    }}>
      <div style={{ 
        maxWidth: "100vw", 
        margin: "auto", 
        background: "#fff", 
        borderRadius: "6px", 
        boxShadow: "0 8px 25px rgba(0,0,0,0.1)", 
        overflow: "hidden",
        height: "99vh",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Header */}
        <div style={{ 
          background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)", 
          color: "#fff", 
          padding: "10px 15px", 
          textAlign: "center",
          flexShrink: 0
        }}>
          <h1 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "700" }}>
            Open Access Schedule for different constituent
          </h1>
          {issueTime && (
            <div style={{ fontSize: "0.8rem", marginTop: "3px", opacity: "0.9" }}>
              📅 Issued on: {issueTime}
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ 
          display: "flex", 
          gap: "12px", 
          padding: "10px 15px", 
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          alignItems: "end",
          flexShrink: 0,
          borderBottom: "1px solid #dee2e6"
        }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ 
              marginBottom: "5px", 
              fontSize: "0.85rem", 
              color: "#495057", 
              fontWeight: "600" 
            }}>
              📅 Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              style={{ 
                padding: "8px 12px", 
                borderRadius: "6px", 
                border: "2px solid #e9ecef", 
                fontSize: "0.9rem",
                width: "160px",
                boxSizing: "border-box",
                transition: "all 0.3s ease",
                background: "#fff"
              }}
            />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ 
              marginBottom: "5px", 
              fontSize: "0.85rem", 
              color: "#495057", 
              fontWeight: "600" 
            }}>
              🏢 Buyer/Seller
            </label>
            <select
              value={selectedEntity}
              onChange={handleEntityChange}
              style={{ 
                padding: "8px 12px", 
                borderRadius: "6px", 
                border: "2px solid #e9ecef", 
                fontSize: "0.9rem",
                width: "300px",
                boxSizing: "border-box",
                transition: "all 0.3s ease",
                background: "#fff"
              }}
            >
              <option value="">Select Buyer/Seller</option>
              {buyerSellerOptions.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
            </select>
          </div>

          {/* Download Button */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ 
              marginBottom: "5px", 
              fontSize: "0.85rem", 
              color: "#495057", 
              fontWeight: "600" 
            }}>
              📥 Export Data
            </label>
            <button
              onClick={downloadExcel}
              disabled={!data.length}
              style={{ 
                padding: "8px 16px", 
                borderRadius: "6px", 
                border: "2px solid #28a745", 
                fontSize: "0.9rem",
                background: data.length ? "linear-gradient(135deg, #28a745 0%, #20c997 100%)" : "#e9ecef",
                color: data.length ? "#fff" : "#6c757d",
                cursor: data.length ? "pointer" : "not-allowed",
                fontWeight: "600",
                transition: "all 0.3s ease",
                minWidth: "120px"
              }}
            >
              📊 Download CSV
            </button>
          </div>

          {/* Debug Info */}
          {selectedEntity && (
            <div style={{ 
              fontSize: "0.75rem", 
              color: "#6c757d",
              background: "#f8f9fa",
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid #dee2e6"
            }}>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div style={{ 
          flex: 1, 
          padding: "8px", 
          overflow: "hidden",
          display: "flex",
          flexDirection: "column"
        }}>
          {loading && (
            <div style={{ 
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              fontSize: "1.1rem",
              color: "#6c757d"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3.5rem", marginBottom: "15px" }}>⏳</div>
                <div>Loading data for {selectedEntity}...</div>
              </div>
            </div>
          )}
          
          {error && (
            <div style={{ 
              background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)", 
              color: "#fff", 
              padding: "15px", 
              borderRadius: "8px",
              textAlign: "center",
              fontSize: "1rem",
              fontWeight: "600"
            }}>
              ⚠️ {error}
            </div>
          )}
          
          {!loading && !error && !selectedEntity && (
            <div style={{ 
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              fontSize: "1.1rem",
              color: "#6c757d"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🔍</div>
                <div>Please select a Buyer/Seller to view data</div>
                <div style={{ fontSize: "0.85rem", marginTop: "8px", opacity: "0.7" }}>
                  Date: {selectedDate}
                </div>
              </div>
            </div>
          )}
          
          {!loading && !error && selectedEntity && data.length === 0 && (
            <div style={{ 
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              fontSize: "1.4rem",
              color: "#6c757d"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "5rem", marginBottom: "15px" }}>📈</div>
                <div>No transactions found for {selectedEntity}</div>
                <div style={{ fontSize: "0.85rem", marginTop: "8px", opacity: "0.7" }}>
                  Date: {selectedDate}
                </div>
              </div>
            </div>
          )}
          
          {!loading && !error && data.length > 0 && tableData && (
            <div style={{ 
              flex: 1,
              border: "1px solid #dee2e6", 
              borderRadius: "6px",
              overflow: "hidden",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              height: "100%"
            }}>
              <div style={{ 
                flex: 1,
                overflowX: "auto", 
                overflowY: "auto",
                position: "relative"
              }}>
                <table style={{ 
                  width: "100%", 
                  borderCollapse: "collapse", 
                  fontSize: "0.85rem", // Increased from 0.80rem
                  background: "#fff",
                  minWidth: "fit-content"
                }}>
                  <thead>
                    <tr style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      {tableData.headers.map((head, idx) => (
                        <th key={idx} style={{
                          background: idx === 0 ? "linear-gradient(135deg, #6f42c1 0%, #563d7c 100%)" : // Purple for Time Block
                                      idx === tableData.headers.length - 1 ? "linear-gradient(135deg, #28a745 0%, #1e7e34 100%)" : // Green for Total
                                      "linear-gradient(135deg, #fd7e14 0%, #e55a00 100%)", // Orange for approval numbers
                          color: "#fff", 
                          padding: "6px 4px", // Increased padding 
                          position: idx === 0 ? "sticky" : "static", 
                          left: idx === 0 ? 0 : "auto", 
                          top: 0, 
                          zIndex: idx === 0 ? 11 : 10, 
                          textAlign: "center",
                          minWidth: idx === 0 ? "85px" : "90px", // Increased width for time column
                          maxWidth: idx === 0 ? "85px" : "130px", // Increased width for time column
                          fontSize: "0.95rem", // Increased font size
                          fontWeight: "700",
                          borderRight: "1px solid rgba(255,255,255,0.3)",
                          textTransform: "uppercase",
                          letterSpacing: "0.1px",
                          whiteSpace: "nowrap",
                          verticalAlign: "middle",
                          boxSizing: "border-box",
                          height: "32px", // Increased height
                          lineHeight: "1"
                        }}>
                          <div style={{ 
                            wordBreak: "break-word", 
                            whiteSpace: "normal",
                            lineHeight: "0.9",
                            fontSize: "0.6rem" // Increased font size
                          }}>
                            {head}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[tableData.sellerRow, tableData.buyerRow, tableData.traderRow, ...tableData.dataRows].map((row, i) => (
                      <tr key={i} style={{ 
                        borderBottom: "1px solid #dee2e6",
                        backgroundColor: i === 0 ? "#fff3cd" : 
                                        i === 1 ? "#cce5ff" : 
                                        i === 2 ? "#e6ccff" : 
                                        i % 2 === 0 ? "#f8f9fa" : "#fff",
                        transition: "background-color 0.2s ease",
                        height: "30px", // Increased height
                        position: i <= 2 ? "sticky" : "static",
                        top: i <= 2 ? `${32 + (i * 30)}px` : "auto", // Adjusted for new heights
                        zIndex: i <= 2 ? 9 : 0
                      }}>
                        {row.map((cell, j) => (
                          <td key={j} style={{
                            padding: "4px", // Increased padding
                            border: "1px solid #dee2e6",
                            fontWeight: (i <= 2 || j === row.length - 1) ? "600" : "400",
                            color: i <= 2 ? "#212529" : (parseFloat(cell) === 0 ? "#6c757d" : "#212529"),
                            textAlign: "center", 
                            position: j === 0 ? "sticky" : "static",
                            left: j === 0 ? 0 : "auto",
                            backgroundColor: j === 0 ? (
                              i === 0 ? "#fff3cd" : 
                              i === 1 ? "#cce5ff" : 
                              i === 2 ? "#e6ccff" : "#f1f3f4"
                            ) : (j === row.length - 1 ? "#e8f5e8" : (i <= 2 ? (
                              i === 0 ? "#fff3cd" : 
                              i === 1 ? "#cce5ff" : 
                              i === 2 ? "#e6ccff" : "inherit"
                            ) : "inherit")),
                            zIndex: j === 0 ? (i <= 2 ? 10 : 1) : (i <= 2 ? 9 : 0),
                            minWidth: j === 0 ? "85px" : "90px", // Increased width for time column
                            maxWidth: j === 0 ? "85px" : "130px", // Increased width for time column
                            fontSize: "0.75rem", // Increased font size
                            borderRight: (j === 0 || j === row.length - 1) ? "1px solid #adb5bd" : "1px solid #dee2e6",
                            fontFamily: "'Inter', sans-serif",
                            whiteSpace: "nowrap",
                            verticalAlign: "middle", 
                            lineHeight: "1",
                            boxSizing: "border-box",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}>
                            {j === 0 && i > 2 ? (
                              <span style={{ 
                                background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
                                color: "#fff",
                                padding: "2px 6px", // Increased padding for time range
                                borderRadius: "3px",
                                fontSize: "0.6rem", // Slightly smaller for time range
                                fontWeight: "600",
                                display: "inline-block",
                                minWidth: "75px", // Increased width for time range
                                textAlign: "center"
                              }}>
                                {cell}
                              </span>
                            ) : (
                              <span style={{
                                display: "inline-block",
                                width: "100%",
                                textAlign: "center",
                                wordBreak: i <= 2 ? "break-all" : "normal",
                                whiteSpace: "nowrap",
                                fontSize: i <= 2 ? "0.65rem" : "0.7rem", // Increased font sizes
                                lineHeight: "1",
                                color: j === row.length - 1 && i > 2 ? "#28a745" : "inherit",
                                fontWeight: j === row.length - 1 && i > 2 ? "700" : "inherit",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                              }}>
                                {cell}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpenAccessSchedule;