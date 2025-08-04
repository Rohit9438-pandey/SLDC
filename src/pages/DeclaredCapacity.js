import React, { useEffect, useState } from 'react';
import { Calendar, Download, Clock, Database, Zap, TrendingUp, Activity, BarChart3 } from 'lucide-react';

const DeclaredCapacity = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [revisionOptions, setRevisionOptions] = useState([]);
  const [selectedRevision, setSelectedRevision] = useState('');
  const [tableData, setTableData] = useState({ pivotData: [], gencos: [] });
  const [loadingData, setLoadingData] = useState(false);
  const [loadingRevisions, setLoadingRevisions] = useState(false);
  const [error, setError] = useState(null);
  const [revisionDate, setRevisionDate] = useState('');
  const [manualRevisionChange, setManualRevisionChange] = useState(false);

  const formatDate = (d) => d.replace(/-/g, '/');
  const parseTimeslot = (ts) => {
    const [h, m] = ts.split('-')[0].split(':').map(Number);
    return h * 60 + m;
  };

  const fetchRevisions = async (date) => {
    setLoadingRevisions(true);
    try {
      const res = await fetch(
        `https://delhisldc.org/app-api/get-data?table=REVISION&filters=${encodeURIComponent(
          JSON.stringify({ FORDATE: formatDate(date) })
        )}`
      );
      const data = await res.json();
      const rows = data?.result?.rows || [];
      
      const dcRevisions = rows
        .map(r => r[0])
        .filter(Boolean)
        .filter(val => val.includes('DC')); 
      
      const uniqueRevisions = [...new Set(dcRevisions)];
      
      const opts = uniqueRevisions
        .map(val => {
          const match = val.match(/^(\d{1,2})DC/);
          const firstTwoDigits = match ? match[1] : val.split('DC')[0];
          
          return {
            label: firstTwoDigits, 
            value: val, 
            fullValue: val
          };
        })
        .sort((a, b) => {
          const aNum = parseInt(a.label);
          const bNum = parseInt(b.label);
          return bNum - aNum;
        });
      
      return opts;
    } catch (error) {
      console.error('Error fetching revisions:', error);
      return [];
    } finally {
      setLoadingRevisions(false);
    }
  };

  const fetchCapacity = async (rev) => {
    if (!rev) return;
    
    setLoadingData(true);
    setError(null);
    try {
      const res = await fetch(
        `https://delhisldc.org/app-api/get-data?table=DTL_DECLAREDCAPACITY&filters=${encodeURIComponent(
          JSON.stringify({ REVISIONNO: rev })
        )}`
      );
      const result = await res.json();
      
      if (!result?.result?.rows?.length) {
        setTableData({ pivotData: [], gencos: [] });
        setError('No capacity data available for this revision.');
        return;
      }

      const idx = Object.fromEntries(result.result.metaData.map((c, i) => [c.name, i]));
      const { TIMESLOT: ti, GENCOCODE: gi, QUANTUM: qi } = idx;
      const tSet = new Set(), gSet = new Set(), grid = {};

      result.result.rows.forEach(r => {
        const ts = r[ti], g = r[gi], q = r[qi];
        if (ts && g && q !== null && q !== undefined) {
          tSet.add(ts);
          gSet.add(g);
          grid[ts] = grid[ts] || {};
          grid[ts][g] = q;
        }
      });

      const gencos = [...gSet].sort();
      const pivot = [...tSet]
        .sort((a, b) => parseTimeslot(a) - parseTimeslot(b))
        .map(ts => ({
          timeslot: ts,
          values: gencos.map(g => (grid[ts][g] !== undefined ? parseFloat(grid[ts][g]).toFixed(2) : '-')),
        }));

      setTableData({ pivotData: pivot, gencos });
    } catch (error) {
      console.error('Error fetching capacity data:', error);
      setError('Error loading capacity data. Please try again.');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchRevDate = async (rev) => {
    if (!rev) return;
    
    try {
      const res = await fetch(
        `https://delhisldc.org/app-api/get-data?table=REVISION&filters=${encodeURIComponent(
          JSON.stringify({ REVISIONNO: rev })
        )}`
      );
      const result = await res.json();
      const idx = result?.result?.metaData?.findIndex(c => c.name === 'REVISIONDATE');
      if (idx >= 0 && result.result.rows.length > 0) {
        setRevisionDate(result.result.rows[0][idx]);
      } else {
        setRevisionDate('');
      }
    } catch (error) {
      console.error('Error fetching revision date:', error);
      setRevisionDate('');
    }
  };

  useEffect(() => {
    const loadRevisionsAndData = async () => {
      setRevisionOptions([]);
      setSelectedRevision('');
      setTableData({ pivotData: [], gencos: [] });
      setRevisionDate('');
      setError(null);

      try {
        const revisions = await fetchRevisions(selectedDate);
        setRevisionOptions(revisions);

        if (revisions.length > 0) {
          const latest = revisions[0];
          setSelectedRevision(latest.value);
          await fetchCapacity(latest.value);
          await fetchRevDate(latest.value);
        } else {
          setError("No revisions found for this date");
        }
      } catch (err) {
        console.error("Error loading data", err);
        setError("Failed to load data");
      }
    };

    loadRevisionsAndData();
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedRevision || !manualRevisionChange) return;
    fetchCapacity(selectedRevision);
    fetchRevDate(selectedRevision);
    setManualRevisionChange(false);
  }, [selectedRevision]);

  const handleDownload = () => {
    const content = [
      ['Timeslot', ...tableData.gencos].join('\t'),
      ...tableData.pivotData.map((r) => [r.timeslot, ...r.values].join('\t')),
    ].join('\n');
    const blob = new Blob([content], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Declared_Capacity_${selectedDate}_Rev${selectedRevision.match(/^(\d{1,2})DC/)?.[1] || selectedRevision.split('DC')[0]}.xls`;
    link.click();
  };

  const LoadingPulse = () => (
    <div className="flex items-center justify-center gap-3 py-8">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="text-blue-600 font-medium">Loading data...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-full mx-auto px-3 sm:px-6 lg:px-4 py-3 sm:py-4 lg:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-yellow-400/20 rounded-full backdrop-blur-sm">
                <Zap className="text-yellow-300" size={28} />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-yellow-100 bg-clip-text text-transparent text-center">
              Declared Capacity of Various Generating Stations
              </h3>
              <div className="p-2 bg-green-400/20 rounded-full backdrop-blur-sm">
                <TrendingUp className="text-green-300" size={28} />
              </div>
            </div>
          </div>
         
        </div>
      </header>

      <main className="max-w-full mx-auto p-2 space-y-3">
        {/* Compact Control Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200/50 p-3 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Date Picker */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                <Calendar size={16} className="text-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 transition-all duration-200"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            {/* Revision Selector */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
                <Database size={16} className="text-purple-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Revision</label>
                <select
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 transition-all duration-200"
                  value={selectedRevision}
                  onChange={(e) => {
                    setManualRevisionChange(true);
                    setSelectedRevision(e.target.value);
                  }}
                  disabled={loadingRevisions}
                >
                  {loadingRevisions ? (
                    <option>Loading...</option>
                  ) : (
                    revisionOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                      {opt.label}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Revision Date */}
            {!loadingData && revisionDate && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-emerald-100 px-2 py-1.5 rounded-lg border border-emerald-200">
                <Clock size={14} className="text-emerald-600" />
                <div className="text-xs text-emerald-800">
                  <span className="font-medium">Issued:</span>
                  <span className="font-semibold ml-1">{revisionDate}</span>
                </div>
              </div>
            )}

            {/* Download Button */}
            {tableData.pivotData.length > 0 && (
              <button
                onClick={handleDownload}
                className="group bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium px-3 py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 text-xs"
              >
                <Download size={14} className="group-hover:animate-bounce" />
                <span>Download</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-400 p-4 rounded-r-xl shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-red-200 rounded-lg mr-3">
                <Activity size={16} className="text-red-600" />
              </div>
              <div>
                <p className="text-red-800 font-medium text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Full Width Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-200/60 overflow-hidden">
          <div className="overflow-auto max-h-[calc(100vh-150px)]" style={{ fontSize: '12px' }}>
            <table className="w-full border-collapse" style={{ minWidth: 'max-content' }}>
              <thead>
                <tr className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <th className="sticky top-0 left-0 z-30 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white font-bold shadow-lg text-left border-r border-indigo-500" 
                      style={{ height: '60px', padding: '8px 16px', minWidth: '140px', width: '140px' }}>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Clock size={14} />
                      <span className="text-sm font-semibold">Time Slot</span>
                    </div>
                  </th>
                  {tableData.gencos.map((genco, index) => (
                    <th
                      key={genco}
                      className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white font-bold text-center border-l border-indigo-500"
                      style={{ 
                        height: '60px', 
                        padding: '8px 4px',
                        minWidth: '100px',
                        width: '100px'
                      }}
                    >
                      <div className="flex items-center justify-center h-full">
                        <div 
                          className="text-xs font-medium text-center whitespace-nowrap overflow-hidden text-ellipsis" 
                          title={genco}
                          style={{ 
                            maxWidth: '90px',
                            lineHeight: '1.2',
                            fontSize: '10px'
                          }}
                        >
                          {genco}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingData ? (
                  <tr>
                    <td colSpan={(tableData.gencos.length || 1) + 1} className="p-8 text-center">
                      <LoadingPulse />
                    </td>
                  </tr>
                ) : tableData.pivotData.length ? (
                  tableData.pivotData.map((row, i) => (
                    <tr
                      key={i}
                      className={`${
                        i % 2 ? 'bg-slate-50/80' : 'bg-white/80'
                      } hover:bg-blue-50/80 transition-all duration-200 group`}
                      style={{ height: '45px' }}
                    >
                      <td className="sticky left-0 z-10 bg-white/95 backdrop-blur-sm font-bold border-r border-gray-200 shadow-sm group-hover:bg-blue-50/95" 
                          style={{ 
                            padding: '8px 16px',
                            minWidth: '140px',
                            width: '140px'
                          }}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <span className="text-slate-700 text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                            {row.timeslot}
                          </span>
                        </div>
                      </td>
                      {row.values.map((value, j) => (
                        <td
                          key={j}
                          className="text-center border-b border-gray-100"
                          style={{ 
                            padding: '8px 4px',
                            minWidth: '100px',
                            width: '100px'
                          }}
                        >
                          <span className={`text-sm font-semibold whitespace-nowrap ${
                            value !== '-' 
                              ? 'text-blue-700 bg-blue-50 px-2 py-1 rounded-md' 
                              : 'text-gray-400 bg-gray-50 px-2 py-1 rounded-md'
                          }`}>
                            {value}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={(tableData.gencos.length || 1) + 1} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Database size={32} className="text-gray-400" />
                        </div>
                        <div className="text-gray-500 font-medium">
                          No data available for the selected date and revision
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeclaredCapacity;