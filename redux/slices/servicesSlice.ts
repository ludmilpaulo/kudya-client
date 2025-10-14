import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getServices, type ServiceListItem } from "../../services/servicesApi";

type ServicesState = {
  data: ServiceListItem[];
  loading: boolean;
  error: string | null;
};

const initialState: ServicesState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchServices = createAsyncThunk<
  ServiceListItem[],
  { category?: number | string; q?: string } | undefined,
  { rejectValue: string }
>("services/fetchServices", async (params, { rejectWithValue }) => {
  try {
    const list = await getServices(params);
    return list;
  } catch (e: any) {
    return rejectWithValue(e?.message || "Failed to load services");
  }
});

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchServices.fulfilled,
        (state, action: PayloadAction<ServiceListItem[]>) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load services";
      });
  },
});

export default servicesSlice.reducer;

