import { useState, useEffect } from 'react';
import type { Product } from '../types';
import { getSaved, unsaveProduct } from '../utils/saved';
import { scoreProduct, getScoreColor, getScoreLabel } from '../utils/scoring';

interface Props {
  onClose: () => void;
}

export default function SavedDrawer({ onClose }: Props) {
  const [saved, setSaved] = useState<Product[]>([]);

  useEffect(() => {
    setSaved(getSaved());
  }, []);

  const remove = (id: string) => {
    unsaveProduct(id);
    setSaved(prev => prev.filter(p => p.id !== id));
  };

  // Group by a category tag if available, otherwise by platform
  const grouped = saved.reduce<Record<string, Product[]>>((acc, p) => {
    const key = p.platform === 'alibaba' ? 'Alibaba' : 'AliExpress';
    acc[key] = [...(acc[key] ?? []), p];
    return acc;
  }, {});

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>🔖 Saved Items ({saved.length})</h2>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        {saved.length === 0 ? (
          <p className="empty-state" style={{ padding: '40px 24px' }}>
            No saved items yet. Click the bookmark icon on any product to save it.
          </p>
        ) : (
          <div className="drawer-content">
            {Object.entries(grouped).map(([group, products]) => (
              <div key={group} className="drawer-group">
                <h3 className="drawer-group-title">{group}</h3>
                {products.map(p => {
                  const score = scoreProduct(p, products);
                  return (
                    <div key={p.id} className="saved-item">
                      <img src={p.imageUrl} alt={p.title} className="saved-img" />
                      <div className="saved-info">
                        <p className="saved-title">{p.title}</p>
                        <p className="saved-price">${p.price.toFixed(2)}</p>
                        <div
                          className="saved-score"
                          style={{ color: getScoreColor(score.total) }}
                        >
                          Score: {score.total} — {getScoreLabel(score.total)}
                        </div>
                      </div>
                      <div className="saved-actions">
                        <a href={p.productUrl} target="_blank" rel="noreferrer" className="saved-view">
                          View →
                        </a>
                        <button className="saved-remove" onClick={() => remove(p.id)}>
                          🗑
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
