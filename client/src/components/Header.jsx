
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass, faHouse, faPeopleGroup, faCalendarDays, faUsersViewfinder } from "@fortawesome/free-solid-svg-icons"
import { Tooltip } from 'react-tooltip';
import { useEffect, useState } from "react";
import logoSmall from '../assets/logoSmall.jpeg'
import './Header.css'

const SearchBar = ({ posts, setSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = () => {
    // Add your logic for handling the search query here
    console.log('Search Query:', searchQuery);
  };

  return (
    <form className="search" onSubmit={handleSearchSubmit}>
      <div className="header-search-icon">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </div>
      <input
        className="search__input"
        type="text"
        id="search"
        onChange={handleSearchChange}
      />
    </form>
  )
};


const Header = () => {
  return (

    <header className="header">
      <div className="header-left-section">
        <img src={logoSmall} alt="Company Logo" className="header-logo" />
        <div className="header-icon">
          <button className="header-nav-button"
            data-tooltip-id="header-home-page-tooltip"
            data-tooltip-content="Home Page">
            <FontAwesomeIcon icon={faHouse} />
          </button>
          <Tooltip id="header-home-page-tooltip" className="header-tooltip-style" />
        </div>
        <div className="header-icon">
          <button className="header-nav-button" 
            data-tooltip-id="header-club-page-tooltip"
            data-tooltip-content="Clubs">
            <FontAwesomeIcon icon={faPeopleGroup} />
          </button>
          <Tooltip id="header-club-page-tooltip" className="header-tooltip-style" />
        </div>
        <div className="header-icon">
          <button className="header-nav-button" 
            data-tooltip-id="header-event-page-tooltip"
            data-tooltip-content="Events">
            <FontAwesomeIcon icon={faCalendarDays} />
          </button>
          <Tooltip id="header-event-page-tooltip" className="header-tooltip-style" />
        </div>
        <div className="header-icon">
          <button className="header-nav-button"
           data-tooltip-id="header-find-page-tooltip"
           data-tooltip-content="Find a Club">
            <FontAwesomeIcon icon={faUsersViewfinder} />
          </button>
          <Tooltip id="header-find-page-tooltip" className="header-tooltip-style" />
        </div>
      </div>
      <div className="header-middle-section">
        <SearchBar />
      </div>
      <div className="header-right-section">
        <button className="header-login-button">Login</button>
      </div>
    </header>
  );
};


export default Header;