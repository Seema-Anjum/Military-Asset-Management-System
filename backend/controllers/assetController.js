import db from '../config/db.js';

// Calculate Opening, Net Movement, Assignments, Expenditures & Closing Balance dynamically
export const getDashboardMetrics = async (req, res) => {
  try {
    const baseId = req.scopedBaseId;
    const { equipmentTypeId, startDate } = req.query;

    const query = `
      WITH purchases_agg AS (
        SELECT COALESCE(SUM(quantity), 0) AS total_purchases
        FROM purchases
        WHERE ($1::int IS NULL OR base_id = $1)
          AND ($2::int IS NULL OR equipment_type_id = $2)
          AND ($3::timestamptz IS NULL OR created_at >= $3)
      ),
      transfers_in_agg AS (
        SELECT COALESCE(SUM(quantity), 0) AS total_transfers_in
        FROM transfers
        WHERE ($1::int IS NULL OR destination_base_id = $1)
          AND ($2::int IS NULL OR equipment_type_id = $2)
          AND status = 'COMPLETED'
          AND ($3::timestamptz IS NULL OR timestamp >= $3)
      ),
      transfers_out_agg AS (
        SELECT COALESCE(SUM(quantity), 0) AS total_transfers_out
        FROM transfers
        WHERE ($1::int IS NULL OR source_base_id = $1)
          AND ($2::int IS NULL OR equipment_type_id = $2)
          AND status = 'COMPLETED'
          AND ($3::timestamptz IS NULL OR timestamp >= $3)
      ),
      assignments_agg AS (
        SELECT COALESCE(SUM(quantity), 0) AS total_assigned
        FROM assignments
        WHERE ($1::int IS NULL OR base_id = $1)
          AND ($2::int IS NULL OR equipment_type_id = $2)
          AND status = 'ACTIVE'
          AND ($3::timestamptz IS NULL OR assigned_at >= $3)
      ),
      expenditures_agg AS (
        SELECT COALESCE(SUM(quantity), 0) AS total_expended
        FROM expenditures
        WHERE ($1::int IS NULL OR base_id = $1)
          AND ($2::int IS NULL OR equipment_type_id = $2)
          AND ($3::timestamptz IS NULL OR expended_at >= $3)
      )
      SELECT
        p.total_purchases,
        ti.total_transfers_in,
        to_sum.total_transfers_out,
        (p.total_purchases + ti.total_transfers_in - to_sum.total_transfers_out) AS net_movement,
        a.total_assigned,
        e.total_expended,
        ((p.total_purchases + ti.total_transfers_in - to_sum.total_transfers_out) - a.total_assigned - e.total_expended) AS closing_balance
      FROM purchases_agg p, transfers_in_agg ti, transfers_out_agg to_sum, assignments_agg a, expenditures_agg e;
    `;

    const result = await db.query(query, [baseId || null, equipmentTypeId || null, startDate || null]);

    return res.status(200).json({
      success: true,
      scopedBaseId: baseId || "GLOBAL_ALL_BASES",
      metrics: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to compute asset metrics: " + error.message });
  }
};