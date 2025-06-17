import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Users, Building, RefreshCw, X, Phone, Mail, MapPin, Fan as Fax } from 'lucide-react';

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
      setError(err instanceof Error ? err.message : 'Failed to load data');
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
      userUnder: row[6],
      children: []
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

      if (emp.userUnder && emp.userUnder.toLowerCase().includes('general manager')) {
        parent = gm;
      } else {
        parent = [...employeeMap.values()].find(e => e.designation === emp.userUnder);
      }

      if (parent && current) {
        parent.children.push(current);
      } else if (current) {
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

  const getNodeStyle = (designation) => {
    const title = designation.toLowerCase();
    if (title.includes('general manager') || title.includes('gm')) {
      return {
        gradient: 'from-red-500 to-pink-600',
        border: 'border-red-300',
        text: 'text-white'
      };
    }
    if (title.includes('agm') || title.includes('assistant general manager')) {
      return {
        gradient: 'from-purple-500 to-indigo-600',
        border: 'border-purple-300',
        text: 'text-white'
      };
    }
    if (title.includes('manager') && !title.includes('assistant') && !title.includes('deputy')) {
      return {
        gradient: 'from-emerald-500 to-teal-600',
        border: 'border-emerald-300',
        text: 'text-white'
      };
    }
    return {
      gradient: 'from-orange-400 to-amber-500',
      border: 'border-orange-300',
      text: 'text-white'
    };
  };

  const openModal = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  const renderNode = (node, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const nodeStyle = getNodeStyle(node.designation);

    return (
      <div key={node.id} className="flex flex-col items-center relative">
        {/* Node Card */}
        <div 
  className={`
    relative bg-gradient-to-br ${nodeStyle.gradient} 
    ${nodeStyle.border} border-2 rounded-xl p-4 shadow-md 
    hover:shadow-lg transition-all duration-300 cursor-pointer
    transform hover:-translate-y-1 w-56 max-w-xs
    ${nodeStyle.text} mb-1
  `}
  onClick={() => openModal(node)}
>

          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="absolute -top-3 -right-3 bg-white border-2 border-current rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isExpanded ? (
            <ChevronDown className="w-8 h-8 text-black stroke-2" />
              ) : (
                <ChevronRight className="w-8 h-8 text-black stroke-2" />
              )}
            </button>
          )}

          {/* Node Header */}
          <div className="mb-4 pb-4 border-b border-white/20">
            <h3 className="text-sm font-bold mb-2 leading-tight">{node.name}</h3>
            <p className="text-sm opacity-90 font-medium italic">{node.designation}</p>
          </div>

          {/* Contact Preview */}
         <div className="space-y-1 text-xs opacity-90">
            {node.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <span className="truncate">{node.phone}</span>
              </div>
            )}
            {node.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                <span className="truncate">{node.email}</span>
              </div>
            )}
          </div>

          
        </div>

        {/* Children Container */}
        {hasChildren && isExpanded && (
          <div className="w-full flex flex-col items-center">
            {/* Vertical Line from Parent */}
            <div className="w-0.5 h-8 bg-gray-400 mb-4"></div>
            
            {/* Children Container with Proper Spacing */}
            <div className="w-full flex justify-center">
              <div className="flex flex-wrap justify-center gap-4 max-w-full">
                {node.children.map((child, index) => (
                  <div key={child.id} className="flex flex-col items-center relative">
                    {/* Horizontal connector line */}
                    {node.children.length > 1 && (
                      <>
                        {/* Vertical line to horizontal connector */}
                        <div className="w-0.5 h-4 bg-gray-400 -mb-2"></div>
                        {/* Horizontal line */}
                        <div 
                          className="h-0.5 bg-gray-400 absolute top-4"
                          style={{
                            width: index === 0 ? '50%' : 
                                   index === node.children.length - 1 ? '50%' : '100%',
                            left: index === 0 ? '50%' : 
                                  index === node.children.length - 1 ? '0%' : '0%'
                          }}
                        ></div>
                        {/* Connection point */}
                        <div className="w-3 h-3 bg-blue-500 rounded-full absolute top-2.5 left-1/2 transform -translate-x-1.5 z-10"></div>
                      </>
                    )}
                    
                    {/* Child Node */}
                    <div className="mt-4">
                      {renderNode(child, level + 1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Organization Data</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md">
          <div className="text-red-500 mb-6">
            <X className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Failed to Load Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadOrgData}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Delhi SLDC</h1>
            <p className="text-xl opacity-90 mb-8">State Load Despatch Centre - Organizational Structure</p>
            
          
          </div>
        </div>
      </div>

      {/* Organization Chart */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-full px-6 py-12">
          {orgData.length > 0 ? (
            <div className="flex flex-col items-center space-y-6 min-w-max">
              {orgData.map(node => renderNode(node))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">
                <Building className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600">No organizational data found</h3>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selectedEmployee.name}</h2>
                  <p className="text-blue-100">{selectedEmployee.designation}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:bg-white/10 rounded-full p-2 transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-center">
              {/* Position Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Position Information
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div><strong>Designation:</strong> {selectedEmployee.designation}</div>
                  {selectedEmployee.userUnder && (
                    <div><strong>Reports To:</strong> {selectedEmployee.userUnder}</div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-600" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {selectedEmployee.phone && (
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                      <Phone className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-semibold text-gray-700">Phone</div>
                        <div className="text-gray-600">{selectedEmployee.phone}</div>
                      </div>
                    </div>
                  )}
                  {selectedEmployee.email && (
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-gray-700">Email</div>
                        <div className="text-gray-600">{selectedEmployee.email}</div>
                      </div>
                    </div>
                  )}
                  {selectedEmployee.fax && (
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                      <Fax className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="font-semibold text-gray-700">Fax</div>
                        <div className="text-gray-600">{selectedEmployee.fax}</div>
                      </div>
                    </div>
                  )}
                  {selectedEmployee.address && (
                    <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                      <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <div className="font-semibold text-gray-700">Address</div>
                        <div className="text-gray-600">{selectedEmployee.address}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Direct Reports */}
              {selectedEmployee.children && selectedEmployee.children.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Direct Reports ({selectedEmployee.children.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedEmployee.children.map(child => (
                      <div
                        key={child.id}
                        className="flex justify-between items-center bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div>
                          <div className="font-semibold text-gray-800">{child.name}</div>
                          <div className="text-sm text-gray-600">{child.designation}</div>
                        </div>
                       
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganisationChart;