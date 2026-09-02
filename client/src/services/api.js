const API_BASE_URL = "http://localhost:5000/api";

const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.message || "Something went wrong"
    );

    error.status = response.status;
    error.response = {
      status: response.status,
      data,
    };

    throw error;
  }

  return data;
};

// ======================================================
// AUTH
// ======================================================

export const loginUser = (credentials) =>
  apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

export const getCurrentUser = () =>
  apiRequest("/auth/me");

export const logoutUser = () =>
  apiRequest("/auth/logout", {
    method: "POST",
  });

// ======================================================
// DASHBOARD
// ======================================================

export const getDashboard = () =>
  apiRequest("/dashboard");

// ======================================================
// LEADS
// ======================================================

export const getLeads = (params = {}) => {
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

  return apiRequest(`/leads${queryString ? `?${queryString}` : ""}`);
};

export const getLead = (leadId) =>
  apiRequest(`/leads/${leadId}`);

export const createLead = (leadData) =>
  apiRequest("/leads", {
    method: "POST",
    body: JSON.stringify(leadData),
  });

export const updateLead = (leadId, leadData) =>
  apiRequest(`/leads/${leadId}`, {
    method: "PATCH",
    body: JSON.stringify(leadData),
  });

export const deleteLead = (leadId) =>
  apiRequest(`/leads/${leadId}`, {
    method: "DELETE",
  });

export const assignLead = (leadId, assignedTo) =>
  apiRequest(`/leads/${leadId}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ assignedTo }),
  });

export const convertLead = (leadId) =>
  apiRequest(`/leads/${leadId}/convert`, {
    method: "POST",
  });

// ======================================================
// CUSTOMERS
// ======================================================

export const getCustomers = (params = {}) => {
  const query = new URLSearchParams();

  if (params.search) {
    query.append("search", params.search);
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

  return apiRequest(`/customers${queryString ? `?${queryString}` : ""}`);
};

export const getCustomer = (customerId) =>
  apiRequest(`/customers/${customerId}`);

export const createCustomer = (customerData) =>
  apiRequest("/customers", {
    method: "POST",
    body: JSON.stringify(customerData),
  });

export const updateCustomer = (
  customerId,
  customerData
) =>
  apiRequest(`/customers/${customerId}`, {
    method: "PATCH",
    body: JSON.stringify(customerData),
  });

export const deleteCustomer = (customerId) =>
  apiRequest(`/customers/${customerId}`, {
    method: "DELETE",
  });

export const assignCustomer = (
  customerId,
  assignedTo
) =>
  apiRequest(`/customers/${customerId}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ assignedTo }),
  });

// ======================================================
// USERS
// ======================================================

export const getUsers = () =>
  apiRequest("/users");

// ======================================================
// DEFAULT
// ======================================================
// ======================================================
// DEALS
// ======================================================

export const getDeals = (params = {}) => {
  const query = new URLSearchParams();

  if (params.search) {
    query.append("search", params.search);
  }

  if (params.stage) {
    query.append("stage", params.stage);
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

  return apiRequest(
    `/deals${queryString ? `?${queryString}` : ""}`
  );
};

export const getDeal = (dealId) =>
  apiRequest(`/deals/${dealId}`);

export const createDeal = (dealData) =>
  apiRequest("/deals", {
    method: "POST",
    body: JSON.stringify(dealData),
  });

export const updateDeal = (dealId, dealData) =>
  apiRequest(`/deals/${dealId}`, {
    method: "PATCH",
    body: JSON.stringify(dealData),
  });

export const deleteDeal = (dealId) =>
  apiRequest(`/deals/${dealId}`, {
    method: "DELETE",
  });

export const assignDeal = (dealId, assignedTo) =>
  apiRequest(`/deals/${dealId}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ assignedTo }),
  });

  // ======================================================
// ACTIVITIES
// ======================================================

export const getActivities = (params = {}) => {
  const query = new URLSearchParams();

  if (params.search) query.append("search", params.search);
  if (params.type) query.append("type", params.type);
  if (params.status) query.append("status", params.status);
  if (params.assignedTo) {
    query.append("assignedTo", params.assignedTo);
  }
  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);

  const queryString = query.toString();

  return apiRequest(
    `/activities${queryString ? `?${queryString}` : ""}`
  );
};

export const getActivity = (activityId) =>
  apiRequest(`/activities/${activityId}`);

export const createActivity = (activityData) =>
  apiRequest("/activities", {
    method: "POST",
    body: JSON.stringify(activityData),
  });

export const updateActivity = (activityId, activityData) =>
  apiRequest(`/activities/${activityId}`, {
    method: "PATCH",
    body: JSON.stringify(activityData),
  });

export const deleteActivity = (activityId) =>
  apiRequest(`/activities/${activityId}`, {
    method: "DELETE",
  });

  export const createUser = (userData) =>
  apiRequest("/users", {
    method: "POST",
    body: JSON.stringify(userData),
  });

export const updateUserStatus = (
  userId,
  isActive
) =>
  apiRequest(`/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });

  // ======================================================
// CONTACTS
// ======================================================

export const getContacts = (params = {}) => {
  const query = new URLSearchParams();

  if (params.search) {
    query.append("search", params.search);
  }

  if (params.customer) {
    query.append("customer", params.customer);
  }

  if (params.lead) {
    query.append("lead", params.lead);
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

  return apiRequest(
    `/contacts${queryString ? `?${queryString}` : ""}`
  );
};

export const getContact = (contactId) =>
  apiRequest(`/contacts/${contactId}`);

export const createContact = (contactData) =>
  apiRequest("/contacts", {
    method: "POST",
    body: JSON.stringify(contactData),
  });

export const updateContact = (
  contactId,
  contactData
) =>
  apiRequest(`/contacts/${contactId}`, {
    method: "PATCH",
    body: JSON.stringify(contactData),
  });

export const deleteContact = (contactId) =>
  apiRequest(`/contacts/${contactId}`, {
    method: "DELETE",
  });

export const assignContact = (
  contactId,
  assignedTo
) =>
  apiRequest(`/contacts/${contactId}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ assignedTo }),
  });

export default apiRequest;