import db from '../config/db.js';
import { logAuditTrail } from '../middlewares/loggerMiddleware.js';

// Record Incoming Asset Stock (Purchase)
export const logPurchase = async (req, res) => {
  const client = await db.connect();
  try {
    const { baseId, equipmentTypeId, quantity } = req.body;
    const userId = req.user.id;

    if (!baseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid payload. Provide baseId, equipmentTypeId, and a positive quantity." });
    }

    // RBAC check for Commanders: Cannot log purchases for other bases
    if (req.user.role === 'BASE_COMMANDER' && req.user.baseId !== parseInt(baseId, 10)) {
      return res.status(403).json({ message: "Unauthorized: You can only record purchases for your assigned base." });
    }

    await client.query('BEGIN'); 

    //  Insert into Purchases
    const insertQuery = `
      INSERT INTO purchases (base_id, equipment_type_id, quantity, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING id, base_id, equipment_type_id, quantity, purchase_date;
    `;
    const purchaseRes = await client.query(insertQuery, [baseId, equipmentTypeId, quantity, userId]);
    const purchaseRecord = purchaseRes.rows[0];

    //  Insert into Central Audit Log
    await logAuditTrail(client, userId, 'PURCHASE', 'purchases', purchaseRecord.id, {
      baseId,
      equipmentTypeId,
      quantity,
      timestamp: purchaseRecord.purchase_date
    });

    await client.query('COMMIT');

    return res.status(201).json({
      message: "Purchase recorded successfully",
      purchase: purchaseRecord
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: "Purchase logging failed: " + error.message });
  } finally {
    client.release();
  }
};

// Fetch Historical Purchases
export const getPurchaseHistory = async (req, res) => {
  try {
    const baseId = req.scopedBaseId;
    const query = `
      SELECT 
        p.id, p.quantity, p.purchase_date,
        b.name AS base_name,
        e.name AS equipment_name, e.category,
        u.username AS recorded_by
      FROM purchases p
      JOIN bases b ON p.base_id = b.id
      JOIN equipment_types e ON p.equipment_type_id = e.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE ($1::int IS NULL OR p.base_id = $1)
      ORDER BY p.purchase_date DESC;
    `;

    const result = await db.query(query, [baseId || null]);
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch purchases: " + error.message });
  }
};