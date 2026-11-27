import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { AuthUser } from "@/services/auth-api"

interface AuthState {
  token: string | null
  user: AuthUser | null
}

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  user: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>
    ) {
      state.token = action.payload.token
      state.user = action.payload.user
    },
    clearCredentials(state) {
      state.token = null
      state.user = null
    },
  },
})

export const { clearCredentials, setCredentials } = authSlice.actions
export default authSlice.reducer
