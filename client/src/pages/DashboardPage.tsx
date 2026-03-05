import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchSaved, unsaveItem } from '../api/auth';
import { scoreProduct, getScoreColor, getScoreLabel } from '../utils/scoring';
import type { Product } from '../types';

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'alibaba' | 'aliexpress'>('all');
  const [sort, setSort] = useState<'saved' | 'score' | 'price-asc' | 'price-desc'>('saved');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchSaved(token).then(data => { setSaved(data); setLoading(false); });
  }, [token, navigate]);

  const handleRemove = async (id: string) => {
    if (!token) return;
    await unsaveItem(token, id);
    setSaved(prev => prev.filter(p => p.id !== id));
  };

  const filtered = saved.filter(p => filter === 'all' || p.platform === filter);

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'score') return scoreProduct(b, saved).total - scoreProduct(a, saved).total;
    return 0; // saved order (newest first from API)
  });

  const alibabaCount = saved.filter(p => p.platform === 'alibaba').length;
  const aliexpressCount = saved.filter(p => p.platform === 'aliexpress').length;
  const avgScore = saved.length
    ? Math.round(saved.reduce((sum, p) => sum + scoreProduct(p, saved).total, 0) / saved.length)
    : 0;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div>
            <h1>💍 Wedding Scanner</h1>
            <p>My Saved Items Dashboard</p>
          </div>
          <div className="header-actions">
            <span className="user-email">👤 {user?.email}</span>
            <button className="saved-header-btn" onClick={() => navigate('/')}>🔍 Search</button>
            <button className="saved-header-btn logout-btn" onClick={() => { logout(); navigate('/login'); }}>Sign Out</button>
          </div>
        </div>
      </header>

      <main className="app-main">
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
        </div>

        {loading ? (
          <p className="status-msg">Loading your saved items…</p>
        ) : saved.length === 0 ? (
          <div className="empty-dashboard">
            <p>You haven't saved any products yet.</p>
            <button className="auth-btn" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
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
              {sorted.map(p => {
                const score = scoreProduct(p, saved);
                return (
                  <div key={p.id} className="product-card-wrap">
                    <a href={p.productUrl} target="_blank" rel="noreferrer" className="product-card">
                      <div className="product-img-wrap">
                        <img src={p.imageUrl} alt={p.title} />
                        <div
                          className="score-badge"
                          style={{ backgroundColor: getScoreColor(score.total) }}
                          title={getScoreLabel(score.total)}
                        >
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
                    <button
                      className="remove-saved-btn"
                      onClick={() => handleRemove(p.id)}
                      title="Remove from saved"
                    >
                      🗑 Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
