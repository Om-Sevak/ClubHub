
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faHouse, faPeopleGroup, faCalendarDays, faUsersViewfinder } from "@fortawesome/free-solid-svg-icons"
import { Tooltip } from 'react-tooltip';
import { useEffect, useState, useRef } from "react";
import logoSmall from '../assets/logoSmall.jpeg'
import './Header.css'
import SearchBar from './SearchBar';
import { SearchResultsList } from "./SearchResultList";
import { useNavigate } from 'react-router-dom';
import authApi from "../api/auth";

const Header = () => {

  const [results, setResults] = useState([]);
  const [viewResults, setViewResults] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  const wrapperRef = useRef(null);
  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const { status: reqStatus, data: reqData } = await authApi.loginStatus();
        if (reqStatus === 200) {
          setLoggedIn(reqData.loggedInStatus);
        }
        else {
          throw new Error("Server Error");
        }
      }
      catch (error) {
        console.error('Auth Error', error);
      }
    };
   

    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setViewResults(false);
      }
      else {
        setViewResults(true);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    
    fetchClubData();
    
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const createClubClick = () => {
    navigate(`/createClub`);
  };

  const handleLoginLogoutClick = async () => {
    const { status: reqStatusLogin, data: loginData } = await authApi.loginStatus();
    if (reqStatusLogin === 200) {
      if(loginData.loggedInStatus) {
        const { status: reqStatusLogout } = await authApi.logout();
        if (reqStatusLogout === 200) {
          setLoggedIn(false);
        }
      }
      else {
        navigate(`/login`);
      }
    } else {
      console.error("There was an authentication error on the server!")
    }
    
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
        { loggedIn &&
          <div className="header-icon">
            <button className="header-nav-button"
              data-tooltip-id="header-find-page-tooltip"
              data-tooltip-content="Create a Club"
              onClick={createClubClick}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <Tooltip id="header-find-page-tooltip" className="header-tooltip-style" />
          </div>
        }
      </div>
      <div className="header-middle-section" ref={wrapperRef}>
        <div className="header-search-bar" >
          <SearchBar setResults={setResults}/>
        </div>
        {results && results.length > 0 && viewResults && <SearchResultsList results={results} />}
      </div>
      <div className="header-right-section">
        <button className="header-login-button" onClick={handleLoginLogoutClick}>{loggedIn ? 'Logout' : 'Login'}</button>
      </div>
    </header>
  );
};


export default Header;