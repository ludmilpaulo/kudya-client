import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RestaurantState {
  restaurant: {
    id: string | null;
    imgUrl: string | null;
    title: string | null;
    rating: number | null;
    genre: string | null;
    address: string | null;
    short_description: string | null;
    dishes: string[] | null;
  };
}

const initialState: RestaurantState = {
  restaurant: {
    id: null,
    imgUrl: null,
    title: null,
    rating: null,
    genre: null,
    address: null,
    short_description: null,
    dishes: null,
  },
};

export const restaurantSlice = createSlice({
  name: "restaurant",
  initialState,
  reducers: {
    setRestaurant: (state, action: PayloadAction<RestaurantState["restaurant"]>) => {
      state.restaurant = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setRestaurant } = restaurantSlice.actions;

export const selectRestaurant = (state: { restaurant: RestaurantState }) => state.restaurant.restaurant;

export default restaurantSlice.reducer;
