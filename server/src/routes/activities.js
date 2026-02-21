import { Router } from 'express';
import { query } from '../config/db.js';
import { snakeToCamel } from '../helpers/caseConverter.js';
import { logActivity } from '../middleware/activityLogger.js';
import { ApiError } from '../helpers/ApiError.js';

const router = Router();

// GET /api/accounts/:accountId/activities
router.get('/:accountId/activities', async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM activities WHERE account_id = $1 ORDER BY date ASC NULLS LAST',
      [req.params.accountId]
    );
    res.json(rows.map(snakeToCamel));
  } catch (err) { next(err); }
});

// POST /api/accounts/:accountId/activities
router.post('/:accountId/activities', async (req, res, next) => {
  try {
    const { name, type, date, priority, status, representative, role, notes, outcome, projectId } = req.body;
    if (!name) throw new ApiError(400, 'Activity name is required');
    const acctId = req.params.accountId;

    const { rows } = await query(
      `INSERT INTO activities (account_id, project_id, name, type, date, priority, status, representative, role, notes, outcome)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [acctId, projectId || null, name, type || null, date || null, priority || null, status || 'planned', representative || null, role || null, notes || null, outcome || null]
    );
    const item = snakeToCamel(rows[0]);
    await logActivity(req.user.userId, acctId, 'create', 'activity', item.id, req.body);
    res.status(201).json(item);
  } catch (err) { next(err); }
});

// PUT /api/accounts/:accountId/activities/:id
router.put('/:accountId/activities/:id', async (req, res, next) => {
  try {
    const { name, type, date, priority, status, representative, role, notes, outcome, projectId } = req.body;
    const { rows } = await query(
      `UPDATE activities SET name=COALESCE($1,name), type=$2, date=$3, priority=$4,
       status=COALESCE($5,status), representative=$6, role=$7, notes=$8, outcome=$9, project_id=$10
       WHERE id=$11 AND account_id=$12 RETURNING *`,
      [name, type, date || null, priority, status, representative, role, notes, outcome, projectId || null, req.params.id, req.params.accountId]
    );
    if (!rows.length) throw new ApiError(404, 'Activity not found');
    const item = snakeToCamel(rows[0]);
    await logActivity(req.user.userId, req.params.accountId, 'update', 'activity', item.id, req.body);
    res.json(item);
  } catch (err) { next(err); }
});

// DELETE /api/accounts/:accountId/activities/:id
router.delete('/:accountId/activities/:id', async (req, res, next) => {
  try {
    const { rows } = await query(
      'DELETE FROM activities WHERE id = $1 AND account_id = $2 RETURNING id',
      [req.params.id, req.params.accountId]
    );
    if (!rows.length) throw new ApiError(404, 'Activity not found');
    await logActivity(req.user.userId, req.params.accountId, 'delete', 'activity', req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
