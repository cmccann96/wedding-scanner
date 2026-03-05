import { Product } from '../types';

export interface ScoreBreakdown {
  total: number;
  sellerRating: number;      // max 20
  popularity: number;        // max 20
  price: number;             // max 20
  shippingCost: number;      // max 15
  moq: number;               // max 10
  deliveryTime: number;      // max 10
  verifiedSeller: number;    // max 5
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function scoreProduct(product: Product, allProducts: Product[]): ScoreBreakdown {
  // --- Seller Rating (max 20) ---
  const sellerRating = clamp((product.rating / 5) * 20, 0, 20);

  // --- Popularity (max 20) ---
  // AliExpress: order count. Alibaba: seller years as proxy
  let popularity = 0;
  if (product.platform === 'aliexpress') {
    const maxOrders = Math.max(...allProducts.filter(p => p.platform === 'aliexpress').map(p => p.orderCount), 1);
    popularity = clamp((product.orderCount / maxOrders) * 20, 0, 20);
  } else {
    popularity = clamp(((product.sellerYears ?? 0) / 10) * 20, 0, 20);
  }

  // --- Price (max 20) ---
  // Lower price = higher score, normalised within platform
  const platformProducts = allProducts.filter(p => p.platform === product.platform && p.price > 0);
  const prices = platformProducts.map(p => p.price);
  const minPrice = Math.min(...prices, product.price);
  const maxPrice = Math.max(...prices, product.price);
  let priceScore = 20;
  if (maxPrice > minPrice) {
    priceScore = clamp(20 - ((product.price - minPrice) / (maxPrice - minPrice)) * 20, 0, 20);
  }

  // --- Shipping Cost (max 15) ---
  // Free = 15pts, capped penalty at $20
  const shippingCost = clamp(15 - (product.shippingCost / 20) * 15, 0, 15);

  // --- MOQ (max 10) ---
  // MOQ 1 = 10pts, MOQ 500+ = 0pts (log scale)
  const moq = clamp(10 - (Math.log10(Math.max(product.minOrderQty, 1)) / Math.log10(500)) * 10, 0, 10);

  // --- Delivery Time (max 10) ---
  // <7 days = 10pts, >30 days = 0pts, unknown = 5pts
  let deliveryTime = 5;
  if (product.deliveryDays !== null) {
    deliveryTime = clamp(10 - ((product.deliveryDays - 7) / 23) * 10, 0, 10);
  }

  // --- Verified Seller (max 5) ---
  const verifiedSeller = product.sellerVerified ? 5 : 0;

  const total = Math.round(
    sellerRating + popularity + priceScore + shippingCost + moq + deliveryTime + verifiedSeller
  );

  return {
    total: clamp(total, 0, 100),
    sellerRating: Math.round(sellerRating),
    popularity: Math.round(popularity),
    price: Math.round(priceScore),
    shippingCost: Math.round(shippingCost),
    moq: Math.round(moq),
    deliveryTime: Math.round(deliveryTime),
    verifiedSeller,
  };
}

export function getScoreColor(score: number): string {
  if (score >= 70) return '#27ae60';
  if (score >= 45) return '#f39c12';
  return '#e74c3c';
}

export function getScoreLabel(score: number): string {
  if (score >= 70) return 'Great';
  if (score >= 45) return 'OK';
  return 'Poor';
}
