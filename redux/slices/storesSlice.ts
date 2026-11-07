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
  async (arg: number | { storeTypeId: number; latitude?: number; longitude?: number }): Promise<Store[]> => {
    const storeTypeId = typeof arg === 'number' ? arg : arg.storeTypeId
    const params = new URLSearchParams({ store_type: String(storeTypeId) })
    if (typeof arg !== 'number') {
      if (arg.latitude != null) params.set('latitude', String(arg.latitude))
      if (arg.longitude != null) params.set('longitude', String(arg.longitude))
    }
    const response = await API.get(`/store/stores/?${params.toString()}`)
    const data: unknown = response.data
    if (Array.isArray(data)) return data as Store[]
    if (data && typeof data === 'object') {
      const record = data as { stores?: Store[]; results?: Store[] }
      return record.stores ?? record.results ?? []
    }
    return []
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
