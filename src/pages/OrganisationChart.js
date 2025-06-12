import React, { useState, useEffect } from 'react';

const OrganisationChart = () => {
  const [orgData, setOrgData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set([1])); 
  const [stats, setStats] = useState({ total: 0, departments: 0, lastUpdated: null });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const API_URL = 'https://delhisldc.org/app-api/get-data?table=DTL_DIRECTORY';

  useEffect(() => {
    loadOrgData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadOrgData, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadOrgData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.result && data.result.rows) {
        const processedData = processOrgData(data.result.rows);
        setOrgData(processedData);
        updateStats(processedData);
      } else {
        throw new Error('Invalid data structure received');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processOrgData = (rows) => {
    const employees = rows.map(row => ({
      id: row[7],           
      name: row[0],         
      designation: row[1],  
      address: row[2],       
      phone: row[3],         
      email: row[4],         
      fax: row[5],           
      userUnder: row[6]      
    })).filter(emp => emp.id !== null);

    return buildHierarchy(employees);
  };

  const buildHierarchy = (employees) => {
    const employeeMap = new Map();
    const hierarchy = [];

    employees.forEach(emp => {
      employeeMap.set(emp.id, { ...emp, children: [] });
    });

    const gm = employeeMap.get(1);

    const agmChildren = employees.filter(emp => {
      const title = emp.designation.toLowerCase();
      return (
        emp.id !== 1 &&
        title.includes('agm') &&
        (!emp.userUnder || emp.userUnder.toLowerCase().includes('general manager'))
      );
    });
    agmChildren.forEach(emp => {
      const node = employeeMap.get(emp.id);
      if (gm && node) {
        gm.children.push(node);
      }
    });

  
    employees.forEach(emp => {
      if (emp.id === 1) return;
      const current = employeeMap.get(emp.id);

      if (gm && gm.children.some(c => c.id === emp.id)) {
        return;
      }

      let parent = null;

      if (
        emp.userUnder &&
        emp.userUnder.toLowerCase().includes('general manager')
      ) {
        parent = gm;
      } else {
        parent = [...employeeMap.values()].find(e => e.designation === emp.userUnder);
      }

      if (parent) {
        parent.children.push(current);
      } else {
        hierarchy.push(current);
      }
    });

    if (gm) {
      hierarchy.unshift(gm);
    }

    const sortChildren = (node) => {
      node.children.sort((a, b) => a.name.localeCompare(b.name));
      node.children.forEach(sortChildren);
    };
    hierarchy.forEach(sortChildren);

    return hierarchy;
  };

  const updateStats = (data) => {
    const total = countAllEmployees(data);
    const designations = getAllDesignations(data);
    const departments = new Set(designations).size;
    
    setStats({
      total,
      departments,
      lastUpdated: new Date().toLocaleString()
    });
  };

  const countAllEmployees = (nodes) => {
    let count = 0;
    nodes.forEach(node => {
      count++;
      if (node.children) {
        count += countAllEmployees(node.children);
      }
    });
    return count;
  };

  const getAllDesignations = (nodes) => {
    let designations = [];
    nodes.forEach(node => {
      designations.push(node.designation);
      if (node.children) {
        designations = designations.concat(getAllDesignations(node.children));
      }
    });
    return designations;
  };

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getNodeClass = (designation) => {
    const title = designation.toLowerCase();
    if (title.includes('general manager') || title.includes('gm')) return 'gm';
    if (title.includes('agm') || title.includes('assistant general manager')) return 'agm';
    if (title.includes('manager') && !title.includes('assistant') && !title.includes('deputy')) return 'manager';
    return 'others';
  };

  const openModal = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  const formatContactInfo = (label, value) => {
    if (!value) return null;
    
    const icons = {
      'Phone': '📞',
      'Email': '📧',
      'Fax': '📠',
      'Address': '📍'
    };

    return (
      <div className="contact-item">
        <span className="contact-icon">{icons[label]}</span>
        <span className="contact-label">{label}:</span>
        <span className="contact-value">{value}</span>
      </div>
    );
  };

 const renderNode = (node) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const nodeClass = getNodeClass(node.designation);

  return (
    <div key={node.id} className="tree-level">
      <div className={`node ${nodeClass}`}>
        <div className="node-header" onClick={() => openModal(node)}>
          <h3>{node.name}</h3>
          <div className="designation">{node.designation}</div>
        </div>

        <div className="contact-info-preview">
          {node.phone && <div className="contact-preview">📞 {node.phone}</div>}
          {node.email && <div className="contact-preview">📧 {node.email}</div>}
        </div>

        {hasChildren && (
          <div className="expand-btn-container">
            <button
              className="expand-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
            >
              {isExpanded ? '−' : '+'}
            </button>
          </div>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="children-row">
          {node.children.map(child => renderNode(child))}
        </div>
      )}
    </div>
  );
};


  const Modal = ({ employee, onClose }) => {
    if (!employee) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{employee.name}</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <div className="employee-details">
              <div className="detail-section">
                <h3>Position Information</h3>
                <p><strong>Designation:</strong> {employee.designation}</p>
                {employee.userUnder && <p><strong>Reports To:</strong> {employee.userUnder}</p>}
              </div>
              
              <div className="detail-section">
                <h3>Contact Information</h3>
                {formatContactInfo('Phone', employee.phone)}
                {formatContactInfo('Email', employee.email)}
                {formatContactInfo('Fax', employee.fax)}
                {formatContactInfo('Address', employee.address)}
              </div>
              
              {employee.children && employee.children.length > 0 && (
                <div className="detail-section">
                  <h3>Direct Reports ({employee.children.length})</h3>
                  <ul className="reports-list">
                    {employee.children.map(child => (
                      <li key={child.id} className="report-item">
                        <span className="report-name">{child.name}</span>
                        <span className="report-designation">{child.designation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>Delhi SLDC</h1>
          <p>State Load Despatch Centre - Organizational Structure</p>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          Loading organizational data...
        </div>
        <style jsx>{`
          .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          .header {
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
          }
          .header p {
            font-size: 1.1rem;
            opacity: 0.9;
          }
          .loading {
            text-align: center;
            padding: 40px;
            font-size: 1.2rem;
            color: #666;
          }
          .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="header">
          <h1>Delhi SLDC</h1>
          <p>State Load Despatch Centre - Organizational Structure</p>
        </div>
        <div className="error">
          ❌ Failed to load organizational data<br />
          <small>Error: {error}</small><br />
          <button className="refresh-btn" onClick={loadOrgData}>
            Try Again
          </button>
        </div>
        <style jsx>{`
          .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          .header {
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
          }
          .header p {
            font-size: 1.1rem;
            opacity: 0.9;
          }
          .error {
            text-align: center;
            padding: 40px;
            color: #dc3545;
            font-size: 1.1rem;
          }
          .refresh-btn {
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            margin-top: 15px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div className="container">
        <div className="header">
          <h1>Delhi SLDC</h1>
          <p>State Load Despatch Centre - Organizational Structure</p>
        </div>
        
        <div className="controls">
          <div className="stats">
            <div className="stat-item">Total Employees: <span>{stats.total}</span></div>
            <div className="stat-item">Departments: <span>{stats.departments}</span></div>
            <div className="stat-item">Last Updated: <span>{stats.lastUpdated || '-'}</span></div>
          </div>
          <button className="refresh-btn" onClick={loadOrgData}>
            🔄 Refresh Data
          </button>
        </div>
        
        <div className="org-chart">
          {orgData.length > 0 ? (
            <div className="tree">
              <ul>
                {orgData.map(node => renderNode(node))}
              </ul>
            </div>
          ) : (
            <div className="error">No organizational data found</div>
          )}
        </div>
      </div>

      {showModal && <Modal employee={selectedEmployee} onClose={closeModal} />}

      <style jsx>{`
        .container {
          max-width: 1400px;
          margin: 0 auto;
          background: white;
          border-radius: 15px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .header {
          background: linear-gradient(135deg, #1e3c72, #2a5298);
          color: white;
          padding: 30px;
          text-align: center;
        }

        .header h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .header p {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .controls {
          padding: 20px 30px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .refresh-btn {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        }

        .refresh-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
        }

        .stats {
          background: #e3f2fd;
          padding: 15px;
          border-radius: 8px;
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .stat-item {
          font-weight: 600;
          color: #1976d2;
        }

        .org-chart {
          padding: 30px;
          overflow-x: auto;
          min-height: 400px;
        }

        .tree {
          display: flex;
          justify-content: center;
          position: relative;
        }

        .tree ul {
          position: relative;
          padding-top: 60px;
          margin: 0;
          padding-left: 0;
          list-style: none;
        }

        .tree > ul {
          padding-top: 20px;
        }

        .tree li {
          float: left;
          text-align: center;
          display: inline-block;
          vertical-align: top;


          list-style-type: none;
          position: relative;
          padding: 20px 5px 0 5px;       
          margin: 20px;
          transition: all 0.5s;
        }

        /* Horizontal connecting lines */
        .tree li::before,
        .tree li::after {
          content: '';
          position: absolute;
          top: -15px;
          width: 50%;
          height: 15px;
          border-top: 3px solid #007bff;
        }

        .tree li::before {
          right: 50%;
          border-right: 3px solid #007bff;
          border-radius: 0 10px 0 0;
        }

        .tree li::after {
          left: 50%;
          border-left: 3px solid #007bff;
          border-radius: 10px 0 0 0;
        }

        /* Remove connecting lines for single child */
        .tree li:only-child::after,
        .tree li:only-child::before {
          display: none;
        }

        /* Remove top connecting line for root */
        .tree > ul > li::before,
        .tree > ul > li::after {
          border-top: none;
        }

        /* Vertical connecting line */
        .tree ul ul::before {
          content: '';
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 3px solid #007bff;
          height: 30px;
        }

        .tree li .children-list.expanded {
         display: block;
        }

        /* Node styling */
        .node {
          background: linear-gradient(135deg, #ffffff, #f8f9fa);
          border: 2px solid #e9ecef;
          border-radius: 20px;
          padding: 16px;
          margin: 0 10px;
          display: inline-block;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          min-width: 220px;
          max-width: 280px;
          text-align: left;
          font-size: 0.85rem;
          z-index: 2;
        }

        .node:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.2);
          border-color: #007bff;
        }

        .node.gm {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          border-color: #c44569;
        }

        .node.agm {
          background: linear-gradient(135deg, #4834d4, #6c5ce7);
          color: white;
          border-color: #a29bfe;
        }

        .node.manager {
          background: linear-gradient(135deg, #00b894, #00cec9);
          color: white;
          border-color: #81ecec;
        }

        .node.others {
          background: linear-gradient(135deg, #fdcb6e, #e17055);
          color: white;
          border-color: #fab1a0;
        }

        .node-header {
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255,255,255,0.2);
        }

        .node h3 {
          font-size: 1rem;
          margin-bottom: 6px;
          font-weight: 700;
          line-height: 1.3;
        }

        .node .designation {
          font-size: 0.9rem;
          opacity: 0.9;
          font-weight: 600;
          font-style: italic;
        }

        .node-id {
          font-size: 0.8rem;
          opacity: 0.8;
          margin-top: 4px;
        }

        .contact-info-preview {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .contact-preview {
          font-size: 0.75rem;
          opacity: 0.85;
          line-height: 1.4;
        }

        .expand-btn-container {
          position: absolute;
          bottom: -35px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }

        .expand-btn {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border: 3px solid white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0,123,255,0.3);
        }

        .expand-btn:hover {
          background: linear-gradient(135deg, #0056b3, #004085);
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0,123,255,0.4);
        }

        .children-list {
         position: absolute;
         top: 100%; /* positions it just below the node */
         left: 50%;
         transform: translateX(-50%);
         display: none;
         z-index: 1;
          margin-top: 40px;
        }

        .collapsed ul {
          display: none;
        }

        .error {
          text-align: center;
          padding: 40px;
          color: #dc3545;
          font-size: 1.1rem;
        }

        /* Modal styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          background: linear-gradient(135deg, #1e3c72, #2a5298);
          color: white;
          padding: 25px;
          border-radius: 20px 20px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          padding: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.3s ease;
        }

        .close-btn:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .modal-body {
          padding: 30px;
        }

        .detail-section {
          margin-bottom: 25px;
        }

        .detail-section h3 {
          color: #1e3c72;
          font-size: 1.2rem;
          margin-bottom: 15px;
          font-weight: 600;
          border-bottom: 2px solid #e9ecef;
          padding-bottom: 8px;
        }

        .detail-section p {
          margin-bottom: 10px;
          line-height: 1.6;
        }

        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 10px;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .contact-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
          width: 25px;
        }

        .contact-label {
          font-weight: 600;
          flex-shrink: 0;
          min-width: 70px;
          color: #495057;
        }

        .contact-value {
          color: #212529;
          word-break: break-all;
          flex: 1;
        }

        .reports-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .report-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          margin-bottom: 8px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }

        .report-name {
          font-weight: 600;
          color: #212529;
        }

        .report-designation {
          font-size: 0.9rem;
          color: #6c757d;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .header h1 {
            font-size: 2rem;
          }
          
          .node {
            min-width: 200px;
            max-width: 240px;
            padding: 14px;
          }
          
          .controls {
            flex-direction: column;
            align-items: stretch;
          }

          .stats {
            flex-direction: column;
            gap: 10px;
          }

          .tree li {
            padding: 20px 5px 0 5px;
          }

          .children-list {
            margin-top: 30px;
          }

          .modal-content {
            width: 95%;
            max-height: 90vh;
          }

          .modal-body {
            padding: 20px;
          }

          .report-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }
        }
      `}</style>
    </div>
  );
};

export default OrganisationChart;
