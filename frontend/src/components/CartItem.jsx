import { Link } from 'react-router-dom';
import useCart from '../hooks/useCart';
import { formatPrice, onImgError, PLACEHOLDER_IMG } from '../utils/format';

export default function CartItem({ item }) {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCart();

  return (
    <div className="cart-item">
      <Link to={`/products/${item.id}`}>
        <img src={item.image || PLACEHOLDER_IMG} alt={item.name} onError={onImgError} />
      </Link>
      <div className="cart-item-info">
        <Link to={`/products/${item.id}`} className="product-name">
          {item.name}
        </Link>
        <span className="muted">{formatPrice(item.price)} each</span>
        {item.quantity >= item.stock && <span className="small-warning">Max stock reached ({item.stock})</span>}
      </div>
      <div className="qty-control">
        <button onClick={() => decreaseQuantity(item.id)} disabled={item.quantity <= 1} aria-label="Decrease quantity">
          −
        </button>
        <span>{item.quantity}</span>
        <button onClick={() => increaseQuantity(item.id)} disabled={item.quantity >= item.stock} aria-label="Increase quantity">
          +
        </button>
      </div>
      <div className="cart-item-subtotal">{formatPrice(item.price * item.quantity)}</div>
      <button className="btn btn-outline btn-sm btn-remove" onClick={() => removeFromCart(item.id)}>
        Remove
      </button>
    </div>
  );
}
