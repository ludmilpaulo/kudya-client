import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { StoreType } from '../../services/types'
import API from '../../services/api'

interface StoreTypeState {
  data: StoreType[]
  loading: boolean
  error: string | null
}

const initialState: StoreTypeState = {
  data: [],
  loading: false,
  error: null,
}

export const fetchStoreTypes = createAsyncThunk(
  'storeTypes/fetch',
  async (): Promise<StoreType[]> => {
    const response = await API.get('/restaurant/store-types/')
    return response.data
  }
)

const storeTypeSlice = createSlice({
  name: 'storeTypes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoreTypes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStoreTypes.fulfilled, (state, action) => {
        state.data = action.payload
        state.loading = false
      })
      .addCase(fetchStoreTypes.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch store types'
      })
  },
})

export default storeTypeSlice.reducer
