import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const distributorOrdersApi = createApi({
  reducerPath: 'distributorOrdersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/distributor/orders',
    credentials: 'include',
  }),
  tagTypes: ['DistributorOrder'],
  endpoints: (builder) => ({
    getDistributorOrders: builder.query({
      query: ({ status = 'all', page = 1, limit = 10 }) => 
        `?status=${status}&page=${page}&limit=${limit}`,
      providesTags: ['DistributorOrder'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ orderId, ...body }) => ({
        url: `/status/${orderId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['DistributorOrder'],
    }),
  }),
});

export const {
  useGetDistributorOrdersQuery,
  useUpdateOrderStatusMutation
} = distributorOrdersApi;