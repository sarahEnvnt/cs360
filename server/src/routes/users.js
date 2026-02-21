import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { snakeToCamel } from '../helpers/caseConverter.js';
import { ApiError } from '../helpers/ApiError.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();
router.use(requireRole('admin'));

const COLS = 'id, email, name, role, permissions, is_active, created_at';
const VALID_SCREENS = ['dashboard', 'accounts', 'surveys', 'reports'];

// GET /api/users
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(`SELECT ${COLS} FROM users ORDER BY created_at DESC`);
    res.json(rows.map(snakeToCamel));
  } catch (err) { next(err); }
});

// POST /api/users
router.post('/', async (req, res, next) => {
  try {
    const { email, name, password, role, permissions } = req.body;
    if (!email || !name || !password) throw new ApiError(400, 'Email, name, and password are required');
    if (password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters');

    const validRoles = ['admin', 'manager', 'csm', 'viewer'];
    const userRole = validRoles.includes(role) ? role : 'csm';
    const userPerms = Array.isArray(permissions) ? permissions.filter(p => VALID_SCREENS.includes(p)) : [...VALID_SCREENS];
    if (userRole === 'admin' && !userPerms.includes('users')) userPerms.push('users');

    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await query(
      `INSERT INTO users (email, name, role, password_hash, permissions) VALUES ($1,$2,$3,$4,$5) RETURNING ${COLS}`,
      [email.toLowerCase().trim(), name, userRole, passwordHash, JSON.stringify(userPerms)]
    );
    res.status(201).json(snakeToCamel(rows[0]));
  } catch (err) { next(err); }
});

// PUT /api/users/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, role, permissions, isActive, password } = req.body;
    if (req.params.id === req.user.userId && isActive === false) {
      throw new ApiError(400, 'Cannot deactivate your own account');
    }

    const userPerms = Array.isArray(permissions) ? permissions.filter(p => VALID_SCREENS.includes(p)) : undefined;
    if (role === 'admin' && userPerms && !userPerms.includes('users')) userPerms.push('users');

    let sql = `UPDATE users SET name = COALESCE($1, name), role = COALESCE($2, role), permissions = COALESCE($3, permissions), is_active = COALESCE($4, is_active)`;
    const params = [name || null, role || null, userPerms ? JSON.stringify(userPerms) : null, isActive !== undefined ? isActive : null];

    if (password && password.length >= 6) {
      const hash = await bcrypt.hash(password, 12);
      sql += `, password_hash = $${params.length + 1}`;
      params.push(hash);
    }

    sql += ` WHERE id = $${params.length + 1} RETURNING ${COLS}`;
    params.push(req.params.id);

    const { rows } = await query(sql, params);
    if (!rows.length) throw new ApiError(404, 'User not found');
    res.json(snakeToCamel(rows[0]));
  } catch (err) { next(err); }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user.userId) throw new ApiError(400, 'Cannot delete your own account');
    const { rows } = await query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
    if (!rows.length) throw new ApiError(404, 'User not found');
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
