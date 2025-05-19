import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Store } from '../../services/types'
import API from '../../services/api'

interface StoresState {
  data: Store[]
  loading: boolean
  error: string | null
}

const initialState: StoresState = {
  data: [],
  loading: false,
  error: null,
}

export const fetchStoresByType = createAsyncThunk(
  'stores/fetchByType',
  async (storeTypeId: number): Promise<Store[]> => {
    const response = await API.get(`/restaurant/stores/?store_type=${storeTypeId}`)
    return response.data
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
      })
      .addCase(fetchStoresByType.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch stores'
      })
  },
})

export default storesSlice.reducer
