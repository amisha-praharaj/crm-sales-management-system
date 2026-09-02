import { apiSlice } from "./apiSlice";

export const leadApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ======================================================
    // GET LEADS
    // ======================================================

    getLeads: builder.query({
      query: (params = {}) => {
        const query = new URLSearchParams();

        if (params.search) {
          query.append("search", params.search);
        }

        if (params.status) {
          query.append("status", params.status);
        }

        if (params.source) {
          query.append("source", params.source);
        }

        if (params.assignedTo) {
          query.append("assignedTo", params.assignedTo);
        }

        if (params.page) {
          query.append("page", params.page);
        }

        if (params.limit) {
          query.append("limit", params.limit);
        }

        const queryString = query.toString();

        return `/leads${
          queryString ? `?${queryString}` : ""
        }`;
      },

      providesTags: ["Lead"],
    }),

    // ======================================================
    // GET SINGLE LEAD
    // ======================================================

    getLead: builder.query({
      query: (leadId) => `/leads/${leadId}`,

      providesTags: (result, error, leadId) => [
        {
          type: "Lead",
          id: leadId,
        },
      ],
    }),

    // ======================================================
    // CREATE LEAD
    // ======================================================

    createLead: builder.mutation({
      query: (leadData) => ({
        url: "/leads",
        method: "POST",
        body: leadData,
      }),

      invalidatesTags: ["Lead"],
    }),

    // ======================================================
    // UPDATE LEAD
    // ======================================================

    updateLead: builder.mutation({
      query: ({ leadId, leadData }) => ({
        url: `/leads/${leadId}`,
        method: "PATCH",
        body: leadData,
      }),

      invalidatesTags: (result, error, { leadId }) => [
        "Lead",
        {
          type: "Lead",
          id: leadId,
        },
      ],
    }),

    // ======================================================
    // DELETE LEAD
    // ======================================================

    deleteLead: builder.mutation({
      query: (leadId) => ({
        url: `/leads/${leadId}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Lead"],
    }),

    // ======================================================
    // ASSIGN LEAD
    // ======================================================

    assignLead: builder.mutation({
      query: ({ leadId, assignedTo }) => ({
        url: `/leads/${leadId}/assign`,
        method: "PATCH",
        body: {
          assignedTo,
        },
      }),

      invalidatesTags: ["Lead"],
    }),

    // ======================================================
    // CONVERT LEAD
    // ======================================================

    convertLead: builder.mutation({
      query: (leadId) => ({
        url: `/leads/${leadId}/convert`,
        method: "POST",
      }),

      invalidatesTags: ["Lead"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetLeadsQuery,
  useGetLeadQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useAssignLeadMutation,
  useConvertLeadMutation,
} = leadApi;