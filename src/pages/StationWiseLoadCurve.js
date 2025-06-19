import React, { useState, useEffect } from 'react';
import { ResponsiveLine } from '@nivo/line';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const StationWiseLoadCurve = () => {
  const [date, setDate] = useState(new Date());
  const [entities, setEntities] = useState([]);
  const [entity, setEntity] = useState('');
  const [chartData, setChartData] = useState([]);
  const [tableData, setTableData] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const tickInterval = windowWidth < 640 ? 24 : 12;



  const formatDate = (date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const getApiDate = (selectedDate) => {
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const yyyy = selectedDate.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };



useEffect(() => {
  const handleResize = () => setWindowWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

  


  const fetchEntities = async () => {
    const formattedDate = getApiDate(date);
    const apiUrl = `https://delhisldc.org/app-api/get-data?table=dtl_webprofile`;

    try {
      const res = await axios.get(apiUrl);
      const rows = res.data.result?.rows || [];

      const uniqueEntities = [...new Set(
        rows
          .filter(
            (row) =>
              row[0]?.trim() === formattedDate &&
              row[2]?.trim() === 'MW' &&
              row[1]?.trim()
          )
          .map((row) => row[1].trim())
      )];

      setEntities(uniqueEntities.sort());

      if (!entity && uniqueEntities.length > 0) {
        setEntity(uniqueEntities[0]);
      }
    } catch (err) {
      console.error('Error fetching entities:', err);
      setEntities([]);
    }
  };

  const fetchGraphData = async () => {
    const formattedDate = getApiDate(date);
    const apiUrl = `https://delhisldc.org/app-api/get-data?table=dtl_completep&filters=${JSON.stringify({
      TYPE: 'MW',
      FORDATE: formattedDate,
    })}`;

    try {
      const res = await axios.get(apiUrl);
      const rows = res.data.result?.rows || [];

      const filtered = rows.filter((row) => row[2]?.trim().toUpperCase() === entity.toUpperCase());

      const seen = new Set();
      const formatted = [];

      for (let row of filtered) {
        const time = row[1]?.trim();
        const load = parseFloat(row[4]);

        if (time && !isNaN(load) && !seen.has(time)) {
          seen.add(time);
          formatted.push({ x: time, y: load });
        }
      }

      formatted.sort((a, b) => {
        const timeToMinutes = (t) => {
          const [hh, mm] = t.split(':').map(Number);
          return hh * 60 + mm;
        };
        return timeToMinutes(a.x) - timeToMinutes(b.x);
      });

      setChartData(
        formatted.length > 0
          ? [{ id: entity, data: formatted }]
          : []
      );
    } catch (err) {
      console.error('Failed to fetch chart data:', err);
      setChartData([]);
    }
  };

  const fetchTableData = async () => {
    const formattedDate = getApiDate(date);
    const apiUrl = `https://delhisldc.org/app-api/get-data?table=dtl_webprofile`;

    try {
      const res = await axios.get(apiUrl);
      const rows = res.data.result?.rows || [];

      const match = rows.find((row) => {
        return (
          row[0]?.trim() === formattedDate &&
          row[1]?.trim().toUpperCase() === entity.toUpperCase() &&
          row[2]?.trim() === 'MW'
        );
      });

      if (match) {
        setTableData({
          peakLoad: match[4],
          peakTime: match[7],
          minLoad: match[5],
          minTime: match[8],
          avgLoad: match[6],
        });
      } else {
        setTableData(null);
      }
    } catch (err) {
      console.error('Failed to fetch table data:', err);
      setTableData(null);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, [date]);

  useEffect(() => {
    if (entity) {
      fetchGraphData();
      fetchTableData();
    }
  }, [date, entity]);

  return (
  <div className="p-4 sm:p-6 md:p-8 max-w-screen-xl mx-auto">
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-4">
      <select
        value={entity}
        onChange={(e) => setEntity(e.target.value)}
        className="border border-blue-400 px-4 py-2 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
      >
        {entities.length === 0 ? (
          <option disabled>Loading entities...</option>
        ) : (
          entities.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))
        )}
      </select>

      <DatePicker
        selected={date}
        onChange={(date) => setDate(date)}
        dateFormat="dd/MM/yyyy"
        maxDate={new Date()}
        className="border border-blue-400 px-4 py-2 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
      />
    </div>

    <h2 className="text-center text-base sm:text-lg md:text-xl font-semibold text-blue-700 mb-4">
      Station wise Load Curve For <span className="text-black">{entity}</span> on {formatDate(date)}
    </h2>

    {chartData.length > 0 ? (
      <div className="border-2 border-blue-300 rounded-lg shadow-lg p-4 bg-white overflow-x-auto">
        <div className="min-w-[350px] w-full h-[300px] sm:h-[450px] md:h-[550px]">
          <ResponsiveLine
            theme={{
              axis: {
                legend: {
                  text: {
                    fontSize: 14,
                    fontWeight: 700,
                  },
                },
                ticks: {
                  text: {
                    fontSize: 12,
                    fontWeight: 600,
                  },
                },
              },
            }}
            data={chartData}
            margin={{ top: 50, right: 120, bottom: 80, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{
              type: 'linear',
              min: 'auto',
              max: 'auto',
              stacked: false,
              reverse: false,
            }}
            curve="monotoneX"
            axisTop={null}
            axisRight={null}
           axisBottom={{
 tickValues: chartData[0]?.data
  .filter((_, i) => i % tickInterval === 0)
  .map((point) => point.x),
  orient: 'bottom',
  tickSize: 5,
  tickPadding: 5,
  tickRotation: windowWidth < 640 ? -45 : 0,
  legend: 'Time Slot',
  legendOffset: 40,
  legendPosition: 'middle',
}}

            axisLeft={{
              orient: 'left',
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'MW',
              legendOffset: -50,
              legendPosition: 'middle',
            }}
            colors={['#0077b6']}
            pointSize={4}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            enableGridX={false}
            enableGridY={true}
            useMesh={true}
            enableArea={true}
            areaOpacity={0.1}
            legends={[
              {
                anchor: 'top-left',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: -30,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 100,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
              },
            ]}
            tooltip={({ point }) => (
              <div className="bg-white text-gray-800 border border-gray-300 p-2 rounded shadow text-sm">
                <strong>{point.data.xFormatted}</strong>: {point.data.yFormatted} MW
              </div>
            )}
          />
        </div>

        {tableData && (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-[600px] w-full text-sm text-left border border-gray-300 rounded-md overflow-hidden">
              <thead className="bg-[#006699] text-white">
                <tr>
                  <th className="px-4 py-2 border">Peak Load (MW)</th>
                  <th className="px-4 py-2 border">Peak Load Time</th>
                  <th className="px-4 py-2 border">Min. Load (MW)</th>
                  <th className="px-4 py-2 border">Min. Load Time</th>
                  <th className="px-4 py-2 border">Avg. Load (MW)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-center text-[#000066] bg-gray-50">
                  <td className="px-4 py-2 border">{Math.round(tableData.peakLoad)}</td>
                  <td className="px-4 py-2 border">{tableData.peakTime}</td>
                  <td className="px-4 py-2 border">{Math.round(tableData.minLoad)}</td>
                  <td className="px-4 py-2 border">{tableData.minTime}</td>
                  <td className="px-4 py-2 border">{Math.round(tableData.avgLoad)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    ) : (
      <p className="text-center text-red-500 mt-4">
        No data available for the selected date and entity.
      </p>
    )}
  </div>
);

};

export default StationWiseLoadCurve;
