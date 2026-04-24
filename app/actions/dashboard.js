"use server";
import { db } from "@/lib/db";

function serialize(rows) {
  return rows.map((row) => JSON.parse(JSON.stringify(row)));
}

export async function getDashboardData() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const [
    statsRes,
    recentOrdersRes,
    topStylesRes,
    ordersByStatusRes,
    revenueByMonthRes,
    pendingOrdersCountRes,
  ] = await Promise.all([
    // ── today stats
    db.execute({
      sql: `SELECT
              COUNT(*)                                          AS total_orders,
              COALESCE(SUM(final_total), 0)                    AS total_revenue,
              COALESCE(SUM(CASE WHEN status='done' THEN final_total ELSE 0 END), 0) AS done_revenue,
              COUNT(CASE WHEN status='done'    THEN 1 END)     AS done_count,
              COUNT(CASE WHEN status='pending' THEN 1 END)     AS pending_count,
              COUNT(CASE WHEN status='cancelled' THEN 1 END)   AS cancelled_count,
              COALESCE(SUM(CASE WHEN status='done' THEN final_total - production_cost ELSE 0 END), 0) AS total_margin
            FROM orders
            WHERE date(created_at) = ?`,
      args: [today],
    }),

    // ── recent orders (last 8)
    db.execute(`
      SELECT o.id, o.code, o.status, o.payment_status, o.final_total,
             o.created_at, o.discount,
             c.name AS customer_name, c.phone AS customer_phone
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
      LIMIT 8
    `),

    // ── top styles by order items (all time)
    db.execute(`
      SELECT s.name AS style_name,
             COUNT(oi.id)       AS order_count,
             SUM(oi.qty)        AS total_qty,
             SUM(oi.invoice_price * oi.qty) AS total_revenue
      FROM order_items oi
      JOIN styles s ON oi.style_id = s.id
      GROUP BY oi.style_id
      ORDER BY total_qty DESC
      LIMIT 5
    `),

    // ── orders by status (all time)
    db.execute(`
      SELECT status, COUNT(*) AS count, COALESCE(SUM(final_total), 0) AS total
      FROM orders
      GROUP BY status
    `),

    // ── revenue last 6 months
    db.execute(`
      SELECT strftime('%Y-%m', created_at) AS month,
             COALESCE(SUM(final_total), 0)      AS revenue,
             COALESCE(SUM(production_cost), 0)  AS cost,
             COUNT(*)                            AS order_count
      FROM orders
      WHERE status = 'done'
        AND created_at >= date('now', '-6 months')
      GROUP BY month
      ORDER BY month ASC
    `),

    // ── pending orders count
    db.execute(`SELECT COUNT(*) AS count FROM orders WHERE status = 'pending'`),
  ]);

  const stats = serialize(statsRes.rows)[0] ?? {};
  const recentOrders = serialize(recentOrdersRes.rows);
  const topStyles = serialize(topStylesRes.rows);
  const ordersByStatus = serialize(ordersByStatusRes.rows);
  const revenueByMonth = serialize(revenueByMonthRes.rows);
  const pendingCount = serialize(pendingOrdersCountRes.rows)[0]?.count ?? 0;

  // ── customer stats
  const [customerStatsRes, topCustomersRes] = await Promise.all([
    db.execute(`
      SELECT COUNT(*) AS total,
             COUNT(CASE WHEN status = 'aktif' THEN 1 END) AS active,
             COUNT(CASE WHEN group_type = 'vip' THEN 1 END) AS vip,
             COUNT(CASE WHEN group_type = 'reseller' THEN 1 END) AS reseller
      FROM customers
    `),
    db.execute(`
      SELECT id, name, phone, group_type, total_orders, total_spent, points
      FROM customers
      ORDER BY total_spent DESC
      LIMIT 5
    `),
  ]);

  const customerStats = serialize(customerStatsRes.rows)[0] ?? {};
  const topCustomers = serialize(topCustomersRes.rows);

  // ── all-time order totals
  const allTimeRes = await db.execute(`
    SELECT COALESCE(SUM(final_total), 0)     AS total_revenue,
           COALESCE(SUM(production_cost), 0) AS total_cost,
           COALESCE(SUM(final_total - production_cost), 0) AS total_margin,
           COUNT(*)                           AS total_orders
    FROM orders WHERE status = 'done'
  `);
  const allTime = serialize(allTimeRes.rows)[0] ?? {};

  return {
    stats,
    recentOrders,
    topStyles,
    ordersByStatus,
    revenueByMonth,
    pendingCount,
    customerStats,
    topCustomers,
    allTime,
  };
}
