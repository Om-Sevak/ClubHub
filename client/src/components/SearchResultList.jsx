import "./SearchResultList.css";
import { SearchResult } from "./SearchResult";

export const SearchResultsList = ({ results }) => {
  return (
    <div className="search-results-container">
      <div className="search-results-list">
        {results.map((result, id) => {
          return <SearchResult result={result} key={id} />;
        })}
      </div>
    </div>
  );
};  