import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchSaved, unsaveItem } from '../api/auth';
import { scoreProduct, getScoreColor, getScoreLabel } from '../utils/scoring';
import { searchAllCategories } from '../api/search';
import CategoryInput from '../components/CategoryInput';
import ResultsSection from '../components/ResultsSection';
import SkeletonCard from '../components/SkeletonCard';
import type { SearchResult } from '../types';
import type { Product } from '../types';

type Tab = 'scanner' | 'dashboard' | 'strava';

export default function MainApp() {
  const { username, token, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('scanner');

  // Scanner state
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedCategories, setSearchedCategories] = useState<string[]>([]);

  // Dashboard state
  const [saved, setSaved] = useState<Product[]>([]);
  const [dashLoading, setDashLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'alibaba' | 'aliexpress'>('all');
  const [sort, setSort] = useState<'saved' | 'score' | 'price-asc' | 'price-desc'>('saved');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
  }, [token, navigate]);

  const [dashError, setDashError] = useState<string | null>(null);

  useEffect(() => {
    if (tab === 'dashboard' && token) {
      setDashLoading(true);
      setDashError(null);
      fetchSaved(token)
        .then(data => { setSaved(data); setDashLoading(false); })
        .catch(() => { setDashError('Failed to load saved items. Please try again.'); setDashLoading(false); });
    }
  }, [tab, token]);

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
    }
  };

  const handleSaveChange = () => {
    if (tab === 'dashboard' && token) {
      fetchSaved(token).then(setSaved);
    }
  };

  const handleRemove = async (id: string) => {
    if (!token) return;
    await unsaveItem(token, id);
    setSaved(prev => prev.filter(p => p.id !== id));
  };

  const filteredSaved = saved.filter(p => filter === 'all' || p.platform === filter);
  const sortedSaved = [...filteredSaved].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'score') return scoreProduct(b, saved).total - scoreProduct(a, saved).total;
    return 0;
  });

  const alibabaCount = saved.filter(p => p.platform === 'alibaba').length;
  const aliexpressCount = saved.filter(p => p.platform === 'aliexpress').length;
  const avgScore = saved.length
    ? Math.round(saved.reduce((sum, p) => sum + scoreProduct(p, saved).total, 0) / saved.length)
    : 0;
  const totalEstimate = saved.reduce((sum, p) => sum + (p.price > 0 ? p.price : 0), 0);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div>
            <h1>CampCrowland AI Super Bot</h1>
            <p>Super Smart AI Bot for the big Campcrowland Day</p>
          </div>
          <div className="header-actions">
            <span className="user-email">👤 {username}</span>
            <button className="saved-header-btn logout-btn" onClick={() => { logout(); navigate('/login'); }}>
              Sign Out
            </button>
          </div>
        </div>
        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'scanner' ? 'active' : ''}`} onClick={() => setTab('scanner')}>
            🔍 Scanner
          </button>
          <button className={`tab-btn ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>
            🏠 My Dashboard {saved.length > 0 && tab !== 'dashboard' && <span className="tab-badge">{saved.length}</span>}
          </button>
          <button className={`tab-btn ${tab === 'strava' ? 'active' : ''}`} onClick={() => setTab('strava')}>
            🏃 Liam's Strava Tracker
          </button>
        </div>
      </header>

      <main className="app-main">
        {tab === 'scanner' && (
          <>
            <CategoryInput onSearch={handleSearch} />
            {error && <p className="status-msg error">{error}</p>}
            {loading && (
              <div className="loading-section">
                <p className="status-msg">🔍 Scanning Alibaba &amp; AliExpress for {searchedCategories.join(', ')}...</p>
                {searchedCategories.map(cat => (
                  <div key={cat} className="results-section">
                    <div className="results-header"><h2>{cat}</h2></div>
                    <div className="product-grid">
                      {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loading && results.map(r => (
              <ResultsSection key={r.category} result={r} onSaveChange={handleSaveChange} />
            ))}
          </>
        )}

        {tab === 'dashboard' && (
          <>
            <div className="dashboard-stats">
              <div className="stat-card">
                <span className="stat-num">{saved.length}</span>
                <span className="stat-label">Total Saved</span>
              </div>
              <div className="stat-card">
                <span className="stat-num">{alibabaCount}</span>
                <span className="stat-label">Alibaba</span>
              </div>
              <div className="stat-card">
                <span className="stat-num">{aliexpressCount}</span>
                <span className="stat-label">AliExpress</span>
              </div>
              <div className="stat-card">
                <span className="stat-num" style={{ color: getScoreColor(avgScore) }}>{avgScore}</span>
                <span className="stat-label">Avg Score</span>
              </div>
              <div className="stat-card">
                <span className="stat-num">${totalEstimate.toFixed(0)}</span>
                <span className="stat-label">Total Estimate</span>
              </div>
            </div>

            {dashLoading ? (
              <p className="status-msg">Loading saved items…</p>
            ) : dashError ? (
              <p className="status-msg" style={{ color: 'red' }}>{dashError}</p>
            ) : saved.length === 0 ? (
              <div className="empty-dashboard">
                <p>No saved items yet.</p>
                <button className="auth-btn" style={{ marginTop: 16 }} onClick={() => setTab('scanner')}>
                  Start Searching
                </button>
              </div>
            ) : (
              <>
                <div className="dashboard-controls">
                  <div className="filter-pills">
                    {(['all', 'alibaba', 'aliexpress'] as const).map(p => (
                      <button key={p} className={`pill ${filter === p ? 'active' : ''}`} onClick={() => setFilter(p)}>
                        {p === 'all' ? 'All' : p === 'alibaba' ? 'Alibaba' : 'AliExpress'}
                      </button>
                    ))}
                  </div>
                  <select className="sort-select" value={sort} onChange={e => setSort(e.target.value as typeof sort)}>
                    <option value="saved">Recently Saved</option>
                    <option value="score">Best Score</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
                <div className="product-grid">
                  {sortedSaved.map(p => {
                    const score = scoreProduct(p, saved);
                    return (
                      <div key={p.id} className="product-card-wrap">
                        <a href={p.productUrl} target="_blank" rel="noreferrer" className="product-card">
                          <div className="product-img-wrap">
                            <img src={p.imageUrl} alt={p.title} />
                            <div className="score-badge" style={{ backgroundColor: getScoreColor(score.total) }}>
                              {score.total}
                              <span className="score-label">{getScoreLabel(score.total)}</span>
                            </div>
                          </div>
                          <div className="product-info">
                            <span className={`platform-badge ${p.platform}`}>
                              {p.platform === 'alibaba' ? 'Alibaba' : 'AliExpress'}
                            </span>
                            <p className="product-title">{p.title}</p>
                            <p className="product-price">
                              ${p.price.toFixed(2)}
                              {p.platform === 'alibaba' && p.minOrderQty > 1
                                ? <span className="moq-tag"> · MOQ {p.minOrderQty}</span>
                                : null}
                            </p>
                            <div className="product-meta">
                              {p.rating > 0 && <span>⭐ {p.rating.toFixed(1)}</span>}
                              {p.platform === 'alibaba' && p.sellerVerified && <span className="verified">✓ Verified</span>}
                            </div>
                          </div>
                        </a>
                        <button className="remove-saved-btn" onClick={() => handleRemove(p.id)}>
                          🗑 Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
        {tab === 'strava' && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🏃</div>
            <h2 style={{ color: '#1b3a2d', fontSize: '1.6rem', marginBottom: '8px' }}>Liam's Strava Tracker</h2>
            <p style={{ color: '#4a9e6b', fontSize: '1.1rem', fontWeight: 600 }}>Update coming soon — he's very fast 🏃</p>
          </div>
        )}
      </main>
    </div>
  );
}
