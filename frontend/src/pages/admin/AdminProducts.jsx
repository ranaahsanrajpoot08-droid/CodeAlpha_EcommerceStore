import { useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ProductForm from '../../components/ProductForm';
import ConfirmationModal from '../../components/ConfirmationModal';
import useFetch from '../../hooks/useFetch';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../../services/productService';
import { getErrorMessage } from '../../services/api';
import { formatPrice, onImgError, PLACEHOLDER_IMG } from '../../utils/format';

export default function AdminProducts() {
  const { data: products, loading, error, reload } = useFetch(() => getProducts());
  const [editing, setEditing] = useState(undefined); // undefined = closed, null = new, object = edit
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');

  const closeForm = () => { setEditing(undefined); setFormError(''); };

  const handleSave = async (data) => {
    setBusy(true);
    setFormError('');
    try {
      if (editing) await updateProduct(editing.id, data);
      else await createProduct(data);
      closeForm();
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    setPageError('');
    try {
      await deleteProduct(toDelete.id);
      reload();
    } catch (err) {
      setPageError(getErrorMessage(err));
    } finally {
      setToDelete(null);
      setBusy(false);
    }
  };

  // Quick stock update directly from the table
  const handleStockBlur = async (p, value) => {
    const stock = Number(value);
    if (!Number.isInteger(stock) || stock < 0 || stock === p.stock) return;
    setPageError('');
    try {
      await updateProduct(p.id, { ...p, stock });
      reload();
    } catch (err) {
      setPageError(getErrorMessage(err));
    }
  };

  return (
    <>
      <div className="section-head">
        <h1 className="page-title">Products</h1>
        <button className="btn btn-primary" onClick={() => setEditing(null)}>+ Add product</button>
      </div>

      <ErrorMessage message={pageError} />
      {loading && <LoadingSpinner />}
      <ErrorMessage message={error} onRetry={reload} />

      {products && (
        <div className="card table-wrap">
          <table className="table">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="table-product">
                      <img src={p.image || PLACEHOLDER_IMG} alt="" onError={onImgError} />
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td>
                    <input
                      className="form-control stock-input"
                      type="number" min="0" defaultValue={p.stock} key={`${p.id}-${p.stock}`}
                      onBlur={(e) => handleStockBlur(p, e.target.value)}
                      aria-label={`Stock for ${p.name}`}
                    />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => setEditing(p)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setToDelete(p)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing !== undefined && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>{editing ? 'Edit product' : 'Add product'}</h3>
            <ProductForm initial={editing} onSubmit={handleSave} onCancel={closeForm} submitting={busy} serverError={formError} />
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!toDelete}
        title="Delete product?"
        message={`"${toDelete?.name}" will be permanently removed. This cannot be undone.`}
        confirmText="Delete"
        loading={busy}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
