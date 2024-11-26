import React from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { useLanguage } from '../Hoc/LanguageContext'; 
import { subnav } from '../lib/RouterLink'; // Import subnav data

const SubNavbar = () => {
  const { translations } = useLanguage();

  return (
    <Navbar className="sub-navbar" bg="dark" expand="lg">
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          {/* Loop through subnav and create dropdown items */}
          {subnav.map((navItem, index) => (
            <NavDropdown
              key={index}
              title={navItem.title} // Use translation for title
              id={`nav-dropdown-${index}`}
              disabled={navItem.disabled} // If disabled, do not show the dropdown
              align="end" // Align dropdown to the right if needed
              className="sub-navbar-dropdown" // Add class to dropdown for custom styles
            >
              {/* Loop through sublinks for each dropdown */}
              {navItem.sublinks &&
                navItem.sublinks.map((sublink, subIndex) => (
                  <NavDropdown.Item key={subIndex} href={sublink.href}>
                    {sublink.title} {/* Use translation for sublink title */}
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
