import { Router } from 'express';
import { query } from '../config/db.js';
import { snakeToCamel } from '../helpers/caseConverter.js';
import { ApiError } from '../helpers/ApiError.js';

const router = Router();

// GET /api/surveys
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM surveys ORDER BY created_at DESC');
    res.json(rows.map(snakeToCamel));
  } catch (err) { next(err); }
});

// GET /api/surveys/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM surveys WHERE id = $1', [req.params.id]);
    if (!rows.length) throw new ApiError(404, 'Survey not found');
    res.json(snakeToCamel(rows[0]));
  } catch (err) { next(err); }
});

// POST /api/surveys
router.post('/', async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;
    if (!name) throw new ApiError(400, 'Survey name is required');
    const { rows } = await query(
      `INSERT INTO surveys (name, description, is_active) VALUES ($1,$2,$3) RETURNING *`,
      [name, description || null, isActive !== false]
    );
    res.status(201).json(snakeToCamel(rows[0]));
  } catch (err) { next(err); }
});

// PUT /api/surveys/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;
    const { rows } = await query(
      `UPDATE surveys SET name=COALESCE($1,name), description=$2, is_active=COALESCE($3,is_active)
       WHERE id=$4 RETURNING *`,
      [name, description, isActive, req.params.id]
    );
    if (!rows.length) throw new ApiError(404, 'Survey not found');
    res.json(snakeToCamel(rows[0]));
  } catch (err) { next(err); }
});

// DELETE /api/surveys/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { rows } = await query('DELETE FROM surveys WHERE id = $1 RETURNING id', [req.params.id]);
    if (!rows.length) throw new ApiError(404, 'Survey not found');
    res.status(204).end();
  } catch (err) { next(err); }
});

// --- QUESTIONS nested under surveys ---

// GET /api/surveys/:surveyId/questions
router.get('/:surveyId/questions', async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM survey_questions WHERE survey_id = $1 ORDER BY sort_order',
      [req.params.surveyId]
    );
    res.json(rows.map(snakeToCamel));
  } catch (err) { next(err); }
});

// POST /api/surveys/:surveyId/questions
router.post('/:surveyId/questions', async (req, res, next) => {
  try {
    const { questionText, questionType, options, sortOrder, isRequired } = req.body;
    if (!questionText) throw new ApiError(400, 'Question text is required');
    const { rows } = await query(
      `INSERT INTO survey_questions (survey_id, question_text, question_type, options, sort_order, is_required)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.params.surveyId, questionText, questionType || null, options ? JSON.stringify(options) : null, sortOrder || 0, isRequired !== false]
    );
    res.status(201).json(snakeToCamel(rows[0]));
  } catch (err) { next(err); }
});

// PUT /api/surveys/:surveyId/questions/:id
router.put('/:surveyId/questions/:id', async (req, res, next) => {
  try {
    const { questionText, questionType, options, sortOrder, isRequired } = req.body;
    const { rows } = await query(
      `UPDATE survey_questions SET question_text=COALESCE($1,question_text), question_type=$2,
       options=$3, sort_order=COALESCE($4,sort_order), is_required=COALESCE($5,is_required)
       WHERE id=$6 AND survey_id=$7 RETURNING *`,
      [questionText, questionType, options ? JSON.stringify(options) : null, sortOrder, isRequired, req.params.id, req.params.surveyId]
    );
    if (!rows.length) throw new ApiError(404, 'Question not found');
    res.json(snakeToCamel(rows[0]));
  } catch (err) { next(err); }
});

// DELETE /api/surveys/:surveyId/questions/:id
router.delete('/:surveyId/questions/:id', async (req, res, next) => {
  try {
    const { rows } = await query(
      'DELETE FROM survey_questions WHERE id = $1 AND survey_id = $2 RETURNING id',
      [req.params.id, req.params.surveyId]
    );
    if (!rows.length) throw new ApiError(404, 'Question not found');
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
