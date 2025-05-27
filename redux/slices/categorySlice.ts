// redux/slices/categorySlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseAPI } from "../../services/types";

export interface Category {
  id: number;
  name: string;
  icon?: string;
}

export interface CategoryState {
  data: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async () => {
    const res = await fetch(`${baseAPI}/store/product/categories/`);
    if (!res.ok) throw new Error("Network error");
    return await res.json();
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error";
      });
  },
});

export default categorySlice.reducer;
