// services/retailerInventoryApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const retailerInventoryApi = createApi({
  reducerPath: 'retailerInventoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/retailer',
    credentials: 'include',
  }),
  tagTypes: ['Inventory', 'Dashboard', 'Orders'],
  endpoints: (builder) => ({

    // Inventory summary
    getInventorySummary: builder.query({
      query: ({ search, category, status } = {}) => {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (category && category !== "all") params.append("category", category);
        if (status && status !== "all") params.append("status", status);

        return `/inventory/summary?${params.toString()}`;
      },
      providesTags: ["InventorySummary"],
    }),

    // Get all stock items with filters
    getStockItems: builder.query({
      query: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return `/inventory/stock${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Inventory'],
    }),

    // Add bulk stock
    addBulkStock: builder.mutation({
      query: (stockItems) => ({
        url: '/inventory/bulk-stock',
        method: 'POST',
        body: { stockItems }
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

    // Get product batches
    getProductBatches: builder.query({
      query: (product_code) => `/inventory/products/${product_code}/batches`,
      providesTags: ['Inventory'],
    }),

  }),
});

export const {
  useGetInventorySummaryQuery,
  useGetStockItemsQuery,
  useAddBulkStockMutation,
  useUpdateStockMutation,
  useDeleteStockMutation,
  useImportProductsMutation,
  useExportProductsQuery,
  useGetProductsQuery,
  useGetProductBatchesQuery,
} = retailerInventoryApi;