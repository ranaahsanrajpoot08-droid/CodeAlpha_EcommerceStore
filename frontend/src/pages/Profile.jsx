import { useState } from 'react';
import ErrorMessage from '../components/ErrorMessage';
import useAuth from '../hooks/useAuth';
import { updateProfile } from '../services/userService';
import { getErrorMessage } from '../services/api';
import { formatDate } from '../utils/format';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, email: user.email, password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (form.password && form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    setServerError('');
    try {
      const updated = await updateProfile(form);
      setUser(updated);
      setForm({ ...form, password: '' });
      setEditing(false);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container section narrow">
      <h1 className="page-title">My profile</h1>
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="profile-head">
          <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <h3>{user.name}</h3>
            <span className="badge">{user.role}</span>
          </div>
        </div>

        {!editing ? (
          <>
            <div className="summary-row"><span className="muted">Name</span><span>{user.name}</span></div>
            <div className="summary-row"><span className="muted">Email</span><span>{user.email}</span></div>
            <div className="summary-row"><span className="muted">Member since</span><span>{formatDate(user.created_at)}</span></div>
            <button className="btn btn-primary" onClick={() => { setSuccess(''); setEditing(true); }}>Update profile</button>
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <ErrorMessage message={serverError} />
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" className="form-control" value={form.name} onChange={handleChange} />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className="form-control" value={form.email} onChange={handleChange} />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="password">New password <span className="muted">(leave blank to keep current)</span></label>
              <input id="password" name="password" type="password" className="form-control" value={form.password} onChange={handleChange} autoComplete="new-password" />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
