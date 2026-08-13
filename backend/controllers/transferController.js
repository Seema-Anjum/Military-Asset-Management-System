import db from '../config/db.js';
import { logAuditTrail } from '../middlewares/loggerMiddleware.js';

// Execute Cross-Base Asset Transfer Atomically
export const createTransfer = async (req, res) => {
  const client = await db.connect();
  try {
    const { sourceBaseId, destinationBaseId, equipmentTypeId, quantity } = req.body;
    const userId = req.user.id;

    if (!sourceBaseId || !destinationBaseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid parameters. Please provide valid bases, equipment, and quantity." });
    }
    

    if (sourceBaseId === destinationBaseId) {
      return res.status(400).json({ message: "Source and Destination bases must be different." });
    }

    // RBAC check for Commanders: Must originate from their assigned base
    if (req.user.role === 'BASE_COMMANDER' && req.user.baseId !== parseInt(sourceBaseId, 10)) {
      return res.status(403).json({ message: "Unauthorized: Base Commanders can only initiate transfers out of their assigned base." });
    }

    await client.query('BEGIN'); 

    //  Verify Source Base Stock Availability before transferring
    const stockCheckQuery = `
      WITH purchases_sum AS (
        SELECT COALESCE(SUM(quantity), 0) AS total FROM purchases WHERE base_id = $1 AND equipment_type_id = $2
      ),
      transfers_in_sum AS (
        SELECT COALESCE(SUM(quantity), 0) AS total FROM transfers WHERE destination_base_id = $1 AND equipment_type_id = $2 AND status = 'COMPLETED'
      ),
      transfers_out_sum AS (
        SELECT COALESCE(SUM(quantity), 0) AS total FROM transfers WHERE source_base_id = $1 AND equipment_type_id = $2 AND status = 'COMPLETED'
      ),
      assignments_sum AS (
        SELECT COALESCE(SUM(quantity), 0) AS total FROM assignments WHERE base_id = $1 AND equipment_type_id = $2 AND status = 'ACTIVE'
      ),
      expenditures_sum AS (
        SELECT COALESCE(SUM(quantity), 0) AS total FROM expenditures WHERE base_id = $1 AND equipment_type_id = $2
      )
      SELECT 
        (p.total + ti.total - to_sum.total - a.total - e.total) AS available_quantity
      FROM purchases_sum p, transfers_in_sum ti, transfers_out_sum to_sum, assignments_sum a, expenditures_sum e;
    `;

    const stockRes = await client.query(stockCheckQuery, [sourceBaseId, equipmentTypeId]);
    const availableStock = parseInt(stockRes.rows[0]?.available_quantity || 0, 10);

    if (availableStock < quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: `Insufficient stock at source base. Required: ${quantity}, Available: ${availableStock}` 
      });
    }

    //  Insert Transfer Record
    const insertTransferQuery = `
      INSERT INTO transfers (source_base_id, destination_base_id, equipment_type_id, quantity, initiated_by, status)
      VALUES ($1, $2, $3, $4, $5, 'COMPLETED')
      RETURNING id, timestamp;
    `;
    const transferRes = await client.query(insertTransferQuery, [
      sourceBaseId, 
      destinationBaseId, 
      equipmentTypeId, 
      quantity, 
      userId
    ]);
    const transferId = transferRes.rows[0].id;

    //  Log into Audit Trail
    await logAuditTrail(client, userId, 'TRANSFER', 'transfers', transferId, {
      sourceBaseId,
      destinationBaseId,
      equipmentTypeId,
      quantity,
      status: 'COMPLETED'
    });

    await client.query('COMMIT');

    return res.status(201).json({
      message: "Transfer completed successfully",
      transferId
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: "Transfer failed: " + error.message });
  } finally {
    client.release();
  }
};

// Fetch Historical Transfers
export const getTransferHistory = async (req, res) => {
  try {
    const baseId = req.scopedBaseId;
    const query = `
      SELECT 
        t.id, t.quantity, t.status, t.timestamp,
        sb.name AS source_base_name,
        db.name AS destination_base_name,
        e.name AS equipment_name, e.category,
        u.username AS initiated_by_user
      FROM transfers t
      JOIN bases sb ON t.source_base_id = sb.id
      JOIN bases db ON t.destination_base_id = db.id
      JOIN equipment_types e ON t.equipment_type_id = e.id
      LEFT JOIN users u ON t.initiated_by = u.id
      WHERE ($1::int IS NULL OR t.source_base_id = $1 OR t.destination_base_id = $1)
      ORDER BY t.timestamp DESC;
    `;

    const result = await db.query(query, [baseId || null]);
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch transfers: " + error.message });
  }
};