import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';



const ENTITIES = ['BRPL', 'BYPL', 'Delhi', 'NDMC', 'NDPL', 'MES', 'ALL'];


const ENTITY_COLORS = {
    BRPL: '#0ea5e9',
    BYPL: '#e63946',
    Delhi: '#ff6347',
    NDMC: '#2a9d8f',
    NDPL: '#8b0000',
    MES: '#8b0000',
    ALL: '#6a0572'
};

const LoadCurve = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedEntity, setSelectedEntity] = useState('ALL');
    const [data, setData] = useState([]);
    const [profileData, setProfileData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchData = async (entity, date) => {
        try {
            setLoading(true);
            setError(null);
            const formattedDate = date.toLocaleDateString('en-GB').split('/').join('/');

            if (entity === 'ALL') {
                const allData = {};
                const allTimeslots = new Set();

                for (const ent of ENTITIES.filter(e => e !== 'ALL')) {
                    const response = await axios.get(`https://delhisldc.org/app-api/load-curve?fordate=${formattedDate}&entity=${ent}`);
                    let entityData = response.data.map(item => ({
                        TIMESLOT: item.TIMESLOT,
                        VALUE: Number(item.VALUE)
                    }));
    
                    entityData.sort((a, b) => parseTime(a.TIMESLOT) - parseTime(b.TIMESLOT));
    
                    allData[ent] = entityData;
                    entityData.forEach(item => allTimeslots.add(item.TIMESLOT));
                }
                const unifiedData = generateUnifiedData(allData, Array.from(allTimeslots).sort());
                setData(unifiedData);
            } else {
                const response = await axios.get(`https://delhisldc.org/app-api/load-curve?fordate=${formattedDate}&entity=${entity}`);
                let entityData = response.data.map(item => ({
                    TIMESLOT: item.TIMESLOT,
                    [entity]: Number(item.VALUE)
                }));
                entityData.sort((a, b) => parseTime(a.TIMESLOT) - parseTime(b.TIMESLOT));
                setData(entityData);
            }

            const profileResponse = await axios.get(`https://delhisldc.org/app-api/get-data?table=dtl_webprofile`);
            const allProfiles = profileResponse.data.result.rows.map(row => ({
                forDate: row[0],
                entity: row[1],
                type: row[2],
                counter: row[3],
                maxValue: row[4],
                minValue: row[5],
                avgValue: row[6],
                maxValTime: row[7],
                minValTime: row[8]
            }));
            const filteredProfileData = allProfiles.filter(p =>
                p.forDate === formattedDate &&
                (selectedEntity === 'ALL' || p.entity === selectedEntity)
            );
            setProfileData(filteredProfileData);
        } catch (err) {
            setError(`Failed to fetch data for ${entity}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(selectedEntity, selectedDate);
    }, [selectedEntity, selectedDate]);

    const generateUnifiedData = (allData, sortedTimeslots) => {
        return sortedTimeslots.map(TIMESLOT => {
            const row = { TIMESLOT };
            for (const entity of Object.keys(allData)) {
                const match = allData[entity].find(d => d.TIMESLOT === TIMESLOT);
                row[entity] = match ? match.VALUE : null;
            }
            return row;
        });
    };

    function parseTime(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes; // Convert to total minutes
    }

    const cardStyles = {
        peakLoad: { backgroundColor: '#FFEB3B', color: '#333', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
        peakLoadTime: { backgroundColor: '#03A9F4', color: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
        minLoad: { backgroundColor: '#FF5722', color: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
        minLoadTime: { backgroundColor: '#4CAF50', color: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
        avgValue: { backgroundColor: '#9C27B0', color: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }
    };

    const tableHeaderStyle = {
        padding: '12px',
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        border: '1px solid #ddd',
        fontSize: '16px',
        borderRadius: '5px',
    };
    
    const tableCellStyle = {
        padding: '10px',
        border: '1px solid #ddd',
        textAlign: 'center',
        fontSize: '18px',
        borderRadius: '5px',
    };


    const getCurrentTimeLabel = () => {
    const now = new Date();
    const selectedDateString = selectedDate.toDateString();
    const todayString = new Date().toDateString();

    if (selectedDateString === todayString) {
        return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}Hrs`;
    } else {
        return '23:55Hrs';
    }
};
    
    

    return (
        <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{
                textAlign: 'center',
                backgroundImage: 'linear-gradient(45deg, #ff5733, #33c3ff)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontSize: '28px',
                fontWeight: 'bold',
                marginBottom: '20px'
            }}>
                Load Curve Visualization
            </h2>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 15, marginBottom: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <label style={{ marginBottom: 5, color: '#2a9d8f', fontWeight: 'bold' }}>Select Date</label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="dd/MM/yyyy"
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <label style={{ marginBottom: 5, color: '#e63946', fontWeight: 'bold' }}>Select Constituent</label>
                    <select
                        value={selectedEntity}
                        onChange={(e) => setSelectedEntity(e.target.value)}
                        style={{ width: '200px', padding: '5px' }}
                    >
                        {ENTITIES.map(entity => (
                            <option key={entity} value={entity}>{entity}</option>
                        ))}
                    </select>
                </div>
            </div>

            {!loading && !error && data.length > 0 && (
                <ResponsiveContainer width="90%" height={500}>
                      <LineChart data={data} margin={{ top: 10, right: 10, left: 10 , bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                        <XAxis
                            dataKey="TIMESLOT"
                          
                            padding={{ left: 10 }}
                            stroke="#4f46e5"
                            tick={{ fill: '#4f46e5', fontWeight: 'bold' }}
                            tickFormatter={(value, index) => {
                               
                              return index % 8 === 0 ? value  : '';
                          }}
                         
                        
                        />
                        <YAxis
                            label={{
                                value: 'Load (MW)',
                                angle: -90,
                                position: 'insideLeft',
                                dy: 50,
                                style: { textAnchor: 'middle', fill: '#fffff', fontWeight: 'bold' }
                            }}
                            stroke="#10b981"
                            tick={{ fill: '#10b981', fontWeight: 'bold' }}
                        />
                        <Tooltip />
                        <Legend />
                        {selectedEntity === 'ALL' ? (
                            ENTITIES.filter(e => e !== 'ALL').map(entity => (
                                <Line
                                    key={entity}
                                    type="monotone"
                                    dataKey={entity}
                                    stroke={ENTITY_COLORS[entity]}
                                />
                            ))
                        ) : (
                            <Line
                                type="monotone"
                                dataKey={selectedEntity}
                                stroke={ENTITY_COLORS[selectedEntity]}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            )}

{/* Show Data Table Below Graph */}

{!loading && profileData.length > 0 && (
    <div style={{ marginTop: 30 }}>
    <h2 style={{
        textAlign: 'center',
        color: '#ff5733', 
        fontSize: '24px',
        fontWeight: 'bold',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f4f4f4',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
        Data Analysis (upto {getCurrentTimeLabel()})
    </h2>
    
        <div style={{ overflowX: 'auto' }}>
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginTop: 10,
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                }}
            >
                <thead>
                    <tr
                        style={{
                            backgroundColor: '#2C6A70',
                            color: '#fff',
                            textAlign: 'center',
                            borderBottom: '2px solid #ddd',
                        }}
                    >
                        <th style={{ ...tableHeaderStyle }}>Entity</th>
                        <th style={{ ...tableHeaderStyle }}>Peak Load</th>
                        <th style={{ ...tableHeaderStyle }}>Peak Load Time</th>
                        <th style={{ ...tableHeaderStyle }}>Min Load</th>
                        <th style={{ ...tableHeaderStyle }}>Min Load Time</th>
                        <th style={{ ...tableHeaderStyle }}>Avg Load</th>
                    </tr>
                </thead>
                <tbody>
                    {profileData
                        .filter(row => ENTITIES.includes(row.entity))
                        .map((row, index) => (
                            <tr
                                key={index}
                                style={{
                                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
                                    textAlign: 'center',
                                    transition: 'background-color 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f1f1f1';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff';
                                }}
                            >
                                <td style={{ ...tableCellStyle, backgroundColor: '#f4a261', cursor: 'pointer' }}>
                                    <a 
                                        onClick={() => navigate(`/entity-details`)}
                                        style={{ textDecoration: 'none', color: 'blue', fontWeight: 'bold' }}
                                    >
                                        {row.entity}
                                    </a>
                                </td>
                                <td style={{ ...tableCellStyle }}>{Math.round(row.maxValue)}</td>
                                <td style={{ ...tableCellStyle }}>{row.maxValTime}</td>
                                <td style={{ ...tableCellStyle }}>{Math.round(row.minValue)}</td>
                                <td style={{ ...tableCellStyle }}>{row.minValTime}</td>
                                <td style={{ ...tableCellStyle }}>{Math.round(row.avgValue)}</td>
                            </tr>
                        ))}
                </tbody>
            </table>

        </div>
    </div>
)}


        </div>
    );
};

export default LoadCurve;
