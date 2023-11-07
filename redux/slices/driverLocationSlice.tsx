import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface DriverLocationState {
  location: any | null;
  // longitude: number | null;
}

const initialState: DriverLocationState = {
  location: null,
  // longitude: null,
};

const driverLocationSlice = createSlice({
  name: "driverLocation",
  initialState,
  reducers: {
    setDriverLocation: (state, action: PayloadAction<{ location: any }>) => {
      state.location = action.payload.location;
      //  state.longitude = action.payload.longitude;
    },
  },
});

export const { setDriverLocation } = driverLocationSlice.actions;

export const selectDriverLocation = (state: { driverLocation: any }) =>
  state.driverLocation;

export default driverLocationSlice.reducer;
