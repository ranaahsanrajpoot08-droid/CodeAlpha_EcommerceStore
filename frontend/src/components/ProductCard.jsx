import { useState } from 'react';
import { Link } from 'react-router-dom';
import useCart from '../hooks/useCart';
import { formatPrice, onImgError, PLACEHOLDER_IMG } from '../utils/format';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-img">
        <img src={product.image || PLACEHOLDER_IMG} alt={product.name} loading="lazy" onError={onImgError} />
        {outOfStock && <span className="stock-tag">Out of stock</span>}
      </Link>
      <div className="product-card-body">
        <span className="product-category">{product.category}</span>
        <Link to={`/products/${product.id}`} className="product-name">
          {product.name}
        </Link>
        <div className="product-card-footer">
          <span className="price">{formatPrice(product.price)}</span>
          <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={outOfStock}>
            {outOfStock ? 'Sold out' : added ? 'Added ✓' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  );
}
