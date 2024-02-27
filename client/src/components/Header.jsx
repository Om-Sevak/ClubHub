
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass, faHouse, faPeopleGroup, faCalendarDays, faUsersViewfinder } from "@fortawesome/free-solid-svg-icons"
import { Tooltip } from 'react-tooltip';
import { useEffect, useState, useRef } from "react";
import logoSmall from '../assets/logoSmall.jpeg'
import './Header.css'
import SearchBar from './SearchBar';
import { SearchResultsList } from "./SearchResultList";
import { useNavigate } from 'react-router-dom';

const Header = () => {

  const [results, setResults] = useState([]);
  const [viewResults, setViewResults] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  const wrapperRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setViewResults(false);
      }
      else {
        setViewResults(true);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  const handleHomeClick = () => {
    navigate(`/`);
  };

  const handleClubsClick = () => {
    navigate(`/clubs`);
  };

  const handleEventsClick = () => {
    navigate(`/events`);
  };

  const handleFindClubsClick = () => {
    navigate(`/findClub`);
  };

  const handleLoginClick = () => {
    navigate(`/login`);
  };

  return (
    <header className="header">
      <div className="header-left-section">
        <img src={logoSmall} alt="Company Logo" className="header-logo" />
        <div className="header-icon">
          <button className="header-nav-button"
            data-tooltip-id="header-home-page-tooltip"
            data-tooltip-content="Home Page"
            onClick={handleHomeClick}>
            <FontAwesomeIcon icon={faHouse} />
          </button>
          <Tooltip id="header-home-page-tooltip" className="header-tooltip-style" />
        </div>
        <div className="header-icon">
          <button className="header-nav-button" 
            data-tooltip-id="header-club-page-tooltip"
            data-tooltip-content="Clubs"
            onClick={handleClubsClick}>
            <FontAwesomeIcon icon={faPeopleGroup} />
          </button>
          <Tooltip id="header-club-page-tooltip" className="header-tooltip-style" />
        </div>
        <div className="header-icon">
          <button className="header-nav-button" 
            data-tooltip-id="header-event-page-tooltip"
            data-tooltip-content="Events"
            onClick={handleEventsClick}>
            <FontAwesomeIcon icon={faCalendarDays} />
          </button>
          <Tooltip id="header-event-page-tooltip" className="header-tooltip-style" />
        </div>
        <div className="header-icon">
          <button className="header-nav-button"
            data-tooltip-id="header-find-page-tooltip"
            data-tooltip-content="Find a Club"
            onClick={handleFindClubsClick}>
            <FontAwesomeIcon icon={faUsersViewfinder} />
          </button>
          <Tooltip id="header-find-page-tooltip" className="header-tooltip-style" />
        </div>
      </div>
      <div className="header-middle-section" ref={wrapperRef}>
        <div className="header-search-bar" >
          <SearchBar setResults={setResults}/>
        </div>
        {results && results.length > 0 && viewResults && <SearchResultsList results={results} />}
      </div>
      <div className="header-right-section">
        <button className="header-login-button" onClick={handleLoginClick}>Login</button>
      </div>
    </header>
  );
};


export default Header;