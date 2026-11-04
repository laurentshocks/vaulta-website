-- VAULTA database: products, photos, accounts, pre-orders, business quotes

CREATE TABLE products (
  id              TEXT PRIMARY KEY,            -- url slug, e.g. "metrosecure-pro"
  sku             TEXT NOT NULL,
  category        TEXT NOT NULL,               -- backpack | small | business
  price_cents     INTEGER NOT NULL,            -- price incl. VAT, in euro cents
  ribbon          TEXT,                        -- small label on the photo, e.g. "Flagship"
  hot             INTEGER NOT NULL DEFAULT 0,  -- 1 = orange ribbon
  fill_photo      INTEGER NOT NULL DEFAULT 0,  -- 1 = main photo has its own background
  has_fingerprint INTEGER NOT NULL DEFAULT 0,
  featured        INTEGER NOT NULL DEFAULT 0,  -- 1 = shown on the home page
  active          INTEGER NOT NULL DEFAULT 1,  -- 0 = hidden from the shop
  sort            INTEGER NOT NULL DEFAULT 100,
  dimensions      TEXT,
  weight          TEXT,
  volume          TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE product_translations (
  product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  locale      TEXT NOT NULL,                   -- fr | nl | en
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  points      TEXT NOT NULL DEFAULT '[]',      -- JSON array of bullet points
  chips       TEXT NOT NULL DEFAULT '[]',      -- JSON array of short tags
  materials   TEXT NOT NULL DEFAULT '',
  colours     TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (product_id, locale)
);

CREATE TABLE product_images (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  r2_key     TEXT NOT NULL,                    -- file name in the R2 image storage
  sort       INTEGER NOT NULL DEFAULT 0        -- 0 = main photo
);
CREATE INDEX idx_images_product ON product_images(product_id, sort);

CREATE TABLE users (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  email                TEXT NOT NULL UNIQUE,
  password_hash        TEXT NOT NULL,
  name                 TEXT NOT NULL DEFAULT '',
  company              TEXT,
  vat_number           TEXT,
  role                 TEXT NOT NULL DEFAULT 'customer',  -- customer | admin
  locale               TEXT NOT NULL DEFAULT 'en',
  marketing_consent    INTEGER NOT NULL DEFAULT 0,        -- 1 = agreed to receive campaigns
  marketing_consent_at TEXT,
  welcome_code         TEXT NOT NULL,                     -- personal 10% code
  welcome_code_used    INTEGER NOT NULL DEFAULT 0,
  created_at           TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sessions (
  id         TEXT PRIMARY KEY,                 -- SHA-256 of the cookie token
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

CREATE TABLE preorders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  product_id    TEXT NOT NULL,
  quantity      INTEGER NOT NULL DEFAULT 1,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  locale        TEXT NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  discount_code TEXT,
  status        TEXT NOT NULL DEFAULT 'new',   -- new | confirmed | shipped | cancelled
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_preorders_user ON preorders(user_id);

CREATE TABLE quotes (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  company        TEXT NOT NULL,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  country        TEXT,
  product_id     TEXT,
  quantity_range TEXT,
  message        TEXT,
  locale         TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'new',  -- new | contacted | won | lost
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
