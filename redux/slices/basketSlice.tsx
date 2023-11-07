// basketSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../types";

interface BasketItem {
  id: number;
  name: string;
  short_description: string;
  price: number;
  image: string;
  resId: number;
  resName: string;
  resImage: string;
  quantity: number;
}

export interface BasketState {
  items: BasketItem[];
}

const initialState: BasketState = {
  items: [],
};

const basketSlice = createSlice({
  name: "basket",
  initialState,
  reducers: {
    addToBasket: (state, action: PayloadAction<BasketItem>) => {
      const newItem = action.payload;
      const existingItem = state.items.find((item) => item.id === newItem.id);

      if (existingItem) {
        // Item already exists, update quantity
        existingItem.quantity++;
      } else {
        state.items.push({ ...newItem, quantity: 1 });
      }
    },
    removeFromBasket: (state, action: PayloadAction<number>) => {
      const idToRemove = action.payload;
      const itemIndex = state.items.findIndex((item) => item.id === idToRemove);

      if (itemIndex !== -1) {
        if (state.items[itemIndex].quantity > 1) {
          // Reduce quantity
          state.items[itemIndex].quantity--;
        } else {
          // Remove item if quantity is 1
          state.items.splice(itemIndex, 1);
        }
      }
    },
    updateBasket: (state, action: PayloadAction<BasketItem>) => {
      const updatedItem = action.payload;
      const existingItem = state.items.find((item) => item.id === updatedItem.id);

      if (existingItem) {
        // Update the item based on your requirements
        existingItem.quantity = updatedItem.quantity;
        // You can add more logic here to update other properties if needed
      }
    },
  },
});

export const { addToBasket, removeFromBasket, updateBasket } = basketSlice.actions;

export const selectBasketItems = (state: RootState) => state.basket.items;

export default basketSlice.reducer;
