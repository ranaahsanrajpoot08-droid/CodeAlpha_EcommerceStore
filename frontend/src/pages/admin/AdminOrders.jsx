import { useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import OrderDetailsView from '../../components/OrderDetailsView';
import useFetch from '../../hooks/useFetch';
import { getAllOrders, getOrder, updateOrderStatus } from '../../services/orderService';
import { getErrorMessage } from '../../services/api';
import { formatDate, formatPrice, ORDER_STATUSES } from '../../utils/format';

export default function AdminOrders() {
  const [filter, setFilter] = useState('');
  const { data: orders, loading, error, reload } = useFetch(() => getAllOrders(filter), [filter]);
  const [details, setDetails] = useState(null);
  const [pageError, setPageError] = useState('');

  const handleStatus = async (order, status) => {
    setPageError('');
    try {
      await updateOrderStatus(order.id, status);
    } catch (err) {
      setPageError(getErrorMessage(err));
    }
    reload(); // always refresh so the table shows the real status
  };

  const openDetails = async (id) => {
    setPageError('');
    try {
      setDetails(await getOrder(id));
    } catch (err) {
      setPageError(getErrorMessage(err));
    }
  };

  return (
    <>
      <div className="section-head">
        <h1 className="page-title">Orders</h1>
        <select className="form-control filter-select" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <ErrorMessage message={pageError} />
      {loading && <LoadingSpinner />}
      <ErrorMessage message={error} onRetry={reload} />
      {orders?.length === 0 && <div className="empty-state"><div className="empty-icon">🧾</div><h3>No orders found</h3></div>}

      {orders?.length > 0 && (
        <div className="card table-wrap">
          <table className="table">
            <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Update status</th><th /></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.user_name}<br /><span className="muted small">{o.user_email}</span></td>
                  <td>{formatDate(o.created_at)}</td>
                  <td>{formatPrice(o.total_amount)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>
                    <select className="form-control" value={o.status} onChange={(e) => handleStatus(o, e.target.value)} aria-label={`Status of order ${o.id}`}>
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td><button className="btn btn-outline btn-sm" onClick={() => openDetails(o.id)}>Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {details && (
        <div className="modal-overlay" onClick={() => setDetails(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <OrderDetailsView order={details} />
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setDetails(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
