import { Router } from 'express';
import { query } from '../config/db.js';
import { snakeToCamel } from '../helpers/caseConverter.js';
import { logActivity } from '../middleware/activityLogger.js';
import { ApiError } from '../helpers/ApiError.js';

const router = Router();

// GET /api/accounts/:accountId/health
router.get('/:accountId/health', async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM health_scores WHERE account_id = $1 ORDER BY created_at DESC',
      [req.params.accountId]
    );
    res.json(rows.map(snakeToCamel));
  } catch (err) { next(err); }
});

// POST /api/accounts/:accountId/health
router.post('/:accountId/health', async (req, res, next) => {
  try {
    const { productAdoption, stakeholderEngagement, supportSatisfaction, renewalLikelihood, expansionPotential, strategicAlignment, assessedBy, notes } = req.body;
    const acctId = req.params.accountId;

    const { rows } = await query(
      `INSERT INTO health_scores (account_id, product_adoption, stakeholder_engagement, support_satisfaction, renewal_likelihood, expansion_potential, strategic_alignment, assessed_by, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [acctId, Number(productAdoption) || 0, Number(stakeholderEngagement) || 0, Number(supportSatisfaction) || 0, Number(renewalLikelihood) || 0, Number(expansionPotential) || 0, Number(strategicAlignment) || 0, assessedBy || null, notes || null]
    );
    const item = snakeToCamel(rows[0]);
    await logActivity(req.user.userId, acctId, 'create', 'health_score', item.id, req.body);
    res.status(201).json(item);
  } catch (err) { next(err); }
});

export default router;
