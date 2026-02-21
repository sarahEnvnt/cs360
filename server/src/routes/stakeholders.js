import { Router } from 'express';
import { query } from '../config/db.js';
import { snakeToCamel } from '../helpers/caseConverter.js';
import { logActivity } from '../middleware/activityLogger.js';
import { ApiError } from '../helpers/ApiError.js';

const router = Router();

// GET /api/accounts/:accountId/stakeholders
router.get('/:accountId/stakeholders', async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM stakeholders WHERE account_id = $1 ORDER BY influence DESC NULLS LAST, name',
      [req.params.accountId]
    );
    res.json(rows.map(snakeToCamel));
  } catch (err) { next(err); }
});

// POST /api/accounts/:accountId/stakeholders
router.post('/:accountId/stakeholders', async (req, res, next) => {
  try {
    const { name, title, role, influence, sentiment, friendFoe, contacts, lastMeeting, notes } = req.body;
    if (!name) throw new ApiError(400, 'Stakeholder name is required');
    const acctId = req.params.accountId;

    const { rows } = await query(
      `INSERT INTO stakeholders (account_id, name, title, role, influence, sentiment, friend_foe, contacts, last_meeting, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [acctId, name, title || null, role || null, influence ? Number(influence) : null, sentiment || null, friendFoe || null, contacts || null, lastMeeting || null, notes || null]
    );
    const item = snakeToCamel(rows[0]);
    await logActivity(req.user.userId, acctId, 'create', 'stakeholder', item.id, req.body);
    res.status(201).json(item);
  } catch (err) { next(err); }
});

// PUT /api/accounts/:accountId/stakeholders/:id
router.put('/:accountId/stakeholders/:id', async (req, res, next) => {
  try {
    const { name, title, role, influence, sentiment, friendFoe, contacts, lastMeeting, notes } = req.body;
    const { rows } = await query(
      `UPDATE stakeholders SET name=COALESCE($1,name), title=$2, role=$3, influence=$4,
       sentiment=$5, friend_foe=$6, contacts=$7, last_meeting=$8, notes=$9
       WHERE id=$10 AND account_id=$11 RETURNING *`,
      [name, title, role, influence ? Number(influence) : null, sentiment, friendFoe, contacts, lastMeeting || null, notes, req.params.id, req.params.accountId]
    );
    if (!rows.length) throw new ApiError(404, 'Stakeholder not found');
    const item = snakeToCamel(rows[0]);
    await logActivity(req.user.userId, req.params.accountId, 'update', 'stakeholder', item.id, req.body);
    res.json(item);
  } catch (err) { next(err); }
});

// DELETE /api/accounts/:accountId/stakeholders/:id
router.delete('/:accountId/stakeholders/:id', async (req, res, next) => {
  try {
    const { rows } = await query(
      'DELETE FROM stakeholders WHERE id = $1 AND account_id = $2 RETURNING id',
      [req.params.id, req.params.accountId]
    );
    if (!rows.length) throw new ApiError(404, 'Stakeholder not found');
    await logActivity(req.user.userId, req.params.accountId, 'delete', 'stakeholder', req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
