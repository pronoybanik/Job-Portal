import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface AuthUser {
  email: string
  id: string
  name: string
  role: string
}

interface AuthResult {
  token: string
  user: AuthUser
}

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest extends LoginRequest {
  name: string
  role: "JOB_SEEKER" | "RECRUITER"
}

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api"

console.log("baseurl", baseUrl)

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token")
      if (token) {
        headers.set("authorization", `Bearer ${token}`)
      }
      return headers
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthResult, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<AuthResult>) => response.data,
    }),
    register: builder.mutation<AuthResult, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<AuthResult>) => response.data,
    }),
  }),
})

export const { useLoginMutation, useRegisterMutation } = authApi
