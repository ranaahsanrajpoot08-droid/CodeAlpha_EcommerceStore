// All SQL related to the products table.
const db = require('../config/db');

// Only these ORDER BY values are allowed (never put user text directly in SQL).
const SORTS = {
  newest: 'id DESC',
  price_asc: 'price ASC',
  price_desc: 'price DESC',
  name_asc: 'name ASC',
};

exports.getAll = async ({ search, category, sort, limit } = {}) => {
  let sql = 'SELECT * FROM products WHERE 1 = 1';
  const params = [];

  if (search) {
    sql += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category && category !== 'All') {
    sql += ' AND category = ?';
    params.push(category);
  }
  sql += ` ORDER BY ${SORTS[sort] || SORTS.newest}`;

  const n = parseInt(limit, 10);
  if (n > 0) sql += ` LIMIT ${Math.min(n, 100)}`; // n is a validated integer

  const [rows] = await db.execute(sql, params);
  return rows;
};

exports.getCategories = async () => {
  const [rows] = await db.execute('SELECT DISTINCT category FROM products ORDER BY category');
  return rows.map((r) => r.category);
};

exports.findById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0];
};

exports.create = async ({ name, description, price, image, category, stock }) => {
  const [result] = await db.execute(
    'INSERT INTO products (name, description, price, image, category, stock) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description, price, image, category, stock]
  );
  return result.insertId;
};

exports.update = async (id, { name, description, price, image, category, stock }) => {
  const [result] = await db.execute(
    'UPDATE products SET name = ?, description = ?, price = ?, image = ?, category = ?, stock = ? WHERE id = ?',
    [name, description, price, image, category, stock, id]
  );
  return result.affectedRows;
};

exports.remove = async (id) => {
  const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows;
};
