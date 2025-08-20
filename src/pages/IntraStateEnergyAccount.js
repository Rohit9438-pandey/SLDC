import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Clock } from 'lucide-react';

const IntraStateEnergyAccount = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const parsePeriod = (period) => {
    if (!period) return { year: 0, month: 0, sortKey: '0000-00' };
    const monthMap = {
      'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
      'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12
    };
    const parts = period.toLowerCase().split(' ');
    if (parts.length >= 2) {
      const month = monthMap[parts[0]] || 0;
      const year = parseInt(parts[1]) || 0;
      return { 
        year, 
        month, 
        sortKey: `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}` 
      };
    }
    return { year: 0, month: 0, sortKey: '0000-00' };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://delhisldc.org/app-api/get-data?table=DTL_ENERGYACCOUNTING');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        const filteredData = result.result.rows
          .filter(row => row[1] === "I")
          .sort((a, b) => {
            const periodA = parsePeriod(a[5]);
            const periodB = parsePeriod(b[5]);
            return periodB.sortKey.localeCompare(periodA.sortKey);
          });
        setData(filteredData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFileClick = (filename) => {
    const fileUrl = `https://delhisldc.org/Resources/${filename}`;
    window.open(fileUrl, '_blank');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
     <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800 p-4">
      <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">      {/* Header with reduced height */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white p-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-y-1 animate-pulse"></div>
      <h1 className="text-3xl font-bold mb-1 relative z-10">Intra State Energy Account</h1>
      <p className="text-lg opacity-90 relative z-10">Delhi State Load Dispatch Centre - Energy Accounting</p>
     </div>

      <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-900 to-blue-900 text-white sticky top-0 z-10">
            <tr>
                <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                <FileText className="w-4 h-4 text-white" />
                 <span className="align-middle">Energy Accounting Bills</span>
         </div>
        </th>

                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-white" />
                    <span>Period</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-white" />
                    <span>Raised on</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                  <span>Block Year</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {data.map((row, index) => (
                <tr 
                  key={row[0]}
                  className={`transition-all duration-300 hover:bg-indigo-50 ${
                    index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                  }`}
                >
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleFileClick(row[2])}
                    className="text-blue-800 hover:text-white bg-blue-50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 px-4 py-2 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg font-medium flex items-center gap-2 w-full text-left"
                    >
                      {row[4]}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-2 rounded-md">
                      {row[5] || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{formatDate(row[3])}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block text-xs font-bold bg-purple-200 text-purple-800 px-3 py-2 rounded-md">
                      {row[7] || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.length === 0 && (
            <div className="text-center py-10">
              <p>No records found</p>
            </div>
          )}
        </div>
      </div>
    </div>
    
  );
};

export default IntraStateEnergyAccount;
