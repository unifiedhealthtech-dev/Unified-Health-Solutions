import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  distributor: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload.user || null;
      state.distributor = action.payload.distributor || null;
      state.isAuthenticated = !!action.payload.user;
    },
    logout: (state) => {
      state.user = null;
      state.distributor = null;
      state.isAuthenticated = false;
    },
  },
});


export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
