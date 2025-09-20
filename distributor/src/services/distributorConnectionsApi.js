// services/distributorConnectionsApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = "http://localhost:5000/api";

export const distributorConnectionsApi = createApi({
  reducerPath: "distributorConnectionsApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: 'include',

  }),
  tagTypes: ["ConnectionRequests", "ConnectedRetailers"],
  endpoints: (builder) => ({
    getConnectionRequests: builder.query({
      query: () => "/distributor/connections/requests",
      providesTags: ["ConnectionRequests"],
    }),
    acceptConnectionRequest: builder.mutation({
      query: ({ requestId }) => ({
        url: `/distributor/connections/accept/${requestId}`,
        method: "POST",
      }),
      invalidatesTags: ["ConnectionRequests", "ConnectedRetailers"],
    }),
    rejectConnectionRequest: builder.mutation({
      query: ({ requestId }) => ({
        url: `/distributor/connections/reject/${requestId}`,
        method: "POST",
      }),
      invalidatesTags: ["ConnectionRequests"],
    }),
    getConnectedRetailers: builder.query({
      query: () => "/distributor/connections/connected",
      providesTags: ["ConnectedRetailers"],
    }),
  }),
});

export const {
  useGetConnectionRequestsQuery,
  useAcceptConnectionRequestMutation,
  useRejectConnectionRequestMutation,
  useGetConnectedRetailersQuery,
} = distributorConnectionsApi;