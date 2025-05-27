import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseAPI } from "../../services/types";

import { Product } from "../../services/types"; 

interface ProductsByCategoryState {
  data: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductsByCategoryState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchProductsByCategory = createAsyncThunk(
  "productsByCategory/fetch",
  async ({
    categoryId,
    search,
    minPrice,
    maxPrice,
    onSale,
  }: {
    categoryId: number;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    onSale?: boolean;
  }) => {
    const params: string[] = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (minPrice) params.push(`min_price=${minPrice}`);
    if (maxPrice) params.push(`max_price=${maxPrice}`);
    if (onSale) params.push(`on_sale=true`);
    const paramString = params.length ? `?${params.join("&")}` : "";
    const res = await fetch(`${baseAPI}/store/product/category/${categoryId}/products/${paramString}`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  }
);

const productsByCategorySlice = createSlice({
  name: "productsByCategory",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.error = action.error.message || "Error";
        state.loading = false;
      });
  },
});

export default productsByCategorySlice.reducer;
