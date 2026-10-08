import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import { createOrder } from '../services/orderService';
import { getErrorMessage } from '../services/api';
import { formatPrice } from '../utils/format';

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '', address: '', city: '', postalCode: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Nothing to check out (but don't redirect right after placing an order)
  if (items.length === 0 && !submitting) return <Navigate to="/cart" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!/^[0-9+\-\s()]{7,20}$/.test(form.phone)) e.phone = 'Enter a valid phone number';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.postalCode.trim()) e.postalCode = 'Postal code is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setServerError('');
    try {
      // Only product ids + quantities are sent. The backend calculates the real total.
      const order = await createOrder({
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        shipping: form,
      });
      clearCart();
      navigate(`/order-success/${order.id}`, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  const field = (name, label, type = 'text') => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} className="form-control" value={form[name]} onChange={handleChange} />
      {errors[name] && <span className="form-error">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="container section">
      <h1 className="page-title">Checkout</h1>
      <form className="cart-layout" onSubmit={handleSubmit} noValidate>
        <div className="card">
          <h3>Shipping details</h3>
          <ErrorMessage message={serverError} />
          {field('name', 'Full name')}
          <div className="form-row">
            {field('email', 'Email', 'email')}
            {field('phone', 'Phone', 'tel')}
          </div>
          {field('address', 'Address')}
          <div className="form-row">
            {field('city', 'City')}
            {field('postalCode', 'Postal code')}
          </div>
        </div>

        <aside className="summary card">
          <h3>Order summary</h3>
          {items.map((i) => (
            <div className="summary-row" key={i.id}>
              <span>{i.name} <span className="muted">× {i.quantity}</span></span>
              <span>{formatPrice(i.price * i.quantity)}</span>
            </div>
          ))}
          <div className="summary-row"><span>Shipping</span><span>Free</span></div>
          <div className="summary-row total-row"><span>Total</span><span>{formatPrice(total)}</span></div>
          <button className="btn btn-primary btn-block btn-lg" disabled={submitting}>{submitting ? 'Placing order...' : 'Place order'}</button>
          <p className="muted small center">Payment: Cash on delivery</p>
        </aside>
      </form>
    </div>
  );
}
