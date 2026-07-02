import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface DriverLocationCoords {
  latitude: number;
  longitude: number;
}

export interface DriverLocationState {
  location: DriverLocationCoords | null;
}

const initialState: DriverLocationState = {
  location: null,
};

const driverLocationSlice = createSlice({
  name: "driverLocation",
  initialState,
  reducers: {
    setDriverLocation: (
      state,
      action: PayloadAction<{ location: DriverLocationCoords }>,
    ) => {
      state.location = action.payload.location;
    },
  },
});

export const { setDriverLocation } = driverLocationSlice.actions;

export const selectDriverLocation = (state: { driverLocation: DriverLocationState }) =>
  state.driverLocation;

export default driverLocationSlice.reducer;
