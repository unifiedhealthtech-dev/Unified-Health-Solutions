import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseRetailerUrl = "http://localhost:5000/api/retailer/connections";

export const retailerConnectionsApi = createApi({
  reducerPath: "retailerConnectionsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseRetailerUrl,
   prepareHeaders: (headers, { getState }) => {
  const token = getState().auth?.token;
  if (token) headers.set("authorization", `Bearer ${token}`);
  return headers;
},
    credentials: "include", // include cookies in requests
  }),
  tagTypes: ["Distributors", "ConnectedDistributors"],
  endpoints: (builder) => ({
    // Get all distributors for retailer
    getAllDistributors: builder.query({
      query: () => `/distributors`,
      providesTags: ["Distributors"],
    }),

    // Get connected distributors
    getConnectedDistributors: builder.query({
      query: () => `/connected-distributors`,
      providesTags: ["ConnectedDistributors"],
    }),

    // Send connection request
    sendConnectionRequest: builder.mutation({
      query: ({ distributorId }) => ({
        url: "/request",
        method: "POST",
        body: { distributorId },
      }),
      invalidatesTags: ["Distributors", "ConnectedDistributors"],
    }),

    // Check connection status
    getConnectionStatus: builder.query({
      query: ({ retailerId, distributorId }) =>
        `/status/${retailerId}/${distributorId}`,
    }),
   disconnectDistributor: builder.mutation({
  query: (distributorId) => ({
    url: `/disconnect/${distributorId}`,
    method: "POST",
  }),
  invalidatesTags: ["Distributors", "ConnectedDistributors"],
}),
  }),
});

export const {
  useGetAllDistributorsQuery,
  useGetConnectedDistributorsQuery,
  useSendConnectionRequestMutation,
  useGetConnectionStatusQuery,
  useDisconnectDistributorMutation
} = retailerConnectionsApi;
