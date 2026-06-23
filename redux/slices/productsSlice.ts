import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Product } from '../../services/types'
import API from '../../services/api'
import { fetchProductsByStoreV1 } from '../../features/marketplace/api/checkoutApi'
import type { MarketplaceVertical } from '../../utils/normalizeStores'

interface ProductsState {
  data: Product[]
  loading: boolean
  error: string | null
  vertical: MarketplaceVertical | null
}

const initialState: ProductsState = {
  data: [],
  loading: false,
  error: null,
  vertical: null,
}

export const fetchProductsByStore = createAsyncThunk(
  'products/fetchByStore',
  async ({
    storeId,
    vertical,
  }: {
    storeId: number
    vertical?: MarketplaceVertical
  }): Promise<Product[]> => {
    if (vertical) {
      return fetchProductsByStoreV1(storeId, vertical)
    }
    const response = await API.get(`/store/products/by_store/?store=${storeId}`)
    return response.data
  },
)

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsByStore.pending, (state, action) => {
        state.loading = true
        state.error = null
        state.vertical = action.meta.arg.vertical ?? null
      })
      .addCase(fetchProductsByStore.fulfilled, (state, action) => {
        state.data = action.payload
        state.loading = false
      })
      .addCase(fetchProductsByStore.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch products'
      })
  },
})

export default productsSlice.reducer
