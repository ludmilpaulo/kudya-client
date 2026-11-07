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

const basketSlice = createSlice({
  name: "basket",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<AddItemPayload>) => {
      const { id, size } = action.payload;
      const existingItem = state.items.find(
        (item) => item.id === id && item.size === size
      );
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
    removeItem: (state, action: PayloadAction<{ id: number; size: string }>) => {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id && item.size === action.payload.size
      );
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
    clearAllCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, clearCart, clearAllCart } = basketSlice.actions;
export const selectCartItems = (state: RootState) => state.basket.items;

export default basketSlice.reducer;
