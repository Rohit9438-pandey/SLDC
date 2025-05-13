 import { Link } from "react-router-dom";
 import { useLanguage } from '../Hoc/LanguageContext';

const Header = ()=> {
  const { language, toggleLanguage, translations } = useLanguage();
  return (
    <header className="header">
      <nav className="navbar">
        <ul className="nav-list">
          <li className="nav-item">
            <Link className="nav-link" to="/">{translations.home}</Link> {/* Dynamic text based on language */}
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/about">{translations.about}</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/contact">{translations.contact}</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/meetings">{translations.meetings}</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/feedback">{translations.feedback}</Link>
          </li>
        </ul>
        <button onClick={toggleLanguage}>
          {language === 'en' ? translations.switchToHindi : translations.switchToEnglish} {/* Toggle button */}
        </button>
      </nav>
    </header>
)};
export default Header;
