import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Menu, X, Zap } from 'lucide-react';
import { subnav } from '../lib/RouterLink';

const SubNavbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileOpenDropdowns, setMobileOpenDropdowns] = useState(new Set());
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

  const toggleMobileDropdown = (dropdownId) => {
    const newOpenDropdowns = new Set(mobileOpenDropdowns);
    if (newOpenDropdowns.has(dropdownId)) {
      newOpenDropdowns.delete(dropdownId);
    } else {
      newOpenDropdowns.add(dropdownId);
    }
    setMobileOpenDropdowns(newOpenDropdowns);
  };

  const renderLinks = (links, depth = 0, isMobile = false, parentId = '') => {
    if (!links || !Array.isArray(links)) return null;

    const containerClass = isMobile
      ? 'ml-4 border-l border-gray-200'
      : `absolute ${depth === 0 ? 'top-full left-0' : 'top-0 left-full'} mt-1 w-max bg-white shadow-xl rounded-md border border-gray-200 z-[60]`;

    return (
      <div className={containerClass}>
        {links.map((link, index) => {
          const dropdownId = `${parentId}-${index}`;
          
          return (
            <div key={index} className="relative group">
              {link.sublinks ? (
                <>
                  {isMobile ? (
                    // Mobile: Make parent clickable and add toggle for sublinks
                    <div>
                      {link.href && link.href !== "#" && link.href !== "" ? (
                        <Link
                          to={link.href}
                          className="block px-3 py-2 text-gray-700 font-medium hover:bg-blue-100"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.title}
                        </Link>
                      ) : (
                        <div className="px-3 py-2 text-gray-700 font-medium">
                          {link.title}
                        </div>
                      )}
                      <button
                        onClick={() => toggleMobileDropdown(dropdownId)}
                        className="w-full text-left px-3 py-1 flex justify-between items-center text-gray-600 text-sm hover:bg-gray-50"
                      >
                        <span>View {link.title} Options</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${
                            mobileOpenDropdowns.has(dropdownId) ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {mobileOpenDropdowns.has(dropdownId) && (
                        <div className="ml-2">
                          {renderLinks(link.sublinks, depth + 1, isMobile, dropdownId)}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Desktop: Keep existing hover behavior
                    <div
                      className={`flex items-center justify-between px-3 py-2 text-gray-700 font-medium hover:bg-blue-100 ${
                        link.sublinks ? 'cursor-pointer' : ''
                      }`}
                    >
                      <span>{link.title}</span>
                      <ChevronRight className="w-3 h-3" />
                      {renderLinks(link.sublinks, depth + 1, isMobile, dropdownId)}
                    </div>
                  )}
                </>
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
          );
        })}
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
            {subnav.map((navItem, index) => {
              const mainDropdownId = `main-${index}`;
              
              return (
                <div key={index} className="border-b">
                  {navItem.sublinks ? (
                    <>
                      {/* If main nav item has its own href, make it clickable */}
                      {navItem.href && navItem.href !== "#" && navItem.href !== "" ? (
                        <Link
                          to={navItem.href}
                          className="block px-4 py-2 text-gray-800 font-medium hover:bg-blue-100"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setMobileOpenDropdowns(new Set());
                          }}
                        >
                          {navItem.title}
                        </Link>
                      ) : (
                        <div className="px-4 py-2 text-gray-800 font-medium">
                          {navItem.title}
                        </div>
                      )}
                      
                      {/* Toggle button for sublinks */}
                      <button
                        onClick={() => toggleMobileDropdown(mainDropdownId)}
                        className="w-full text-left px-4 py-2 flex justify-between items-center text-gray-600 hover:bg-blue-50"
                      >
                        <span>View {navItem.title} Options</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            mobileOpenDropdowns.has(mainDropdownId) ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      
                      {/* Sublinks */}
                      {mobileOpenDropdowns.has(mainDropdownId) && (
                        <div className="ml-4">
                          {renderLinks(navItem.sublinks, 0, true, mainDropdownId)}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={navItem.href}
                      className="block px-4 py-2 text-gray-800 font-medium hover:bg-blue-100"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setMobileOpenDropdowns(new Set());
                      }}
                    >
                      {navItem.title}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </nav>
    </div>
  );
};

export default SubNavbar;