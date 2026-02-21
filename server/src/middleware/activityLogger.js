import { query } from '../config/db.js';

export async function logActivity(userId, accountId, action, entityType, entityId, details = null) {
  try {
    await query(
      `INSERT INTO activity_log (user_id, account_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, accountId, action, entityType, entityId, details ? JSON.stringify(details) : null]
    );
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
}
