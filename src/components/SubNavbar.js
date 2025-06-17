import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Menu, X, Zap } from 'lucide-react';
import { subnav } from '../lib/RouterLink';

const SubNavbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRefs = useRef({});
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (Object.values(dropdownRefs.current).every(ref => ref && !ref.contains(event.target))) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = (index) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdown(index);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const renderLinks = (links, depth = 0) => {
    if (!links || !Array.isArray(links)) return null;

    return (
     <div
  className={`absolute ${depth === 0 ? 'top-full left-0' : 'top-0 left-full'} mt-1 w-max bg-white shadow-xl rounded-md border border-gray-200 z-[60]`}
>

        {links.map((link, index) => (
          <div key={index} className="relative group">
            {link.sublinks ? (
              <div className="flex items-center justify-between px-3 py-2 hover:bg-blue-100 text-gray-700 font-medium cursor-pointer">
                <span>{link.title}</span>
                <ChevronRight className="w-3 h-3" />
                {renderLinks(link.sublinks, depth + 1)}
              </div>
            ) : (
              <Link
                to={link.href}
                className="block px-3 py-2 hover:bg-blue-100 text-gray-700 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.title}
              </Link>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="top-0 z-50 bg-[#699ab3] shadow-xl">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Nav */}
        <div className="lg:hidden flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-xl shadow">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Menu</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-white hover:bg-blue-600 transition"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex justify-center items-center gap-3 py-2 relative">
          {subnav.map((navItem, index) => (
            <div
              key={index}
              ref={(el) => (dropdownRefs.current[index] = el)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              className="relative"
            >
            <button className="px-3 py-1.5 text-white hover:bg-blue-600 rounded-md font-semibold flex items-center space-x-1">
                <span className="whitespace-nowrap">{navItem.title}</span>
                {navItem.sublinks && <ChevronDown className="w-3 h-3" />}
              </button>
              {openDropdown === index && renderLinks(navItem.sublinks)}
            </div>
          ))}
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-2 bg-white rounded-md shadow-md max-h-[70vh] overflow-y-auto">
            {subnav.map((navItem, index) => (
              <div key={index} className="border-b">
                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === index ? null : index)
                  }
                  className="w-full text-left px-4 py-2 flex justify-between items-center text-gray-800 font-medium hover:bg-blue-100"
                >
                  <span>{navItem.title}</span>
                  {navItem.sublinks && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openDropdown === index ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>
                {openDropdown === index && (
                  <div className="ml-4">
                    {renderLinks(navItem.sublinks)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
};

export default SubNavbar;
