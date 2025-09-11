// src/store/api/inventoryApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const inventoryApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include',
  }),
  tagTypes: ['Inventory', 'Dashboard', 'Orders'],
  endpoints: (builder) => ({
    // Dashboard summary
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

    // Import products from CSV
    importProducts: builder.mutation({
      query: (products) => ({
        url: '/inventory/products/import',
        method: 'POST',
        body: { products },
        credentials: 'include',
      }),
      invalidatesTags: ['Inventory', 'Dashboard'],
    }),

    // Get all products
     getProducts: builder.query({
      query: () => '/inventory/products', 
    }),

    // Export products to CSV
    exportProducts: builder.query({
      query: () => '/inventory/products/export',
      responseHandler: async (response) => {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventory_export.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return { success: true };
      },
    }),

    // Get recent orders
    getRecentOrders: builder.query({
      query: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return `/orders/recent${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Orders'],
    }),
  }),
});

export const {
  useGetDashboardDataQuery,
  useGetStockItemsQuery,
  useAddStockMutation,
  useUpdateStockMutation,
  useDeleteStockMutation,
  useImportProductsMutation,
  useExportProductsQuery,
  useGetRecentOrdersQuery,
  useGetProductsQuery
} = inventoryApi;