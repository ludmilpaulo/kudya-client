// redux/slices/basketSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { CartItem } from "../../services/types"; // Adjust path as needed

type BasketState = {
  items: CartItem[];
};

const initialState: BasketState = {
  items: [],
};

type AddItemPayload = Omit<CartItem, "quantity"> & { quantity?: number };
type LineRef = { id: number; size: string; line_key?: string };

function sameLine(item: CartItem, ref: LineRef): boolean {
  return item.id === ref.id && item.size === ref.size && (item.line_key ?? "") === (ref.line_key ?? "");
}

const basketSlice = createSlice({
  name: "basket",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<AddItemPayload>) => {
      const existingItem = state.items.find((item) => sameLine(item, action.payload));
      if (existingItem) {
        existingItem.quantity += action.payload.quantity || (existingItem.allows_fractional ? 0.5 : 1);
        existingItem.quantity = Number(existingItem.quantity.toFixed(3));
      } else {
        const fractional = Boolean(action.payload.allows_fractional);
        state.items.push({
          ...action.payload,
          quantity: action.payload.quantity || (fractional ? 0.5 : 1),
        });
      }
    },
    removeItem: (state, action: PayloadAction<LineRef>) => {
      const index = state.items.findIndex((item) => sameLine(item, action.payload));
      if (index !== -1) {
        const step = state.items[index].allows_fractional ? 0.5 : 1;
        if (state.items[index].quantity > step) {
          state.items[index].quantity = Number((state.items[index].quantity - step).toFixed(3));
        } else {
          state.items.splice(index, 1);
        }
      }
    },
    clearCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.store !== action.payload);
    },
    clearStores: (state, action: PayloadAction<number[]>) => {
      const placed = new Set(action.payload);
      state.items = state.items.filter((item) => !placed.has(item.store));
    },
    setItemQuantity: (state, action: PayloadAction<LineRef & { quantity: number }>) => {
      const item = state.items.find((entry) => sameLine(entry, action.payload));
      if (!item) return;
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter((entry) => entry !== item);
      } else {
        item.quantity = Number(action.payload.quantity.toFixed(3));
      }
    },
    clearAllCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, clearCart, clearStores, setItemQuantity, clearAllCart } = basketSlice.actions;
export const selectCartItems = (state: RootState) => state.basket.items;

export default basketSlice.reducer;
