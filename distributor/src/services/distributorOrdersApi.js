// src/services/distributorOrdersApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const distributorOrdersApi = createApi({
  reducerPath: 'distributorOrdersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/distributor',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Orders', 'Billing', 'Disputes'],
  endpoints: (builder) => ({
    getDistributorOrders: builder.query({
      query: ({ status = 'all', page = 1, limit = 10, order_type = 'all' }) => ({
        url: 'orders',
        params: { status, page, limit, order_type },
      }),
      providesTags: ['Orders'],
    }),

    getOrderById: builder.query({
      query: (orderId) => `orders/${orderId}`,
      providesTags: ['Orders'],
    }),

    confirmOrder: builder.mutation({
      query: (orderId) => ({
        url: `orders/confirm/${orderId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Orders'],
    }),

    rejectOrder: builder.mutation({
      query: ({ orderId, reason }) => ({
        url: `orders/reject/${orderId}`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: ['Orders'],
    }),

    exportOrders: builder.mutation({
      query: ({ status = 'all', order_type = 'all' }) => ({
        url: 'orders/export',
        responseHandler: (response) => response.text(),
        params: { status, order_type },
      }),
    }),

    createManualOrder: builder.mutation({
      query: (orderData) => ({
        url: 'orders/manual',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Orders'],
    }),

    updateManualOrder: builder.mutation({
      query: ({ orderId, ...orderData }) => ({
        url: `orders/manual/${orderId}`,
        method: 'PUT',
        body: orderData,
      }),
      invalidatesTags: ['Orders'],
    }),

    deleteManualOrder: builder.mutation({
      query: (orderId) => ({
        url: `orders/manual/${orderId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Orders'],
    }),

    getBillingDetails: builder.query({
      query: (orderId) => `orders/billing/${orderId}`,
      providesTags: ['Billing'],
    }),

    generateInvoice: builder.mutation({
      query: (body) => ({
        url: 'orders/billing/generate',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Orders', 'Billing'],
    }),

    // Dispute endpoints
    resolveDispute: builder.mutation({
      query: ({ disputeId, ...body }) => ({
        url: `orders/disputes/${disputeId}/resolve`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Disputes', 'Orders'],
    }),

    getDisputes: builder.query({
      query: ({ status = 'open' }) => ({
        url: 'orders/disputes/list',
        params: { status },
      }),
      providesTags: ['Disputes'],
    }),
  }),
});

export const {
  useGetDistributorOrdersQuery,
  useGetOrderByIdQuery,
  useConfirmOrderMutation,
  useRejectOrderMutation,
  useExportOrdersMutation,
  useCreateManualOrderMutation,
  useUpdateManualOrderMutation,
  useDeleteManualOrderMutation,
  useGetBillingDetailsQuery,
  useGenerateInvoiceMutation,
  useResolveDisputeMutation,
  useGetDisputesQuery,
} = distributorOrdersApi;