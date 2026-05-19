import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import toast from "react-hot-toast";
import { CartItem } from "../types";

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, variantName?: string) => void;
  updateQuantity: (id: string, delta: number, variantName?: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("dieudhoop_cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("dieudhoop_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.variantName === item.variantName);
      if (existing) {
        toast.success(`Increased ${item.name} quantity in cart`, {
          icon: '✨',
          style: {
            borderRadius: '0px',
            background: '#1c1917',
            color: '#fafaf9',
            fontSize: '10px',
            letterSpacing: '0.1em',
            border: '1px solid #44403c'
          }
        });
        return prev.map((i) => (i.id === item.id && i.variantName === item.variantName ? { ...i, quantity: i.quantity + item.quantity } : i));
      }
      toast.success(`${item.name} added to sacred cart`, {
        icon: '🕉️',
        style: {
          borderRadius: '0px',
          background: '#1c1917',
          color: '#fafaf9',
          fontSize: '10px',
          letterSpacing: '0.1em',
          border: '1px solid #44403c'
        }
      });
      return [...prev, item];
    });
  };

  const removeItem = (id: string, variantName?: string) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.variantName === variantName)));
  };

  const updateQuantity = (id: string, delta: number, variantName?: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id && i.variantName === variantName ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
