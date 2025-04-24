import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import axios from 'axios';

const DISCOM_OPTIONS = ['BRPL', 'BYPL', 'NDMC', 'NDPL', 'Delhi'];

const ODUDCurve = () => {
  const [selectedDiscom, setSelectedDiscom] = useState('NDPL');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [chartData, setChartData] = useState({ series: [], categories: [] });

  useEffect(() => {
    fetchChartData();
  }, [selectedDiscom, selectedDate]);

  const fetchChartData = async () => {
    const revisionString = `${dayjs(selectedDate).format('DD')}DS${selectedDiscom}${dayjs(selectedDate).format('YYYY/MM/DD')}`;
    const loadDate = dayjs(selectedDate).format('DD/MM/YYYY');

    try {
      const scheduleRes = await axios.get(
        `https://delhisldc.org/app-api/get-data?table=DTL_DRAWL_TOTAL&filters=${encodeURIComponent(JSON.stringify({ REVISIONNO: revisionString }))}`
      );

      const loadRes = await axios.get(
        `https://delhisldc.org/app-api/get-data?table=dtl_completep&filters=${encodeURIComponent(JSON.stringify({ TYPE: "MW", FORDATE: loadDate }))}`
      );

      const scheduleData = scheduleRes.data.filter(item => item.DISCOM === selectedDiscom);
      const loadData = loadRes.data.filter(item => item.DISCOM === selectedDiscom);

      if (!scheduleData.length || !loadData.length) {
        setChartData({ series: [], categories: [] });
        return;
      }

      const scheduleMap = scheduleData.reduce((acc, cur) => {
        acc[cur.TIME] = parseFloat(cur.SCHEDULE);
        return acc;
      }, {});

      const loadMap = loadData.reduce((acc, cur) => {
        acc[cur.TIME] = parseFloat(cur.VALUE);
        return acc;
      }, {});

      const timePoints = Object.keys(scheduleMap).filter(time => loadMap[time] !== undefined);

      const diffData = timePoints.map(time => {
        const schedule = scheduleMap[time];
        const load = loadMap[time];
        return parseFloat((load - schedule).toFixed(2));
      });

      setChartData({
        categories: timePoints,
        series: [
          {
            name: 'Load - Schedule (MW)',
            data: diffData
          }
        ]
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setChartData({ series: [], categories: [] });
    }
  };

  const chartOptions = {
    chart: {
      type: 'line',
      height: 400,
      zoom: { enabled: false }
    },
    xaxis: {
      categories: chartData.categories,
      title: { text: 'Time (15-min intervals)' },
      labels: { rotate: -45 }
    },
    yaxis: {
      title: { text: 'MW (Load - Schedule)' }
    },
    title: {
      text: `OD/UD Curve for ${selectedDiscom} (${dayjs(selectedDate).format('DD MMM YYYY')})`,
      align: 'center'
    },
    stroke: {
      curve: 'smooth',
      width: 2
    }
  };

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4 items-center">
        <select
          className="border rounded p-2"
          value={selectedDiscom}
          onChange={(e) => setSelectedDiscom(e.target.value)}
        >
          {DISCOM_OPTIONS.map(discom => (
            <option key={discom} value={discom}>{discom}</option>
          ))}
        </select>

        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          className="border rounded p-2"
          dateFormat="yyyy-MM-dd"
        />
      </div>

      {chartData.series.length > 0 ? (
        <ReactApexChart
          options={chartOptions}
          series={chartData.series}
          type="line"
          height={400}
        />
      ) : (
        <p className="text-center text-gray-500">No data available for selected DISCOM and date</p>
      )}
    </div>
  );
};

export default ODUDCurve;
