"use server";
import { db } from "@/lib/db";

function serialize(rows) {
  return rows.map((row) => JSON.parse(JSON.stringify(row)));
}

export async function getIncome() {
  const result = await db.execute(`
    SELECT
      o.id,
      o.code              AS ref,
      DATE(o.created_at)  AS date,
      o.final_total       AS amount,
      o.payment_method    AS method,
      o.notes             AS note,
      o.cashier           AS description,
      c.name              AS customer_name,
      'penjualan'         AS category,
      'selesai'           AS status
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    WHERE o.payment_status = 'paid'
    ORDER BY o.created_at DESC
  `);
  return serialize(result.rows);
}
