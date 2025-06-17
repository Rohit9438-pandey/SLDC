import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../Hoc/LanguageContext";
import { Menu, X } from "lucide-react";

const Header = () => {
  const { language, toggleLanguage, translations } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="header">
      <nav className="navbar">
        <div className="logo">
          
        </div>

        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <ul className={`nav-list ${isMobileMenuOpen ? "open" : ""}`}>
          <li className="nav-item">
            <Link className="nav-link" to="/" onClick={() => setIsMobileMenuOpen(false)}>
              {translations.home}
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/about" onClick={() => setIsMobileMenuOpen(false)}>
              {translations.about}
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
              {translations.contact}
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/meetings" onClick={() => setIsMobileMenuOpen(false)}>
              {translations.meetings}
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/feedback" onClick={() => setIsMobileMenuOpen(false)}>
              {translations.feedback}
            </Link>
          </li>
          <li className="nav-item">
            <button onClick={toggleLanguage} className="language-toggle">
              {language === "en"
                ? translations.switchToHindi
                : translations.switchToEnglish}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
