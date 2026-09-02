import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",

    credentials: "include",
  }),

  tagTypes: [
    "User",
    "Lead",
    "Customer",
    "Deal",
    "Activity",
    "Contact",
    "Dashboard",
  ],

  endpoints: () => ({}),
});