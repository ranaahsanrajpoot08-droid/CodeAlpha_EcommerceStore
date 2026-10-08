import { useState } from 'react';
import ErrorMessage from './ErrorMessage';

const EMPTY = { name: '', description: '', price: '', image: '', category: '', stock: '' };
const SUGGESTED_CATEGORIES = ['Electronics', 'Clothing', 'Shoes', 'Accessories', 'Home'];

// Used for both "Add product" (initial = null) and "Edit product".
export default function ProductForm({ initial, onSubmit, onCancel, submitting, serverError }) {
  const [form, setForm] = useState(initial ? { ...EMPTY, ...initial } : EMPTY);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.category.trim()) e.category = 'Category is required';
    if (form.price === '' || Number(form.price) < 0 || Number.isNaN(Number(form.price))) e.price = 'Enter a valid price';
    if (form.stock === '' || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) e.stock = 'Enter a whole number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, price: Number(form.price), stock: Number(form.stock) });
  };

  const field = (name, label, props = {}) => (
    <div className="form-group">
      <label htmlFor={`pf-${name}`}>{label}</label>
      <input id={`pf-${name}`} name={name} className="form-control" value={form[name]} onChange={handleChange} {...props} />
      {errors[name] && <span className="form-error">{errors[name]}</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <ErrorMessage message={serverError} />
      {field('name', 'Product name')}
      <div className="form-group">
        <label htmlFor="pf-description">Description</label>
        <textarea id="pf-description" name="description" className="form-control" rows="3" value={form.description} onChange={handleChange} />
      </div>
      <div className="form-row">
        {field('price', 'Price', { type: 'number', step: '0.01', min: '0' })}
        {field('stock', 'Stock', { type: 'number', step: '1', min: '0' })}
      </div>
      {field('category', 'Category', { list: 'category-list' })}
      <datalist id="category-list">
        {SUGGESTED_CATEGORIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      {field('image', 'Image URL', { type: 'url', placeholder: 'https://...' })}
      <div className="modal-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : initial ? 'Save changes' : 'Add product'}
        </button>
      </div>
    </form>
  );
}
