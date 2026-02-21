import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = { userId: payload.userId, role: payload.role, permissions: payload.permissions };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
