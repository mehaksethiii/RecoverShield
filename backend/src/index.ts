import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import apiRoutes from './routes/api';
import webhookRoutes from './routes/webhooks';

dotenv.config();

// Ensure DB schema is up to date on every startup (critical for Render/ephemeral filesystems)
try {
  console.log('Running prisma db push...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('Prisma db push complete.');
} catch (err) {
  console.error('Prisma db push failed:', err);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
// Use raw body for webhook verification
app.use('/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
