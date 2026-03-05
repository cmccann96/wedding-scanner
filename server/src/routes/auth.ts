import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? 'wedding-scanner-secret';
const USERNAME = 'campcrowland';
const PASSWORD = process.env.APP_PASSWORD ?? 'campcrowland!2026';

router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (username === USERNAME && password === PASSWORD) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { username } });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export default router;
