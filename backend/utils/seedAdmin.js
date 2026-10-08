// Creates (or updates) the admin account with a bcrypt-hashed password.
//
// Run:            npm run seed:admin
// Custom values:  node utils/seedAdmin.js "My Name" me@mail.com MyPassword123
const bcrypt = require('bcryptjs');
require('dotenv').config();
const db = require('../config/db');

(async () => {
  const name = process.argv[2] || 'Admin';
  const email = (process.argv[3] || 'admin@example.com').toLowerCase();
  const password = process.argv[4] || 'Admin@123';

  try {
    const hash = await bcrypt.hash(password, 10);
    const [rows] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length) {
      await db.execute("UPDATE users SET name = ?, password = ?, role = 'admin' WHERE id = ?", [name, hash, rows[0].id]);
      console.log(`Updated existing user -> admin: ${email}`);
    } else {
      await db.execute("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')", [name, email, hash]);
      console.log(`Admin created: ${email}`);
    }
    console.log(`Password: ${password}`);
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await db.end();
  }
})();
