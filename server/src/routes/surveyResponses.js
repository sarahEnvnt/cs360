import { Router } from 'express';
import { query } from '../config/db.js';
import { snakeToCamel } from '../helpers/caseConverter.js';
import { logActivity } from '../middleware/activityLogger.js';
import { ApiError } from '../helpers/ApiError.js';

const router = Router();

// GET /api/accounts/:accountId/responses
router.get('/:accountId/responses', async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM survey_responses WHERE account_id = $1 ORDER BY date DESC NULLS LAST',
      [req.params.accountId]
    );
    res.json(rows.map(snakeToCamel));
  } catch (err) { next(err); }
});

// POST /api/accounts/:accountId/responses
router.post('/:accountId/responses', async (req, res, next) => {
  try {
    const { surveyId, surveyName, respondent, date, csat, nps, satisfaction, serviceQuality, recommend, feedback, answers } = req.body;
    const acctId = req.params.accountId;

    const { rows } = await query(
      `INSERT INTO survey_responses (account_id, survey_id, survey_name, respondent, date, csat, nps, satisfaction, service_quality, recommend, feedback, answers)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [acctId, surveyId || null, surveyName || null, respondent || null, date || null,
       csat != null && csat !== '' ? Number(csat) : null,
       nps != null && nps !== '' ? Number(nps) : null,
       satisfaction || null, serviceQuality || null, recommend || null, feedback || null,
       answers ? JSON.stringify(answers) : null]
    );
    const item = snakeToCamel(rows[0]);
    await logActivity(req.user.userId, acctId, 'create', 'survey_response', item.id, req.body);
    res.status(201).json(item);
  } catch (err) { next(err); }
});

// PUT /api/accounts/:accountId/responses/:id
router.put('/:accountId/responses/:id', async (req, res, next) => {
  try {
    const { surveyId, surveyName, respondent, date, csat, nps, satisfaction, serviceQuality, recommend, feedback, answers } = req.body;
    const { rows } = await query(
      `UPDATE survey_responses SET survey_id=$1, survey_name=$2, respondent=$3, date=$4,
       csat=$5, nps=$6, satisfaction=$7, service_quality=$8, recommend=$9, feedback=$10, answers=$11
       WHERE id=$12 AND account_id=$13 RETURNING *`,
      [surveyId || null, surveyName || null, respondent || null, date || null,
       csat != null && csat !== '' ? Number(csat) : null,
       nps != null && nps !== '' ? Number(nps) : null,
       satisfaction || null, serviceQuality || null, recommend || null, feedback || null,
       answers ? JSON.stringify(answers) : null, req.params.id, req.params.accountId]
    );
    if (!rows.length) throw new ApiError(404, 'Response not found');
    const item = snakeToCamel(rows[0]);
    await logActivity(req.user.userId, req.params.accountId, 'update', 'survey_response', item.id, req.body);
    res.json(item);
  } catch (err) { next(err); }
});

// DELETE /api/accounts/:accountId/responses/:id
router.delete('/:accountId/responses/:id', async (req, res, next) => {
  try {
    const { rows } = await query(
      'DELETE FROM survey_responses WHERE id = $1 AND account_id = $2 RETURNING id',
      [req.params.id, req.params.accountId]
    );
    if (!rows.length) throw new ApiError(404, 'Response not found');
    await logActivity(req.user.userId, req.params.accountId, 'delete', 'survey_response', req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
