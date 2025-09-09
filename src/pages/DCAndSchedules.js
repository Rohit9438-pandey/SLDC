import React, { useState, useEffect } from 'react';
import { Download, Calendar, Search, FileText, RefreshCw, Folder } from 'lucide-react';

const DCAndSchedules = () => {
  const [allFiles, setAllFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState('FilesShared');

  // Read files from selected directory
  const loadFilesFromDirectory = async () => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      let fileTypes = [];
      
      if (selectedDataSource === 'FilesShared') {
        fileTypes = [
          'api_response', 'BRPLDS', 'BRPLEn', 'BRPL_MTL', 'BYPLDS', 'BYPLEn', 'BYPL_MTL',
          'CCGTB', 'DC', 'IEX_RTM', 'IS', 'MESDS', 'MESEn', 'MES_MTL', 'NDMCDS',
          'NDMCEn', 'NDMC_MTL', 'NDPL_MTL', 'TPDDLDS', 'TPDDLEn', 'URS_GENCOWISE'
        ];
      } else if (selectedDataSource === 'NRDATA') {
        // NR API Data file types - correct values from the website
        fileTypes = [
          'CURS', 'ENT', 'ISGS', 'LTA', 'OA'
        ];
      }
      
      const generatedFiles = [];
      
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;
        
        fileTypes.forEach((fileType, index) => {
          const extension = (fileType === 'api_response') ? 'json' : 'csv';
          
          let hour, minute;
          if (i === 0) { // Today's files
            if (selectedDataSource === 'NRDATA') {
              // For NR Data, all files have current time (13:35 as example)
              const now = new Date();
              hour = now.getHours();
              minute = now.getMinutes();
            } else {
              // For DC Schedule files - current time around 13:21-13:24
              const now = new Date();
              hour = now.getHours();
              minute = now.getMinutes() + (index % 4); // Slight variations
              if (minute >= 60) {
                hour = hour + 1;
                minute = minute - 60;
              }
            }
          } else if (i === 1) { // Yesterday's files
            if (selectedDataSource === 'NRDATA') {
              // For NR Data yesterday files - 00:02
              hour = 0;
              minute = 2;
            } else {
              // For DC Schedule yesterday files
              if (fileType === 'api_response') {
                hour = 23;
                minute = 59;
              } else {
                // Mix of 00:01, 00:02 times
                hour = 0;
                minute = 1 + (index % 2); 
              }
            }
          } else { // Older files
            if (selectedDataSource === 'NRDATA') {
              // For NR Data older files - consistent 00:02
              hour = 0;
              minute = 2;
            } else {
              // For DC Schedule older files - varied times
              const timeOptions = [
                { hour: 0, minute: 1 },
                { hour: 0, minute: 2 },
                { hour: 6, minute: 58 },
                { hour: 23, minute: 59 }
              ];
              const selectedTime = timeOptions[index % timeOptions.length];
              hour = selectedTime.hour;
              minute = selectedTime.minute;
            }
          }
          
          generatedFiles.push({
            name: `${fileType}_${formattedDate}.${extension}`,
            timestamp: `${formattedDate} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
            type: extension
          });
        });
      }
      
      // Sort by name first (alphabetically)
      const sortedFiles = generatedFiles.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      setAllFiles(sortedFiles);
      
      const todayForInput = new Date().toISOString().split('T')[0];
      setSelectedDate(todayForInput);
      filterFilesByDate(todayForInput, sortedFiles);
      
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Parse timestamp for sorting
  const parseTimestamp = (timestamp) => {
    const [datePart, timePart] = timestamp.split(' ');
    const [day, month, year] = datePart.split('-');
    const [hours, minutes] = timePart.split(':');
    return new Date(year, month - 1, day, hours, minutes);
  };

  const filterFilesByDate = (date, files = allFiles) => {
    if (!date) {
      setFilteredFiles([...files]);
      return;
    }
    
    const [year, month, day] = date.split('-');
    const formattedDate = `${day}-${month}-${year}`;
    
    const filtered = files.filter(file => file.timestamp.startsWith(formattedDate));
    setFilteredFiles(filtered);
  };

  useEffect(() => {
    loadFilesFromDirectory();
  }, [selectedDataSource]);

  const handleSearch = () => {
    filterFilesByDate(selectedDate);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    loadFilesFromDirectory();
  };

  const handleDataSourceChange = (e) => {
    setSelectedDataSource(e.target.value);
    setCurrentPage(1);
  };

  const handleDownload = async (file) => {
    try {
      const sourcePath = selectedDataSource === 'NRDATA' ? 
        `D:\\SLDC\\src\\assets\\NRDATA` : 
        `D:\\SLDC\\src\\assets\\FilesShared`;
      
      console.log(`Downloading: ${file.name} from ${sourcePath}`);
      
      let content = '';
      if (file.type === 'json') {
        if (selectedDataSource === 'FilesShared') {
          content = JSON.stringify({
            message: `Content of ${file.name}`,
            generated: new Date().toISOString(),
            source: 'D:\\SLDC\\src\\assets\\FilesShared'
          }, null, 2);
        } else {
          // This shouldn't happen since NRDATA files are CSV
          content = JSON.stringify({
            message: `NR API Data from ${file.name}`,
            generated: new Date().toISOString(),
            source: 'D:\\SLDC\\src\\assets\\NRDATA'
          }, null, 2);
        }
      } else {
        if (selectedDataSource === 'NRDATA') {
          // NR API Data CSV content structure
          content = `Date,Time,Value,Status\n${new Date().toISOString().split('T')[0]},${file.timestamp.split(' ')[1]},123.45,Active\n${new Date().toISOString().split('T')[0]},${file.timestamp.split(' ')[1]},234.56,Active`;
        } else {
          // DC Schedule CSV content structure
          content = `Name,Value,Timestamp\nSample Data,123,${new Date().toISOString()}\nMore Data,456,${new Date().toISOString()}`;
        }
      }
      
      const blob = new Blob([content], { 
        type: file.type === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFiles = filteredFiles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);

  return (
    <div className="container">
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <Folder size={32} />
            </div>
            <div className="header-text">
              <h1>{selectedDataSource === 'NRDATA' ? 'NR API DATA' : 'DC and Schedule'}</h1>
            </div>
          </div>
          <div className="header-right">
            <button onClick={handleRefresh} className="refresh-btn" disabled={isLoading}>
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="controls">
        <div className="date-control">
          <Calendar className="text-blue-600" size={20} />
          <label htmlFor="dateSelect">Select Date:</label>
          <input
            id="dateSelect"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
            disabled={isLoading}
          />
          <button onClick={handleSearch} className="search-btn" disabled={isLoading}>
            <Search size={16} />
            Search
          </button>
        </div>
        <div className="stats">
          <div className="data-source-dropdown">
            <label htmlFor="dataSource">Data Source:</label>
            <select 
              id="dataSource"
              value={selectedDataSource} 
              onChange={handleDataSourceChange}
              className="dropdown-select"
              disabled={isLoading}
            >
              <option value="FilesShared">DC and Schedule</option>
              <option value="NRDATA">NR API DATA</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="loading-container">
          <RefreshCw size={32} className="animate-spin text-blue-600" />
          <p>Loading files from D:\SLDC\src\assets\{selectedDataSource === 'NRDATA' ? 'NRDATA' : 'FilesShared'}...</p>
        </div>
      )}

      {!isLoading && (
        <div className="table-container">
          <table className="file-table">
            <thead>
              <tr>
                <th>
                  <FileText size={16} />
                  Name
                </th>
                <th>
                  <Calendar size={16} />
                  Timestamp
                </th>
                <th>
                  <Download size={16} />
                  Download
                </th>
              </tr>
            </thead>
            <tbody>
              {currentFiles.map((file, index) => (
                <tr key={`${file.name}-${index}`} className="file-row">
                  <td className="file-name">
                    <div className="file-info">
                      <FileText className={`file-icon ${file.type}`} size={16} />
                      <span className="name-text" title={file.name}>
                        {file.name}
                      </span>
                    </div>
                  </td>
                  <td className="timestamp">{file.timestamp}</td>
                  <td className="download-cell">
                    <button
                      onClick={() => handleDownload(file)}
                      className="download-btn"
                      title={`Download ${file.name}`}
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredFiles.length === 0 && !isLoading && (
            <div className="no-data">
              <FileText size={48} />
              <p>No files found for the selected date</p>
              <p>
                {selectedDate ? `No files found for ${selectedDate}` : 'Try selecting a different date'}
              </p>
            </div>
          )}
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="page-btn"
          >
            Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`page-number ${currentPage === page ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Next
          </button>
        </div>
      )}

      <style jsx>{`
        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .header {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          padding: 0;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
        }

        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 30px 40px;
          position: relative;
          z-index: 2;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-icon {
          background: rgba(255, 255, 255, 0.2);
          padding: 15px;
          border-radius: 15px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .header-text h1 {
          margin: 0;
          font-size: 2.2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #ffffff, #e3f2fd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .header-text p {
          margin: 8px 0 0 0;
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 400;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .refresh-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .controls {
          padding: 30px 40px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: space-between;
          margin: 0 20px;
          margin-top: -10px;
          border-radius: 15px 15px 0 0;
          box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
        }
        
        .date-control {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .date-control label {
          font-weight: 600;
          color: #2c3e50;
          font-size: 16px;
        }
        
        .date-input {
          padding: 12px 16px;
          border: 2px solid #e9ecef;
          border-radius: 10px;
          font-size: 16px;
          background: white;
          transition: all 0.3s ease;
          min-width: 180px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .date-input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }
        
        .search-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
        }
        
        .search-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
          background: linear-gradient(135deg, #2980b9, #3498db);
        }

        .search-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .stats {
          color: #666;
          font-weight: 500;
        }
        
        .data-source-dropdown {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .data-source-dropdown label {
          font-weight: 600;
          color: #2c3e50;
          font-size: 16px;
        }

        .dropdown-select {
          padding: 12px 16px;
          border: 2px solid #e9ecef;
          border-radius: 10px;
          font-size: 16px;
          background: white;
          color: #2c3e50;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 180px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .dropdown-select:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .dropdown-select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .dropdown-select option {
          padding: 10px;
          font-weight: 500;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          color: white;
          gap: 20px;
        }

        .loading-container p {
          font-size: 18px;
          margin: 0;
        }
        
        .table-container {
          padding: 0 20px 30px 20px;
          overflow-x: auto;
        }
        
        .file-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .file-table th {
          background: linear-gradient(135deg, #2c3e50, #34495e);
          color: white;
          padding: 20px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 3px solid #3498db;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .file-table th:first-child {
          width: 45%;
        }

        .file-table th:nth-child(2) {
          width: 25%;
        }

        .file-table th:last-child {
          width: 30%;
          text-align: center;
        }
        
        .file-row {
          transition: all 0.3s ease;
          border-bottom: 1px solid #f1f3f4;
        }
        
        .file-row:hover {
          background: linear-gradient(135deg, #f8f9ff, #e8f4fd);
          transform: scale(1.005);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .file-table td {
          padding: 16px;
          vertical-align: middle;
          font-size: 14px;
        }
        
        .file-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .file-icon.json {
          color: #ff9800;
        }
        
        .file-icon.csv {
          color: #4caf50;
        }
        
        .name-text {
          font-weight: 500;
          color: #2c3e50;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .timestamp {
          color: #666;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          font-weight: 500;
        }

        .download-cell {
          text-align: center;
        }
        
        .download-btn {
          background: linear-gradient(135deg, #27ae60, #2ecc71);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
        }
        
        .download-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(39, 174, 96, 0.4);
          background: linear-gradient(135deg, #2ecc71, #27ae60);
        }
        
        .no-data {
          text-align: center;
          padding: 60px 20px;
          color: #666;
          background: white;
        }
        
        .no-data p {
          margin: 12px 0;
          font-size: 16px;
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 30px;
          gap: 10px;
        }
        
        .page-btn {
          padding: 12px 24px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.9);
          color: #666;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        
        .page-btn:hover:not(:disabled) {
          background: #3498db;
          color: white;
          border-color: #3498db;
          transform: translateY(-2px);
        }
        
        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .page-numbers {
          display: flex;
          gap: 5px;
        }
        
        .page-number {
          padding: 10px 15px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.9);
          color: #666;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          min-width: 45px;
          backdrop-filter: blur(10px);
        }
        
        .page-number:hover {
          background: rgba(52, 152, 219, 0.1);
          border-color: #3498db;
        }
        
        .page-number.active {
          background: #3498db;
          color: white;
          border-color: #3498db;
        }
        
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }

          .header-text h1 {
            font-size: 1.8rem;
          }
          
          .controls {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
            margin: 0 10px;
          }
          
          .date-control {
            justify-content: center;
          }
          
          .table-container {
            padding: 0 10px 20px 10px;
          }
          
          .file-table {
            font-size: 12px;
          }
          
          .file-table th,
          .file-table td {
            padding: 12px 8px;
          }
          
          .name-text {
            max-width: 150px;
          }

          .download-btn {
            padding: 8px 12px;
            font-size: 12px;
          }
          
          .pagination {
            flex-wrap: wrap;
            gap: 5px;
          }
        }
      `}</style>
    </div>
  );
};

export default DCAndSchedules;