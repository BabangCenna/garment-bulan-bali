"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ─── SIZES ────────────────────────────────────────────────────────

export async function getSizes() {
  const result = await db.execute(
    `SELECT * FROM sizes ORDER BY sort_order ASC, name ASC`,
  );
  return result.rows.map((r) => ({
    ...r,
    status: r.status === 1,
    sortOrder: r.sort_order,
    productCount: r.product_count ?? 0,
  }));
}

export async function createSize({
  name,
  label,
  description,
  sortOrder,
  status,
}) {
  await db.execute({
    sql: `INSERT INTO sizes (name, label, description, sort_order, status, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    args: [
      name,
      label || null,
      description || null,
      sortOrder || 0,
      status ? 1 : 0,
    ],
  });
  revalidatePath("/dashboard/categories");
}

export async function updateSize({
  id,
  name,
  label,
  description,
  sortOrder,
  status,
}) {
  await db.execute({
    sql: `UPDATE sizes SET name=?, label=?, description=?, sort_order=?, status=?, updated_at=datetime('now') WHERE id=?`,
    args: [
      name,
      label || null,
      description || null,
      sortOrder || 0,
      status ? 1 : 0,
      id,
    ],
  });
  revalidatePath("/dashboard/categories");
}

export async function deleteSize(id) {
  await db.execute({ sql: `DELETE FROM sizes WHERE id=?`, args: [id] });
  revalidatePath("/dashboard/categories");
}

export async function toggleSizeStatus(id, currentStatus) {
  await db.execute({
    sql: `UPDATE sizes SET status=?, updated_at=datetime('now') WHERE id=?`,
    args: [currentStatus ? 0 : 1, id],
  });
  revalidatePath("/dashboard/categories");
}

// ─── STYLES ───────────────────────────────────────────────────────

export async function getStyles() {
  const stylesResult = await db.execute(
    `SELECT * FROM styles ORDER BY name ASC`,
  );
  const tagsResult = await db.execute(`SELECT style_id, tag FROM style_tags`);

  const tagsByStyle = {};
  for (const row of tagsResult.rows) {
    if (!tagsByStyle[row.style_id]) tagsByStyle[row.style_id] = [];
    tagsByStyle[row.style_id].push(row.tag);
  }

  return stylesResult.rows.map((s) => ({
    ...s,
    status: s.status === 1,
    tags: tagsByStyle[s.id] ?? [],
    productCount: s.product_count ?? 0,
  }));
}

export async function createStyle({ name, description, tags, status }) {
  const result = await db.execute({
    sql: `INSERT INTO styles (name, description, status, updated_at) VALUES (?, ?, ?, datetime('now'))`,
    args: [name, description || null, status ? 1 : 0],
  });
  const styleId = Number(result.lastInsertRowid);
  const tagList = Array.isArray(tags)
    ? tags
    : tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
  for (const tag of tagList) {
    await db.execute({
      sql: `INSERT INTO style_tags (style_id, tag) VALUES (?, ?)`,
      args: [styleId, tag],
    });
  }
  revalidatePath("/dashboard/categories");
}

export async function updateStyle({ id, name, description, tags, status }) {
  await db.execute({
    sql: `UPDATE styles SET name=?, description=?, status=?, updated_at=datetime('now') WHERE id=?`,
    args: [name, description || null, status ? 1 : 0, id],
  });
  await db.execute({
    sql: `DELETE FROM style_tags WHERE style_id=?`,
    args: [id],
  });
  const tagList = Array.isArray(tags)
    ? tags
    : tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
  for (const tag of tagList) {
    await db.execute({
      sql: `INSERT INTO style_tags (style_id, tag) VALUES (?, ?)`,
      args: [id, tag],
    });
  }
  revalidatePath("/dashboard/categories");
}

export async function deleteStyle(id) {
  await db.execute({ sql: `DELETE FROM styles WHERE id=?`, args: [id] });
  revalidatePath("/dashboard/categories");
}

export async function toggleStyleStatus(id, currentStatus) {
  await db.execute({
    sql: `UPDATE styles SET status=?, updated_at=datetime('now') WHERE id=?`,
    args: [currentStatus ? 0 : 1, id],
  });
  revalidatePath("/dashboard/categories");
}

// ─── FABRICS ──────────────────────────────────────────────────────

export async function getFabrics() {
  const result = await db.execute(`SELECT * FROM fabrics ORDER BY name ASC`);
  return result.rows.map((r) => ({
    ...r,
    status: r.status === 1,
    productCount: r.product_count ?? 0,
  }));
}

export async function createFabric({
  name,
  material,
  weight,
  description,
  care,
  status,
}) {
  await db.execute({
    sql: `INSERT INTO fabrics (name, material, weight, description, care, status, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [
      name,
      material || null,
      weight || null,
      description || null,
      care || null,
      status ? 1 : 0,
    ],
  });
  revalidatePath("/dashboard/categories");
}

export async function updateFabric({
  id,
  name,
  material,
  weight,
  description,
  care,
  status,
}) {
  await db.execute({
    sql: `UPDATE fabrics SET name=?, material=?, weight=?, description=?, care=?, status=?, updated_at=datetime('now') WHERE id=?`,
    args: [
      name,
      material || null,
      weight || null,
      description || null,
      care || null,
      status ? 1 : 0,
      id,
    ],
  });
  revalidatePath("/dashboard/categories");
}

export async function deleteFabric(id) {
  await db.execute({ sql: `DELETE FROM fabrics WHERE id=?`, args: [id] });
  revalidatePath("/dashboard/categories");
}

export async function toggleFabricStatus(id, currentStatus) {
  await db.execute({
    sql: `UPDATE fabrics SET status=?, updated_at=datetime('now') WHERE id=?`,
    args: [currentStatus ? 0 : 1, id],
  });
  revalidatePath("/dashboard/categories");
}
