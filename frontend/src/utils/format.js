// Change CURRENCY / LOCALE here to change how prices look everywhere.
const CURRENCY = 'USD';
const LOCALE = 'en-US';

export const formatPrice = (value) =>
  new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY }).format(Number(value) || 0);

export const formatDate = (value) =>
  new Date(value).toLocaleDateString(LOCALE, { year: 'numeric', month: 'short', day: 'numeric' });

export const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' fill='%239ca3af' font-family='Arial' font-size='28' text-anchor='middle' dominant-baseline='middle'>No Image</text></svg>";

// Use as: <img onError={onImgError} />  -> shows a placeholder if the URL is broken
export const onImgError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = PLACEHOLDER_IMG;
};

export const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
