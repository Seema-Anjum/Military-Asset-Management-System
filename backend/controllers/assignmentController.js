import db from '../config/db.js';
import { logAuditTrail } from '../middlewares/loggerMiddleware.js';

// Assign Equipment to Personnel
export const createAssignment = async (req, res) => {
  const client = await db.connect();
  try {
    const { baseId, equipmentTypeId, quantity, assignedTo } = req.body;
    const userId = req.user.id;

    if (!baseId || !equipmentTypeId || !quantity || quantity <= 0 || !assignedTo) {
      return res.status(400).json({
        message: "Invalid payload. Provide baseId, equipmentTypeId, a positive quantity, and assignedTo."
      });
    }

    // RBAC check for Commanders: Cannot assign assets outside their own base
    if (req.user.role === 'BASE_COMMANDER' && req.user.baseId !== parseInt(baseId, 10)) {
      return res.status(403).json({ message: "Unauthorized: You can only assign assets for your assigned base." });
    }

    await client.query('BEGIN');

    const insertQuery = `
      INSERT INTO assignments (base_id, equipment_type_id, quantity, assigned_to, assigned_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, base_id, equipment_type_id, quantity, assigned_to, status, assigned_at;
    `;
    const assignmentRes = await client.query(insertQuery, [baseId, equipmentTypeId, quantity, assignedTo, userId]);
    const assignmentRecord = assignmentRes.rows[0];

    await logAuditTrail(client, userId, 'ASSIGNMENT', 'assignments', assignmentRecord.id, {
      baseId,
      equipmentTypeId,
      quantity,
      assignedTo,
      timestamp: assignmentRecord.assigned_at
    });

    await client.query('COMMIT');

    return res.status(201).json({
      message: "Assignment recorded successfully",
      assignment: assignmentRecord
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: "Assignment logging failed: " + error.message });
  } finally {
    client.release();
  }
};

// Mark an Active Assignment as Returned
export const returnAssignment = async (req, res) => {
  const client = await db.connect();
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await client.query('BEGIN');

    // Fetch the assignment first to check scope + current status
    const existing = await client.query(`SELECT * FROM assignments WHERE id = $1;`, [id]);
    if (existing.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Assignment not found." });
    }

    const assignment = existing.rows[0];

    if (assignment.status === 'RETURNED') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "This assignment has already been marked as returned." });
    }

    if (req.user.role === 'BASE_COMMANDER' && req.user.baseId !== assignment.base_id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: "Unauthorized: This assignment belongs to another base." });
    }

    const updateQuery = `
      UPDATE assignments
      SET status = 'RETURNED', returned_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, base_id, equipment_type_id, quantity, assigned_to, status, assigned_at, returned_at;
    `;
    const updateRes = await client.query(updateQuery, [id]);
    const updatedRecord = updateRes.rows[0];

    await logAuditTrail(client, userId, 'ASSIGNMENT_RETURN', 'assignments', updatedRecord.id, {
      returnedAt: updatedRecord.returned_at
    });

    await client.query('COMMIT');

    return res.status(200).json({
      message: "Assignment marked as returned",
      assignment: updatedRecord
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: "Failed to update assignment: " + error.message });
  } finally {
    client.release();
  }
};

// Fetch Historical Assignments
export const getAssignmentHistory = async (req, res) => {
  try {
    const baseId = req.scopedBaseId;
    const query = `
      SELECT
        a.id, a.quantity, a.assigned_to, a.status, a.assigned_at, a.returned_at,
        b.name AS base_name,
        e.name AS equipment_name, e.category,
        u.username AS assigned_by
      FROM assignments a
      JOIN bases b ON a.base_id = b.id
      JOIN equipment_types e ON a.equipment_type_id = e.id
      LEFT JOIN users u ON a.assigned_by = u.id
      WHERE ($1::int IS NULL OR a.base_id = $1)
      ORDER BY a.assigned_at DESC;
    `;

    const result = await db.query(query, [baseId || null]);
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch assignments: " + error.message });
  }
};