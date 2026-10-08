export default function SearchBar({ value, onChange, placeholder = 'Search products...' }) {
  return (
    <div className="search-bar">
      <span aria-hidden="true">🔍</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
      />
    </div>
  );
}
