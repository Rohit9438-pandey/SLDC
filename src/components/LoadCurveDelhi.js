import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const ENTITY_COLORS = {
    Delhi: '#ff6347'
};

const LoadCurveDelhi = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async (date) => {
        try {
            setLoading(true);
            setError(null);
            const formattedDate = date.toLocaleDateString('en-GB').split('/').join('/');

            const response = await axios.get(`https://delhisldc.org/app-api/load-curve?fordate=${formattedDate}&entity=Delhi`);
            let entityData = response.data.map(item => ({
                TIMESLOT: item.TIMESLOT,
                Delhi: Number(item.VALUE)
            }));

            entityData.sort((a, b) => parseTime(a.TIMESLOT) - parseTime(b.TIMESLOT));
            setData(entityData);
        } catch (err) {
            setError("Failed to fetch data for Delhi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(selectedDate);
    }, [selectedDate]);

    function parseTime(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

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
                Load Curve - Delhi
            </h2>

            <div style={{ 
                padding: '15px', 
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)', 
                backgroundColor: '#ffffff', 
                maxWidth: '95%',
                margin: 'auto'
            }}>
                {!loading && !error && data.length > 0 && (
                    <ResponsiveContainer width="100%" height={500}>
                        <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                            <XAxis
                                dataKey="TIMESLOT"
                                stroke="#4f46e5"
                                tick={{ fill: '#4f46e5', fontWeight: 'bold' }}
                                tickFormatter={(value, index) => index % 8 === 0 ? value : ''}
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
                            
                            <Line
                                type="monotone"
                                dataKey="Delhi"
                                stroke={ENTITY_COLORS['Delhi']}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default LoadCurveDelhi;
