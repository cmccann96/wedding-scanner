import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import CategoryInput from './components/CategoryInput';
import ResultsSection from './components/ResultsSection';
import SkeletonCard from './components/SkeletonCard';
import SavedDrawer from './components/SavedDrawer';
import { searchAllCategories } from './api/search';
import { useAuth } from './context/AuthContext';
import type { SearchResult } from './types';
import { getSaved } from './utils/saved';

function App() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedCategories, setSearchedCategories] = useState<string[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [savedCount, setSavedCount] = useState(() => getSaved().length);

  const handleSearch = async (categories: string[]) => {
    setLoading(true);
    setError(null);
    setResults([]);
    setSearchedCategories(categories);
    try {
      const data = await searchAllCategories(categories);
      setResults(data);
    } catch (err) {
      setError('Search failed. Make sure the server is running.');
      console.error(err);
    } finally {
      setLoading(false);
      setSavedCount(getSaved().length);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div>
            <h1>💍 Wedding Scanner</h1>
            <p>Find the best deals on Alibaba &amp; AliExpress for your big day</p>
          </div>
          <div className="header-actions">
            {username ? (
              <>
                <span className="user-email">👤 {username}</span>
                <button className="saved-header-btn logout-btn" onClick={() => { logout(); }}>Sign Out</button>
              </>
            ) : (
              <button className="saved-header-btn" onClick={() => navigate('/login')}>Sign In</button>
            )}
            <button className="saved-header-btn" onClick={() => setShowSaved(true)}>
              🔖 Saved {savedCount > 0 && <span className="saved-count-badge">{savedCount}</span>}
            </button>
          </div>
        </div>
      </header>
      <main className="app-main">
        <CategoryInput onSearch={handleSearch} />

        {error && <p className="status-msg error">{error}</p>}

        {loading && (
          <div className="loading-section">
            <p className="status-msg">🔍 Scanning Alibaba &amp; AliExpress for {searchedCategories.join(', ')}...</p>
            {searchedCategories.map(cat => (
              <div key={cat} className="results-section">
                <div className="results-header">
                  <h2>{cat}</h2>
                </div>
                <div className="product-grid">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && results.map(r => (
          <ResultsSection key={r.category} result={r} onSaveChange={() => setSavedCount(getSaved().length)} />
        ))}
      </main>

      {showSaved && <SavedDrawer onClose={() => setShowSaved(false)} />}
    </div>
  );
}

export default App;
