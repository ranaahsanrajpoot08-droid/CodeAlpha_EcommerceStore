import { NavLink, Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function AdminLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="container admin-wrap">
        <aside className="admin-sidebar">
          <h3>Admin</h3>
          <NavLink to="/admin" end>📊 Dashboard</NavLink>
          <NavLink to="/admin/products">📦 Products</NavLink>
          <NavLink to="/admin/orders">🧾 Orders</NavLink>
        </aside>
        <section className="admin-content">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
