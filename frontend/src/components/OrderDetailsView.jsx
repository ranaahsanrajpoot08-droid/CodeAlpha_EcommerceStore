import StatusBadge from './StatusBadge';
import { formatDate, formatPrice, onImgError, PLACEHOLDER_IMG } from '../utils/format';

// Shows one full order. Used on the customer "Order details" page and in the admin modal.
export default function OrderDetailsView({ order }) {
  return (
    <div className="order-details">
      <div className="order-details-head">
        <div>
          <h2>Order #{order.id}</h2>
          <p className="muted">Placed on {formatDate(order.created_at)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="order-details-grid">
        <div className="card">
          <h4>Shipping information</h4>
          <p>{order.shipping_name}</p>
          <p>{order.shipping_address}</p>
          <p>
            {order.shipping_city}, {order.shipping_postal_code}
          </p>
          <p className="muted">
            {order.shipping_phone} · {order.shipping_email}
          </p>
        </div>
        <div className="card">
          <h4>Customer</h4>
          <p>{order.user_name}</p>
          <p className="muted">{order.user_email}</p>
        </div>
      </div>

      <div className="card">
        <h4>Items</h4>
        {order.items.map((it) => (
          <div className="summary-row item-row" key={it.id}>
            <img src={it.image || PLACEHOLDER_IMG} alt="" onError={onImgError} />
            <span className="grow">
              {it.name || 'Deleted product'} <span className="muted">× {it.quantity}</span>
            </span>
            <span>{formatPrice(it.price * it.quantity)}</span>
          </div>
        ))}
        <div className="summary-row total-row">
          <span>Total</span>
          <span>{formatPrice(order.total_amount)}</span>
        </div>
      </div>
    </div>
  );
}
