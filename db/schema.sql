-- ============================================================
-- TokoKu — Auth Schema
-- Compatible with: Turso (libsql) and MySQL
-- To migrate to MySQL later: change AUTOINCREMENT → AUTO_INCREMENT
-- ============================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- Roles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        VARCHAR(50)  NOT NULL UNIQUE,
  slug        VARCHAR(50)  NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  role_id         INTEGER      NOT NULL,
  username        VARCHAR(100) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  full_name       VARCHAR(150),
  email           VARCHAR(150) UNIQUE,
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  last_login_at   TIMESTAMP,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- ------------------------------------------------------------
-- Sessions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_sessions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER      NOT NULL,
  token       VARCHAR(255) NOT NULL UNIQUE,
  ip_address  VARCHAR(45),
  user_agent  TEXT,
  expires_at  TIMESTAMP    NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Seed: Roles
-- ------------------------------------------------------------
INSERT OR IGNORE INTO roles (name, slug, description) VALUES
  ('Owner', 'owner', 'Full access to all features'),
  ('Admin', 'admin', 'Manage store operations'),
  ('Staff', 'staff', 'Point of sale and basic operations');