export type SortOption = 'score' | 'price-asc' | 'price-desc' | 'orders' | 'delivery';
export type PlatformFilter = 'both' | 'aliexpress' | 'alibaba';

export interface Filters {
  platform: PlatformFilter;
  minScore: number;
  maxPrice: number;
  maxMoq: number;
  sort: SortOption;
}

export const DEFAULT_FILTERS: Filters = {
  platform: 'both',
  minScore: 0,
  maxPrice: 10000,
  maxMoq: 10000,
  sort: 'score',
};
