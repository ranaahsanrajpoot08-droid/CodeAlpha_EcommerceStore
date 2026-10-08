import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container section">
      <div className="empty-state">
        <div className="empty-icon">🧭</div>
        <h3>404 - Page not found</h3>
        <p>The page you are looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">Go home</Link>
      </div>
    </div>
  );
}
