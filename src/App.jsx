import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import Results from './components/Results';
import ThemeToggle from './components/ThemeToggle';
import InfoSection from './components/InfoSection';
import { fetchAppPrivacy, addRecentSearch } from './services/api';
import './App.css';

function App() {
  const [theme, setTheme] = useState(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSearch = async (appName) => {
    setLoading(true);
    setResults(null);
    setActiveSection(null);
    
    try {
      const data = await fetchAppPrivacy(appName);
      setResults(data);
      addRecentSearch(appName);
    } catch (error) {
      setResults({
        error: true,
        message: "couldn't snitch on this one. try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const showSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="app">
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      
      <div className="container">
        <header className="header">
          <h1 className="title">Snitch</h1>
          <p className="subtitle">Find out what apps really collect</p>
        </header>

        <div className="nav-buttons">
          <button 
            className="about-toggle" 
            onClick={() => showSection('about')}
          >
            {activeSection === 'about' ? 'Back' : 'About'}
          </button>

          <button 
            className="about-toggle" 
            onClick={() => showSection('why')}
          >
            {activeSection === 'why' ? 'Back' : 'Why'}
          </button>

          <button 
            className="about-toggle" 
            onClick={() => showSection('support')}
          >
            {activeSection === 'support' ? 'Back' : 'Support'}
          </button>
        </div>

        {activeSection ? (
          <InfoSection type={activeSection} />
        ) : (
          <>
            <SearchBar onSearch={handleSearch} loading={loading} />
            
            {loading && (
              <div className="loading">
                snitching<span className="loading-dot"></span>
              </div>
            )}
            {results && <Results data={results} />}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
