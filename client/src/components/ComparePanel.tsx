import type { Product } from '../types';
import type { ScoreBreakdown } from '../utils/scoring';
import { getScoreColor, getScoreLabel } from '../utils/scoring';

interface CompareItem {
  product: Product;
  score: ScoreBreakdown;
}

interface Props {
  items: CompareItem[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

const ROWS = [
  { label: 'Score',         render: (_p: Product, s: ScoreBreakdown) => (
      <span style={{ color: getScoreColor(s.total), fontWeight: 700 }}>
        {s.total} — {getScoreLabel(s.total)}
      </span>
    )
  },
  { label: 'Platform',      render: (_p: Product) => _p.platform === 'alibaba' ? 'Alibaba' : 'AliExpress' },
  { label: 'Price',         render: (p: Product) => `$${p.price.toFixed(2)}` },
  { label: 'Min. Order',    render: (p: Product) => p.minOrderQty === 1 ? '1 (no MOQ)' : `${p.minOrderQty} units` },
  { label: 'Rating',        render: (p: Product) => p.rating > 0 ? `⭐ ${p.rating.toFixed(1)} / 5` : 'N/A' },
  { label: 'Orders',        render: (p: Product) => p.platform === 'aliexpress' ? p.orderCount.toLocaleString() : 'N/A' },
  { label: 'Shipping',      render: (p: Product) => p.shippingCost === 0 ? 'Free' : `$${p.shippingCost.toFixed(2)}` },
  { label: 'Delivery',      render: (p: Product) => p.deliveryDays ? `~${p.deliveryDays} days` : 'Unknown' },
  { label: 'Verified',      render: (p: Product) => p.sellerVerified ? '✅ Yes' : '—' },
  { label: 'Seller',        render: (p: Product) => p.sellerName },
] as const;

export default function ComparePanel({ items, onRemove, onClose }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="compare-panel">
      <div className="compare-header">
        <h3>🔀 Comparing {items.length} product{items.length > 1 ? 's' : ''}</h3>
        <button className="compare-close" onClick={onClose}>✕ Close</button>
      </div>

      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="compare-row-label" />
              {items.map(({ product: p, score }) => (
                <th key={p.id} className="compare-col">
                  <div className="compare-product-head">
                    <img src={p.imageUrl} alt={p.title} />
                    <p className="compare-product-title">{p.title}</p>
                    <button className="compare-remove" onClick={() => onRemove(p.id)}>✕</button>
                  </div>
                  <div
                    className="compare-score-pill"
                    style={{ backgroundColor: getScoreColor(score.total) }}
                  >
                    {score.total}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(row => (
              <tr key={row.label}>
                <td className="compare-row-label">{row.label}</td>
                {items.map(({ product: p, score }) => (
                  <td key={p.id} className="compare-cell">
                    {row.render(p, score)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="compare-row-label" />
              {items.map(({ product: p }) => (
                <td key={p.id} className="compare-cell">
                  <a href={p.productUrl} target="_blank" rel="noreferrer" className="compare-view-btn">
                    View →
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
