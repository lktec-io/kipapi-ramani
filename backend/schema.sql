-- =============================================================================
--  KIPAPI RAMANI — MySQL Database Schema
--  Engine : InnoDB  |  Charset : utf8mb4  |  Collation : utf8mb4_unicode_ci
-- =============================================================================

CREATE DATABASE IF NOT EXISTS kipapi_ramani
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE kipapi_ramani;

-- =============================================================================
--  TABLE: users
--  Stores both clients (buyers) and admin accounts.
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id           INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  name         VARCHAR(100)     NOT NULL,
  email        VARCHAR(150)     NOT NULL,
  password     VARCHAR(255)     NOT NULL,                    -- bcrypt hash (cost 12)
  role         ENUM('client', 'admin') NOT NULL DEFAULT 'client',
  created_at   TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
--  TABLE: house_plans
--  Product catalog. thumbnail_url is public; secure_file_path is server-side only.
-- =============================================================================
CREATE TABLE IF NOT EXISTS house_plans (
  id                INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  title             VARCHAR(200)     NOT NULL,
  description       TEXT,
  price             DECIMAL(14, 2)   NOT NULL,               -- TZS — no decimals in practice, but stored for flexibility
  bedrooms          TINYINT UNSIGNED NOT NULL,
  bathrooms         TINYINT UNSIGNED NOT NULL DEFAULT 1,
  stories           TINYINT UNSIGNED NOT NULL DEFAULT 1,
  plot_size         VARCHAR(60),                             -- e.g. "15m × 20m", "300 sqm"
  style             VARCHAR(100),                            -- e.g. "Modern", "Swahili", "Bungalow"
  thumbnail_url     VARCHAR(500)     NOT NULL,               -- public path under /uploads/thumbnails/
  secure_file_path  VARCHAR(500)     NOT NULL,               -- absolute server path inside secure_storage/
  is_active         TINYINT(1)       NOT NULL DEFAULT 1,     -- soft delete flag
  created_at        TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  -- Filter query indexes (used by GET /api/plans?bedrooms=3&style=Modern&minPrice=...)
  INDEX idx_plans_bedrooms  (bedrooms),
  INDEX idx_plans_stories   (stories),
  INDEX idx_plans_style     (style),
  INDEX idx_plans_price     (price),
  INDEX idx_plans_active    (is_active),

  -- Composite for the most common filtered browse query
  INDEX idx_plans_filter    (is_active, bedrooms, stories, style, price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
--  TABLE: orders
--  One row per purchase attempt. Linked to user and plan at time of purchase.
--  total_amount is a snapshot — plan price may change later.
-- =============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id                 INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  user_id            INT UNSIGNED      NOT NULL,
  plan_id            INT UNSIGNED      NOT NULL,
  total_amount       DECIMAL(14, 2)    NOT NULL,             -- price snapshot at purchase time
  payment_status     ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
  payment_method     VARCHAR(50),                            -- 'mpesa' | 'tigopesa' | 'airtel' | 'halopesa'
  payment_reference  VARCHAR(200)      DEFAULT NULL,         -- transaction ID returned by gateway
  phone_number       VARCHAR(20)       NOT NULL,             -- mobile money number used
  created_at         TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  CONSTRAINT fk_orders_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,

  CONSTRAINT fk_orders_plan FOREIGN KEY (plan_id)
    REFERENCES house_plans (id) ON DELETE RESTRICT ON UPDATE CASCADE,

  -- Webhook lookup — gateway sends back the reference to match an order
  UNIQUE KEY uq_orders_reference (payment_reference),

  INDEX idx_orders_user    (user_id),
  INDEX idx_orders_plan    (plan_id),
  INDEX idx_orders_status  (payment_status),

  -- Admin dashboard analytics: sales by date
  INDEX idx_orders_date    (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
--  TABLE: downloads
--  Secure, time-limited, count-limited download tokens.
--  A token is created only after payment_status = 'paid'.
--  The file is never served directly — Express validates this token first.
-- =============================================================================
CREATE TABLE IF NOT EXISTS downloads (
  id              INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  order_id        INT UNSIGNED      NOT NULL,
  unique_token    VARCHAR(64)       NOT NULL,               -- crypto.randomBytes(32).toString('hex')
  expires_at      DATETIME          NOT NULL,               -- NOW() + DOWNLOAD_TOKEN_EXPIRES_HOURS
  download_count  TINYINT UNSIGNED  NOT NULL DEFAULT 0,
  max_downloads   TINYINT UNSIGNED  NOT NULL DEFAULT 3,     -- configurable per order if needed
  created_at      TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  CONSTRAINT fk_downloads_order FOREIGN KEY (order_id)
    REFERENCES orders (id) ON DELETE CASCADE ON UPDATE CASCADE,

  UNIQUE KEY uq_downloads_token   (unique_token),
  INDEX      idx_downloads_order  (order_id),

  -- Fast expiry check in controller: WHERE unique_token = ? AND expires_at > NOW()
  INDEX      idx_downloads_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
--  SEED: default admin account
--  Password: Admin@12345  (bcrypt hash — CHANGE THIS before going live)
--  Generate a new hash: node -e "const b=require('bcryptjs'); b.hash('yourpass',12).then(console.log)"
-- =============================================================================
INSERT IGNORE INTO users (name, email, password, role) VALUES (
  'Kipapi Admin',
  'admin@kipapi.co.tz',
  '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- placeholder hash
  'admin'
);
