import { Link, useNavigate } from 'react-router-dom';
import CartItem from '../components/CartItem';
import useCart from '../hooks/useCart';
import { formatPrice } from '../utils/format';

export default function Cart() {
  const { items, subtotal, total, clearCart, itemCount } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container section">
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn btn-primary">Browse products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="page-title">Shopping cart</h1>
      <div className="cart-layout">
        <div className="cart-list">
          {items.map((item) => <CartItem key={item.id} item={item} />)}
          <button className="btn btn-outline btn-sm" onClick={clearCart}>Clear cart</button>
        </div>

        <aside className="summary card">
          <h3>Order summary</h3>
          <div className="summary-row"><span>Items ({itemCount})</span><span>{formatPrice(subtotal)}</span></div>
          <div className="summary-row"><span>Shipping</span><span>Free</span></div>
          <div className="summary-row total-row"><span>Total</span><span>{formatPrice(total)}</span></div>
          <button className="btn btn-primary btn-block btn-lg" onClick={() => navigate('/checkout')}>Proceed to checkout</button>
          <Link to="/products" className="link center">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
