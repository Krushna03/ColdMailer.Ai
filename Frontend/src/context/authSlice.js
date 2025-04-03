import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: false,
  userData: JSON.parse(localStorage.getItem("data")) || null,
}


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
      login: (state, action) => {
        const { role, ...userData } = action.payload;
        state.status = true;
        state.userData = userData;
        localStorage.setItem("data", JSON.stringify(userData))
      },

      logout: (state) => {
        state.status = false;
        state.userData = null;
        localStorage.removeItem('data')
      },
    }
})


export const { login, logout } = authSlice.actions;

export default authSlice.reducer;