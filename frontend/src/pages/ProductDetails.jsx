import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import useFetch from '../hooks/useFetch';
import useCart from '../hooks/useCart';
import { getProduct } from '../services/productService';
import { formatPrice, onImgError, PLACEHOLDER_IMG } from '../utils/format';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { data: product, loading, error, reload } = useFetch(() => getProduct(id), [id]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="container section">
        <ErrorMessage message={error} onRetry={reload} />
        <Link to="/products" className="btn btn-outline">← Back to products</Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="container section">
      <button className="btn btn-outline btn-sm" onClick={() => navigate('/products')}>← Back to products</button>

      <div className="details">
        <div className="details-img">
          <img src={product.image || PLACEHOLDER_IMG} alt={product.name} onError={onImgError} />
        </div>
        <div className="details-info">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="details-price">{formatPrice(product.price)}</p>
          <p className={outOfStock ? 'stock out' : 'stock in'}>
            {outOfStock ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left!` : `In stock (${product.stock} available)`}
          </p>
          <p className="details-desc">{product.description || 'No description available.'}</p>

          {!outOfStock && (
            <div className="details-actions">
              <div className="qty-control">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} disabled={qty >= product.stock} aria-label="Increase quantity">+</button>
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleAdd}>
                {added ? 'Added ✓' : 'Add to cart'}
              </button>
            </div>
          )}
          {added && <Link to="/cart" className="link">Go to cart →</Link>}
        </div>
      </div>
    </div>
  );
}
