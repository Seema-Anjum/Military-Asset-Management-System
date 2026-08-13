import db from '../config/db.js';
import { logAuditTrail } from '../middlewares/loggerMiddleware.js';

// Record Consumed / Expended Assets (e.g. spent ammunition)
export const logExpenditure = async (req, res) => {
  const client = await db.connect();
  try {
    const { baseId, equipmentTypeId, quantity, reason } = req.body;
    const userId = req.user.id;

    if (!baseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({
        message: "Invalid payload. Provide baseId, equipmentTypeId, and a positive quantity."
      });
    }

    // RBAC check for Commanders: Cannot record expenditures for other bases
    if (req.user.role === 'BASE_COMMANDER' && req.user.baseId !== parseInt(baseId, 10)) {
      return res.status(403).json({ message: "Unauthorized: You can only record expenditures for your assigned base." });
    }

    await client.query('BEGIN');

    const insertQuery = `
      INSERT INTO expenditures (base_id, equipment_type_id, quantity, reason, recorded_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, base_id, equipment_type_id, quantity, reason, expended_at;
    `;
    const expenditureRes = await client.query(insertQuery, [baseId, equipmentTypeId, quantity, reason || null, userId]);
    const expenditureRecord = expenditureRes.rows[0];

    await logAuditTrail(client, userId, 'EXPENDITURE', 'expenditures', expenditureRecord.id, {
      baseId,
      equipmentTypeId,
      quantity,
      reason,
      timestamp: expenditureRecord.expended_at
    });

    await client.query('COMMIT');

    return res.status(201).json({
      message: "Expenditure recorded successfully",
      expenditure: expenditureRecord
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: "Expenditure logging failed: " + error.message });
  } finally {
    client.release();
  }
};

// Fetch Historical Expenditures
export const getExpenditureHistory = async (req, res) => {
  try {
    const baseId = req.scopedBaseId;
    const query = `
      SELECT
        x.id, x.quantity, x.reason, x.expended_at,
        b.name AS base_name,
        e.name AS equipment_name, e.category,
        u.username AS recorded_by
      FROM expenditures x
      JOIN bases b ON x.base_id = b.id
      JOIN equipment_types e ON x.equipment_type_id = e.id
      LEFT JOIN users u ON x.recorded_by = u.id
      WHERE ($1::int IS NULL OR x.base_id = $1)
      ORDER BY x.expended_at DESC;
    `;

    const result = await db.query(query, [baseId || null]);
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch expenditures: " + error.message });
  }
};