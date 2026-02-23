import { Router } from 'express';
import { query } from '../config/db.js';
import { snakeToCamel } from '../helpers/caseConverter.js';
import { logActivity } from '../middleware/activityLogger.js';
import { ApiError } from '../helpers/ApiError.js';

const router = Router();

// GET /api/accounts/:accountId/projects
router.get('/:accountId/projects', async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM projects WHERE account_id = $1 ORDER BY created_at DESC',
      [req.params.accountId]
    );
    res.json(rows.map(snakeToCamel));
  } catch (err) { next(err); }
});

// POST /api/accounts/:accountId/projects
router.post('/:accountId/projects', async (req, res, next) => {
  try {
    const { name, type, status, budget, currency, timeframe, progress, probability, stakeholder, vendor, competitors, notes, startDate, endDate } = req.body;
    if (!name) throw new ApiError(400, 'Project name is required');
    const acctId = req.params.accountId;

    const { rows } = await query(
      `INSERT INTO projects (account_id, name, type, status, budget, currency, timeframe, progress, probability, stakeholder, vendor, competitors, notes, start_date, end_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [acctId, name, type || null, status || 'leads', budget ? Number(budget) : 0, currency || 'SAR', timeframe || null,
       progress != null && progress !== '' ? Number(progress) : null,
       probability != null && probability !== '' ? Number(probability) : null,
       stakeholder || null, vendor || null, competitors || null, notes || null, startDate || null, endDate || null]
    );
    const item = snakeToCamel(rows[0]);
    await logActivity(req.user.userId, acctId, 'create', 'project', item.id, req.body);
    res.status(201).json(item);
  } catch (err) { next(err); }
});

// PUT /api/accounts/:accountId/projects/:id
router.put('/:accountId/projects/:id', async (req, res, next) => {
  try {
    const { name, type, status, budget, currency, timeframe, progress, probability, stakeholder, vendor, competitors, notes, startDate, endDate } = req.body;
    const { rows } = await query(
      `UPDATE projects SET name=COALESCE($1,name), type=$2, status=COALESCE($3,status), budget=$4,
       currency=COALESCE($5,currency), timeframe=$6, progress=$7, probability=$8,
       stakeholder=$9, vendor=$10, competitors=$11, notes=$12, start_date=$13, end_date=$14
       WHERE id=$15 AND account_id=$16 RETURNING *`,
      [name, type, status, budget ? Number(budget) : 0, currency, timeframe,
       progress != null && progress !== '' ? Number(progress) : null,
       probability != null && probability !== '' ? Number(probability) : null,
       stakeholder, vendor, competitors, notes, startDate || null, endDate || null, req.params.id, req.params.accountId]
    );
    if (!rows.length) throw new ApiError(404, 'Project not found');
    const item = snakeToCamel(rows[0]);
    await logActivity(req.user.userId, req.params.accountId, 'update', 'project', item.id, req.body);
    res.json(item);
  } catch (err) { next(err); }
});

// DELETE /api/accounts/:accountId/projects/:id
router.delete('/:accountId/projects/:id', async (req, res, next) => {
  try {
    const { rows } = await query(
      'DELETE FROM projects WHERE id = $1 AND account_id = $2 RETURNING id',
      [req.params.id, req.params.accountId]
    );
    if (!rows.length) throw new ApiError(404, 'Project not found');
    await logActivity(req.user.userId, req.params.accountId, 'delete', 'project', req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
