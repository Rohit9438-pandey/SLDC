import React, { useState, useEffect } from "react";
import {
  Download,
  Calendar,
  Search,
  FileText,
  RefreshCw,
  Folder,
} from "lucide-react";

const DCAndSchedules = () => {
  const [allFiles, setAllFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState("FilesShared");

  const getApiEndpoint = (dataSource) => {
    if (dataSource === "FilesShared")
      return "https://delhisldc.org/app-api/list-files/fileshared";
    if (dataSource === "NRDATA")
      return "https://delhisldc.org/app-api/list-files/nrdata";
    return null;
  };

  const getFolderName = (dataSource) => {
    if (dataSource === "FilesShared") return "fileshared";
    if (dataSource === "NRDATA") return "nrdata";
    return "";
  };

  const formatTimestamp = (isoDate) => {
    try {
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) return isoDate;
      const day = String(date.getUTCDate()).padStart(2, "0");
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const year = date.getUTCFullYear();
      const hours = String(date.getUTCHours()).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");
      return `${day}-${month}-${year} ${hours}:${minutes}`;
    } catch {
      return isoDate;
    }
  };

  const getUTCDateString = (isoDate) => {
    try {
      const d = new Date(isoDate);
      if (isNaN(d.getTime())) return null;
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    } catch {
      return null;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return "-";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const loadFilesFromDirectory = async () => {
    setIsLoading(true);
    try {
      const apiUrl = getApiEndpoint(selectedDataSource);
      const response = await fetch(apiUrl);
      if (!response.ok)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      if (!data.files || !Array.isArray(data.files))
        throw new Error("Invalid API response format");

     const transformedFiles = data.files.map((file) => {
     const extension = (file.filename || "").split(".").pop().toLowerCase();
    return {
    name: file.filename,
    timestamp: file.lastModifiedFormatted || file.lastModified,
    type: extension,
    path: `https://delhisldc.org/app-api/download-file/${getFolderName(
      selectedDataSource
    )}/${encodeURIComponent(file.filename)}`,
    size: formatFileSize(file.size),
    sizeBytes: file.size,
    originalData: file,
  };
});


      const sortedFiles = transformedFiles.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setAllFiles(sortedFiles);

      const todayUTC = (() => {
        const d = new Date();
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, "0");
        const day = String(d.getUTCDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      })();

      setSelectedDate(todayUTC);
      filterFilesByDate(todayUTC, sortedFiles);
    } catch {
      setAllFiles([]);
      setFilteredFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterFilesByDate = (date, files = allFiles) => {
    if (!date) {
      setFilteredFiles([...files]);
      return;
    }
    const filtered = files.filter((file) => {
      const fileDateStr = getUTCDateString(file.originalData.lastModified);
      return fileDateStr === date;
    });
    setFilteredFiles(filtered);
    setCurrentPage(1);
  };

  const handleDownload = async (file) => {
    try {
      const downloadUrl = `https://delhisldc.org/app-api/download-file/${getFolderName(
        selectedDataSource
      )}/${encodeURIComponent(file.name)}`;
      const response = await fetch(downloadUrl);
      if (!response.ok)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const blob = await response.blob();
      if (blob.size === 0) throw new Error("Downloaded file is empty");
      const objectUrl = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = objectUrl;
      downloadLink.download = file.name;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      alert(`Failed to download ${file.name}: ${err.message}`);
    }
  };

  useEffect(() => {
    loadFilesFromDirectory();
  }, [selectedDataSource]);

  const handleSearch = () => filterFilesByDate(selectedDate);
  const handleRefresh = () => loadFilesFromDirectory();
  const handleDataSourceChange = (e) => {
    setSelectedDataSource(e.target.value);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFiles = filteredFiles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);

  return (
    <>
      <div className="container">
        <div className="header">
          <div className="header-content">
            <div className="header-left">
              <div className="header-icon">
                <Folder size={32} />
              </div>
              <div className="header-text">
                <h1>
                  {selectedDataSource === "NRDATA"
                    ? "NR API DATA"
                    : "DC and Schedule"}
                </h1>
              </div>
            </div>
            <div className="header-right">
              <button
                onClick={handleRefresh}
                className="refresh-btn"
                disabled={isLoading}
              >
                <RefreshCw
                  size={16}
                  className={isLoading ? "animate-spin" : ""}
                />
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
            <button
              onClick={handleSearch}
              className="search-btn"
              disabled={isLoading}
            >
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
            <div className="file-count">Total Files: {filteredFiles.length}</div>
          </div>
        </div>

        {isLoading && (
          <div className="loading-container">
            <RefreshCw size={32} className="animate-spin text-blue-600" />
            <p>Loading files from {selectedDataSource} API...</p>
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
                {currentFiles.map((file, idx) => (
                  <tr key={idx} className="file-row">
                    <td className="file-info">
                      <span className={`file-icon ${file.type}`}>
                        <FileText size={18} />
                      </span>
                      <span className="name-text">{file.name}</span>
                    </td>
                    <td className="timestamp">{file.timestamp}</td>
                    <td className="download-cell">
                      <button
                        className="download-btn"
                        onClick={() => handleDownload(file)}
                      >
                        <Download size={16} /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> 
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </button>
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`page-number ${
                    currentPage === i + 1 ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

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
          display: flex;
          align-items: center;
          gap: 30px;
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

        .file-count {
          background: linear-gradient(135deg, #e3f2fd, #bbdefb);
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          color: #1565c0;
          border: 1px solid #90caf9;
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

          .stats {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
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
    </>
  );
};

export default DCAndSchedules;
