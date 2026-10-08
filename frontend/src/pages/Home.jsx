import { Link } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import useFetch from '../hooks/useFetch';
import { getProducts } from '../services/productService';

const CATEGORIES = [
  { name: 'Electronics', icon: '🎧' },
  { name: 'Clothing', icon: '👕' },
  { name: 'Shoes', icon: '👟' },
  { name: 'Accessories', icon: '🎒' },
  { name: 'Home', icon: '🏠' },
];

export default function Home() {
  const { data: products, loading, error, reload } = useFetch(() => getProducts({ limit: 4 }));

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <span className="hero-tag">New season, new deals</span>
            <h1>Everything you need, delivered to your door.</h1>
            <p>Discover quality electronics, fashion, accessories and home essentials at fair prices.</p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-accent btn-lg">Shop now</Link>
              <Link to="/register" className="btn btn-light btn-lg">Create account</Link>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">🛍️</div>
        </div>
      </section>

      <section className="container section">
        <h2 className="section-title">Shop by category</h2>
        <div className="category-grid">
          {CATEGORIES.map((c) => (
            <Link key={c.name} to={`/products?category=${c.name}`} className="category-card">
              <span className="category-icon">{c.icon}</span>
              <span>{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2 className="section-title">Featured products</h2>
          <Link to="/products" className="link">View all →</Link>
        </div>
        {loading && <LoadingSpinner />}
        <ErrorMessage message={error} onRetry={reload} />
        {products && <ProductGrid products={products} />}
      </section>

      <section className="container section">
        <div className="cta">
          <h2>Join ShopEase today</h2>
          <p>Create a free account to track your orders and check out faster.</p>
          <Link to="/register" className="btn btn-accent btn-lg">Get started</Link>
        </div>
      </section>
    </>
  );
}
