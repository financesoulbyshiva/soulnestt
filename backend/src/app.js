import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import tenantRoutes from './routes/tenant.routes.js';
import ownerRoutes from './routes/owner.routes.js';
import discoverRoutes from './routes/discover.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SoulNestt API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
