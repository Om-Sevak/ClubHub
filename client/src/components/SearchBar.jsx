import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import './SearchBar.css'

const SearchBar = ({ setResults }) => {
    const [searchQuery, setSearchQuery] = useState('');
  
    const fetchData = (value) => {
        const data = ['test','Role Testing','EyalTest','123'];

        
        const fileted = data.filter((element) => element.toString().toLowerCase().includes(value.toString().toLowerCase()));
        setResults(fileted);
    }
    
    const handleSearchChange = (e) => {
      setSearchQuery(e.target.value);
      if(e.target.value) {
        fetchData(e.target.value);
      } else {
        setResults([]);
      }
      
    };
  
    const handleSearchSubmit = (e) => {
      e.preventDefault();
    };
  
    return (
      <form className="search" autoComplete='off' onSubmit={handleSearchSubmit}>
        <div className="header-search-icon">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </div>
        <input
          className="search-input"
          type="text"
          id="search"
          autoComplete='off'
          placeholder="Find Clubs..."
          onChange={handleSearchChange}
        />
      </form>
    )
  };

  export default SearchBar;