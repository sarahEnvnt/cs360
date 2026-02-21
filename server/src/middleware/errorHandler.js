export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // pg unique violation
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate entry', detail: err.detail });
  }

  // pg foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced entity not found', detail: err.detail });
  }

  // pg check constraint violation
  if (err.code === '23514') {
    return res.status(400).json({ error: 'Validation failed', detail: err.detail });
  }

  res.status(500).json({ error: 'Internal server error' });
}
