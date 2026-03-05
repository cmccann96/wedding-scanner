import axios from 'axios';
import { Product } from '../types';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';

export async function searchAlibaba(keyword: string): Promise<Product[]> {
  const response = await axios.get('https://alibaba-datahub.p.rapidapi.com/item_search', {
    params: { q: keyword, page: '1' },
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'alibaba-datahub.p.rapidapi.com',
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entries: any[] = response.data?.result?.resultList ?? [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return entries.map((entry: any): Product => {
    const item = entry.item ?? {};
    const seller = entry.seller ?? {};
    const company = entry.company ?? {};

    const priceList = item.sku?.def?.priceModule?.priceList ?? [];
    const minPrice = priceList.length > 0
      ? parseFloat(priceList[0].price ?? '0')
      : 0;

    const moq = parseInt(item.sku?.def?.quantityModule?.minOrder?.quantity ?? '1', 10);

    const storeEvaluates: any[] = seller.storeEvaluates ?? [];
    const allReview = storeEvaluates.find((e: any) => e.title === 'All Product Review');
    const rating = parseFloat(allReview?.score ?? '0');

    const itemUrl = item.itemUrl?.startsWith('//')
      ? `https:${item.itemUrl}`
      : item.itemUrl ?? '';
    const imageUrl = item.image?.startsWith('//')
      ? `https:${item.image}`
      : item.image ?? '';

    const isVerified = company.status?.verified === true || company.status?.gold === true;

    return {
      id: String(item.itemId ?? Math.random()),
      title: item.title ?? 'Unknown',
      price: minPrice,
      currency: 'USD',
      imageUrl,
      productUrl: itemUrl,
      rating,
      reviewCount: 0,
      orderCount: 0,
      shippingCost: 0,
      deliveryDays: null,
      minOrderQty: moq,
      sellerName: company.companyName ?? 'Alibaba Seller',
      sellerVerified: isVerified,
      sellerYears: parseInt(seller.storeAge ?? '0', 10),
      platform: 'alibaba',
    };
  });
}
