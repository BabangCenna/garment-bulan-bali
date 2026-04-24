"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

function serialize(rows) {
  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([k, v]) => [
        k,
        typeof v === "bigint" ? Number(v) : v,
      ]),
    ),
  );
}

function generateOrderCode() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `ORD-${rand}-${y}${m}${d}`;
}

export async function getOrders() {
  const ordersResult = await db.execute(`
    SELECT o.*,
           c.name       AS customer_name,
           c.phone      AS customer_phone,
           c.group_type AS customer_group,
           c.address    AS customer_address,
           c.email      AS customer_email
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    ORDER BY o.created_at DESC
  `);

  const itemsResult = await db.execute(`
    SELECT oi.*,
           s.name  AS style_name,
           f.name  AS fabric_name,
           sz.name AS size_name
    FROM order_items oi
    LEFT JOIN styles  s  ON oi.style_id  = s.id
    LEFT JOIN fabrics f  ON oi.fabric_id = f.id
    LEFT JOIN sizes   sz ON oi.size_id   = sz.id
    ORDER BY oi.sort_order ASC
  `);

  const accessoriesResult = await db.execute(`
    SELECT oia.*, a.name AS accessory_name, a.unit
    FROM order_item_accessories oia
    JOIN accessories a ON oia.accessory_id = a.id
  `);

  // serialize all raw rows first
  const orders = serialize(ordersResult.rows);
  const items = serialize(itemsResult.rows);
  const accRows = serialize(accessoriesResult.rows);

  const accessoriesByItem = {};
  for (const row of accRows) {
    if (!accessoriesByItem[row.order_item_id])
      accessoriesByItem[row.order_item_id] = [];
    accessoriesByItem[row.order_item_id].push(row);
  }

  const itemsByOrder = {};
  for (const row of items) {
    if (!itemsByOrder[row.order_id]) itemsByOrder[row.order_id] = [];
    itemsByOrder[row.order_id].push({
      ...row,
      accessories: accessoriesByItem[row.id] ?? [],
    });
  }

  return orders.map((o) => ({
    ...o,
    customer: {
      id: o.customer_id,
      name: o.customer_name,
      phone: o.customer_phone,
      group: o.customer_group,
      address: o.customer_address,
      email: o.customer_email,
    },
    items: itemsByOrder[o.id] ?? [],
    finalTotal: o.final_total,
    paymentMethod: o.payment_method,
    paymentStatus: o.payment_status,
    productionCost: o.production_cost,
    invoicePrice: o.invoice_price,
    invoiceLocked: o.invoice_locked === 1,
    amountPaid: o.amount_paid, // ← add this
    createdAt: o.created_at,
  }));
}

export async function getOrderFormData() {
  const [stylesRes, fabricsRes, sizesRes, accessoriesRes] = await Promise.all([
    db.execute(
      `SELECT id, name FROM styles WHERE status = 1 ORDER BY name ASC`,
    ),
    db.execute(
      `SELECT id, name, material FROM fabrics WHERE status = 1 ORDER BY name ASC`,
    ),
    db.execute(
      `SELECT id, name, label, sort_order FROM sizes WHERE status = 1 ORDER BY sort_order ASC`,
    ),
    db.execute(
      `SELECT id, name, unit, cost_price FROM accessories WHERE status = 1 ORDER BY name ASC`,
    ),
  ]);
  return {
    styles: serialize(stylesRes.rows),
    fabrics: serialize(fabricsRes.rows),
    sizes: serialize(sizesRes.rows),
    accessories: serialize(accessoriesRes.rows),
  };
}

export async function createOrder({
  customerId,
  items,
  discount,
  paymentMethod,
  paymentStatus,
  notes,
  cashier,
}) {
  const code = generateOrderCode();
  const subtotal = items.reduce((s, i) => s + i.invoice_price * i.qty, 0);
  const productionCost = items.reduce(
    (s, i) => s + i.production_cost * i.qty,
    0,
  );
  const discountVal = Number(discount) || 0;
  const finalTotal = subtotal - discountVal;

  const result = await db.execute({
    sql: `INSERT INTO orders
            (code, customer_id, subtotal, discount, final_total, production_cost,
             invoice_price, payment_method, payment_status, notes, cashier, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [
      code,
      customerId,
      subtotal,
      discountVal,
      finalTotal,
      productionCost,
      subtotal,
      paymentMethod || "cash",
      paymentStatus || "unpaid",
      notes || null,
      cashier || null,
    ],
  });

  const orderId = Number(result.lastInsertRowid);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemResult = await db.execute({
      sql: `INSERT INTO order_items
              (order_id, style_id, fabric_id, size_id, size_marker, weight,
               colorway, colour_fabric, description, qty,
               production_cost, invoice_price, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        orderId,
        item.style_id || null,
        item.fabric_id || null,
        item.size_id || null,
        item.size_marker || null,
        item.weight || null,
        item.colorway || null,
        item.colour_fabric || null,
        item.description || null,
        item.qty,
        item.production_cost || 0,
        item.invoice_price || 0,
        i,
      ],
    });

    const orderItemId = Number(itemResult.lastInsertRowid);

    if (item.accessories?.length) {
      for (const acc of item.accessories) {
        await db.execute({
          sql: `INSERT INTO order_item_accessories
                  (order_item_id, accessory_id, qty, cost_price, notes)
                VALUES (?, ?, ?, ?, ?)`,
          args: [
            orderItemId,
            acc.accessory_id,
            acc.qty,
            acc.cost_price || 0,
            acc.notes || null,
          ],
        });
      }
    }
  }

  await db.execute({
    sql: `UPDATE customers
          SET total_orders = total_orders + 1,
              total_spent  = total_spent  + ?,
              last_order   = date('now'),
              points       = points + ?
          WHERE id = ?`,
    args: [finalTotal, Math.floor(finalTotal / 1000), customerId],
  });

  const orderRow = await db.execute({
    sql: `SELECT o.*,
                 c.name    AS customer_name,
                 c.phone   AS customer_phone,
                 c.address AS customer_address,
                 c.email   AS customer_email
          FROM orders o
          JOIN customers c ON c.id = o.customer_id
          WHERE o.id = ?`,
    args: [orderId],
  });

  const itemRows = await db.execute({
    sql: `SELECT * FROM order_items WHERE order_id = ? ORDER BY sort_order ASC`,
    args: [orderId],
  });

  const toObj = (row) =>
    Object.fromEntries(
      Object.entries(row).map(([k, v]) => [
        k,
        typeof v === "bigint" ? Number(v) : v,
      ]),
    );

  revalidatePath("/dashboard/orders");
  return {
    code,
    orderId,
    order: toObj(orderRow.rows[0]),
    items: itemRows.rows.map(toObj),
  };
}

export async function updateOrderStatus(id, status) {
  await db.execute({
    sql: `UPDATE orders SET status=?, updated_at=datetime('now') WHERE id=?`,
    args: [status, id],
  });
  revalidatePath("/dashboard/orders");
}

export async function cancelOrder(id) {
  await db.execute({
    sql: `UPDATE orders SET status='cancelled', updated_at=datetime('now') WHERE id=?`,
    args: [id],
  });
  revalidatePath("/dashboard/orders");
}

export async function searchCustomers(query) {
  const result = await db.execute({
    sql: `SELECT id, name, phone, email, address, group_type AS "group", status
          FROM customers
          WHERE status = 'aktif' AND (name LIKE ? OR phone LIKE ?)
          ORDER BY name ASC LIMIT 10`,
    args: [`%${query}%`, `%${query}%`],
  });
  return serialize(result.rows);
}

export async function saveProductionCosts({ orderId, items }) {
  for (const item of items) {
    const { productionCost, breakdown, itemId } = item;

    // update production_cost total on order_items
    await db.execute({
      sql: `UPDATE order_items 
            SET production_cost = ?, updated_at = datetime('now') 
            WHERE id = ?`,
      args: [productionCost, itemId],
    });

    // upsert breakdown into order_item_costs
    await db.execute({
      sql: `INSERT INTO order_item_costs 
              (order_item_id, sewing, buttonhole, swir, assembly, embroidery, prewash)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(order_item_id) DO UPDATE SET
              sewing     = excluded.sewing,
              buttonhole = excluded.buttonhole,
              swir       = excluded.swir,
              assembly   = excluded.assembly,
              embroidery = excluded.embroidery,
              prewash    = excluded.prewash,
              updated_at = datetime('now')`,
      args: [
        itemId,
        breakdown.sewing || 0,
        breakdown.buttonhole || 0,
        breakdown.swir || 0,
        breakdown.assembly || 0,
        breakdown.embroidery || 0,
        breakdown.prewash || 0,
      ],
    });
  }

  // recalculate order-level production_cost
  const result = await db.execute({
    sql: `SELECT SUM(production_cost * qty) as total FROM order_items WHERE order_id = ?`,
    args: [orderId],
  });
  const totalProduction = result.rows[0]?.total || 0;

  await db.execute({
    sql: `UPDATE orders 
          SET status = 'confirmed', production_cost = ?, updated_at = datetime('now') 
          WHERE id = ?`,
    args: [totalProduction, orderId],
  });

  revalidatePath("/dashboard/orders");
}

export async function markOrderDone({ orderId, amountPaid }) {
  const current = await db.execute({
    sql: `SELECT final_total, amount_paid FROM orders WHERE id = ?`,
    args: [orderId],
  });
  const row = current.rows[0];
  const totalPaidSoFar = (row.amount_paid || 0) + amountPaid;
  const isFullyPaid = totalPaidSoFar >= row.final_total;

  await db.execute({
    sql: `UPDATE orders
          SET status         = ?,
              payment_status = ?,
              amount_paid    = ?,
              updated_at     = datetime('now')
          WHERE id = ?`,
    args: [
      isFullyPaid ? "done" : "confirmed",
      isFullyPaid ? "paid" : "deposit",
      totalPaidSoFar,
      orderId,
    ],
  });

  revalidatePath("/dashboard/orders");
}
