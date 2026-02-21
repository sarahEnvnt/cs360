import { Router } from 'express';
import { query } from '../config/db.js';
import { snakeToCamel } from '../helpers/caseConverter.js';

const router = Router();

// GET /api/activity-log
router.get('/', async (req, res, next) => {
  try {
    const { accountId, entityType, limit } = req.query;
    let sql = 'SELECT * FROM activity_log WHERE 1=1';
    const params = [];

    if (accountId) {
      params.push(accountId);
      sql += ` AND account_id = $${params.length}`;
    }
    if (entityType) {
      params.push(entityType);
      sql += ` AND entity_type = $${params.length}`;
    }

    sql += ' ORDER BY created_at DESC';
    params.push(Math.min(Number(limit) || 100, 500));
    sql += ` LIMIT $${params.length}`;

    const { rows } = await query(sql, params);
    res.json(rows.map(snakeToCamel));
  } catch (err) { next(err); }
});

export default router;
