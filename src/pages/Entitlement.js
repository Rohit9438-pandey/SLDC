import React, { useEffect, useState } from "react";
import { Calendar, RefreshCw, Clock, Download, Zap, RotateCcw, Database , BarChart3 } from "lucide-react";

const DISCOMS = ["BRPL", "BYPL", "NDMC", "NDPL", "MES"];

const Entitlement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedDiscom, setSelectedDiscom] = useState(DISCOMS[0]);
  const [revisionOptions, setRevisionOptions] = useState([]);
  const [selectedRevision, setSelectedRevision] = useState("");
  const [revisionDate, setRevisionDate] = useState("");
  const [tableData, setTableData] = useState({ pivotData: [], gencos: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeslotData, setTimeslotData] = useState({});

  const formatDateForRevision = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${year}/${month}/${day}`;
  };

  const parseTimeslot = (ts) => {
    if (!ts || typeof ts !== "string") return 0;
    const parts = ts.split("-");
    if (!parts.length || !parts[0].includes(":")) return 0;
    const [h, m] = parts[0].split(":").map(Number);
    return h * 60 + m;
  };

  const fetchValidRevisions = async (date, discom) => {
    const formattedDate = formatDateForRevision(date);
    
    try {
      const filters = {
        FORDATE: formattedDate
      };
      
      const url = `https://delhisldc.org/app-api/get-data?table=REVISION&filters=${encodeURIComponent(JSON.stringify(filters))}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data?.result?.rows || data.result.rows.length === 0) {
        return [];
      }
      
      const rows = data.result.rows;
      const metaData = data.result.metaData || [];
      
      const revisionNoIndex = metaData.findIndex(col => col.name === "REVISIONNO");
      const revisionDateIndex = metaData.findIndex(col => col.name === "REVISIONDATE");
      const forDateIndex = metaData.findIndex(col => col.name === "FORDATE");
      
      if (revisionNoIndex === -1) {
        return [];
      }
      
      const pattern = `En${discom}${formattedDate}`;
      const validRevisions = [];
      
      for (const row of rows) {
        const revisionNo = row[revisionNoIndex];
        const forDate = row[forDateIndex];
        
        if (revisionNo && revisionNo.includes(pattern) && forDate === formattedDate) {
          const revisionMatch = revisionNo.match(/^(\d{2})En/);
          if (revisionMatch) {
            const revisionNumber = parseInt(revisionMatch[1], 10);
            validRevisions.push({
              label: `${revisionNumber}`,
              value: revisionNo,
              number: revisionNumber,
              revisionNo: revisionNo,
              revisionDate: revisionDateIndex !== -1 ? row[revisionDateIndex] : null
            });
          }
        }
      }
      
      return validRevisions.sort((a, b) => b.number - a.number);
      
    } catch (error) {
      console.error("Error fetching revisions:", error);
      return await fetchValidRevisionsWithoutFilter(date, discom);
    }
  };

  const fetchValidRevisionsWithoutFilter = async (date, discom) => {
    const formattedDate = formatDateForRevision(date);
    
    try {
      const validRevisions = [];
      const concurrentRequests = [];
      
      for (let i = 99; i >= 1; i--) {
        const revisionNum = String(i).padStart(2, "0");
        const revisionNo = `${revisionNum}En${discom}${formattedDate}`;
        
        const promise = fetch(`https://delhisldc.org/app-api/get-data?table=REVISION&filters=${encodeURIComponent(JSON.stringify({ REVISIONNO: revisionNo }))}`)
          .then(async (response) => {
            const data = await response.json();
            if (data?.result?.rows && data.result.rows.length > 0) {
              const row = data.result.rows[0];
              const metaData = data.result.metaData || [];
              const revisionDateIndex = metaData.findIndex(col => col.name === "REVISIONDATE");
              
              return {
                label: `${i}`,
                value: revisionNo,
                number: i,
                revisionNo: revisionNo,
                revisionDate: revisionDateIndex !== -1 ? row[revisionDateIndex] : null
              };
            }
            return null;
          })
          .catch(() => null);
        
        concurrentRequests.push(promise);
        
        if (concurrentRequests.length >= 10) {
          const results = await Promise.all(concurrentRequests);
          validRevisions.push(...results.filter(Boolean));
          concurrentRequests.length = 0;
          
          if (validRevisions.length > 0) {
            break;
          }
        }
      }
      
      if (concurrentRequests.length > 0) {
        const results = await Promise.all(concurrentRequests);
        validRevisions.push(...results.filter(Boolean));
      }
      
      return validRevisions.sort((a, b) => b.number - a.number);
      
    } catch (error) {
      console.error("Error in fallback revision fetch:", error);
      return [];
    }
  };

  const fetchData = async (revision) => {
    if (!revision) return;

    setLoading(true);
    setError(null);

    try {
      const url = `https://delhisldc.org/app-api/get-data?table=DTL_ENTITLEMENT&filters=${encodeURIComponent(
        JSON.stringify({ REVISIONNO: revision })
      )}`;

      const res = await fetch(url);
      const json = await res.json();

      const rows = json?.result?.rows || [];
      const metaData = json?.result?.metaData || [];

      if (rows.length === 0) {
        setTableData({ pivotData: [], gencos: [] });
        setError("No data found for this revision");
        return;
      }

      const columnMap = {};
      metaData.forEach((col, index) => {
        columnMap[col.name] = index;
      });

      const tsIndex = columnMap["TIMESLOT"];
      const genIndex = columnMap["GENCOCODE"];
      const qtyIndex = columnMap["QUANTUM"];

      const tsSet = new Set(),
        gSet = new Set(),
        map = {};

      for (const row of rows) {
        const ts = row[tsIndex];
        const g = row[genIndex];
        const q = row[qtyIndex];

        tsSet.add(ts);
        gSet.add(g);
        map[ts] = map[ts] || {};
        map[ts][g] = q;
      }

      const gencosSorted = Array.from(gSet).sort();
      const pivotData = Array.from(tsSet)
        .sort((a, b) => parseTimeslot(a) - parseTimeslot(b))
        .map((ts) => ({
          timeslot: ts,
          values: gencosSorted.map((g) => map[ts][g] ?? "-"),
        }));

      setTableData({ pivotData, gencos: gencosSorted });
    } catch (err) {
      setError(`Failed to fetch data: ${err.message}`);
      setTableData({ pivotData: [], gencos: [] });
    } finally {
      setLoading(false);
    }
  };

  const fetchRevisionDate = async (revisionNo) => {
    try {
      const url = `https://delhisldc.org/app-api/get-data?table=REVISION&filters=${encodeURIComponent(
        JSON.stringify({ REVISIONNO: revisionNo })
      )}`;
      const res = await fetch(url);
      const data = await res.json();

      const rows = data?.result?.rows || [];
      const meta = data?.result?.metaData || [];

      if (rows.length === 0) return;

      const revDateIndex = meta.findIndex((col) => col.name === "REVISIONDATE");
      if (revDateIndex === -1) return;

      const revisionDateValue = rows[0][revDateIndex];
      setRevisionDate(revisionDateValue);
    } catch (error) {
      console.error("Failed to fetch revision date", error);
      setRevisionDate("");
    }
  };

  const handleDownload = () => {
    let content = "Timeslot\t" + tableData.gencos.join("\t") + "\n";
    tableData.pivotData.forEach((row) => {
      content += (timeslotData[row.timeslot] || row.timeslot) + "\t" + row.values.join("\t") + "\n";
    });

    const blob = new Blob([content], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Entitlement_${selectedDate}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fetchTimeslotData = async () => {
    try {
      const response = await fetch('https://delhisldc.org/app-api/get-data?table=TIMESLOT');
      const result = await response.json();

      if (result?.result?.rows) {
        const map = {};
        for (const row of result.result.rows) {
          const [id, label] = row;
          map[id] = label;
        }
        setTimeslotData(map);
      } else {
        setError("No timeslot data found.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchTimeslotData();
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setError(null);
      setRevisionOptions([]);
      setSelectedRevision("");
      setTableData({ pivotData: [], gencos: [] });
      setRevisionDate("");

      try {
        const revisions = await fetchValidRevisions(selectedDate, selectedDiscom);
        setRevisionOptions(revisions);

        if (revisions.length > 0) {
          const latest = revisions[0];
          setSelectedRevision(latest.value);
          
          if (latest.revisionDate) {
            setRevisionDate(latest.revisionDate);
          } else {
            await fetchRevisionDate(latest.value);
          }
          
          await fetchData(latest.value);
        } else {
          setError("No revisions found for the selected date and DISCOM");
        }
      } catch (err) {
        setError("Failed to load revisions");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [selectedDate, selectedDiscom]);

  const handleRevisionChange = async (e) => {
    const newRevision = e.target.value;
    setSelectedRevision(newRevision);
    
    if (newRevision) {
      const selectedRevisionData = revisionOptions.find(opt => opt.value === newRevision);
      if (selectedRevisionData && selectedRevisionData.revisionDate) {
        setRevisionDate(selectedRevisionData.revisionDate);
      } else {
        await fetchRevisionDate(newRevision);
      }
      
      await fetchData(newRevision);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-full mx-auto px-3 sm:px-6 lg:px-4 py-3 sm:py-4 lg:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full backdrop-blur-sm">
                <Database className="text-white" size={28} />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-yellow-100 bg-clip-text text-transparent text-center">
                Entitlement of Discoms in Generating Stations
              </h3>
              <div className="p-2 bg-green-400/20 rounded-full backdrop-blur-sm">
                <BarChart3 className="text-green-300" size={28} />
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
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            {/* DISCOM Selector */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
                <Zap size={16} className="text-purple-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">DISCOM</label>
                <select
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:border-purple-500 focus:ring-2 focus:ring-purple-200/50 transition-all duration-200"
                  value={selectedDiscom}
                  onChange={(e) => setSelectedDiscom(e.target.value)}
                >
                  {DISCOMS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Revision Selector */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg">
                <RotateCcw size={16} className="text-indigo-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Revision</label>
                <select
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all duration-200 disabled:opacity-50"
                  value={selectedRevision}
                  onChange={handleRevisionChange}
                  disabled={loading}
                >
                  {revisionOptions.length > 0 ? (
                    revisionOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))
                  ) : (
                    <option value="">No revisions</option>
                  )}
                </select>
              </div>
            </div>

            {/* Revision Date */}
            {!loading && revisionDate && (
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

          {/* Loading Indicator in Control Card */}
          {loading && (
            <div className="mt-3 flex items-center justify-center space-x-3 text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 py-2 px-3 rounded-lg border border-blue-200/50">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span className="font-medium text-xs">Loading data...</span>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-400 p-4 rounded-r-xl shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-red-200 rounded-lg mr-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-red-800 font-medium text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

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
                      className="sticky top-0 z-20  bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white font-bold text-center border-l border-indigo-500"
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
                {loading ? (
                  <tr>
                    <td colSpan={(tableData.gencos.length || 1) + 1} className="p-8 text-center">
                      <div className="flex items-center justify-center gap-3 py-8">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-blue-600 font-medium">Loading data...</span>
                      </div>
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
                            {timeslotData[row.timeslot] || row.timeslot}
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
                            {value === '-' ? value : parseFloat(value).toFixed(2)}
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

export default Entitlement;