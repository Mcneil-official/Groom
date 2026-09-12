import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { verifyToken } from '../middleware/auth.js';
import type { ApiResponse } from '../types.js';

const auth = new Hono();

const verifySchema = z.object({
  token: z.string().min(1),
});

// POST /api/auth/verify - Verify token
auth.post('/verify', zValidator('json', verifySchema), async (c) => {
  const { token } = c.req.valid('json');
  const valid = verifyToken(token);
  
  if (!valid) {
    return c.json<ApiResponse<{ valid: boolean }>>({
      error: { code: 'INVALID_TOKEN', message: 'Invalid API token' },
      data: { valid: false },
    }, 401);
  }
  
  return c.json<ApiResponse<{ valid: boolean }>>({ data: { valid: true } });
});

export default auth;