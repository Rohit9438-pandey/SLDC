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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-300"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
      </div>

      {/* Enhanced Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-xl">
        <div className="max-w-5xl mx-auto px-3 py-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Database className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent mb-2">
              Entitlement of Discoms in Generating Stations
            </h2>
            
            <div className="mt-4 h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto"></div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5 pt-7">
        {/* Enhanced Control Card */}
        <div className="relative group mb-10">
          {/* Animated Border */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 animate-pulse"></div>
          
          <div className="relative bg-white/95 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/20">
            {/* Card Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                </div>
              </div>
              
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Enhanced Date Picker */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Select Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white/90 text-slate-800 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400 hover:shadow-md group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Enhanced DISCOM Selector */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                  <Zap className="w-4 h-4 text-purple-600" />
                  DISCOM
                </label>
                <div className="relative">
                  <select
                    value={selectedDiscom}
                    onChange={(e) => setSelectedDiscom(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white/90 text-slate-800 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-purple-400 hover:shadow-md cursor-pointer group-hover:scale-[1.02]"
                  >
                    {DISCOMS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Enhanced Revision Selector */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                  <RotateCcw className="w-4 h-4 text-indigo-600" />
                  Revision
                </label>
                <div className="relative">
                  <select
                    value={selectedRevision}
                    onChange={handleRevisionChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white/90 text-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 hover:border-indigo-400 hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-[1.02]"
                    disabled={loading}
                  >
                    {revisionOptions.length > 0 ? (
                      revisionOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          Revision {opt.label}
                        </option>
                      ))
                    ) : (
                      <option value="">No revisions available</option>
                    )}
                  </select>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Enhanced Issued On */}
              <div className="flex flex-col justify-center">
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl border-2 border-emerald-200/50 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium">Issued On</span>
                  </div>
                  <div className="font-bold text-slate-800">
                    {revisionDate ? (
                      <span className="text-emerald-700">{revisionDate}</span>
                    ) : (
                      <span className="text-slate-400 animate-pulse">Loading...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Loading State */}
            {loading && (
              <div className="mt-6 flex items-center justify-center space-x-3 text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 py-4 px-6 rounded-xl shadow-inner border border-blue-200/50">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="font-semibold">Loading data...</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Error Message */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Enhanced Download Button */}
        {tableData.pivotData.length > 0 && (
          <div className="flex justify-end mb-6">
            <button
              onClick={handleDownload}
              className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
            >
              <Download className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>Download</span>
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        )}

        {/* Enhanced Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-slate-200/60 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 flex items-center gap-3">
              <BarChart3 size={24} className="text-blue-400" />
              <h2 className="text-white font-bold text-lg">Entitlement Data</h2>
            </div>
          
          <div className="relative bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="overflow-auto max-h-[95vh] xl:max-h-[95vh]">             
          <table className="w-full text-sm border-collapse">               
           <thead>
                  <tr>
                    <th className="sticky top-0 left-0 z-30 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-4 font-bold text-left border-r border-blue-500/30 shadow-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Timeslot
                      </div>
                    </th>
                    {tableData.gencos.map((g, index) => (
                      <th key={g} className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-4 font-bold text-center border-r border-blue-500/30 shadow-lg min-w-[120px]">
                        <div className="flex items-center justify-center gap-2">
                          <Zap className="w-4 h-4" />
                          {g}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.pivotData.length > 0 ? (
                    tableData.pivotData.map((row, idx) => (
                      <tr key={idx} className={`group transition-all duration-200 ${idx % 2 === 0 ? 'bg-gradient-to-r from-slate-50 to-blue-50' : 'bg-white'} hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50`}>
                        <td className="sticky left-0 z-10 bg-gradient-to-r from-slate-100 to-blue-100 font-semibold px-4 py-3 border-r border-slate-200 shadow-sm p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            {timeslotData[row.timeslot] || row.timeslot}
                          </div>
                        </td>
                        {row.values.map((val, j) => (
                          <td key={j} className="px-4 py-3 text-center border-r border-slate-200 transition-all duration-200 group-hover:bg-white/80">
                            {val === '-' ? (
                              <span className="text-slate-400 font-medium text-lg">—</span>
                            ) : (
                              <div className="font-semibold text-slate-800 bg-gradient-to-r from-green-100 to-emerald-100 px-2 py-1 rounded-lg">
                                {parseFloat(val).toFixed(2)}
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={tableData.gencos.length + 1} className="text-center py-12 text-slate-500">
                        <div className="flex flex-col items-center gap-3">
                          <Database className="w-12 h-12 text-slate-300" />
                          <span className="font-medium text-lg">
                            {loading ? 'Loading data...' : 'No data available'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Entitlement;