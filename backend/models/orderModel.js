// All SQL related to orders and order_items.
const db = require('../config/db');
const AppError = require('../utils/AppError');

/**
 * Creates an order inside a MySQL TRANSACTION.
 * If anything fails, rollback() undoes everything, so we never end up with
 * a half-created order or wrong stock numbers.
 *
 * The total is calculated HERE from database prices. Prices sent by the
 * frontend are never used.
 */
exports.create = async (userId, items, shipping) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Merge duplicate products and validate quantities
    const wanted = new Map(); // productId -> quantity
    for (const item of items) {
      const productId = Number(item.productId);
      const qty = Number(item.quantity);
      if (!Number.isInteger(productId) || productId < 1 || !Number.isInteger(qty) || qty < 1) {
        throw new AppError('Invalid cart item.', 400);
      }
      wanted.set(productId, (wanted.get(productId) || 0) + qty);
    }

    // Lock the product rows so two customers cannot buy the last item at once
    const ids = [...wanted.keys()];
    const [products] = await conn.query(
      'SELECT id, name, price, stock FROM products WHERE id IN (?) FOR UPDATE',
      [ids]
    );
    if (products.length !== ids.length) throw new AppError('One or more products no longer exist.', 400);

    // Check stock and calculate the total (in cents to avoid float errors)
    let totalCents = 0;
    const itemRows = [];
    for (const p of products) {
      const qty = wanted.get(p.id);
      if (p.stock < qty) {
        throw new AppError(`Not enough stock for "${p.name}". Only ${p.stock} left.`, 400);
      }
      totalCents += Math.round(Number(p.price) * 100) * qty;
      itemRows.push([p.id, qty, p.price]);
    }
    const total = totalCents / 100;

    const [orderResult] = await conn.execute(
      `INSERT INTO orders
        (user_id, total_amount, status, shipping_name, shipping_email, shipping_phone,
         shipping_address, shipping_city, shipping_postal_code)
       VALUES (?, ?, 'Pending', ?, ?, ?, ?, ?, ?)`,
      [userId, total, shipping.name, shipping.email, shipping.phone, shipping.address, shipping.city, shipping.postalCode]
    );
    const orderId = orderResult.insertId;

    await conn.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?',
      [itemRows.map((r) => [orderId, ...r])]
    );

    for (const p of products) {
      await conn.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [wanted.get(p.id), p.id]);
    }

    await conn.commit();
    return orderId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.findItems = async (orderId) => {
  const [rows] = await db.execute(
    `SELECT oi.id, oi.product_id, oi.quantity, oi.price, p.name, p.image
     FROM order_items oi
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?`,
    [orderId]
  );
  return rows;
};

exports.findById = async (id) => {
  const [rows] = await db.execute(
    `SELECT o.*, u.name AS user_name, u.email AS user_email
     FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = ?`,
    [id]
  );
  if (!rows[0]) return null;
  return { ...rows[0], items: await exports.findItems(id) };
};

exports.findByUser = async (userId) => {
  const [rows] = await db.execute(
    `SELECT o.*,
       (SELECT COALESCE(SUM(quantity), 0) FROM order_items WHERE order_id = o.id) AS item_count
     FROM orders o WHERE o.user_id = ? ORDER BY o.id DESC`,
    [userId]
  );
  return rows;
};

exports.findAll = async (status) => {
  let sql = `SELECT o.*, u.name AS user_name, u.email AS user_email,
       (SELECT COALESCE(SUM(quantity), 0) FROM order_items WHERE order_id = o.id) AS item_count
     FROM orders o JOIN users u ON u.id = o.user_id`;
  const params = [];
  if (status) {
    sql += ' WHERE o.status = ?';
    params.push(status);
  }
  sql += ' ORDER BY o.id DESC';
  const [rows] = await db.execute(sql, params);
  return rows;
};

/**
 * Changes the status. If an order becomes "Cancelled", its items are put back
 * into stock. A cancelled order cannot be re-opened.
 */
exports.updateStatus = async (id, status) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute('SELECT status FROM orders WHERE id = ? FOR UPDATE', [id]);
    if (!rows[0]) throw new AppError('Order not found.', 404);
    const current = rows[0].status;

    if (current === 'Cancelled' && status !== 'Cancelled') {
      throw new AppError('A cancelled order cannot be re-opened.', 400);
    }
    if (current !== 'Cancelled' && status === 'Cancelled') {
      const [items] = await conn.execute('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]);
      for (const it of items) {
        await conn.execute('UPDATE products SET stock = stock + ? WHERE id = ?', [it.quantity, it.product_id]);
      }
    }
    await conn.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
