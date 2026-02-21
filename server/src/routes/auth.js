import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { env } from '../config/env.js';
import { snakeToCamel } from '../helpers/caseConverter.js';
import { ApiError } from '../helpers/ApiError.js';

const router = Router();

function signToken(user) {
  return jwt.sign({ userId: user.id, role: user.role, permissions: user.permissions }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

function sanitizeUser(row) {
  const u = snakeToCamel(row);
  delete u.passwordHash;
  return u;
}

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, 'Email and password are required');

    const { rows } = await query(
      `SELECT * FROM users WHERE email = $1 AND is_active = true`,
      [email.toLowerCase().trim()]
    );

    if (!rows.length) throw new ApiError(401, 'Invalid email or password');

    const user = rows[0];
    if (!user.password_hash) throw new ApiError(401, 'Account has no password set');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new ApiError(401, 'Invalid email or password');

    const token = signToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) { next(err); }
});

// GET /api/auth/me
router.get('/me', async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) throw new ApiError(401, 'No token');

    const payload = jwt.verify(header.slice(7), env.JWT_SECRET);
    const { rows } = await query(`SELECT * FROM users WHERE id = $1 AND is_active = true`, [payload.userId]);
    if (!rows.length) throw new ApiError(401, 'User not found');

    res.json(sanitizeUser(rows[0]));
  } catch (err) { next(err); }
});

export default router;
