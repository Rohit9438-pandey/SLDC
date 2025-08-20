import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter, FileSpreadsheet } from 'lucide-react';

const InterDiscomTransfer = () => {
  const [data, setData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2025/08/11');
  const [selectedDiscom, setSelectedDiscom] = useState('BRPL');
  const [issueDate, setIssueDate] = useState('');

  const discoms = ['BRPL', 'BYPL', 'NDMC', 'NDPL', 'MES'];
  const allDiscomColumns = ['NDMC', 'MES', 'BYPL', 'NDPL', 'BRPL'];
  
  // Get visible columns based on selected DISCOM
  const getVisibleColumns = () => {
    return allDiscomColumns.filter(col => col !== selectedDiscom);
  };

  const fetchData = async (date) => {
    setLoading(true);
    try {
      const encodedFilters = encodeURIComponent(`{"FORDATE":"${date}"}`);
      const response = await fetch(`https://delhisldc.org/app-api/get-data?table=DTL_IDT&filters=${encodedFilters}`);
      const result = await response.json();
      
      if (result && result.result && result.result.rows) {
        const formattedData = result.result.rows.map(row => ({
          timeslot: row[0],
          forDate: row[1],
          issueDate: row[2],
          buyer: row[3],
          seller: row[4],
          quantum: parseFloat(row[5]) || 0
        }));
        
        setData(formattedData);
        
        // Set issue date from first record if available
        if (formattedData.length > 0 && formattedData[0].issueDate) {
          setIssueDate(formattedData[0].issueDate);
        }
        
        processDataForTable(formattedData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const processDataForTable = (rawData) => {
    const timeslots = [...new Set(rawData.map(item => item.timeslot))].sort((a, b) => a - b);
    
    const processed = timeslots.map(timeslot => {
      const timeslotData = { timeslot };
      
      allDiscomColumns.forEach(discom => {
        timeslotData[discom] = 0;
      });
      
      const timeslotRecords = rawData.filter(item => item.timeslot === timeslot);
      
      timeslotRecords.forEach(record => {
        const { buyer, seller, quantum } = record;
        
        if (allDiscomColumns.includes(buyer)) {
          timeslotData[buyer] += quantum;
        }
        
        if (allDiscomColumns.includes(seller)) {
          timeslotData[seller] -= quantum;
        }
      });
      
      const visibleColumns = allDiscomColumns.filter(col => col !== selectedDiscom);
      timeslotData.total = visibleColumns.reduce((sum, discom) => sum + timeslotData[discom], 0);
      
      return timeslotData;
    });
    
    setProcessedData(processed);
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const filtered = data.filter(item => 
      item.buyer === selectedDiscom || item.seller === selectedDiscom
    );
    processDataForTable(filtered);
  }, [selectedDiscom, data]);

  const downloadExcel = () => {
    const visibleColumns = getVisibleColumns();
    const headers = ['Timeslot', ...visibleColumns, 'Total'];
    const csvContent = [
      headers.join(','),
      ...processedData.map(row => [
        row.timeslot,
        ...visibleColumns.map(discom => row[discom].toFixed(3)),
        row.total.toFixed(3)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inter_discom_transfer_${selectedDate.replace(/\//g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2">
      <div className="max-w-full mx-auto">
      <div className="text-center mb-5">
      <h1 className="inline-block px-6 py-3 text-3xl font-bold text-white rounded-lg shadow-lg bg-gradient-to-r from-purple-600 via-pink-500 to-red-500">
        Inter Discom Transfer Data
      </h1>
    </div>



        <div className="bg-white rounded-lg shadow-lg p-3 mb-3">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-end">
            <div className="lg:col-span-1">
              {issueDate && (
                <div className="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-lg">
                  <div className="text-xs font-medium">Issued On</div>
                  <div className="text-sm font-bold">{issueDate}</div>
                </div>
              )}
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                <Calendar className="inline w-3 h-3 mr-1" />
                Date
              </label>
              <input
                type="date"
                value={selectedDate.replace(/\//g, '-')}
                onChange={(e) => setSelectedDate(e.target.value.replace(/-/g, '/'))}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* DISCOM Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                <Filter className="inline w-3 h-3 mr-1" />
                DISCOM
              </label>
              <select
                value={selectedDiscom}
                onChange={(e) => setSelectedDiscom(e.target.value)}
                className="w-full px-2 py-2 text-sm border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              >
                {discoms.map(discom => (
                  <option key={discom} value={discom}>
                    {discom}
                  </option>
                ))}
              </select>
            </div>

            {/* Download Button */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Download
              </label>
              <button
                onClick={downloadExcel}
                disabled={processedData.length === 0}
                className="w-full px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium rounded-md hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg"
              >
                <FileSpreadsheet className="w-3 h-3 mr-1" />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ 
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
            fontSize: "1.1rem",
            color: "#6c757d"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "15px" }}>⏳</div>
              <div>Loading Inter Discom Transfer data...</div>
            </div>
          </div>
        )}

        {/* Compact Data Table */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
             
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-gradient-to-r from-indigo-600 to-purple-700 border-b border-gray-300">
                    <th className="px-3 py-2 text-center text-xs font-bold text-white border-r border-indigo-400 bg-gradient-to-r from-violet-600 to-purple-700 sticky left-0 z-30">
                      TimeSlot
                    </th>
                    {getVisibleColumns().map(discom => (
                      <th key={discom} className="px-3 py-2 text-center text-xs font-bold text-white border-r border-indigo-400 min-w-[80px]">
                        {discom}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-center text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 min-w-[80px]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {processedData.length > 0 ? (
                    processedData.map((row, index) => (
                      <tr 
                        key={row.timeslot} 
                        className={`${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-blue-50 transition-colors duration-150`}
                      >
                        <td className="px-3 py-1 text-xs font-bold text-gray-900 border-r border-gray-200 bg-gradient-to-r from-violet-50 to-purple-50 sticky left-0 z-10">
                          {row.timeslot}
                        </td>
                        {getVisibleColumns().map(discom => (
                          <td 
                            key={discom} 
                            className="px-2 py-1 text-center text-xs font-semibold border-r border-gray-200"
                          >
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              row[discom] > 0 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : row[discom] < 0 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {row[discom].toFixed(2)}
                            </span>
                          </td>
                        ))}
                        <td className="px-2 py-1 text-center text-xs font-bold bg-gradient-to-r from-emerald-50 to-teal-50">
                          <span className={`px-2 py-1 rounded font-bold text-white text-xs ${
                            row.total > 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 
                            row.total < 0 ? 'bg-gradient-to-r from-red-500 to-pink-500' : 
                            'bg-gradient-to-r from-gray-400 to-gray-500'
                          }`}>
                            {row.total.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={getVisibleColumns().length + 2} className="px-6 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <div className="text-4xl mb-2">📊</div>
                          <div className="text-sm">No data available</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterDiscomTransfer;