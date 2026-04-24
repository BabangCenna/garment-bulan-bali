"use server";

import { db } from "@/lib/db";
import { sessionOptions } from "@/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function loginAction(formData) {
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    return { error: "Username dan password wajib diisi" };
  }

  const result = await db.execute({
    sql: `SELECT u.id, u.username, u.full_name, u.password_hash, u.is_active,
                 r.slug as role
          FROM users u
          JOIN roles r ON r.id = u.role_id
          WHERE u.username = ?
          LIMIT 1`,
    args: [username],
  });

  const user = result.rows[0];

  if (!user) {
    return { error: "Username atau password salah" };
  }

  if (!user.is_active) {
    return { error: "Akun kamu tidak aktif, hubungi administrator" };
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return { error: "Username atau password salah" };
  }

  await db.execute({
    sql: `UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?`,
    args: [user.id],
  });

  const session = await getIronSession(await cookies(), sessionOptions);
  session.user = {
    id: user.id,
    username: user.username,
    fullName: user.full_name,
    role: user.role,
  };
  await session.save();

  redirect("/dashboard");
}
