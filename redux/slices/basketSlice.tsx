import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from '../store'; // Adjust the import path according to your project structure

type Meal = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  restaurant: number; // Add restaurant property to the Meal type
};

type BasketState = {
  items: Meal[];
};

const initialState: BasketState = {
  items: [],
};

const basketSlice = createSlice({
  name: "basket",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Meal>) => {
      const existingItem = state.items.find((item) => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    removeItem: (state, action: PayloadAction<number>) => {
      const index = state.items.findIndex((item) => item.id === action.payload);
      if (index !== -1) {
        if (state.items[index].quantity > 1) {
          state.items[index].quantity -= 1;
        } else {
          state.items.splice(index, 1);
        }
      }
    },
    clearCart: (state, action: PayloadAction<number>) => { // Add clearCart reducer
      state.items = state.items.filter(item => item.restaurant !== action.payload);
    },
    clearAllCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, clearCart, clearAllCart } = basketSlice.actions;

export const selectCartItems = (state: RootState) => state.basket.items;

export default basketSlice.reducer;
