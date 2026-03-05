import axios from 'axios';
import { Product } from '../types';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';

export async function searchAliExpress(keyword: string): Promise<Product[]> {
  const response = await axios.get('https://aliexpress-datahub.p.rapidapi.com/item_search', {
    params: { q: keyword, page: '1' },
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'aliexpress-datahub.p.rapidapi.com',
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = response.data?.result?.resultList ?? [];

  return items.map((item: any): Product => {
    const info = item.item ?? {};
    const price = parseFloat(info.sku?.def?.promotionPrice ?? info.sku?.def?.price ?? '0');
    const shippingCost = parseFloat(info.shipping?.freightAmount?.cent ?? '0') / 100;

    return {
      id: String(info.itemId ?? Math.random()),
      title: info.title ?? 'Unknown',
      price,
      currency: 'USD',
      imageUrl: info.image ?? '',
      productUrl: `https://www.aliexpress.com/item/${info.itemId}.html`,
      rating: parseFloat(info.averageStar ?? '0'),
      reviewCount: parseInt(info.evaluateCount ?? '0', 10),
      orderCount: parseInt(info.tradeCount ?? '0', 10),
      shippingCost,
      deliveryDays: null,
      minOrderQty: parseInt(info.minQuantity ?? '1', 10),
      sellerName: info.sellerInfo?.storeName ?? 'Unknown Seller',
      platform: 'aliexpress',
    };
  });
}
