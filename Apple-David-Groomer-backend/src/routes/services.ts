import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { getServices } from '../lib/db.js';
import type { Service, ApiResponse } from '../types.js';

const services = new Hono();

services.use('*', authMiddleware);

// GET /api/services - Get all services with pricing
services.get('/', async (c) => {
  const servicesList = await getServices();
  return c.json<ApiResponse<Service[]>>({ data: servicesList });
});

export default services;