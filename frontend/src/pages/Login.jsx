import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import useAuth from '../hooks/useAuth';
import { getErrorMessage } from '../services/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/'; // go back to the page the user wanted

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    setServerError('');
    try {
      await login(form.email, form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Welcome back</h1>
        <p className="muted">Log in to your account</p>
        <ErrorMessage message={serverError} />
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="form-control" value={form.email} onChange={handleChange} autoComplete="email" />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" className="form-control" value={form.password} onChange={handleChange} autoComplete="current-password" />
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>
        <button className="btn btn-primary btn-block" disabled={submitting}>{submitting ? 'Logging in...' : 'Login'}</button>
        <p className="auth-switch">Don't have an account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
}
