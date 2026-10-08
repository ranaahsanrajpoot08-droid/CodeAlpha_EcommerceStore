-- =====================================================================
--  E-commerce Store database for XAMPP / MySQL (phpMyAdmin -> SQL tab)
--  Re-running this file RESETS the database (all data is deleted).
-- =====================================================================
CREATE DATABASE IF NOT EXISTS ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecommerce_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------- users ----------
CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,            -- bcrypt hash, never plain text
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ---------- products ----------
CREATE TABLE products (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image VARCHAR(500) DEFAULT NULL,
  category VARCHAR(80) NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_products_category (category),
  KEY idx_products_name (name),
  CONSTRAINT chk_products_price CHECK (price >= 0)
) ENGINE=InnoDB;

-- ---------- orders ----------
CREATE TABLE orders (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('Pending','Processing','Shipped','Delivered','Cancelled') NOT NULL DEFAULT 'Pending',
  shipping_name VARCHAR(100) NOT NULL,
  shipping_email VARCHAR(150) NOT NULL,
  shipping_phone VARCHAR(30) NOT NULL,
  shipping_address VARCHAR(255) NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_postal_code VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_orders_user (user_id),
  KEY idx_orders_status (status),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------- order_items ----------
CREATE TABLE order_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  price DECIMAL(10,2) NOT NULL,              -- price at the time of purchase
  PRIMARY KEY (id),
  KEY idx_items_order (order_id),
  KEY idx_items_product (product_id),
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------- Admin + test user (passwords are bcrypt hashes) ----------
-- admin@example.com / Admin@123      user@example.com / User@123
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@example.com', '$2a$10$71ydx3Uaolk2jRaE0jyqc.VMFOBqGKUYwZI85OfBW90YwPPegKgfW', 'admin'),
('Test User', 'user@example.com', '$2a$10$STuapvtjoisu0izBTkuuuerNjbtV75Ccml8gUkfUOz7CTAH34MLum', 'user');

-- ---------- Sample products ----------
INSERT INTO products (name, description, price, image, category, stock) VALUES
('Wireless Headphones', 'Over-ear Bluetooth headphones with noise isolation and 30 hours of battery life.', 89.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80&auto=format&fit=crop', 'Electronics', 25),
('Smart Watch Series 5', 'Fitness tracking, heart-rate monitor, sleep tracking and phone notifications on your wrist.', 149.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80&auto=format&fit=crop', 'Electronics', 15),
('Wireless Gaming Mouse', 'Ergonomic mouse with adjustable DPI, programmable buttons and a long-lasting rechargeable battery.', 39.50, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80&auto=format&fit=crop', 'Electronics', 40),
('Ultrabook Laptop 14"', 'Lightweight 14-inch laptop with a fast SSD, 16GB RAM and all-day battery life.', 749.00, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80&auto=format&fit=crop', 'Electronics', 8),
('Classic White T-Shirt', 'Soft 100% cotton crew-neck t-shirt with a relaxed everyday fit.', 14.99, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80&auto=format&fit=crop', 'Clothing', 100),
('Denim Jacket', 'Timeless medium-wash denim jacket with button front and chest pockets.', 59.90, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80&auto=format&fit=crop', 'Clothing', 30),
('Running Shoes', 'Breathable, cushioned running shoes designed for daily training and long distances.', 79.95, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&auto=format&fit=crop', 'Shoes', 35),
('Casual Sneakers', 'Clean low-top sneakers that go with everything, from jeans to shorts.', 64.00, 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80&auto=format&fit=crop', 'Shoes', 20),
('Everyday Backpack', 'Water-resistant 20L backpack with a padded laptop sleeve and multiple pockets.', 44.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80&auto=format&fit=crop', 'Accessories', 50),
('Polarized Sunglasses', 'UV400 polarized sunglasses with a lightweight durable frame.', 24.99, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80&auto=format&fit=crop', 'Accessories', 60),
('Ceramic Table Lamp', 'Modern ceramic lamp with a linen shade. Adds a warm glow to any room.', 34.50, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80&auto=format&fit=crop', 'Home', 18),
('Cozy Throw Blanket', 'Soft knitted throw blanket, perfect for the sofa or bed.', 27.00, 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=600&q=80&auto=format&fit=crop', 'Home', 45);
