// app/api/customers/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, email, address, group_type, notes } = body;

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: "Nama dan telepon wajib diisi" },
        { status: 400 },
      );
    }

    // check duplicate phone
    const existing = await db.execute({
      sql: `SELECT id FROM customers WHERE phone = ? LIMIT 1`,
      args: [phone.trim()],
    });
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "Nomor telepon sudah terdaftar" },
        { status: 409 },
      );
    }

    const result = await db.execute({
      sql: `INSERT INTO customers (name, phone, email, address, group_type, notes)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        name.trim(),
        phone.trim(),
        email?.trim() || null,
        address?.trim() || null,
        group_type || "reguler",
        notes?.trim() || null,
      ],
    });

    const newCustomer = await db.execute({
      sql: `SELECT id, name, phone, email, address, group_type, total_orders, total_spent, points, status, notes
            FROM customers WHERE id = ?`,
      args: [result.lastInsertRowid],
    });

    return NextResponse.json(
      { customer: newCustomer.rows[0] },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/customers]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
