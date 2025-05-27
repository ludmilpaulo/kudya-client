import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import API from "../../services/api";
import { WishlistItem, Product } from "../../services/types";

interface WishlistState {
  data: WishlistItem[];
  loading: boolean;
  error: string | null;
  count: number;
}

const initialState: WishlistState = {
  data: [],
  loading: false,
  error: null,
  count: 0,
};

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (userId: number): Promise<WishlistItem[]> => {
    const res = await API.get(`/wishlist/?user=${userId}`);
    return res.data;
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async ({ userId, productId }: { userId: number; productId: number }) => {
    const res = await API.post(`/store/wishlist/`, { user: userId, product: productId });
    return res.data;
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async ({ userId, productId }: { userId: number; productId: number }) => {
    const res = await API.delete(`/store/wishlist/${userId}/${productId}/`);
    return productId;
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlistCount(state, action: PayloadAction<number>) {
      state.count = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.data = action.payload;
        state.count = action.payload.length;
        state.loading = false;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch wishlist";
      })
      // Add to wishlist
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.data.push(action.payload);
        state.count = state.data.length;
      })
      // Remove from wishlist
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.data = state.data.filter(item => item.product.id !== action.payload);
        state.count = state.data.length;
      });
  }
});

export const { setWishlistCount } = wishlistSlice.actions;
export default wishlistSlice.reducer;
