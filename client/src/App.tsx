import { useState } from 'react';
import './App.css';
import CategoryInput from './components/CategoryInput';
import { searchAllCategories } from './api/search';
import { SearchResult } from './types';

function App() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (categories: string[]) => {
    setLoading(true);
    setError(null);
    setResults([]);
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>💍 Wedding Scanner</h1>
        <p>Find the best deals on Alibaba &amp; AliExpress for your big day</p>
      </header>
      <main className="app-main">
        <CategoryInput onSearch={handleSearch} />
        {loading && <p className="status-msg">🔍 Scanning AliExpress...</p>}
        {error && <p className="status-msg error">{error}</p>}
        {results.map((r) => (
          <div key={r.category} className="results-section">
            <h2>{r.category} <span className="result-count">({r.results.length} found)</span></h2>
            <div className="product-grid">
              {r.results.map((p) => (
                <a key={p.id} href={p.productUrl} target="_blank" rel="noreferrer" className="product-card">
                  <img src={p.imageUrl} alt={p.title} />
                  <div className="product-info">
                    <p className="product-title">{p.title}</p>
                    <p className="product-price">${p.price.toFixed(2)}</p>
                    <p className="product-meta">⭐ {p.rating} · {p.orderCount} orders</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
