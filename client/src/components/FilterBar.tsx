import type { Filters, SortOption, PlatformFilter } from '../types/filters';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function FilterBar({ filters, onChange }: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="filter-bar">
      {/* Platform */}
      <div className="filter-group">
        <label>Platform</label>
        <div className="filter-pills">
          {(['both', 'aliexpress', 'alibaba'] as PlatformFilter[]).map(p => (
            <button
              key={p}
              className={`filter-pill ${filters.platform === p ? 'active' : ''}`}
              onClick={() => set('platform', p)}
            >
              {p === 'both' ? 'Both' : p === 'aliexpress' ? 'AliExpress' : 'Alibaba'}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="filter-group">
        <label>Sort by</label>
        <select
          value={filters.sort}
          onChange={e => set('sort', e.target.value as SortOption)}
          className="filter-select"
        >
          <option value="score">Best Score</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="orders">Most Orders</option>
          <option value="delivery">Fastest Delivery</option>
        </select>
      </div>

      {/* Min Score */}
      <div className="filter-group">
        <label>Min Score: <strong>{filters.minScore}</strong></label>
        <input
          type="range"
          min={0} max={100} step={5}
          value={filters.minScore}
          onChange={e => set('minScore', Number(e.target.value))}
          className="filter-range"
        />
      </div>

      {/* Max Price */}
      <div className="filter-group">
        <label>Max Price: <strong>${filters.maxPrice === 10000 ? '∞' : filters.maxPrice}</strong></label>
        <input
          type="range"
          min={0} max={100} step={1}
          value={filters.maxPrice === 10000 ? 100 : filters.maxPrice}
          onChange={e => {
            const v = Number(e.target.value);
            set('maxPrice', v === 100 ? 10000 : v);
          }}
          className="filter-range"
        />
      </div>

      {/* Max MOQ */}
      <div className="filter-group">
        <label>Max MOQ: <strong>{filters.maxMoq === 10000 ? '∞' : filters.maxMoq}</strong></label>
        <input
          type="range"
          min={1} max={500} step={1}
          value={filters.maxMoq === 10000 ? 500 : filters.maxMoq}
          onChange={e => {
            const v = Number(e.target.value);
            set('maxMoq', v === 500 ? 10000 : v);
          }}
          className="filter-range"
        />
      </div>
    </div>
  );
}
