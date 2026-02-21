import { Router } from 'express';
import { query } from '../config/db.js';
import { snakeToCamel } from '../helpers/caseConverter.js';

const router = Router();

// GET /api/dashboard/kpis — uses v_executive_kpis view
router.get('/kpis', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM v_executive_kpis');
    res.json(rows.length ? snakeToCamel(rows[0]) : {});
  } catch (err) { next(err); }
});

// GET /api/dashboard/summary — uses v_account_summary view
router.get('/summary', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM v_account_summary ORDER BY name');
    res.json(rows.map(snakeToCamel));
  } catch (err) { next(err); }
});

// GET /api/dashboard/latest-health — uses v_latest_health view
router.get('/latest-health', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM v_latest_health');
    res.json(rows.map(snakeToCamel));
  } catch (err) { next(err); }
});

// GET /api/dashboard/upcoming-activities — top upcoming activities across all accounts
router.get('/upcoming-activities', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT a.*, acc.name AS account_name FROM activities a
       JOIN accounts acc ON acc.id = a.account_id
       WHERE a.status NOT IN ('done') ORDER BY a.date ASC NULLS LAST LIMIT 6`
    );
    res.json(rows.map(snakeToCamel));
  } catch (err) { next(err); }
});

// GET /api/dashboard/all-responses — all survey responses with account name
router.get('/all-responses', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT sr.*, acc.name AS account_name FROM survey_responses sr
       JOIN accounts acc ON acc.id = sr.account_id
       ORDER BY sr.date DESC NULLS LAST LIMIT 50`
    );
    res.json(rows.map(snakeToCamel));
  } catch (err) { next(err); }
});

export default router;
