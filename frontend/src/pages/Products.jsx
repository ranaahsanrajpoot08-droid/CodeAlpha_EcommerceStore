import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import ProductGrid from '../components/ProductGrid';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';
import { getCategories, getProducts } from '../services/productService';

export default function Products() {
  const [searchParams] = useSearchParams(); // lets /products?category=Shoes work from the Home page
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [sort, setSort] = useState('newest');
  const debouncedSearch = useDebounce(search);

  const { data: categories } = useFetch(getCategories);
  const { data: products, loading, error, reload } = useFetch(
    () => getProducts({ search: debouncedSearch, category, sort }),
    [debouncedSearch, category, sort]
  );

  return (
    <div className="container section">
      <h1 className="page-title">Products</h1>

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} />
        <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="All">All categories</option>
          {(categories || []).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className="form-control" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="name_asc">Name: A to Z</option>
        </select>
      </div>

      {loading && <LoadingSpinner />}
      <ErrorMessage message={error} onRetry={reload} />
      {!loading && !error && products?.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔎</div>
          <h3>No products found</h3>
          <p>Try a different search or category.</p>
        </div>
      )}
      {!loading && products?.length > 0 && (
        <>
          <p className="muted result-count">{products.length} product{products.length === 1 ? '' : 's'}</p>
          <ProductGrid products={products} />
        </>
      )}
    </div>
  );
}
