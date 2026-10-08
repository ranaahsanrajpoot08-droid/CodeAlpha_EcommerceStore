import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate, formatPrice } from '../utils/format';

export default function OrderCard({ order }) {
  return (
    <div className="order-card">
      <div>
        <h3>Order #{order.id}</h3>
        <p className="muted">
          {formatDate(order.created_at)} · {order.item_count} item{order.item_count === 1 ? '' : 's'}
        </p>
      </div>
      <div className="order-card-mid">
        <StatusBadge status={order.status} />
        <strong>{formatPrice(order.total_amount)}</strong>
      </div>
      <Link to={`/orders/${order.id}`} className="btn btn-outline btn-sm">
        View details
      </Link>
    </div>
  );
}
