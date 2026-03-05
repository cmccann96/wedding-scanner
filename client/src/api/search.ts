import axios from 'axios';
import type { SearchResult } from '../types';

const API_BASE = 'http://localhost:4000/api';

export async function searchCategory(category: string): Promise<SearchResult> {
  const { data } = await axios.get<SearchResult>(`${API_BASE}/search`, {
    params: { category, platform: 'aliexpress' },
  });
  return data;
}

export async function searchAllCategories(categories: string[]): Promise<SearchResult[]> {
  return Promise.all(categories.map(searchCategory));
}
