
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const inventoryApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include',
  }),
  tagTypes: ['Inventory'],
  endpoints: (builder) => ({
    // Get dashboard summary
    getDashboardData: builder.query({
      query: () => '/inventory/dashboard',
      providesTags: ['Dashboard'],
    }),

    // Get all stock items with filters
    getStockItems: builder.query({
      query: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return `/inventory/stock${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Inventory'],
    }),

    // Add new stock
    addStock: builder.mutation({
      query: (stockData) => ({
        url: '/inventory/stock',
        method: 'POST',
        body: stockData,
      }),
      invalidatesTags: ['Inventory', 'Dashboard'],
    }),

    // Update stock
    updateStock: builder.mutation({
      query: ({ stockId, ...stockData }) => ({
        url: `/inventory/stock/${stockId}`,
        method: 'PUT',
        body: stockData,
      }),
      invalidatesTags: ['Inventory', 'Dashboard'],
    }),

    // Delete stock
    deleteStock: builder.mutation({
      query: (stockId) => ({
        url: `/inventory/stock/${stockId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Inventory', 'Dashboard'],
    }),
    getRecentOrders: builder.query({
      query: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return `/orders/recent${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Orders'],
    }),

    // Get payment summary
    getPaymentSummary: builder.query({
      query: () => '/payments/summary',
    }),
  }),
});


export const {
  useGetDashboardDataQuery,
  useGetStockItemsQuery,
  useAddStockMutation,
  useUpdateStockMutation,
  useDeleteStockMutation,
  useGetRecentOrdersQuery,
  useGetPaymentSummaryQuery,
} = inventoryApi;