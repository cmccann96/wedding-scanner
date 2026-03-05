import { useState } from 'react';
import type { SearchResult } from '../types';
import type { ScoreBreakdown } from '../utils/scoring';
import { scoreProduct, getScoreColor, getScoreLabel } from '../utils/scoring';
import ScoreModal from './ScoreModal';

interface Props {
  result: SearchResult;
}

interface ModalState {
  title: string;
  score: ScoreBreakdown;
}

export default function ResultsSection({ result }: Props) {
  const [modal, setModal] = useState<ModalState | null>(null);
  const { category, results } = result;

  const scored = results
    .map(p => ({ product: p, score: scoreProduct(p, results) }))
    .sort((a, b) => b.score.total - a.score.total);

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
        </div>
      </div>

      {scored.length === 0 ? (
        <p className="empty-state">No results found for "{category}"</p>
      ) : (
        <div className="product-grid">
          {scored.map(({ product: p, score }) => (
            <a
              key={p.id}
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
          ))}
        </div>
      )}
    </div>
  );
}
