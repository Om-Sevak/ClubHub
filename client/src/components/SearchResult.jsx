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