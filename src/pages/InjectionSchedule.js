import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Database, Zap, TrendingUp } from 'lucide-react';

const InjectionSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [revisionOptions, setRevisionOptions] = useState([]);
  const [selectedRevision, setSelectedRevision] = useState('');
  const [tableData, setTableData] = useState({ pivotData: [], gencos: [] });
  const [revisionDate, setRevisionDate] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [loadingRevisions, setLoadingRevisions] = useState(false);
  const [error, setError] = useState('');

  const formatDate = (date) => date.replace(/-/g, '/');

  const formatSlotToTime = (slotNum) => {
    const totalMinutes = (Number(slotNum) - 1) * 15;
    const startHour = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const startMin = String(totalMinutes % 60).padStart(2, '0');
    const endMinutes = totalMinutes + 15;
    const endHour = String(Math.floor(endMinutes / 60)).padStart(2, '0');
    const endMin = String(endMinutes % 60).padStart(2, '0');
    return `${startHour}:${startMin}-${endHour}:${endMin}`;
  };

  const fetchRevisions = async (date) => {
    setLoadingRevisions(true);
    try {
      const res = await fetch(`https://delhisldc.org/app-api/get-data?table=REVISION&filters=${encodeURIComponent(JSON.stringify({ FORDATE: formatDate(date) }))}`);
      const data = await res.json();
      const rows = data?.result?.rows || [];
      const isRevisions = rows.map(r => r[0]).filter(val => val?.includes('IS'));
      const unique = [...new Set(isRevisions)];

      return unique.map(rev => {
        const num = rev.match(/^(\d{1,2})IS/)?.[1] || rev.split('IS')[0];
        return { label: num, value: rev };
      }).sort((a, b) => parseInt(b.label) - parseInt(a.label));
    } catch (e) {
      console.error(e);
      return [];
    } finally {
      setLoadingRevisions(false);
    }
  };

  const fetchInjection = async (rev) => {
    setLoadingData(true);
    try {
      const res = await fetch(`https://delhisldc.org/app-api/get-data?table=DTL_INJECTION_SCHEDULE&filters=${encodeURIComponent(JSON.stringify({ REVISIONNO: rev }))}`);
      const data = await res.json();
      const rows = data?.result?.rows || [];

      if (!rows.length) {
        setTableData({ pivotData: [], gencos: [] });
        setError('No data available for this revision.');
        return;
      }

      const idx = Object.fromEntries(data.result.metaData.map((c, i) => [c.name, i]));
      const tSet = new Set(), gSet = new Set(), grid = {};

      rows.forEach(r => {
        const ts = r[idx.TIMESLOT];
        const g = r[idx.GENCOCODE];
        const q = r[idx.QUANTUM];

        if (ts && g && q !== null) {
          tSet.add(ts);
          gSet.add(g);
          if (!grid[ts]) grid[ts] = {};
          grid[ts][g] = q;
        }
      });

      const gencos = [...gSet].sort();
      const pivotData = [...tSet]
        .sort((a, b) => Number(a) - Number(b))
        .map(ts => ({
          timeslot: ts,
          values: gencos.map(g => grid[ts][g] !== undefined ? parseFloat(grid[ts][g]).toFixed(2) : '-')
        }));

      setTableData({ pivotData, gencos });
      setError('');
    } catch (e) {
      console.error(e);
      setError('Failed to fetch data.');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchRevisionDate = async (rev) => {
    try {
      const res = await fetch(`https://delhisldc.org/app-api/get-data?table=REVISION&filters=${encodeURIComponent(JSON.stringify({ REVISIONNO: rev }))}`);
      const data = await res.json();
      const idx = data.result.metaData.findIndex(c => c.name === 'REVISIONDATE');
      if (idx >= 0 && data.result.rows.length > 0) {
        setRevisionDate(data.result.rows[0][idx]);
      }
    } catch (e) {
      console.error('Failed to fetch revision date');
    }
  };

  useEffect(() => {
    const load = async () => {
      setRevisionOptions([]);
      setTableData({ pivotData: [], gencos: [] });
      const revs = await fetchRevisions(selectedDate);
      setRevisionOptions(revs);
      if (revs.length) {
        setSelectedRevision(revs[0].value);
        await fetchInjection(revs[0].value);
        await fetchRevisionDate(revs[0].value);
      } else {
        setError('No revisions found.');
      }
    };
    load();
  }, [selectedDate]);

  useEffect(() => {
    if (selectedRevision) {
      fetchInjection(selectedRevision);
      fetchRevisionDate(selectedRevision);
    }
  }, [selectedRevision]);

  return (
    <div className="p-6 bg-slate-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-screen-2xl mx-auto space-y-6">

        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Zap className="text-yellow-300" size={24} />
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent text-center">
                Injection Schedule for Various Generating Stations
              </h1>
              <TrendingUp className="text-green-300" size={24} />
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Date Picker */}
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar size={20} className="text-blue-600" />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                <input
                  type="date"
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            {/* Revision Dropdown */}
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Database size={20} className="text-purple-600" />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Revision</label>
                <select
                  value={selectedRevision}
                  onChange={e => setSelectedRevision(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
                  disabled={loadingRevisions}
                >
                  {revisionOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Issued Date */}
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg self-start lg:self-center">
              <Clock size={16} className="text-gray-600" />
              <span className="text-sm text-gray-700">
                <strong>Issued on:</strong> {revisionDate || 'N/A'}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-100 text-red-700 p-3 rounded shadow">
              {error}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-auto border border-gray-300 rounded-xl shadow bg-white max-h-[95vh]">
          <table className="min-w-[800px] w-full text-sm border-separate border-spacing-0">
            <thead className="sticky top-0 bg-blue-700 text-white z-12">
              <tr>
                <th className="sticky left-0 bg-blue p-4 text-left border-r border-blue-600">Time Slot</th>
                {tableData.gencos.map(g => (
                  <th key={g} className="p-2 border-r border-blue-600 text-center">{g}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingData ? (
                <tr>
                  <td colSpan={tableData.gencos.length + 1} className="text-center p-4">Loading...</td>
                </tr>
              ) : (
                tableData.pivotData.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                    <td className="sticky left-0 bg-white p-2 font-medium border-r border-gray-200">
                      {formatSlotToTime(row.timeslot)}
                    </td>
                    {row.values.map((val, j) => (
                      <td key={j} className="p-2 text-center border-r border-gray-200 font-mono">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default InjectionSchedule;
