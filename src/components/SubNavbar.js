import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { subnav } from '../lib/RouterLink';

const SubNavbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleDropdownToggle = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const renderSublinks = (sublinks) => (
    <ul className="submenu">
      {sublinks.map((sublink, subIndex) => (
        <li key={subIndex} className="submenu-item">
          {sublink.sublinks ? (
            <div className="nested-dropdown">
              <span>{sublink.title}</span>
              {renderSublinks(sublink.sublinks)}
            </div>
          ) : (
            <Link to={sublink.href}>{sublink.title}</Link>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <nav className="custom-navbar">
      <ul className="nav-list2">
        {subnav.map((navItem, index) => (
          <li key={index} className="nav-item2">
            <div className="nav-link2" onClick={() => handleDropdownToggle(index)}>
              {navItem.title}
            </div>
            {openDropdown === index && navItem.sublinks && (
              <div className="dropdown">
                {renderSublinks(navItem.sublinks)}
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SubNavbar;