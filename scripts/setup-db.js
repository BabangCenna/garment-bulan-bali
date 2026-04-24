#!/usr/bin/env node
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
// ============================================================
// TokoKu — Database Setup Script
// Run once: node scripts/setup-db.js
// ============================================================

import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import * as argon2 from "argon2";

import bcrypt from "bcryptjs";
import * as readline from "readline/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── 1. Validate env ──────────────────────────────────────────
const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_AUTH) {
  console.error(`
❌  Missing environment variables.
    Make sure your .env.local has:

    TURSO_DATABASE_URL=libsql://your-db-name.turso.io
    TURSO_AUTH_TOKEN=your-token-here
`);
  process.exit(1);
}

// ── 2. Connect ───────────────────────────────────────────────
const db = createClient({ url: TURSO_URL, authToken: TURSO_AUTH });

// ── 3. Run schema ────────────────────────────────────────────
console.log("📦  Running schema...");
const sql = readFileSync(join(__dirname, "../db/schema.sql"), "utf8");

const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--"));

for (const statement of statements) {
  await db.execute(statement);
}
console.log("✅  Schema applied.");

// ── 4. Create owner account ──────────────────────────────────
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("\n👤  Create your Owner account\n");
const username = await rl.question("   Username  : ");
const fullName = await rl.question("   Full name : ");
const email = await rl.question("   Email     : ");
const password = await rl.question("   Password  : ");
rl.close();

if (!username || !password) {
  console.error("\n❌  Username and password are required.");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);

const ownerRole = await db.execute(
  "SELECT id FROM roles WHERE slug = 'owner' LIMIT 1",
);
const roleId = ownerRole.rows[0].id;

await db.execute({
  sql: `INSERT INTO users (role_id, username, password_hash, full_name, email)
        VALUES (?, ?, ?, ?, ?)`,
  args: [roleId, username, hash, fullName || null, email || null],
});

console.log(`\n🎉  Owner account "${username}" created successfully!`);
console.log("    You can now log in to TokoKu.\n");
