// All SQL related to the users table. Queries are parameterized (?) to
// prevent SQL injection. The password column is only selected by findByEmail
// (needed for login) and never sent to the client.
const db = require('../config/db');

const SAFE_COLUMNS = 'id, name, email, role, created_at';

exports.findByEmail = async (email) => {
  const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

exports.findById = async (id) => {
  const [rows] = await db.execute(`SELECT ${SAFE_COLUMNS} FROM users WHERE id = ?`, [id]);
  return rows[0];
};

exports.create = async ({ name, email, password, role = 'user' }) => {
  const [result] = await db.execute(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, password, role]
  );
  return result.insertId;
};

exports.getAll = async () => {
  const [rows] = await db.execute(`SELECT ${SAFE_COLUMNS} FROM users ORDER BY id DESC`);
  return rows;
};

exports.updateProfile = async (id, { name, email, password }) => {
  if (password) {
    await db.execute('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?', [name, email, password, id]);
  } else {
    await db.execute('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
  }
};
