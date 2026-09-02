import { apiSlice } from "./apiSlice";

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query({
      query: () => "/dashboard",

      providesTags: ["Dashboard"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetDashboardQuery,
} = dashboardApi;