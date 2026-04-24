"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

function serialize(rows) {
  return rows.map((row) => JSON.parse(JSON.stringify(row)));
}

export async function getUsers() {
  const result = await db.execute(`
    SELECT u.id, u.username, u.full_name, u.email, u.is_active,
           u.last_login_at, u.created_at, u.updated_at,
           r.id as role_id, r.name as role_name, r.slug as role_slug
    FROM users u
    JOIN roles r ON u.role_id = r.id
    ORDER BY u.created_at DESC
  `);
  return serialize(result.rows).map((r) => ({
    ...r,
    isActive: r.is_active === 1 || r.is_active === true,
    lastLoginAt: r.last_login_at,
    createdAt: r.created_at,
    role: { id: r.role_id, name: r.role_name, slug: r.role_slug },
  }));
}

export async function getRoles() {
  const result = await db.execute(`SELECT * FROM roles ORDER BY id ASC`);
  return serialize(result.rows);
}

export async function createUser({
  username,
  fullName,
  email,
  password,
  roleId,
  isActive,
}) {
  // check username unique
  const existing = await db.execute({
    sql: `SELECT id FROM users WHERE username = ?`,
    args: [username],
  });
  if (existing.rows.length > 0) {
    throw new Error("Username sudah digunakan.");
  }

  const hash = await bcrypt.hash(password, 10);
  await db.execute({
    sql: `INSERT INTO users (role_id, username, password_hash, full_name, email, is_active, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    args: [
      roleId,
      username,
      hash,
      fullName || null,
      email || null,
      isActive ? 1 : 0,
    ],
  });
  revalidatePath("/dashboard/users");
}

export async function updateUser({
  id,
  username,
  fullName,
  email,
  roleId,
  isActive,
}) {
  // check username unique excluding self
  const existing = await db.execute({
    sql: `SELECT id FROM users WHERE username = ? AND id != ?`,
    args: [username, id],
  });
  if (existing.rows.length > 0) {
    throw new Error("Username sudah digunakan.");
  }

  await db.execute({
    sql: `UPDATE users SET role_id=?, username=?, full_name=?, email=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    args: [
      roleId,
      username,
      fullName || null,
      email || null,
      isActive ? 1 : 0,
      id,
    ],
  });
  revalidatePath("/dashboard/users");
}

export async function resetPassword({ id, newPassword }) {
  const hash = await bcrypt.hash(newPassword, 10);
  await db.execute({
    sql: `UPDATE users SET password_hash=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    args: [hash, id],
  });
  revalidatePath("/dashboard/users");
}

export async function toggleUserStatus(id, currentStatus) {
  await db.execute({
    sql: `UPDATE users SET is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    args: [currentStatus ? 0 : 1, id],
  });
  revalidatePath("/dashboard/users");
}

export async function deleteUser(id) {
  // delete sessions first
  await db.execute({
    sql: `DELETE FROM user_sessions WHERE user_id=?`,
    args: [id],
  });
  await db.execute({ sql: `DELETE FROM users WHERE id=?`, args: [id] });
  revalidatePath("/dashboard/users");
}
