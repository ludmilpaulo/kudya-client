import { createSlice } from "@reduxjs/toolkit";

export interface AuthState {
  user: any;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginUser: (state, action) => {
      state.user = action.payload;
    },
    logoutUser: (state) => {
      state.user = null;
    },
  },
});

export const { loginUser, logoutUser } = authSlice.actions;

export const selectUser = (state: { auth: AuthState }) => state.auth.user;

export default authSlice.reducer;
