export interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
  productUrl: string;
  rating: number;
  reviewCount: number;
  orderCount: number;
  shippingCost: number;
  deliveryDays: number | null;
  minOrderQty: number;
  sellerName: string;
  sellerVerified?: boolean;
  sellerYears?: number;
  platform: 'aliexpress' | 'alibaba';
}

export interface SearchResult {
  category: string;
  results: Product[];
}
