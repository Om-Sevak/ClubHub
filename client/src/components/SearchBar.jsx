import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import clubApi from "../api/clubs";
import './SearchBar.css'

const SearchBar = ({ setResults }) => {
  
    const fetchData = async (value) => {
        const { status: reqStatus, data: clubsData } = await clubApi.getClubs(value.toString().toLowerCase());
        if (reqStatus === 200) {
            setResults(clubsData.names);
        }
        else {
            setResults([]);
        }  
    }
    
    const handleSearchChange = (e) => {
      if(e.target.value && e.target.value.length > 2) {
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