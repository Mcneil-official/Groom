import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

const API_TOKEN = process.env.API_TOKEN || 'apple-david-dev-token-2026';

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Missing or invalid Authorization header' });
  }
  
  const token = authHeader.slice(7); // Remove 'Bearer '
  
  if (token !== API_TOKEN) {
    throw new HTTPException(401, { message: 'Invalid API token' });
  }
  
  await next();
});

export function verifyToken(token: string): boolean {
  return token === API_TOKEN;
}