// app/api/orders/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

/** Generate order code: ORD_<seq>_<YYYY>_<MM>_<DD> */
async function generateOrderCode() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const prefix = `ORD_%_${yyyy}_${mm}_${dd}`;

  // count how many orders exist today to get sequence
  const count = await db.execute({
    sql: `SELECT COUNT(*) as c FROM orders WHERE created_at >= date('now')`,
    args: [],
  });
  const seq = String((count.rows[0].c ?? 0) + 1).padStart(2, "0");

  return `ORD_${seq}_${yyyy}_${mm}_${dd}`;
}

export async function POST(request) {
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { customer_id, payment_method, payment_status, notes, items } = body;

    if (!customer_id) {
      return NextResponse.json(
        { error: "customer_id wajib diisi" },
        { status: 400 },
      );
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Minimal 1 item pesanan" },
        { status: 400 },
      );
    }

    const code = await generateOrderCode();
    const cashier = session.user.name || session.user.username || "Admin";

    // compute totals from items
    const subtotal = items.reduce((s, i) => s + i.invoice_price * i.qty, 0);
    const production_cost = items.reduce(
      (s, i) => s + i.production_cost * i.qty,
      0,
    );
    const final_total = subtotal; // no discount at order creation

    // insert order
    const orderResult = await db.execute({
      sql: `INSERT INTO orders
              (code, customer_id, status, payment_method, payment_status,
               subtotal, discount, final_total, production_cost, invoice_price,
               invoice_locked, notes, cashier)
            VALUES (?, ?, 'pending', ?, ?,
                    ?, 0, ?, ?, ?,
                    0, ?, ?)`,
      args: [
        code,
        customer_id,
        payment_method || "cash",
        payment_status || "unpaid",
        subtotal,
        final_total,
        production_cost,
        subtotal,
        notes?.trim() || null,
        cashier,
      ],
    });

    const orderId = orderResult.lastInsertRowid;

    // insert items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await db.execute({
        sql: `INSERT INTO order_items
                (order_id, style_id, fabric_id, size_id,
                 size_marker, weight, colorway, colour_fabric,
                 description, qty, production_cost, invoice_price, sort_order)
              VALUES (?, ?, ?, ?,
                      ?, ?, ?, ?,
                      ?, ?, ?, ?, ?)`,
        args: [
          orderId,
          item.style_id || null,
          item.fabric_id || null,
          item.size_id || null,
          item.size_marker?.trim() || null,
          item.weight?.trim() || null,
          item.colorway?.trim() || null,
          item.colour_fabric?.trim() || null,
          item.description?.trim() || null,
          item.qty || 1,
          item.production_cost || 0,
          item.invoice_price || 0,
          i,
        ],
      });
    }

    // update customer stats
    await db.execute({
      sql: `UPDATE customers
            SET total_orders = total_orders + 1,
                total_spent  = total_spent + ?,
                last_order   = date('now'),
                updated_at   = datetime('now')
            WHERE id = ?`,
      args: [final_total, customer_id],
    });

    // return the created order with customer
    const order = await db.execute({
      sql: `SELECT o.*, c.name as customer_name, c.phone as customer_phone
            FROM orders o
            JOIN customers c ON c.id = o.customer_id
            WHERE o.id = ?`,
      args: [orderId],
    });

    return NextResponse.json({ order: order.rows[0] }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
