/*********************************************************************************
  FileName: SearchResult.jsx
  FileVersion: 1.0
  Core Feature(s): Displaying search results and navigation
  Purpose: This component represents a single search result item and handles navigation to the corresponding club page.
*********************************************************************************/

import "./SearchResult.css";
import { useNavigate } from 'react-router-dom';

export const SearchResult = ({ result }) => {
    
  const handleResultClick = () => {
    navigate(`/club/${result}`)
    window.location.reload();
  }
  
  const navigate = useNavigate();
    return (
    <div
      className="search-result"
      onClick={handleResultClick}
    >
      {result}
    </div>
  );
};