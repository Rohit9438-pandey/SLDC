import React, { useState, useEffect } from 'react';

const OpenAccessSchedule = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [buyerSellerOptions, setBuyerSellerOptions] = useState([]);
  const [discomMapping, setDiscomMapping] = useState([]);
  const [issueTime, setIssueTime] = useState('');

  const mainDiscoms = ['BRPL', 'BYPL', 'TPDDL', 'NDPL', 'MES', 'NDMC'];

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize with current date
  useEffect(() => {
    const currentDate = getCurrentDate();
    setSelectedDate(currentDate);
  }, []);

  const formatDateForAPI = (date) => date.replace(/-/g, '/');

  // Fetch DISCOM mapping data
  const fetchDiscomMapping = async () => {
    try {
      const res = await fetch('https://delhisldc.org/app-api/get-data?table=DTL_MAPPING');
      const result = await res.json();
      if (result.result?.rows) {
        const mapping = {};
        result.result.rows.forEach(row => {
          const localCode = row[0]; 
          const remoteCode = row[1]; 
          if (mainDiscoms.includes(localCode)) {
            mapping[localCode] = remoteCode;
          }
        });
        setDiscomMapping(mapping);
        console.log('DISCOM Mapping:', mapping);
      }
    } catch (err) {
      console.error('Error fetching DISCOM mapping:', err);
    }
  };

  const fetchBuyerSellerOptions = async () => {
    try {
      const formattedDate = formatDateForAPI(selectedDate);
      
      const res = await fetch(`https://delhisldc.org/app-api/get-data?table=DTL_OASCHEDULE&filters=${encodeURIComponent(JSON.stringify({ FORDATE: formattedDate }))}`);
      const result = await res.json();
      
      if (result.result?.rows) {
        const uniqueEntities = new Set();
        
        result.result.rows.forEach(row => {
          if (row[3]) uniqueEntities.add(row[3]); 
          if (row[4]) uniqueEntities.add(row[4]); 
        });
        
        let entitiesArray = Array.from(uniqueEntities).sort();
        
        if (entitiesArray.includes('TPDDL') && entitiesArray.includes('NDPL')) {
          entitiesArray = entitiesArray.filter(entity => entity !== 'TPDDL');
        } else if (entitiesArray.includes('TPDDL') && !entitiesArray.includes('NDPL')) {
          entitiesArray = entitiesArray.map(entity => entity === 'TPDDL' ? 'NDPL' : entity);
        }
        
        entitiesArray = [...new Set(entitiesArray)].sort();
        
        setBuyerSellerOptions(entitiesArray);
        
        // Auto-select BRPL if available, otherwise select first option
        if (entitiesArray.includes('BRPL')) {
          setSelectedEntity('BRPL');
        } else if (!selectedEntity && entitiesArray.length > 0) {
          setSelectedEntity(entitiesArray[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching buyer/seller options:', err);
    }
  };

  const getDisplayName = (entity) => {
    return entity;
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
    if (!selectedEntity) return;
    
    setLoading(true);
    setError('');
    try {
      const formattedDate = formatDateForAPI(selectedDate);
      const relatedEntities = getRelatedEntities(selectedEntity);
      
      const apiCalls = [];
      
      relatedEntities.forEach(entity => {
        const buyerFilters = { BUYER: entity, FORDATE: formattedDate };
        apiCalls.push(
          fetch(`https://delhisldc.org/app-api/get-data?table=DTL_OASCHEDULE&filters=${encodeURIComponent(JSON.stringify(buyerFilters))}`)
        );
        
        const sellerFilters = { SELLER: entity, FORDATE: formattedDate };
        apiCalls.push(
          fetch(`https://delhisldc.org/app-api/get-data?table=DTL_OASCHEDULE&filters=${encodeURIComponent(JSON.stringify(sellerFilters))}`)
        );
      });

      const responses = await Promise.all(apiCalls);
      const results = await Promise.all(responses.map(res => res.json()));

      const allRows = [];
      results.forEach(result => {
        if (result.result?.rows) {
          allRows.push(...result.result.rows);
        }
      });

      const uniqueRows = allRows.filter((row, index, self) => 
        index === self.findIndex(r => 
          r[0] === row[0] && r[1] === row[1] && r[3] === row[3] && r[4] === row[4]
        )
      );

      setData(uniqueRows);

      if (uniqueRows.length > 0) {
        setIssueTime(uniqueRows[0][7]);
      } else {
        setIssueTime('');
      }
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error('Error fetching data:', err);
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
    if (selectedEntity && Object.keys(discomMapping).length > 0) {
      fetchData();
    }
  }, [selectedEntity, selectedDate, discomMapping]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedEntity(''); 
  };
  
  const handleEntityChange = (e) => setSelectedEntity(e.target.value);

  const getUniqueApprovalNumbers = () => [...new Set(data.map(row => row[1]))].filter(Boolean).sort();
  const getUniqueTimeslots = () => [...new Set(data.map(row => row[0]))].sort((a, b) => parseInt(a) - parseInt(b));

  const createTableData = () => {
    const approvalNumbers = getUniqueApprovalNumbers();
    const timeslots = getUniqueTimeslots();

    const sellerRow = ['Seller', ...approvalNumbers.map(app => {
      const row = data.find(r => r[1] === app);
      const seller = row?.[4] || '';
      return seller;
    }), 'Total'];

    const buyerRow = ['Buyer', ...approvalNumbers.map(app => {
      const row = data.find(r => r[1] === app);
      const buyer = row?.[3] || '';
      return buyer;
    }), ''];

    const traderRow = ['Trader', ...approvalNumbers.map(app => {
      const row = data.find(r => r[1] === app);
      return row?.[5] || '';
    }), ''];

    const dataRows = timeslots.map(slot => {
      const row = [slot.toString()];
      let rowTotal = 0;
      
      approvalNumbers.forEach(app => {
        const d = data.find(r => r[0] === slot && r[1] === app);
        const value = d ? parseFloat(d[6]) : 0;
        row.push(value.toFixed(2));
        rowTotal += value;
      });
      
      row.push(rowTotal.toFixed(2));
      return row;
    });

    return { headers: ['Time Block', ...approvalNumbers, 'Total'], sellerRow, buyerRow, traderRow, dataRows };
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
                  {getDisplayName(entity)}
                </option>
              ))}
            </select>
          </div>
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
                <div style={{ fontSize: "2.5rem", marginBottom: "15px" }}>⏳</div>
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
              fontSize: "1.1rem",
              color: "#6c757d"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "15px" }}>📈</div>
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
                  fontSize: "0.7rem",
                  background: "#fff",
                  minWidth: "fit-content"
                }}>
                  <thead>
                    <tr style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      {tableData.headers.map((head, idx) => (
                        <th key={idx} style={{
                          background: "linear-gradient(135deg, #495057 0%, #343a40 100%)", 
                          color: "#fff", 
                          padding: "6px 4px", 
                          position: idx === 0 ? "sticky" : "static", 
                          left: idx === 0 ? 0 : "auto", 
                          top: 0, 
                          zIndex: idx === 0 ? 11 : 10, 
                          textAlign: "center",
                          minWidth: idx === 0 ? "70px" : "90px",
                          fontSize: "0.65rem",
                          fontWeight: "700",
                          borderRight: "1px solid #6c757d",
                          textTransform: "uppercase",
                          letterSpacing: "0.2px",
                          whiteSpace: "nowrap",
                          verticalAlign: "middle",
                          boxSizing: "border-box",
                          height: "30px",
                          lineHeight: "1",
                          backgroundColor: idx === tableData.headers.length - 1 ? 
                            "linear-gradient(135deg, #28a745 0%, #1e7e34 100%)" : 
                            "linear-gradient(135deg, #495057 0%, #343a40 100%)"
                        }}>
                          <div style={{ 
                            wordBreak: "break-word", 
                            whiteSpace: "normal",
                            lineHeight: "1"
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
                        height: "28px",
                        position: i <= 2 ? "sticky" : "static",
                        top: i <= 2 ? `${30 + (i * 28)}px` : "auto",
                        zIndex: i <= 2 ? 9 : 0
                      }}>
                        {row.map((cell, j) => (
                          <td key={j} style={{
                            padding: "4px 3px", 
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
                            minWidth: j === 0 ? "70px" : "90px",
                            fontSize: "0.65rem",
                            borderRight: (j === 0 || j === row.length - 1) ? "1px solid #adb5bd" : "1px solid #dee2e6",
                            fontFamily: "'Inter', sans-serif",
                            whiteSpace: "nowrap",
                            verticalAlign: "middle", 
                            lineHeight: "1",
                            boxSizing: "border-box"
                          }}>
                            {j === 0 && i > 2 ? (
                              <span style={{ 
                                background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
                                color: "#fff",
                                padding: "1px 4px",
                                borderRadius: "2px",
                                fontSize: "0.6rem",
                                fontWeight: "600",
                                display: "inline-block",
                                minWidth: "20px"
                              }}>
                                {cell}
                              </span>
                            ) : (
                              <span style={{
                                display: "inline-block",
                                width: "100%",
                                textAlign: "center",
                                wordBreak: i <= 2 ? "break-word" : "normal",
                                whiteSpace: i <= 2 ? "normal" : "nowrap",
                                fontSize: i <= 2 ? "0.6rem" : "0.65rem",
                                lineHeight: "1",
                                color: j === row.length - 1 && i > 2 ? "#28a745" : "inherit",
                                fontWeight: j === row.length - 1 && i > 2 ? "700" : "inherit"
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