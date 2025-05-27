import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface storeState {
  store: {
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

const initialState: storeState = {
  store: {
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

export const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
    setstore: (state, action: PayloadAction<storeState["store"]>) => {
      state.store = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setstore } = storeSlice.actions;

export const selectstore = (state: { store: storeState }) => state.store.store;

export default storeSlice.reducer;
