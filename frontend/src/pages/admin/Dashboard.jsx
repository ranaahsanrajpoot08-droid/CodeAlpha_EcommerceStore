import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { getAdminStats } from '../../services/userService';
import { formatDate, formatPrice } from '../../utils/format';

export default function Dashboard() {
  const { data, loading, error, reload } = useFetch(getAdminStats);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  const { stats, recentOrders } = data;
  const cards = [
    { label: 'Total Products', value: stats.totalProducts, icon: '📦' },
    { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
    { label: 'Total Orders', value: stats.totalOrders, icon: '🧾' },
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: '💰' },
  ];

  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <div className="stats-grid">
        {cards.map((c) => (
          <div className="stat-card" key={c.label}>
            <span className="stat-icon">{c.icon}</span>
            <div><p className="muted">{c.label}</p><h2>{c.value}</h2></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-head">
          <h3>Recent orders</h3>
          <Link to="/admin/orders" className="link">View all →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="muted">No orders yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td><td>{o.user_name}</td><td>{formatDate(o.created_at)}</td>
                    <td>{formatPrice(o.total_amount)}</td><td><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
