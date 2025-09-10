// src/store/api/authApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const loginRegisterApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include', // 👈 Ensures cookies are sent automatically
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const { useLoginMutation } = loginRegisterApi;