import { Link, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import OrderDetailsView from '../components/OrderDetailsView';
import useFetch from '../hooks/useFetch';
import { getOrder } from '../services/orderService';

export default function OrderDetails() {
  const { id } = useParams();
  const { data: order, loading, error, reload } = useFetch(() => getOrder(id), [id]);

  return (
    <div className="container section narrow">
      <Link to="/my-orders" className="btn btn-outline btn-sm">← Back to my orders</Link>
      {loading && <LoadingSpinner />}
      <ErrorMessage message={error} onRetry={reload} />
      {order && <OrderDetailsView order={order} />}
    </div>
  );
}
