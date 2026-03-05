import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { requireAuth } from './auth';

const router = Router();

router.get('/', requireAuth, async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT product, saved_at FROM saved_items ORDER BY saved_at DESC');
  res.json(result.rows.map(r => ({ ...r.product, savedAt: r.saved_at })));
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  const product = req.body;
  if (!product?.id) return res.status(400).json({ error: 'Invalid product' });
  try {
    await pool.query(
      'INSERT INTO saved_items (product_id, product) VALUES ($1, $2) ON CONFLICT (product_id) DO NOTHING',
      [product.id, JSON.stringify(product)]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save item' });
  }
});

router.delete('/:productId', requireAuth, async (req: Request, res: Response) => {
  await pool.query('DELETE FROM saved_items WHERE product_id = $1', [req.params.productId]);
  res.json({ ok: true });
});

export default router;
