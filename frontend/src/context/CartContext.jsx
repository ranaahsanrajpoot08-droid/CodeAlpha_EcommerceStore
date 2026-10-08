import { createContext, useEffect, useMemo, useState } from 'react';

export const CartContext = createContext(null);

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  // Save to localStorage whenever the cart changes (so refresh keeps the cart)
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Add a product. Quantity can never go above the product's stock.
  const addToCart = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, stock: product.stock, quantity: Math.min(i.quantity + quantity, product.stock) } : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
          quantity: Math.min(quantity, product.stock),
        },
      ];
    });
  };

  const removeFromCart = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const increaseQuantity = (id) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) } : i)));

  const decreaseQuantity = (id) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(i.quantity - 1, 1) } : i)));

  const clearCart = () => setItems([]);

  const itemCount = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const total = subtotal; // shipping is free; add tax/shipping here if you want

  const value = { items, itemCount, subtotal, total, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
