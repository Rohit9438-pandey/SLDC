import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, Download, Calendar, FileText } from 'lucide-react';

const MeteringData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

   const congestionData = useMemo(() => {
    const filtered = data.filter(item => {
      const isCongestionType = item[1] === 'M' || 
                               (item[4] && item[4].toLowerCase().includes('MeteringData'));
      const matchesSearch = searchTerm === '' || 
                          (item[4] && item[4].toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item[2] && item[2].toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item[7] && item[7].toString().includes(searchTerm));
      return isCongestionType && matchesSearch;
    });

    return filtered.sort((a, b) => {
      const extractPeriod = (period) => {
        if (!period) return { year: 0, month: 0 };
        const match = period.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i);
        if (!match) return { year: 0, month: 0 };
        const monthMap = {
          january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
          july: 7, august: 8, september: 9, october: 10, november: 11, december: 12
        };
        return {
          month: monthMap[match[1].toLowerCase()] || 0,
          year: parseInt(match[2], 10)
        };
      };

      const periodA = extractPeriod(a[5]);
      const periodB = extractPeriod(b[5]);

      if (periodB.year !== periodA.year) {
        return periodB.year - periodA.year;
      }

      const now = new Date();
      const currentMonth = now.getMonth() + 1;

      const shiftMonth = (monthNum) => {
        let diff = monthNum - currentMonth;
        if (diff < 0) diff += 12;
        return diff;
      };

      const aRank = shiftMonth(periodA.month);
      const bRank = shiftMonth(periodB.month);

      return aRank - bRank;
    });
  }, [data, searchTerm]);


  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://delhisldc.org/app-api/get-data?table=DTL_ENERGYACCOUNTING');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.result && result.result.rows) {
        setData(result.result.rows);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (err) {
      setError(`Failed to fetch data: ${err.message}`);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  const handleBillClick = (filename, eaId, description) => {
    if (!filename) {
      alert('No file available for download');
      return;
    }
        
  
    const possibleUrls = [
      `https://delhisldc.org/Resources/${filename}`,
     
    ];
    
    const downloadUrl = possibleUrls[0];
    
    const newWindow = window.open(downloadUrl, '_blank');
    
    if (!newWindow) {
      console.log('Popup blocked. Try these URLs manually:');
      possibleUrls.forEach((url, index) => {
      });
      alert(`Download popup was blocked. Check the console for direct URLs or try: ${downloadUrl}`);
    }
  };

  const getFileIcon = (filename) => {
    if (!filename) return <FileText className="w-4 h-4" />;
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext === 'pdf' ? '📄' : ext === 'xls' || ext === 'xlsx' ? '📊' : <FileText className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800 p-4">
      <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
        
    <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white p-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-y-1 animate-pulse"></div>
      <h1 className="text-3xl font-bold mb-1 relative z-10">Metering Data</h1>
    </div>


        <div className="bg-white">
          {error && (
            // Error block stays intact
            <div className="text-center py-16 mx-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
                <div className="text-red-600 text-xl mb-2">⚠️ Error</div>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={fetchData}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {congestionData.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-600 text-xl">No congestion charges data found</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-900 to-blue-900 text-white sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider">
                            Metering Data
                          </th>
                          <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider">
                            Period
                          </th>
                          <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider">
                            Raised On
                          </th>
                          <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider">
                            Block Year
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {congestionData.map((row, index) => (
                          <tr 
                            key={row[0] || index}
                            className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:transform hover:translate-x-2 hover:shadow-lg"
                          >
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleBillClick(row[2], row[0], row[4])}
                                className="text-blue-800 hover:text-white bg-blue-50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 px-4 py-2 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg font-medium flex items-center gap-2 w-full text-left"
                                title={`Download: ${row[2]}`}
                              >
                                {getFileIcon(row[2])}
                                <span className="flex-1 break-words">
                                  {row[4] || 'Congestion Charges Bill'}
                                </span>
                                <Download className="w-4 h-4 flex-shrink-0" />
                              </button>
                               
                            </td>
                            <td className="px-6 py-4">
                              <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-4 py-2 rounded-full font-bold text-center inline-block min-w-[60px]">
                                {row[5] || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-gray-600 font-mono">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm">{formatDate(row[3])}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="bg-gradient-to-r from-gray-800 to-blue-900 text-white px-4 py-2 rounded-full font-semibold text-center inline-block min-w-[80px]">
                                {row[7] || 'N/A'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-t border-gray-200 text-center text-gray-600">
                    <p className="text-sm">
                      Showing <span className="font-semibold text-blue-600">{congestionData.length}</span> congestion charges bills
                    </p>
                  </div>
                </>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );

};

export default MeteringData;