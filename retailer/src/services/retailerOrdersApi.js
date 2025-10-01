// src/store/api/orderApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const retailerOrdersApi = createApi({
  reducerPath: 'retailerOrdersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/retailer/orders',
    credentials: 'include',
  }),
  tagTypes: ['Order', 'DistributorStock', 'OrderStats'],
  endpoints: (builder) => ({
    // Get connected distributors list
    getConnectedDistributors: builder.query({
      query: () => '/connected-distributors',
      providesTags: ['DistributorStock'],
    }),

    // Search medicines
    searchMedicines: builder.query({
      query: ({ search, distributorId }) => 
        `/search-medicines?search=${encodeURIComponent(search)}&distributorId=${distributorId || ''}`,
      providesTags: ['DistributorStock'],
    }),

    // Get distributor stock with pagination
    getDistributorStock: builder.query({
      query: ({ distributorId, search, page = 1, limit = 20 }) => 
        `/distributor-stock?distributorId=${distributorId || 'all'}&search=${encodeURIComponent(search || '')}&page=${page}&limit=${limit}`,
      providesTags: ['DistributorStock'],
    }),

    // Create new order
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/create',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order', 'OrderStats', 'DistributorStock'],
    }),

    // Get retailer orders
    getRetailerOrders: builder.query({
      query: ({ status = 'all', page = 1, limit = 10 }) => 
        `/my-orders?status=${status}&page=${page}&limit=${limit}`,
      providesTags: ['Order'],
    }),

    // Get order details
    getOrderDetails: builder.query({
      query: (orderId) => `/details/${orderId}`,
      providesTags: ['Order'],
    }),

    // Cancel order
    cancelOrder: builder.mutation({
      query: ({ orderId, reason }) => ({
        url: `/cancel/${orderId}`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: ['Order', 'OrderStats', 'DistributorStock'],
    }),

    // Get order statistics
    getOrderStatistics: builder.query({
      query: () => '/statistics',
      providesTags: ['OrderStats'],
    }),
    getDCItems: builder.query({
      query: () => '/dc-items',
      providesTags: ['DCItem'],
    }),
    createDCItemsBulk: builder.mutation({
  query: (payload) => ({
    url: '/dc-items/bulk',
    method: 'POST',
    body: payload
  }),
  invalidatesTags: ['DCItems']
}),
updateDCItem: builder.mutation({
  query: ({ id, data }) => ({
    url: `/dc-items/${id}`,
    method: 'PUT',
    body: data
  }),
  invalidatesTags: ['DCItems']
}),
getDCItems: builder.query({
  query: () => '/dc-items',
  providesTags: ['DCItems'] // for auto-refetch
}),
deleteDCItem: builder.mutation({
  query: (id) => ({
    url: `/dc-items/${id}`,
    method: 'DELETE'
  }),
  invalidatesTags: ['DCItems']
}),
    verifyOrder: builder.mutation({
  query: (orderId) => ({
    url: `/orders/${orderId}/verify`,
    method: 'POST'
  }),
  invalidatesTags: ['Orders']
}),
createDispute: builder.mutation({
  query: (disputeData) => ({
    url: '/disputes',
    method: 'POST',
    body: disputeData
  })
}),
})
});

export const {
  useGetConnectedDistributorsQuery,
  useSearchMedicinesQuery,
  useGetDistributorStockQuery,
  useCreateOrderMutation,
  useGetRetailerOrdersQuery,
  useGetOrderDetailsQuery,
  useCancelOrderMutation,
  useGetOrderStatisticsQuery,
  useGetDCItemsQuery,
  useCreateDCItemsBulkMutation,
  useUpdateDCItemMutation,
  useDeleteDCItemMutation,
  useVerifyOrderMutation,
  useCreateDisputeMutation
} = retailerOrdersApi;