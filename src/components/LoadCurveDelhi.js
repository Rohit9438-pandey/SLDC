import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Card, CardContent, Typography, Grid } from '@mui/material';

const LoadCurveDelhi = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [data, setData] = useState([]);
    const [profileData, setProfileData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async (date) => {
        try {
            setLoading(true);
            setError(null);
            const formattedDate = date.toLocaleDateString('en-GB').split('/').join('/');

            // Fetch data for Delhi entity only
            const response = await axios.get(`https://delhisldc.org/app-api/load-curve?fordate=${formattedDate}&entity=Delhi`);
            const entityData = response.data.map(item => ({
                TIMESLOT: item.TIMESLOT,
                Delhi: Number(item.VALUE)
            }));
            setData(entityData);

            // Fetch profile data
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
                p.entity === 'Delhi'
            );
            setProfileData(filteredProfileData);
        } catch (err) {
            setError('Failed to fetch data for Delhi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(selectedDate);
    }, [selectedDate]);

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
                Load Curve Visualization - Delhi
            </h2>

            {/* Graph Container with Border */}
            <div
                style={{
                    border: '2px solid #4f46e5', // Border color
                    borderRadius: '8px', // Rounded corners
                    padding: '20px', // Padding inside the border
                    marginBottom: '30px', // Space below the graph
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', // Shadow for a 3D effect
                }}
            >
                {!loading && !error && data.length > 0 && (
                    <ResponsiveContainer width="90%" height={500}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                            <XAxis
                                dataKey="TIMESLOT"
                                stroke="#4f46e5"
                                tick={{ fill: '#4f46e5', fontWeight: 'bold' }}
                                tickFormatter={(value, index) => {
                                  // Only show label for every 8th timeslot (adjust as needed)
                                  return index % 8 === 0 ? value : '';
                              }}
                            />
                            <YAxis
                                label={{
                                    value: 'Load (MW)',
                                    angle: -90,
                                    position: 'insideLeft',
                                    dy: 50,
                                    style: { textAnchor: 'middle', fill: '#10b981', fontWeight: 'bold' }
                                }}
                                stroke="#10b981"
                                tick={{ fill: '#10b981', fontWeight: 'bold' }}
                            />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="Delhi"
                                stroke="#ff6347" // Color for Delhi
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default LoadCurveDelhi;
