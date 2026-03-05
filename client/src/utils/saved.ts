import type { Product } from '../types';

const STORAGE_KEY = 'wedding-scanner-saved';

export function getSaved(): Product[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveProduct(product: Product): void {
  const saved = getSaved();
  if (!saved.find(p => p.id === product.id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...saved, product]));
  }
}

export function unsaveProduct(id: string): void {
  const saved = getSaved().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

export function isSaved(id: string): boolean {
  return getSaved().some(p => p.id === id);
}
