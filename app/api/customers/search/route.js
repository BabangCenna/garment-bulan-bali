// app/api/customers/search/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ customers: [] });
  }

  try {
    const like = `%${q}%`;
    const result = await db.execute({
      sql: `SELECT id, name, phone, email, address, group_type, total_orders, total_spent, points, status, notes
            FROM customers
            WHERE status = 'aktif'
              AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)
            ORDER BY name ASC
            LIMIT 10`,
      args: [like, like, like],
    });

    return NextResponse.json({ customers: result.rows });
  } catch (err) {
    console.error("[GET /api/customers/search]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
