import { createSlice, PayloadAction } from "@reduxjs/toolkit";
//import { RootState } from '../store';

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
}

const initialState: LocationState = {
  latitude: null,
  longitude: null,
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setUserLocation: (
      state,
      action: PayloadAction<{ latitude: number; longitude: number }>
    ) => {
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
    },
  },
});

export const { setUserLocation } = locationSlice.actions;

export const selectUserLocation = (state: { location: any }) => state.location;

export default locationSlice.reducer;
