import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <h4>🛍️ ShopEase</h4>
          <p>A simple, friendly online store built with React, Express and MySQL.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/products">All products</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/my-orders">My orders</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/profile">Profile</Link>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} ShopEase. University project.</div>
    </footer>
  );
}
