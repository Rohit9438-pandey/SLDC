import React, { useState } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { useLanguage } from '../Hoc/LanguageContext';
import { Link, useNavigate } from 'react-router-dom'; 
import { subnav } from '../lib/RouterLink'; 
import RealTimeData from '../pages/Real-Time-Data';

const SubNavbar = () => {
  const { translations } = useLanguage();
  const navigate = useNavigate(); 
  
  // State to control the visibility of the table for DISCOM DRAWL
  const [activeTable, setActiveTable] = useState(null);

  // Function to handle toggling the table visibility
  const handleTableToggle = (index) => {
    if (activeTable === index) {
      setActiveTable(null); 
    } else {
      setActiveTable(index); 
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
            onClick={navigate("/real-time-data")}
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
