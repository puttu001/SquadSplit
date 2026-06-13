import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { env } from './config/env';
import { errorHandler } from './shared/middleware/error.middleware';
import { globalRateLimiter } from './shared/middleware/rateLimiter.middleware';

// Route imports
import authRoutes        from './modules/auth/auth.routes';
import usersRoutes       from './modules/users/users.routes';
import groupsRoutes      from './modules/groups/groups.routes';
import expensesRoutes    from './modules/expenses/expenses.routes';
import settlementsRoutes from './modules/settlements/settlements.routes';
import notifRoutes       from './modules/notifications/notifications.routes';
import activityRoutes    from './modules/activity/activity.routes';
import analyticsRoutes   from './modules/analytics/analytics.routes';

const app = express();

// ─── Security & Parsing ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use('/api', globalRateLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth',          authRoutes);
app.use('/api/v1/users',         usersRoutes);
app.use('/api/v1/groups',        groupsRoutes);
app.use('/api/v1/expenses',      expensesRoutes);
app.use('/api/v1/settlements',   settlementsRoutes);
app.use('/api/v1/notifications', notifRoutes);
app.use('/api/v1/activity',      activityRoutes);
app.use('/api/v1/analytics',     analyticsRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
