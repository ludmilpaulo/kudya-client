import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/api";
import { Product } from "../../services/types";

interface RelatedProductsState {
  data: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: RelatedProductsState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchRelatedProducts = createAsyncThunk(
  "relatedProducts/fetchRelatedProducts",
  async (productId: number): Promise<Product[]> => {
    const res = await API.get(`/store/products/related/${productId}/`);
    return res.data;
  }
);

const relatedProductsSlice = createSlice({
  name: "relatedProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRelatedProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchRelatedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch related products";
      });
  }
});

export default relatedProductsSlice.reducer;
