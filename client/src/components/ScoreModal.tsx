import type { ScoreBreakdown } from '../utils/scoring';
import { getScoreColor } from '../utils/scoring';

interface Props {
  productTitle: string;
  score: ScoreBreakdown;
  onClose: () => void;
}

const CRITERIA = [
  { key: 'sellerRating',  label: 'Seller Rating',   max: 20, icon: '⭐' },
  { key: 'popularity',    label: 'Popularity',       max: 20, icon: '🔥' },
  { key: 'price',         label: 'Price',            max: 20, icon: '💰' },
  { key: 'shippingCost',  label: 'Shipping Cost',    max: 15, icon: '🚚' },
  { key: 'moq',           label: 'Min. Order Qty',   max: 10, icon: '📦' },
  { key: 'deliveryTime',  label: 'Delivery Time',    max: 10, icon: '📅' },
  { key: 'verifiedSeller',label: 'Verified Seller',  max: 5,  icon: '✅' },
] as const;

export default function ScoreModal({ productTitle, score, onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-header">
          <div
            className="modal-score-circle"
            style={{ borderColor: getScoreColor(score.total) }}
          >
            <span className="modal-score-number" style={{ color: getScoreColor(score.total) }}>
              {score.total}
            </span>
            <span className="modal-score-label">/ 100</span>
          </div>
          <p className="modal-title">{productTitle}</p>
        </div>

        <div className="breakdown-list">
          {CRITERIA.map(({ key, label, max, icon }) => {
            const val = score[key];
            const pct = (val / max) * 100;
            return (
              <div key={key} className="breakdown-row">
                <span className="breakdown-icon">{icon}</span>
                <div className="breakdown-info">
                  <div className="breakdown-top">
                    <span className="breakdown-label">{label}</span>
                    <span className="breakdown-pts">{val} / {max}</span>
                  </div>
                  <div className="breakdown-bar-bg">
                    <div
                      className="breakdown-bar-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: getScoreColor(Math.round(pct)),
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
