import { Link, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import useFetch from '../hooks/useFetch';
import { getOrder } from '../services/orderService';
import { formatPrice } from '../utils/format';

export default function OrderSuccess() {
  const { id } = useParams();
  const { data: order, loading, error, reload } = useFetch(() => getOrder(id), [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="container section"><ErrorMessage message={error} onRetry={reload} /></div>;

  return (
    <div className="container section">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Thank you for your order!</h1>
        <p className="muted">We've received your order and will start processing it soon.</p>
        <div className="success-info">
          <div><span className="muted">Order ID</span><strong>#{order.id}</strong></div>
          <div><span className="muted">Total</span><strong>{formatPrice(order.total_amount)}</strong></div>
          <div><span className="muted">Status</span><StatusBadge status={order.status} /></div>
        </div>
        <div className="hero-actions center-actions">
          <Link to="/products" className="btn btn-primary">Continue shopping</Link>
          <Link to={`/orders/${order.id}`} className="btn btn-outline">View order</Link>
        </div>
      </div>
    </div>
  );
}
