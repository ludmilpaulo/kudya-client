import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Store } from '../../services/types'
import API from '../../services/api'
import {
  MarketplaceVertical,
  normalizeV1Stores,
  verticalApiPath,
} from '../../utils/normalizeStores'

interface StoresState {
  data: Store[]
  loading: boolean
  error: string | null
  vertical: MarketplaceVertical | null
}

const initialState: StoresState = {
  data: [],
  loading: false,
  error: null,
  vertical: null,
}

export const fetchStoresByType = createAsyncThunk(
  'stores/fetchByType',
  async (storeTypeId: number): Promise<Store[]> => {
    const response = await API.get(`/store/stores/?store_type=${storeTypeId}`)
    return response.data
  }
)

export const fetchStoresByVertical = createAsyncThunk(
  'stores/fetchByVertical',
  async (vertical: MarketplaceVertical): Promise<Store[]> => {
    const response = await API.get(verticalApiPath(vertical))
    return normalizeV1Stores(response.data)
  }
)

const storesSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoresByType.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStoresByType.fulfilled, (state, action) => {
        state.data = action.payload
        state.loading = false
        state.vertical = null
      })
      .addCase(fetchStoresByType.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch stores'
      })
      .addCase(fetchStoresByVertical.pending, (state, action) => {
        state.loading = true
        state.error = null
        state.vertical = action.meta.arg
      })
      .addCase(fetchStoresByVertical.fulfilled, (state, action) => {
        state.data = action.payload
        state.loading = false
      })
      .addCase(fetchStoresByVertical.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch stores'
      })
  },
})

export default storesSlice.reducer
