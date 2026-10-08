// Entry point of the backend. Run with: npm run dev
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// CORS: only the React app is allowed to call this API from a browser
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

(async () => {
  if (!process.env.JWT_SECRET) {
    console.error('Missing JWT_SECRET in backend/.env');
    process.exit(1);
  }
  try {
    const conn = await db.getConnection();
    conn.release();
    console.log('MySQL connected');
  } catch (err) {
    console.error('Could not connect to MySQL:', err.message);
    console.error('Is MySQL started in XAMPP and does the database exist (see backend/.env)?');
  }
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
})();
