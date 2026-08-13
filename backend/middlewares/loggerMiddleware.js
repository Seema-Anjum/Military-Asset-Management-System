import db from '../config/db.js';

// Helper function to append structured entries into audit_logs inside or outside transactions
export const logAuditTrail = async (clientOrPool, userId, action, entityType, entityId, details) => {
  const query = `
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES ($1, $2, $3, $4, $5::jsonb);
  `;
  const executor = clientOrPool || db;
  await executor.query(query, [
    userId,
    action,
    entityType,
    entityId,
    JSON.stringify(details)
  ]);
};