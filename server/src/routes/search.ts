import { Router, Request, Response } from 'express';
import { searchAliExpress } from './aliexpress';
import { searchAlibaba } from './alibaba';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  const { category, platform } = req.query as { category: string; platform?: string };

  if (!category) {
    res.status(400).json({ error: 'category is required' });
    return;
  }

  try {
    const results = [];

    if (!platform || platform === 'aliexpress') {
      const aliExpressResults = await searchAliExpress(category);
      results.push(...aliExpressResults);
    }

    if (!platform || platform === 'alibaba') {
      const alibabaResults = await searchAlibaba(category);
      results.push(...alibabaResults);
    }

    res.json({ category, results });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed', details: String(err) });
  }
});

export default router;
