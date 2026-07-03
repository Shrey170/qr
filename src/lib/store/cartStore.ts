import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  sessionId: string | null;
  tableNumber: number | null;
  items: CartItem[];
  setSession: (sessionId: string, tableNumber: number) => void;
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      sessionId: null,
      tableNumber: null,
      items: [],
      setSession: (sessionId, tableNumber) => set({ sessionId, tableNumber }),
      addItem: (item) => set((state) => {
        const existing = state.items.find((i) => i.menuItemId === item.menuItemId);
        if (existing) {
          return {
            items: state.items.map((i) => 
              i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + 1 } : i
            )
          }
        }
        return { items: [...state.items, { ...item, quantity: 1 }] }
      }),
      removeItem: (menuItemId) => set((state) => {
        const existing = state.items.find((i) => i.menuItemId === menuItemId);
        if (existing && existing.quantity > 1) {
          return {
            items: state.items.map((i) => 
              i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i
            )
          }
        }
        return {
          items: state.items.filter((i) => i.menuItemId !== menuItemId)
        }
      }),
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      }
    }),
    {
      name: 'tableserve-cart',
    }
  )
)
