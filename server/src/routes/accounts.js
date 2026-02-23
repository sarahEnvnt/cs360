import { Router } from 'express';
import { query } from '../config/db.js';
import { snakeToCamel } from '../helpers/caseConverter.js';
import { logActivity } from '../middleware/activityLogger.js';
import { ApiError } from '../helpers/ApiError.js';

const router = Router();

// GET /api/accounts
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM accounts ORDER BY name');
    res.json(rows.map(snakeToCamel));
  } catch (err) { next(err); }
});

// GET /api/accounts/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM accounts WHERE id = $1', [req.params.id]);
    if (!rows.length) throw new ApiError(404, 'Account not found');
    res.json(snakeToCamel(rows[0]));
  } catch (err) { next(err); }
});

// POST /api/accounts
router.post('/', async (req, res, next) => {
  try {
    const { name, nameAr, sector, ministry, summary, challenges, alliances, notes, status, assigneeId } = req.body;
    if (!name) throw new ApiError(400, 'Account name is required');

    const { rows } = await query(
      `INSERT INTO accounts (name, name_ar, sector, ministry, summary, challenges, alliances, notes, status, assignee_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, nameAr || null, sector || null, ministry || null, summary || null, challenges || null, alliances || null, notes || null, status || 'active', assigneeId || null]
    );
    const account = snakeToCamel(rows[0]);
    await logActivity(req.user.userId, account.id, 'create', 'account', account.id, req.body);
    res.status(201).json(account);
  } catch (err) { next(err); }
});

// PUT /api/accounts/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, nameAr, sector, ministry, summary, challenges, alliances, notes, status, assigneeId } = req.body;
    const { rows } = await query(
      `UPDATE accounts SET name=COALESCE($1,name), name_ar=$2, sector=$3, ministry=$4,
       summary=$5, challenges=$6, alliances=$7, notes=$8, status=COALESCE($9,status), assignee_id=$10
       WHERE id=$11 RETURNING *`,
      [name, nameAr, sector, ministry, summary, challenges, alliances, notes, status, assigneeId || null, req.params.id]
    );
    if (!rows.length) throw new ApiError(404, 'Account not found');
    const account = snakeToCamel(rows[0]);
    await logActivity(req.user.userId, account.id, 'update', 'account', account.id, req.body);
    res.json(account);
  } catch (err) { next(err); }
});

// DELETE /api/accounts/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { rows } = await query('DELETE FROM accounts WHERE id = $1 RETURNING id', [req.params.id]);
    if (!rows.length) throw new ApiError(404, 'Account not found');
    await logActivity(req.user.userId, req.params.id, 'delete', 'account', req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
