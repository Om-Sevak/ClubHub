/*********************************************************************************
  FileName: SearchResultList.jsx
  FileVersion: 1.0
  Core Feature(s): Displaying a list of search results
  Purpose: This component renders a list of search results using the SearchResult component.
*********************************************************************************/

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