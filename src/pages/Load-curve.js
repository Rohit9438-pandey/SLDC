import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

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

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
};

const LoadCurve = () => {
    const isMobile = useIsMobile();
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
                    try {
                        const response = await fetch(`https://delhisldc.org/app-api/load-curve?fordate=${formattedDate}&entity=${ent}`);
                        const responseData = await response.json();
                        let entityData = responseData.map(item => ({
                            TIMESLOT: item.TIMESLOT,
                            VALUE: Number(item.VALUE)
                        }));
        
                        entityData.sort((a, b) => parseTime(a.TIMESLOT) - parseTime(b.TIMESLOT));
        
                        allData[ent] = entityData;
                        entityData.forEach(item => allTimeslots.add(item.TIMESLOT));
                    } catch (entityError) {
                        console.error(`Error fetching data for ${ent}:`, entityError);
                    }
                }
                const unifiedData = generateUnifiedData(allData, Array.from(allTimeslots).sort());
                setData(unifiedData);
            } else {
                const response = await fetch(`https://delhisldc.org/app-api/load-curve?fordate=${formattedDate}&entity=${entity}`);
                const responseData = await response.json();
                let entityData = responseData.map(item => ({
                    TIMESLOT: item.TIMESLOT,
                    [entity]: Number(item.VALUE)
                }));
                entityData.sort((a, b) => parseTime(a.TIMESLOT) - parseTime(b.TIMESLOT));
                setData(entityData);
            }

            // Fetch profile data
            const profileResponse = await fetch(`https://delhisldc.org/app-api/get-data?table=dtl_webprofile`);
            const profileResponseData = await profileResponse.json();
            const allProfiles = profileResponseData.result.rows.map(row => ({
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
            setError(`Failed to fetch data for ${entity}: ${err.message}`);
            console.error('API Error:', err);
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

    const tableHeaderStyle = {
        padding: isMobile ? '8px 4px' : '12px',
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        border: '1px solid #ddd',
        fontSize: isMobile ? '12px' : '16px',
        borderRadius: '5px',
        minWidth: isMobile ? '60px' : 'auto'
    };
    
    const tableCellStyle = {
        padding: isMobile ? '6px 4px' : '10px',
        border: '1px solid #ddd',
        textAlign: 'center',
        fontSize: isMobile ? '11px' : '18px',
        borderRadius: '5px',
        minWidth: isMobile ? '60px' : 'auto'
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

    const containerStyle = {
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        padding: isMobile ? '10px' : '20px',
        fontFamily: 'Arial, sans-serif'
    };

    const filterControlsStyle = {
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: isMobile ? '12px' : '15px',
        marginBottom: '20px',
        width: '100%'
    };

    const chartContainerStyle = {
        width: '100%',
        overflowX: isMobile ? 'auto' : 'visible',
        overflowY: 'visible',
        marginBottom: '20px'
    };

    const chartMinWidth = isMobile ? '800px' : '100%';

    return (
        <div style={containerStyle}>
            <h2 style={{
                textAlign: 'center',
                backgroundImage: 'linear-gradient(45deg, #ff5733, #33c3ff)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontSize: isMobile ? '20px' : '28px',
                fontWeight: 'bold',
                marginBottom: '20px'
            }}>
                Load Curve Visualization
            </h2>

            <div style={filterControlsStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <label style={{ 
                        marginBottom: 5, 
                        color: '#2a9d8f', 
                        fontWeight: 'bold',
                        fontSize: isMobile ? '14px' : '16px'
                    }}>
                        Select Date
                    </label>
                    <input
                        type="date"
                        value={selectedDate.toISOString().split('T')[0]}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        style={{
                            width: isMobile ? '150px' : '200px',
                            padding: '8px',
                            fontSize: isMobile ? '14px' : '16px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <label style={{ 
                        marginBottom: 5, 
                        color: '#e63946', 
                        fontWeight: 'bold',
                        fontSize: isMobile ? '14px' : '16px'
                    }}>
                        Select Constituent
                    </label>
                    <select
                        value={selectedEntity}
                        onChange={(e) => setSelectedEntity(e.target.value)}
                        style={{ 
                            width: isMobile ? '150px' : '200px', 
                            padding: '8px',
                            fontSize: isMobile ? '14px' : '16px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    >
                        {ENTITIES.map(entity => (
                            <option key={entity} value={entity}>{entity}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '20px',
                    fontSize: isMobile ? '14px' : '16px',
                    color: '#666'
                }}>
                    Loading data...
                </div>
            )}

            {error && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '20px',
                    color: '#e63946',
                    fontSize: isMobile ? '14px' : '16px',
                    backgroundColor: '#fee',
                    borderRadius: '8px',
                    margin: '10px 0'
                }}>
                    {error}
                </div>
            )}

            {!loading && !error && data.length > 0 && (
                <div style={chartContainerStyle}>
                    <div style={{ 
                        minWidth: chartMinWidth,
                        width: '100%',
                        height: isMobile ? '350px' : '500px'
                    }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart 
                                data={data} 
                                margin={{ 
                                    top: 20, 
                                    right: isMobile ? 10 : 30, 
                                    left: isMobile ? 10 : 20, 
                                    bottom: isMobile ? 40 : 20 
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                                <XAxis
                                    dataKey="TIMESLOT"
                                    stroke="#4f46e5"
                                    tick={{ 
                                        fill: '#4f46e5', 
                                        fontWeight: 'bold',
                                        fontSize: isMobile ? 10 : 12
                                    }}
                                    tickFormatter={(value, index) => {
                                        if (isMobile) {
                                            return index % 6 === 0 ? value : '';
                                        }
                                        return index % 3 === 0 ? value : '';
                                    }}
                                    angle={isMobile ? -45 : 0}
                                    textAnchor={isMobile ? 'end' : 'middle'}
                                    height={isMobile ? 60 : 30}
                                />
                                <YAxis
                                    label={{
                                        value: 'Load (MW)',
                                        angle: -90,
                                        position: 'insideLeft',
                                        style: { 
                                            textAnchor: 'middle', 
                                            fill: '#10b981', 
                                            fontWeight: 'bold',
                                            fontSize: isMobile ? 12 : 14
                                        }
                                    }}
                                    stroke="#10b981"
                                    tick={{ 
                                        fill: '#10b981', 
                                        fontWeight: 'bold',
                                        fontSize: isMobile ? 10 : 12
                                    }}
                                    width={isMobile ? 60 : 80}
                                />
                                <Tooltip 
                                    wrapperStyle={{ 
                                        zIndex: 1000,
                                        fontSize: isMobile ? '12px' : '14px'
                                    }} 
                                />
                                {!isMobile && <Legend />}
                                {selectedEntity === 'ALL' ? (
                                    ENTITIES.filter(e => e !== 'ALL').map(entity => (
                                        <Line
                                            key={entity}
                                            type="monotone"
                                            dataKey={entity}
                                            stroke={ENTITY_COLORS[entity]}
                                            strokeWidth={isMobile ? 1.5 : 2}
                                            dot={false}
                                            activeDot={{ r: isMobile ? 3 : 4 }}
                                        />
                                    ))
                                ) : (
                                    <Line
                                        type="monotone"
                                        dataKey={selectedEntity}
                                        stroke={ENTITY_COLORS[selectedEntity]}
                                        strokeWidth={isMobile ? 2 : 3}
                                        dot={false}
                                        activeDot={{ r: isMobile ? 4 : 6 }}
                                    />
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {!loading && !error && profileData.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                    <h2 style={{
                        textAlign: 'center',
                        color: '#ff5733',
                        fontSize: isMobile ? '14px' : '18px',
                        fontWeight: 'bold',
                        fontFamily: 'Arial, sans-serif',
                        backgroundColor: '#f4f4f4',
                        padding: '10px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        Data Analysis (upto {getCurrentTimeLabel()})
                    </h2>

                    <div style={{ 
                        overflowX: 'auto', 
                        width: '100%',
                        WebkitOverflowScrolling: 'touch'
                    }}>
                        <table style={{
                            minWidth: isMobile ? '600px' : '720px',
                            width: '100%',
                            borderCollapse: 'collapse',
                            marginTop: '15px'
                        }}>
                            <thead>
                                <tr style={{
                                    backgroundColor: '#2C6A70',
                                    color: '#fff',
                                    textAlign: 'center',
                                    borderBottom: '2px solid #ddd',
                                }}>
                                    <th style={tableHeaderStyle}>Entity</th>
                                    <th style={tableHeaderStyle}>Peak Load</th>
                                    <th style={tableHeaderStyle}>Peak Time</th>
                                    <th style={tableHeaderStyle}>Min Load</th>
                                    <th style={tableHeaderStyle}>Min Time</th>
                                    <th style={tableHeaderStyle}>Avg Load</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profileData
                                    .filter(row => ENTITIES.includes(row.entity))
                                    .map((row, index) => (
                                        <tr key={index}
                                            style={{
                                                backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
                                                textAlign: 'center',
                                                transition: 'background-color 0.3s ease',
                                            }}
                                        >
                                            <td style={{ 
                                                ...tableCellStyle, 
                                                backgroundColor: '#f4a261', 
                                                fontWeight: 'bold',
                                                color: '#000',
                                                cursor: 'pointer'
                                            }}>
                                                <a
                                                    onClick={() => navigate('/entity-details')}
                                                    style={{ 
                                                        textDecoration: 'none', 
                                                        color: 'blue', 
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {row.entity}
                                                </a>
                                            </td>
                                            <td style={tableCellStyle}>{Math.round(row.maxValue)}</td>
                                            <td style={tableCellStyle}>{row.maxValTime}</td>
                                            <td style={tableCellStyle}>{Math.round(row.minValue)}</td>
                                            <td style={tableCellStyle}>{row.minValTime}</td>
                                            <td style={tableCellStyle}>{Math.round(row.avgValue)}</td>
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