import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import searchRouter from './routes/search';
import authRouter from './routes/auth';
import savedItemsRouter from './routes/savedItems';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api', searchRouter);
app.use('/api/auth', authRouter);
app.use('/api/saved', savedItemsRouter);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
