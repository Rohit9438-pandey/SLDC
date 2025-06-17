import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../Hoc/LanguageContext';

const Footer = () => {
  const { translations } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Contact Us Section */}
        <div className="footer-section contact-info">
          <h3>{translations.contactUs}</h3>
          <ul>
            <li>
              <div className="footer-icon-text">
                <i className="fas fa-map-marker-alt"></i>
                <span>{translations.sldcAddress}</span>
              </div>
            </li>
            <li>
              <div className="footer-icon-text">
                <i className="fas fa-envelope"></i>
                <a href="mailto:info@uksldc.in">{translations.email}</a>
              </div>
            </li>
            <li>
              <div className="footer-icon-text">
                <i className="fas fa-phone"></i>
                <a href="tel:+91352645768">{translations.phone}</a>
              </div>
            </li>
          </ul>
        </div>

        {/* About Us Section */}
        <div className="footer-section about-links">
          <h3>{translations.aboutUs}</h3>
          <ul>
            <li><Link to="/about-us">{translations.profile}</Link></li>
            <li><Link to="/about-us">{translations.missionAndVision}</Link></li>
            <li><Link to="/about-us">{translations.evolution}</Link></li>
            <li><Link to="/about-us">{translations.functions}</Link></li>
            <li><Link to="/about-us">{translations.orgChart}</Link></li>
            <li><Link to="/about-us">{translations.sldcOfficials}</Link></li>
          </ul>
        </div>

        {/* Quick Links Section */}
        <div className="footer-section quick-links">
          <h3>{translations.quickLinks}</h3>
          <ul>
            <li><Link to="/acts">{translations.acts}</Link></li>
            <li><Link to="/system-availability">{translations.systemAvailability}</Link></li>
            <li><Link to="/load-forecast">{translations.loadForecast}</Link></li>
            <li><Link to="/downloads">{translations.downloads}</Link></li>
            <li><Link to="/registration">{translations.registration}</Link></li>
            <li><Link to="/important-regulations">{translations.importantRegulations}</Link></li>
          </ul>
        </div>

        {/* Web Policies Section */}
        <div className="footer-section web-policies">
          <h3>{translations.webPolicies}</h3>
          <ul>
            <li><Link to="/privacy-policy">{translations.privacyPolicy}</Link></li>
            <li><Link to="/hyperlink-policy">{translations.hyperlinkPolicy}</Link></li>
            <li><Link to="/copyright-policy">{translations.copyrightPolicy}</Link></li>
            <li><Link to="/terms-conditions">{translations.termsConditions}</Link></li>
            <li><Link to="/accessibility">{translations.accessibilityStatement}</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 SLDC, New Delhi. {translations.allRightsReserved}</p>
      </div>
    </footer>
  );
};

export default Footer;