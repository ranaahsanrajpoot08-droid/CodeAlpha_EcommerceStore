# ShopEase – E-commerce Store (React + Express + MySQL/XAMPP)

A beginner-friendly full-stack store. **React (Vite) + Context API + Axios** on the front, **Node.js + Express + JWT + bcryptjs** on the back, **MySQL (XAMPP / phpMyAdmin)** for data.

---
## 1. Folder structure
```
ecommerce-store/
├── backend/
│   ├── config/db.js                 MySQL connection pool
│   ├── controllers/                 auth, product, order, user, admin logic
│   ├── middleware/                  authMiddleware, adminMiddleware, errorMiddleware
│   ├── models/                      SQL queries (user, product, order)
│   ├── routes/                      URL -> controller mapping
│   ├── utils/                       AppError, asyncHandler, generateToken, validators, seedAdmin
│   ├── database/ecommerce_db.sql    <-- paste this into phpMyAdmin
│   ├── .env / .env.example
│   ├── server.js                    entry point
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/              Navbar, Footer, ProductCard, ProductGrid, SearchBar, LoadingSpinner,
    │   │                            ErrorMessage, ProtectedRoute, CartItem, OrderCard, OrderDetailsView,
    │   │                            ProductForm, ConfirmationModal, StatusBadge
    │   ├── pages/                   Home, Products, ProductDetails, Login, Register, Cart, Checkout,
    │   │   └── admin/               OrderSuccess, MyOrders, OrderDetails, Profile, NotFound | Dashboard, AdminProducts, AdminOrders
    │   ├── layouts/                 MainLayout, AdminLayout
    │   ├── context/                 AuthContext, CartContext
    │   ├── services/                api.js (Axios) + auth/product/order/user services
    │   ├── hooks/                   useAuth, useCart, useFetch, useDebounce
    │   ├── utils/format.js
    │   ├── styles/                  global.css, components.css, pages.css, admin.css
    │   ├── App.jsx  main.jsx
    ├── index.html  vite.config.js  package.json  .env
```

## 2. npm packages
**Backend:** express, mysql2, jsonwebtoken, bcryptjs, dotenv, cors
**Frontend:** react, react-dom, react-router-dom, axios, vite, @vitejs/plugin-react

(Everything is already listed in each `package.json`; `npm install` installs it.)

---
## 3. Setup with XAMPP (step by step)

### A. Start XAMPP and MySQL
1. Open **XAMPP Control Panel** (Start menu -> "XAMPP Control Panel").
2. Click **Start** next to **Apache** (needed for phpMyAdmin) and **Start** next to **MySQL**. Both turn green.
   - If MySQL won't start, port 3306 is probably used by another MySQL. Stop that service (Windows `services.msc`) and try again.

### B. Create the database + tables
1. Open **http://localhost/phpmyadmin** in your browser (or click **Admin** next to MySQL in XAMPP).
2. Click the **SQL** tab at the top.
3. Open `backend/database/ecommerce_db.sql` in VS Code, copy **everything**, paste into the SQL box, click **Go**.
4. In the left sidebar you will now see `ecommerce_db` with 4 tables: `users`, `products`, `orders`, `order_items`.
   (It also creates the admin + a test user and 12 sample products.)

### C. Run the backend (VS Code terminal / PowerShell)
```powershell
cd backend
npm install
npm run dev
```
You should see `MySQL connected` and `API running on http://localhost:5000`.
Test in the browser: http://localhost:5000/api/products

### D. Run the frontend (a second terminal)
```powershell
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173**

---
## 4. Login credentials
| Role  | Email               | Password   |
|-------|---------------------|------------|
| Admin | admin@example.com   | Admin@123  |
| User  | user@example.com    | User@123   |

You can also register new users on the Register page (they always get role `user`).

**Change the admin credentials** (password is hashed with bcrypt automatically):
```powershell
cd backend
node utils/seedAdmin.js "Your Name" you@email.com YourNewPassword
```
If the email already exists it is updated and promoted to admin; otherwise a new admin is created. Running `npm run seed:admin` with no arguments creates/resets `admin@example.com / Admin@123`.

**Make an existing user an admin:** phpMyAdmin -> `ecommerce_db` -> `users` -> edit the row -> set `role` to `admin`.

---
## 5. API endpoints
| Method | URL | Access | Purpose |
|---|---|---|---|
| POST | /api/auth/register | public | create account |
| POST | /api/auth/login | public | login, returns JWT |
| GET | /api/auth/me | user | current user |
| GET | /api/products?search=&category=&sort=&limit= | public | list/search/filter/sort |
| GET | /api/products/categories | public | category names |
| GET | /api/products/:id | public | one product |
| POST | /api/products | admin | create |
| PUT | /api/products/:id | admin | update (also stock) |
| DELETE | /api/products/:id | admin | delete |
| POST | /api/orders | user | place order |
| GET | /api/orders/my-orders | user | my orders |
| GET | /api/orders/:id | owner/admin | order + items |
| GET | /api/admin/orders?status= | admin | all orders |
| PUT | /api/admin/orders/:id/status | admin | change status |
| GET | /api/admin/users | admin | all users |
| GET | /api/admin/stats | admin | dashboard numbers |
| GET | /api/users/profile | user | my profile |
| PUT | /api/users/profile | user | update name/email/password |

Sort values: `newest`, `price_asc`, `price_desc`, `name_asc`.

---
## 6. How it works

**Frontend <-> backend.** `frontend/src/services/api.js` creates one Axios instance whose base URL is `VITE_API_URL` (`http://localhost:5000/api`). Pages call small service functions (e.g. `getProducts()`); an Axios interceptor adds `Authorization: Bearer <token>` automatically. The backend allows the React origin via CORS (`CLIENT_URL` in `backend/.env`).

**Authentication.**
1. Register/Login -> backend hashes/compares the password with **bcryptjs** and returns a **JWT** (signed with `JWT_SECRET`, valid 7 days) plus the user (never the password).
2. React saves the token in `localStorage` and the user in `AuthContext`.
3. On page refresh `AuthContext` calls `GET /api/auth/me` with the saved token to restore the session.
4. Backend `authMiddleware` verifies the token on protected routes; `adminMiddleware` additionally requires `role = 'admin'` (otherwise 403).
5. Logout = remove the token from localStorage and clear the user state.
6. In React, `ProtectedRoute` hides pages (user pages / `/admin`) — but the **real** security is on the backend.

**Order processing.** (`backend/models/orderModel.js`)
1. React sends only `{ productId, quantity }` + shipping info. Prices/totals from the browser are ignored.
2. Backend validates login, shipping fields and that the cart isn't empty.
3. It opens a **MySQL transaction** and locks the product rows (`SELECT ... FOR UPDATE`).
4. Checks every product exists and has enough stock.
5. Calculates the total from **current database prices**.
6. Inserts `orders` + `order_items`, reduces `products.stock`.
7. `COMMIT`. If anything fails -> `ROLLBACK`, so no partial order or wrong stock is ever saved.
8. React clears the cart and redirects to `/order-success/:id`.
Cancelling an order in the admin panel puts the items back into stock.

**Cart.** `CartContext` keeps items in React state and mirrors them to `localStorage` (survives refresh). Quantity can't exceed stock.

---
## 7. Testing checklist
1. Home page shows featured products; categories link to filtered products.
2. Products: search, category filter, sort, add to cart.
3. Register a new user -> you are logged in; Logout -> Login again.
4. Cart: +/-, remove, refresh page (cart stays), total correct.
5. Checkout (log in first) -> fill form -> Place order -> success page with order ID.
6. My Orders shows it; open details. Product stock decreased in phpMyAdmin.
7. Login as admin -> **Admin** link: dashboard numbers; add/edit/delete product; change stock; change order status (try Cancelled -> stock returns).
8. Try opening `/admin` as a normal user -> redirected home.
9. Try ordering more than the stock -> friendly error.

---
## 8. Common errors & solutions
| Problem | Solution |
|---|---|
| `Could not connect to MySQL` / `Access denied` | Start MySQL in XAMPP; check `DB_USER`, `DB_PASSWORD` (default root + empty) in `backend/.env`. |
| `Unknown database 'ecommerce_db'` | You haven't imported the SQL file yet (step 3B). |
| MySQL won't start in XAMPP (port 3306) | Another MySQL is running. Stop it or change the XAMPP MySQL port and set `DB_PORT` in `.env`. |
| `EADDRINUSE: port 5000` | Something uses 5000. Change `PORT` in `backend/.env` AND `VITE_API_URL` in `frontend/.env`. |
| Browser: "CORS error" | Frontend must run on `http://localhost:5173`, or add its URL to `CLIENT_URL` in `backend/.env`; restart backend. |
| "Cannot reach the server" in the UI | Backend isn't running (`npm run dev` in `backend`). |
| Changed `.env` but nothing changes | Restart the dev server (Vite and Node read `.env` only at start). |
| `npm` / `node` not recognized | Install Node.js LTS from nodejs.org and reopen VS Code. |
| PowerShell: "running scripts is disabled" | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or use Command Prompt instead. |
| Product images don't show | The URL is blocked/broken; a "No Image" placeholder is shown. Use another image URL in the admin panel. |
| Can't delete a product | It's part of existing orders (foreign key). Set its stock to 0 instead. |
| Login says invalid for admin | Re-run the SQL file, or `node utils/seedAdmin.js` in `backend`. |

---
## 9. Prepare for GitHub
```powershell
cd ecommerce-store
git init
git add .
git commit -m "Initial commit: ShopEase e-commerce store"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```
- `.gitignore` already excludes `node_modules`, `dist` and `.env` (secrets stay private). The `.env.example` files are included so others know what to configure.
- Before submitting/deploying, change `JWT_SECRET` to a long random string.

## 10. Ideas to extend
Payment gateway, product image upload, reviews, pagination, order e-mails, refresh tokens, rate limiting (`express-rate-limit`), `helmet`.
