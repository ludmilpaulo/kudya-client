import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import API from "../../services/api";
import { Review } from "../../services/types";

interface ReviewsState {
  data: Review[];
  loading: boolean;
  error: string | null;
}

const initialState: ReviewsState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchReviewsByProduct = createAsyncThunk(
  "reviews/fetchReviewsByProduct",
  async (productId: number): Promise<Review[]> => {
    const res = await API.get(`/store/reviews/?product=${productId}`);
    return res.data;
  }
);

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviewsByProduct.pending, (state) => { state.loading = true; })
      .addCase(fetchReviewsByProduct.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchReviewsByProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch reviews";
      });
  },
});

export default reviewsSlice.reducer;
