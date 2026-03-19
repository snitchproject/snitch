import { useState, useEffect } from 'react';
import { getRecentSearches } from '../services/api';
import { POPULAR_APPS } from '../utils/constants';
import './SearchBar.css';

function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        document.querySelector('.search-input')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (app) => {
    setQuery(app);
    setShowSuggestions(false);
    onSearch(app);
  };

  const clearQuery = () => {
    setQuery('');
    setShowSuggestions(false);
  };

  const suggestions = query.length > 0
    ? [...recentSearches, ...POPULAR_APPS]
        .filter(app => app.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
    : recentSearches.slice(0, 5);

  return (
    <div className="search-container">
      <form className="search-bar" onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Type an app name... (press / to focus)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            disabled={loading}
          />
          {query && (
            <button
              type="button"
              className="clear-button"
              onClick={clearQuery}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <button type="submit" className="search-button" disabled={loading || !query.trim()}>
          {loading ? 'Snitching...' : 'Snitch'}
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((app, index) => (
            <button
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(app)}
            >
              {app}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
