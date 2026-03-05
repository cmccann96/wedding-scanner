import { useState } from 'react';
import type { SearchResult } from '../types';
import type { ScoreBreakdown } from '../utils/scoring';
import type { Filters } from '../types/filters';
import { scoreProduct, getScoreColor, getScoreLabel } from '../utils/scoring';
import { saveProduct, unsaveProduct, isSaved } from '../utils/saved';
import ScoreModal from './ScoreModal';
import FilterBar from './FilterBar';
import ComparePanel from './ComparePanel';
import { DEFAULT_FILTERS } from '../types/filters';

interface Props {
  result: SearchResult;
  onSaveChange: () => void;
}

interface ModalState {
  title: string;
  score: ScoreBreakdown;
}

interface CompareItem {
  product: import('../types').Product;
  score: ScoreBreakdown;
}

export default function ResultsSection({ result, onSaveChange }: Props) {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    const saved = results.map(p => p.id).filter(id => isSaved(id));
    return new Set(saved);
  });
  const { category, results } = result;

  const scored = results.map(p => ({ product: p, score: scoreProduct(p, results) }));

  const filtered = scored.filter(({ product: p, score }) => {
    if (filters.platform !== 'both' && p.platform !== filters.platform) return false;
    if (score.total < filters.minScore) return false;
    if (p.price > 0 && p.price > filters.maxPrice) return false;
    if (p.minOrderQty > filters.maxMoq) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (filters.sort) {
      case 'price-asc': return a.product.price - b.product.price;
      case 'price-desc': return b.product.price - a.product.price;
      case 'orders': return b.product.orderCount - a.product.orderCount;
      case 'delivery': return (a.product.deliveryDays ?? 999) - (b.product.deliveryDays ?? 999);
      default: return b.score.total - a.score.total;
    }
  });

  const toggleSave = (product: import('../types').Product) => {
    if (savedIds.has(product.id)) {
      unsaveProduct(product.id);
      setSavedIds(prev => { const s = new Set(prev); s.delete(product.id); return s; });
    } else {
      saveProduct(product);
      setSavedIds(prev => new Set([...prev, product.id]));
    }
    onSaveChange();
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const compareItems: CompareItem[] = compareIds
    .map(id => scored.find(s => s.product.id === id))
    .filter(Boolean) as CompareItem[];

  const aliexpressCount = results.filter(p => p.platform === 'aliexpress').length;
  const alibabaCount = results.filter(p => p.platform === 'alibaba').length;

  return (
    <div className="results-section">
      {modal && (
        <ScoreModal
          productTitle={modal.title}
          score={modal.score}
          onClose={() => setModal(null)}
        />
      )}

      <div className="results-header">
        <h2>{category}</h2>
        <div className="results-meta">
          <span className="platform-count aliexpress">{aliexpressCount} AliExpress</span>
          <span className="platform-count alibaba">{alibabaCount} Alibaba</span>
          {compareIds.length > 0 && (
            <button className="compare-trigger" onClick={() => setShowCompare(true)}>
              🔀 Compare ({compareIds.length})
            </button>
          )}
        </div>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {showCompare && compareItems.length > 0 && (
        <ComparePanel
          items={compareItems}
          onRemove={id => setCompareIds(prev => prev.filter(x => x !== id))}
          onClose={() => setShowCompare(false)}
        />
      )}

      {sorted.length === 0 ? (
        <p className="empty-state">No results match your filters for "{category}"</p>
      ) : (
        <>
          {compareIds.length < 3 && (
            <p className="compare-hint">☑ Select up to 3 products to compare</p>
          )}
          <div className="product-grid">
            {sorted.map(({ product: p, score }) => {
              const isSelected = compareIds.includes(p.id);
              return (
                <div key={p.id} className={`product-card-wrap ${isSelected ? 'selected' : ''}`}>
                  <label className="compare-checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCompare(p.id)}
                      disabled={!isSelected && compareIds.length >= 3}
                    />
                    Compare
                  </label>
                  <a
                    href={p.productUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="product-card"
                  >
                    <div className="product-img-wrap">
                      <img src={p.imageUrl} alt={p.title} />
                      <button
                        className="score-badge"
                        style={{ backgroundColor: getScoreColor(score.total) }}
                        onClick={e => {
                          e.preventDefault();
                          setModal({ title: p.title, score });
                        }}
                        title="Click to see score breakdown"
                      >
                        {score.total}
                        <span className="score-label">{getScoreLabel(score.total)}</span>
                      </button>
                      <button
                        className={`save-btn ${savedIds.has(p.id) ? 'saved' : ''}`}
                        onClick={e => { e.preventDefault(); toggleSave(p); }}
                        title={savedIds.has(p.id) ? 'Remove bookmark' : 'Save product'}
                      >
                        {savedIds.has(p.id) ? '🔖' : '🏷'}
                      </button>
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
                        {p.platform === 'aliexpress' && p.orderCount > 0 && (
                          <span>{p.orderCount.toLocaleString()} orders</span>
                        )}
                        {p.platform === 'alibaba' && p.sellerVerified && (
                          <span className="verified">✓ Verified</span>
                        )}
                        {p.platform === 'alibaba' && p.sellerYears ? (
                          <span>{p.sellerYears}yr seller</span>
                        ) : null}
                      </div>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
