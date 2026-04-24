"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
  const result = await db.execute(`SELECT * FROM customers ORDER BY name ASC`);
  return result.rows.map((r) => ({
    ...r,
    group: r.group_type,
    totalOrders: r.total_orders,
    totalSpent: r.total_spent,
    lastOrder: r.last_order,
  }));
}

export async function createCustomer({
  name,
  phone,
  email,
  address,
  group,
  notes,
  status,
}) {
  await db.execute({
    sql: `INSERT INTO customers (name, phone, email, address, group_type, notes, status, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [
      name,
      phone,
      email || null,
      address || null,
      group || "reguler",
      notes || null,
      status === true || status === "aktif" ? "aktif" : "nonaktif",
    ],
  });
  revalidatePath("/dashboard/customers");
}

export async function updateCustomer({
  id,
  name,
  phone,
  email,
  address,
  group,
  notes,
  status,
}) {
  await db.execute({
    sql: `UPDATE customers SET name=?, phone=?, email=?, address=?, group_type=?, notes=?, status=?, updated_at=datetime('now') WHERE id=?`,
    args: [
      name,
      phone,
      email || null,
      address || null,
      group || "reguler",
      notes || null,
      status === true || status === "aktif" ? "aktif" : "nonaktif",
      id,
    ],
  });
  revalidatePath("/dashboard/customers");
}

export async function deleteCustomer(id) {
  await db.execute({ sql: `DELETE FROM customers WHERE id=?`, args: [id] });
  revalidatePath("/dashboard/customers");
}

export async function toggleCustomerStatus(id, currentStatus) {
  const next = currentStatus === "aktif" ? "nonaktif" : "aktif";
  await db.execute({
    sql: `UPDATE customers SET status=?, updated_at=datetime('now') WHERE id=?`,
    args: [next, id],
  });
  revalidatePath("/dashboard/customers");
}
