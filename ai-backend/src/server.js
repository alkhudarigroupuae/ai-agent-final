import express from 'express';
import cors from 'cors';
import agentRoutes from './routes/agentRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { config } from './config.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'saleparts-ai-backend' });
});

app.use('/', agentRoutes);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`SaleParts AI backend running on port ${config.port}`);
});
