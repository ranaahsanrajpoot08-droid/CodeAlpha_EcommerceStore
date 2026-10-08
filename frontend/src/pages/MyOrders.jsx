import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import OrderCard from '../components/OrderCard';
import useFetch from '../hooks/useFetch';
import { getMyOrders } from '../services/orderService';

export default function MyOrders() {
  const { data: orders, loading, error, reload } = useFetch(getMyOrders);

  return (
    <div className="container section narrow">
      <h1 className="page-title">My orders</h1>
      {loading && <LoadingSpinner />}
      <ErrorMessage message={error} onRetry={reload} />
      {orders?.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p>When you place an order it will show up here.</p>
          <Link to="/products" className="btn btn-primary">Start shopping</Link>
        </div>
      )}
      {orders?.map((o) => <OrderCard key={o.id} order={o} />)}
    </div>
  );
}
