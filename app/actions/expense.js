"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

function serialize(rows) {
  return rows.map((row) => JSON.parse(JSON.stringify(row)));
}

export async function getExpenses() {
  const result = await db.execute(`
    SELECT
      oic.id,
      o.code                AS ref,
      DATE(o.created_at)    AS date,
      o.payment_method      AS method,
      o.notes               AS note,
      c.name                AS customer_name,
      s.name                AS style_name,
      oi.qty                AS qty,
      oic.sewing,
      oic.buttonhole,
      oic.swir,
      oic.assembly,
      oic.embroidery,
      oic.prewash,
      (
        oic.sewing + oic.buttonhole + oic.swir +
        oic.assembly + oic.embroidery + oic.prewash
      ) * oi.qty            AS amount
    FROM order_item_costs oic
    JOIN order_items oi    ON oi.id  = oic.order_item_id
    JOIN orders o          ON o.id   = oi.order_id
    JOIN customers c       ON c.id   = o.customer_id
    LEFT JOIN styles s     ON s.id   = oi.style_id
    ORDER BY o.created_at DESC, oic.id DESC
  `);
  return serialize(result.rows);
}
