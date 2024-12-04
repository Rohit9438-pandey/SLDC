import React, { useState } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { useLanguage } from '../Hoc/LanguageContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { subnav } from '../lib/RouterLink'; // Import subnav data

const SubNavbar = () => {
  const { translations } = useLanguage();
  const navigate = useNavigate(); // Initialize navigate hook
  
  // State to control the visibility of the table for DISCOM DRAWL
  const [activeTable, setActiveTable] = useState(null);

  // Function to handle toggling the table visibility
  const handleTableToggle = (index) => {
    if (activeTable === index) {
      setActiveTable(null); // Hide table if already active
    } else {
      setActiveTable(index); // Show table for this index
    }
  };

  // Handle navigation to real-time data page
  const handleRealTimeDataClick = () => {
    navigate('/real-time-data'); // Navigate to /real-time-data route
  };

  return (
    <Navbar className="sub-navbar" bg="dark" expand="lg">
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          {/* Loop through subnav and create dropdown items */}
          {subnav.map((navItem, index) => (
            <NavDropdown
              key={index}
              title={navItem.title}
              id={`nav-dropdown-${index}`}
              disabled={navItem.disabled}
              align="end"
              className="sub-navbar-dropdown"
            >
              {/* Loop through sublinks for each dropdown */}
              {navItem.sublinks &&
                navItem.sublinks.map((sublink, subIndex) => (
                  <NavDropdown.Item 
                    key={subIndex} 
                    href={sublink.href}
                   
                  >
                    {sublink.title}

                    {/* Display table when DISCOM DRAWL is clicked */}
                    {activeTable === subIndex && (
                      <div className="mt-3">
                        {sublink.data && Array.isArray(sublink.data) && sublink.data.length > 0 ? (
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th>Discom</th>
                                <th>Schedule</th>
                                <th>Drawl</th>
                                <th>OD/UD</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sublink.data.map((item, itemIndex) => (
                                <tr key={itemIndex}>
                                  <td>{item.discom}</td>
                                  <td>{item.schedule}</td>
                                  <td>{item.drawl}</td>
                                  <td>{item.od_ud}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p>No data available</p>
                        )}
                      </div>
                    )}
                  </NavDropdown.Item>
                ))}
            </NavDropdown>
          ))}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default SubNavbar;
