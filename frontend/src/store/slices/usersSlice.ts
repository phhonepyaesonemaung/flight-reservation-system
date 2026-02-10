import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

const initialState = {
  token: null,
  refresh_token: null,
  user: null
};
export const usersSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    loginData(state, { payload }) {
      state.user = payload?.user; // Ensure user is set
      state.token = payload?.access_token;
      const decoded = payload?.access_token ? jwtDecode(payload?.access_token) : null;
      if (decoded) {
        state.user = payload?.user; // Ensure user is set
        state.token = payload?.access_token;
        state.refresh_token = payload?.refresh_token;
      } else {
        state.user = null;
        state.token = null;
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;
    },
    empty(state) {
      state.user = null;
      state.token = null;
    },
  },
});
export const { loginData, logout, empty } = usersSlice.actions;
export default usersSlice.reducer;