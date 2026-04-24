// app/actions/settings.js
"use server";

import { db } from "@/lib/db";

const toPlain = (rows) => rows.map((r) => ({ ...r }));

// ─── GET ──────────────────────────────────────────────────────────
export async function getSiteConfig() {
  const [cfgRows, featStyleRows, featFabricRows] = await Promise.all([
    db.execute("SELECT key, value FROM site_config"),
    db.execute(`
      SELECT lfs.id, lfs.badge, lfs.sort_order,
             s.id as style_id, s.name, s.description
      FROM landing_featured_styles lfs
      JOIN styles s ON s.id = lfs.style_id
      ORDER BY lfs.sort_order
    `),
    db.execute(`
      SELECT lff.id, lff.color, lff.sort_order,
             f.id as fabric_id, f.name, f.material, f.description
      FROM landing_featured_fabrics lff
      JOIN fabrics f ON f.id = lff.fabric_id
      ORDER BY lff.sort_order
    `),
  ]);

  const cfg = Object.fromEntries(cfgRows.rows.map((r) => [r.key, r.value]));

  return {
    site: {
      name: cfg["site.name"] ?? "",
      tagline: cfg["site.tagline"] ?? "",
      description: cfg["site.description"] ?? "",
      logo: cfg["site.logo"] ?? "",
    },
    contact: {
      whatsapp: cfg["contact.whatsapp"] ?? "",
      email: cfg["contact.email"] ?? "",
      instagram: cfg["contact.instagram"] ?? "",
    },
    hero: {
      headline: cfg["hero.headline"] ?? "",
      headlineAccent: cfg["hero.headlineAccent"] ?? "",
      subheadline: cfg["hero.subheadline"] ?? "",
      cta: cfg["hero.cta"] ?? "",
    },
    about: {
      title: cfg["about.title"] ?? "",
      body: cfg["about.body"] ?? "",
      highlight: cfg["about.highlight"] ?? "",
    },
    styles: toPlain(featStyleRows.rows),
    fabrics: toPlain(featFabricRows.rows),
  };
}

export async function getAvailableStyles() {
  const res = await db.execute(
    "SELECT id, name FROM styles WHERE status = 1 ORDER BY name",
  );
  return toPlain(res.rows);
}

export async function getAvailableFabrics() {
  const res = await db.execute(
    "SELECT id, name, material FROM fabrics WHERE status = 1 ORDER BY name",
  );
  return toPlain(res.rows);
}

// ─── UPDATE SITE IDENTITY ─────────────────────────────────────────
export async function updateSiteConfig({ name, tagline, description, logo }) {
  await db.batch([
    {
      sql: "INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)",
      args: ["site.name", name ?? ""],
    },
    {
      sql: "INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)",
      args: ["site.tagline", tagline ?? ""],
    },
    {
      sql: "INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)",
      args: ["site.description", description ?? ""],
    },
    {
      sql: "INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)",
      args: ["site.logo", logo ?? ""],
    },
  ]);
}

// ─── UPDATE CONTACT ───────────────────────────────────────────────
export async function updateContactConfig({ whatsapp, email, instagram }) {
  await db.batch([
    {
      sql: "INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)",
      args: ["contact.whatsapp", whatsapp ?? ""],
    },
    {
      sql: "INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)",
      args: ["contact.email", email ?? ""],
    },
    {
      sql: "INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)",
      args: ["contact.instagram", instagram ?? ""],
    },
  ]);
}

// ─── UPDATE HERO ──────────────────────────────────────────────────
export async function updateHeroSection({
  headline,
  headlineAccent,
  subheadline,
  cta,
}) {
  await db.batch([
    {
      sql: "INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)",
      args: ["hero.headline", headline ?? ""],
    },
    {
      sql: "INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)",
      args: ["hero.headlineAccent", headlineAccent ?? ""],
    },
    {
      sql: "INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)",
      args: ["hero.subheadline", subheadline ?? ""],
    },
    {
      sql: "INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)",
      args: ["hero.cta", cta ?? ""],
    },
  ]);
}

// ─── UPDATE ABOUT ─────────────────────────────────────────────────
export async function updateAboutSection({ title, body, highlight }) {
  await db.batch([
    {
      sql: "INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)",
      args: ["about.title", title ?? ""],
    },
    {
      sql: "INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)",
      args: ["about.body", body ?? ""],
    },
    {
      sql: "INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)",
      args: ["about.highlight", highlight ?? ""],
    },
  ]);
}

// ─── UPDATE FEATURED STYLES ───────────────────────────────────────
export async function updateFeaturedStyles(styles) {
  await db.batch([
    { sql: "DELETE FROM landing_featured_styles", args: [] },
    ...styles.map((s, i) => ({
      sql: "INSERT INTO landing_featured_styles (style_id, badge, sort_order) VALUES (?, ?, ?)",
      args: [s.style_id, s.badge ?? null, i + 1],
    })),
  ]);
}

// ─── UPDATE FEATURED FABRICS ──────────────────────────────────────
export async function updateFeaturedFabrics(fabrics) {
  await db.batch([
    { sql: "DELETE FROM landing_featured_fabrics", args: [] },
    ...fabrics.map((f, i) => ({
      sql: "INSERT INTO landing_featured_fabrics (fabric_id, color, sort_order) VALUES (?, ?, ?)",
      args: [f.fabric_id, f.color ?? "sand", i + 1],
    })),
  ]);
}

// ─── UPDATE SOCIAL (unused for now, kept for future) ─────────────
export async function updateSocialConfig(data) {
  const entries = Object.entries(data).filter(([, v]) => v !== undefined);
  if (!entries.length) return;
  await db.batch(
    entries.map(([key, value]) => ({
      sql: "INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)",
      args: [`social.${key}`, value ?? ""],
    })),
  );
}
