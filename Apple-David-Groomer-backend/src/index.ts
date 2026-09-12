import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import bookings from './routes/bookings.js';
import services from './routes/services.js';
import auth from './routes/auth.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API routes
app.route('/api/bookings', bookings);
app.route('/api/services', services);
app.route('/api/auth', auth);

// 404 handler
app.notFound((c) => c.json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }, 404));

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  if (err instanceof Response) return err;
  return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, 500);
});

const port = parseInt(process.env.PORT || '3001', 10);

console.log(`🚀 Backend server starting on http://localhost:${port}`);
console.log(`   API: http://localhost:${port}/api`);

export default {
  fetch: app.fetch,
  port,
};