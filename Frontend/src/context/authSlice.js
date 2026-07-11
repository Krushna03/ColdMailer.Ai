import { createSlice } from "@reduxjs/toolkit";

const storedUserData = JSON.parse(localStorage.getItem("data")) || null;

const initialState = {
  status: Boolean(storedUserData),
  userData: storedUserData,
}


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
      login: (state, action) => {
        const userData = action.payload;
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