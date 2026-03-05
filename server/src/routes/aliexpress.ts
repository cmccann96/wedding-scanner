import axios from 'axios';
import { Product } from '../types';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';

export async function searchAliExpress(keyword: string): Promise<Product[]> {
  const response = await axios.get('https://aliexpress-datahub.p.rapidapi.com/item_search_2', {
    params: { q: keyword, page: '1' },
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'aliexpress-datahub.p.rapidapi.com',
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = response.data?.result?.resultList ?? [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return items.map((entry: any): Product => {
    const item = entry.item ?? {};
    const price = parseFloat(item.sku?.def?.promotionPrice ?? item.sku?.def?.price ?? '0');
    const itemUrl = item.itemUrl?.startsWith('//')
      ? `https:${item.itemUrl}`
      : item.itemUrl ?? '';
    const imageUrl = item.image?.startsWith('//')
      ? `https:${item.image}`
      : item.image ?? '';

    return {
      id: String(item.itemId ?? Math.random()),
      title: item.title ?? 'Unknown',
      price,
      currency: 'USD',
      imageUrl,
      productUrl: itemUrl,
      rating: parseFloat(item.averageStarRate ?? '0'),
      reviewCount: 0,
      orderCount: parseInt(item.sales ?? '0', 10),
      shippingCost: 0,
      deliveryDays: null,
      minOrderQty: 1,
      sellerName: 'AliExpress Seller',
      platform: 'aliexpress',
    };
  });
}
