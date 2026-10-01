import React, { createContext, useContext, useMemo, useState } from 'react';
import { CartItem, Product } from '../types';

type CartContextValue = { items: CartItem[]; count: number; total: number; addItem: (product: Product, selectedOptions?: Record<string, string>, notes?: string) => void; removeItem: (item: CartItem) => void; clear: () => void };
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const addItem = (product: Product, selectedOptions: Record<string, string> = {}, notes = '') => {
    const selectedSize = selectedOptions.Pedazos;
    const price = selectedSize && product.sizePrices?.[selectedSize] ? product.sizePrices[selectedSize] : product.price;
    setItems(current => [...current, { ...product, price, quantity: 1, selectedOptions, notes }]);
  };
  const removeItem = (item: CartItem) => setItems(current => current.filter(candidate => candidate !== item));
  const value = useMemo(() => ({ items, count: items.reduce((sum, item) => sum + item.quantity, 0), total: items.reduce((sum, item) => sum + item.price * item.quantity, 0), addItem, removeItem, clear: () => setItems([]) }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error('useCart debe usarse dentro de CartProvider'); return context; }
