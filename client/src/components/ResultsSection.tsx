import type { SearchResult } from '../types';
import { scoreProduct, getScoreColor, getScoreLabel } from '../utils/scoring';

interface Props {
  result: SearchResult;
}

export default function ResultsSection({ result }: Props) {
  const { category, results } = result;

  // Score and sort all products best first
  const scored = results
    .map(p => ({ product: p, score: scoreProduct(p, results) }))
    .sort((a, b) => b.score.total - a.score.total);

  const aliexpressCount = results.filter(p => p.platform === 'aliexpress').length;
  const alibabaCount = results.filter(p => p.platform === 'alibaba').length;

  return (
    <div className="results-section">
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
                <div
                  className="score-badge"
                  style={{ backgroundColor: getScoreColor(score.total) }}
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
