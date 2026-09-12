import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import bookings from './routes/bookings.js';
import services from './routes/services.js';
import auth from './routes/auth.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: (origin) => origin || '*',
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Root documentation & status page
app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Apple David Groomer API</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1e293b; background: #f8fafc; }
    h1 { color: #0f172a; margin-bottom: 8px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 600; background: #dcfce7; color: #166534; margin-bottom: 20px; }
    .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 14px; }
    ul { list-style: none; padding: 0; margin: 12px 0 0 0; }
    li { padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Apple David Groomer API</h1>
  <span class="badge">● Online (Port 3000)</span>
  <div class="card">
    <h3 style="margin-top: 0;">Available Endpoints</h3>
    <ul>
      <li><strong>GET</strong> <a href="/health"><code>/health</code></a> - Health status</li>
      <li><strong>GET</strong> <code>/api/services</code> - Grooming services and pricing (Bearer token required)</li>
      <li><strong>GET</strong> <code>/api/bookings</code> - List bookings with search and pagination (Bearer token required)</li>
      <li><strong>POST</strong> <code>/api/bookings</code> - Create new booking (Bearer token required)</li>
      <li><strong>POST</strong> <code>/api/auth/verify</code> - Verify API token</li>
    </ul>
  </div>
</body>
</html>`);
});

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

const PORT = 3000;

serve({
  fetch: app.fetch,
  port: PORT,
  hostname: '0.0.0.0',
}, (info) => {
  console.log(`🚀 Backend server running on http://0.0.0.0:${info.port}`);
  console.log(`   API: http://0.0.0.0:${info.port}/api`);
});

export default app;