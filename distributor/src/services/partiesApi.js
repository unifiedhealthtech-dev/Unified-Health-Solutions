// services/partiesApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = "http://localhost:5000/api/distributor";

export const partiesApi = createApi({
  reducerPath: "partiesApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: 'include',
    }),
    tagTypes: ["Parties"],
  endpoints: (builder) => ({
    getParties: builder.query({
      query: () => "/parties",
      providesTags: ["Parties"],
    }),
    addParty: builder.mutation({
      query: (partyData) => ({
        url: "/parties",
        method: "POST",
        body: partyData,
      }),
      invalidatesTags: ["Parties"],
    }),
  }),
});

export const {
  useGetPartiesQuery,
  useAddPartyMutation,
} = partiesApi;

