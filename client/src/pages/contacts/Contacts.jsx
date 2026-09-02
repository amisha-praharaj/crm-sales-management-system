import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Eye,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import {
  getContacts,
  getCustomers,
  getLeads,
  getUsers,
  createContact,
  updateContact,
  deleteContact,
  assignContact,
} from "../../services/api";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  jobTitle: "",
  department: "",
  company: "",
  customer: "",
  lead: "",
  notes: "",
};

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [leadFilter, setLeadFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  const [editingContact, setEditingContact] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [assignedTo, setAssignedTo] = useState("");

  const [saving, setSaving] = useState(false);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // ======================================================
  // CURRENT USER
  // ======================================================

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Failed to load current user:", err);
    }
  }, []);

  // ======================================================
  // LOAD CONTACTS
  // ======================================================

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getContacts({
        search,
        customer: customerFilter,
        lead: leadFilter,
        page,
        limit: 10,
      });

      setContacts(response.contacts || []);

      setPagination(
        response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        }
      );
    } catch (err) {
      setError(err.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await getCustomers();
      setCustomers(response.customers || []);
    } catch (err) {
      console.error("Failed to load customers:", err);
    }
  };

  const loadLeads = async () => {
    try {
      const response = await getLeads();

      setLeads(
        Array.isArray(response.leads)
          ? response.leads
          : []
      );
    } catch (err) {
      console.error("Failed to load leads:", err);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.users || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [search, customerFilter, leadFilter, page]);

  useEffect(() => {
    loadCustomers();
    loadLeads();
    loadUsers();
  }, []);

  // ======================================================
  // ROLE PERMISSIONS
  // ======================================================

  const canAssign =
    currentUser?.role === "ADMIN" ||
    currentUser?.role === "SALES_MANAGER";

  const canDelete =
    currentUser?.role === "ADMIN";

  const canEdit =
    currentUser?.role === "ADMIN" ||
    currentUser?.role === "SALES_MANAGER" ||
    currentUser?.role === "SALES_EXECUTIVE";

  const salesExecutives = useMemo(
    () =>
      users.filter(
        (user) =>
          user.role === "SALES_EXECUTIVE" &&
          user.isActive !== false
      ),
    [users]
  );

  // ======================================================
  // FORM
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openCreate = () => {
    setEditingContact(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (contact) => {
    setEditingContact(contact);

    setForm({
      name: contact.name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      jobTitle: contact.jobTitle || "",
      department: contact.department || "",
      company: contact.company || "",
      customer: contact.customer?._id || "",
      lead: contact.lead?._id || "",
      notes: contact.notes || "",
    });

    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingContact(null);
    setForm(emptyForm);
  };

  // ======================================================
  // CREATE / UPDATE
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Contact name is required");
      return;
    }

    if (!form.email.trim()) {
      setError("Contact email is required");
      return;
    }

    if (!form.phone.trim()) {
      setError("Contact phone is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        jobTitle: form.jobTitle.trim(),
        department: form.department.trim(),
        company: form.company.trim(),
        customer: form.customer || undefined,
        lead: form.lead || undefined,
        notes: form.notes.trim(),
      };

      if (editingContact) {
        await updateContact(
          editingContact._id,
          payload
        );
      } else {
        await createContact(payload);
      }

      closeForm();
      setPage(1);
      await loadContacts();
    } catch (err) {
      if (err.status === 403) {
        setError(
          err.message ||
            "You are not authorized to perform this action."
        );
      } else if (err.status === 404) {
        setError(
          err.message ||
            "Customer, lead or user was not found."
        );
      } else {
        setError(
          err.message || "Failed to save contact"
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // VIEW
  // ======================================================

  const openView = (contact) => {
    setSelectedContact(contact);
    setShowView(true);
  };

  const closeView = () => {
    setShowView(false);
    setSelectedContact(null);
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (contact) => {
    const confirmed = window.confirm(
      `Delete "${contact.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteContact(contact._id);

      await loadContacts();
    } catch (err) {
      if (err.status === 403) {
        setError(
          err.message ||
            "Only Admin can delete contacts."
        );
      } else {
        setError(
          err.message || "Failed to delete contact"
        );
      }
    }
  };

  // ======================================================
  // ASSIGN
  // ======================================================

  const openAssign = (contact) => {
    if (!canAssign) {
      setError(
        "Only Admin and Sales Manager can assign contacts."
      );
      return;
    }

    setSelectedContact(contact);
    setAssignedTo(contact.assignedTo?._id || "");
    setError("");
    setShowAssign(true);
  };

  const closeAssign = () => {
    setShowAssign(false);
    setSelectedContact(null);
    setAssignedTo("");
  };

  const handleAssign = async () => {
    if (!assignedTo) {
      setError("Please select a Sales Executive");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await assignContact(
        selectedContact._id,
        assignedTo
      );

      closeAssign();
      await loadContacts();
    } catch (err) {
      if (err.status === 403) {
        setError(
          err.message ||
            "You are not authorized to assign contacts."
        );
      } else {
        setError(
          err.message || "Failed to assign contact"
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // HELPERS
  // ======================================================

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const clearFilters = () => {
    setSearch("");
    setCustomerFilter("");
    setLeadFilter("");
    setPage(1);
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-full bg-[#F8F9FB] p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-gilroy text-2xl font-bold text-[#1D1E20]">
            Contacts
          </h1>

          <p className="mt-1 font-inter text-sm text-[#8A9099]">
            Manage your business contacts and relationships.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#266DF0] px-5 font-inter text-sm font-semibold text-white shadow-[0_7px_18px_rgba(38,109,240,0.20)] transition hover:bg-[#1F5FD8]"
        >
          <Plus size={18} />
          Add Contact
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* FILTERS */}
      <div className="mb-5 rounded-2xl border border-[#EDEEF0] bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">
          {/* SEARCH */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA1AA]"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search contacts..."
              className="h-11 w-full rounded-xl border border-[#E4E6EA] bg-white pl-10 pr-4 font-inter text-sm text-[#1D1E20] outline-none transition focus:border-[#266DF0] focus:ring-2 focus:ring-[#266DF0]/10"
            />
          </div>

          {/* CUSTOMER FILTER */}
          <select
            value={customerFilter}
            onChange={(e) => {
              setCustomerFilter(e.target.value);
              setPage(1);
            }}
            className="h-11 rounded-xl border border-[#E4E6EA] bg-white px-3 font-inter text-sm text-[#555E67] outline-none focus:border-[#266DF0]"
          >
            <option value="">
              All Customers
            </option>

            {customers.map((customer) => (
              <option
                key={customer._id}
                value={customer._id}
              >
                {customer.name}
              </option>
            ))}
          </select>

          {/* LEAD FILTER */}
          <select
            value={leadFilter}
            onChange={(e) => {
              setLeadFilter(e.target.value);
              setPage(1);
            }}
            className="h-11 rounded-xl border border-[#E4E6EA] bg-white px-3 font-inter text-sm text-[#555E67] outline-none focus:border-[#266DF0]"
          >
            <option value="">
              All Leads
            </option>

            {leads.map((lead) => (
              <option
                key={lead._id}
                value={lead._id}
              >
                {lead.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="h-11 rounded-xl border border-[#E4E6EA] px-4 font-inter text-sm font-medium text-[#555E67] hover:bg-[#F7F8FA]"
          >
            Clear
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-[#EDEEF0] bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-sm text-[#8A9099]">
              Loading contacts...
            </div>
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F8FE] text-[#266DF0]">
              <UserPlus size={24} />
            </div>

            <h3 className="font-gilroy text-lg font-bold text-[#1D1E20]">
              No contacts found
            </h3>

            <p className="mt-1 max-w-md font-inter text-sm text-[#8A9099]">
              Create a contact or change your filters
              to see contacts here.
            </p>

            <button
              type="button"
              onClick={openCreate}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#266DF0] px-4 py-2.5 font-inter text-sm font-semibold text-white"
            >
              <Plus size={17} />
              Add Contact
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="border-b border-[#EDEEF0] bg-[#FAFBFC]">
                    <th className="px-5 py-4 text-left font-inter text-[11px] font-bold uppercase tracking-[0.08em] text-[#9CA1AA]">
                      Contact
                    </th>

                    <th className="px-5 py-4 text-left font-inter text-[11px] font-bold uppercase tracking-[0.08em] text-[#9CA1AA]">
                      Company
                    </th>

                    <th className="px-5 py-4 text-left font-inter text-[11px] font-bold uppercase tracking-[0.08em] text-[#9CA1AA]">
                      Customer / Lead
                    </th>

                    <th className="px-5 py-4 text-left font-inter text-[11px] font-bold uppercase tracking-[0.08em] text-[#9CA1AA]">
                      Assigned To
                    </th>

                    <th className="px-5 py-4 text-left font-inter text-[11px] font-bold uppercase tracking-[0.08em] text-[#9CA1AA]">
                      Created
                    </th>

                    <th className="px-5 py-4 text-right font-inter text-[11px] font-bold uppercase tracking-[0.08em] text-[#9CA1AA]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {contacts.map((contact) => (
                    <tr
                      key={contact._id}
                      className="border-b border-[#F0F1F3] transition hover:bg-[#FAFBFD]"
                    >
                      {/* CONTACT */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF] font-inter text-xs font-bold text-[#266DF0]">
                            {getInitials(contact.name)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-inter text-sm font-semibold text-[#1D1E20]">
                              {contact.name}
                            </p>

                            <div className="mt-1 flex items-center gap-2 text-xs text-[#8A9099]">
                              <Mail size={12} />
                              <span className="truncate">
                                {contact.email}
                              </span>
                            </div>

                            {contact.phone && (
                              <div className="mt-1 flex items-center gap-2 text-xs text-[#8A9099]">
                                <Phone size={12} />
                                <span>
                                  {contact.phone}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* COMPANY */}
                      <td className="px-5 py-4">
                        <p className="font-inter text-sm font-medium text-[#555E67]">
                          {contact.company || "—"}
                        </p>

                        {contact.jobTitle && (
                          <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                            {contact.jobTitle}
                          </p>
                        )}
                      </td>

                      {/* CUSTOMER / LEAD */}
                      <td className="px-5 py-4">
                        {contact.customer ? (
                          <div>
                            <span className="inline-flex rounded-lg bg-[#EEF4FF] px-2.5 py-1 font-inter text-xs font-semibold text-[#266DF0]">
                              Customer
                            </span>

                            <p className="mt-1 font-inter text-xs text-[#555E67]">
                              {contact.customer.name}
                            </p>
                          </div>
                        ) : contact.lead ? (
                          <div>
                            <span className="inline-flex rounded-lg bg-[#F4F0FF] px-2.5 py-1 font-inter text-xs font-semibold text-[#7657D9]">
                              Lead
                            </span>

                            <p className="mt-1 font-inter text-xs text-[#555E67]">
                              {contact.lead.name}
                            </p>
                          </div>
                        ) : (
                          <span className="font-inter text-sm text-[#9CA1AA]">
                            —
                          </span>
                        )}
                      </td>

                      {/* ASSIGNED */}
                      <td className="px-5 py-4">
                        {contact.assignedTo ? (
                          <div>
                            <p className="font-inter text-sm font-medium text-[#555E67]">
                              {contact.assignedTo.name}
                            </p>

                            <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                              {contact.assignedTo.role ===
                              "SALES_EXECUTIVE"
                                ? "Sales Executive"
                                : contact.assignedTo.role}
                            </p>
                          </div>
                        ) : (
                          <span className="font-inter text-sm text-[#9CA1AA]">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* CREATED */}
                      <td className="px-5 py-4 font-inter text-sm text-[#555E67]">
                        {formatDate(contact.createdAt)}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openView(contact)
                            }
                            title="View"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#7C838D] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
                          >
                            <Eye size={17} />
                          </button>

                          {canEdit && (
                            <button
                              type="button"
                              onClick={() =>
                                openEdit(contact)
                              }
                              title="Edit"
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#7C838D] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
                            >
                              <Edit3 size={17} />
                            </button>
                          )}

                          {canAssign && (
                            <button
                              type="button"
                              onClick={() =>
                                openAssign(contact)
                              }
                              title="Assign"
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#7C838D] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
                            >
                              <UserPlus size={17} />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(contact)
                              }
                              title="Delete"
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#7C838D] hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 size={17} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex flex-col gap-3 border-t border-[#EDEEF0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-inter text-sm text-[#8A9099]">
                Showing{" "}
                <span className="font-semibold text-[#555E67]">
                  {contacts.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#555E67]">
                  {pagination.total}
                </span>{" "}
                contacts
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((prev) =>
                      Math.max(prev - 1, 1)
                    )
                  }
                  className="rounded-lg border border-[#E4E6EA] px-3 py-2 font-inter text-sm text-[#555E67] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="rounded-lg bg-[#F5F8FE] px-3 py-2 font-inter text-sm font-semibold text-[#266DF0]">
                  {pagination.page} /{" "}
                  {pagination.totalPages || 1}
                </span>

                <button
                  type="button"
                  disabled={
                    page >= pagination.totalPages
                  }
                  onClick={() =>
                    setPage((prev) => prev + 1)
                  }
                  className="rounded-lg border border-[#E4E6EA] px-3 py-2 font-inter text-sm text-[#555E67] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ==================================================
          CREATE / EDIT MODAL
      ================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1D1E20]/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EDEEF0] px-6 py-5">
              <div>
                <h2 className="font-gilroy text-xl font-bold text-[#1D1E20]">
                  {editingContact
                    ? "Edit Contact"
                    : "Add Contact"}
                </h2>

                <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                  Enter the contact information below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA1AA] hover:bg-[#F5F6F8] hover:text-[#1D1E20]"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Rahul Sharma"
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="rahul@example.com"
                />

                <Input
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="9876543210"
                />

                <Input
                  label="Job Title"
                  name="jobTitle"
                  value={form.jobTitle}
                  onChange={handleChange}
                  placeholder="Project Manager"
                />

                <Input
                  label="Department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="IT"
                />

                <Input
                  label="Company"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="ABC Technologies"
                />

                <Select
                  label="Customer"
                  name="customer"
                  value={form.customer}
                  onChange={handleChange}
                >
                  <option value="">
                    Select Customer
                  </option>

                  {customers.map((customer) => (
                    <option
                      key={customer._id}
                      value={customer._id}
                    >
                      {customer.name}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Lead"
                  name="lead"
                  value={form.lead}
                  onChange={handleChange}
                >
                  <option value="">
                    Select Lead
                  </option>

                  {leads.map((lead) => (
                    <option
                      key={lead._id}
                      value={lead._id}
                    >
                      {lead.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-2 block font-inter text-xs font-semibold text-[#555E67]">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={4}
                  maxLength={2000}
                  placeholder="Add notes about this contact..."
                  className="w-full resize-none rounded-xl border border-[#E4E6EA] px-4 py-3 font-inter text-sm text-[#1D1E20] outline-none focus:border-[#266DF0] focus:ring-2 focus:ring-[#266DF0]/10"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-[#EDEEF0] pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-[#E4E6EA] px-5 py-2.5 font-inter text-sm font-medium text-[#555E67] hover:bg-[#F7F8FA]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#266DF0] px-5 py-2.5 font-inter text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingContact
                    ? "Update Contact"
                    : "Create Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          VIEW MODAL
      ================================================== */}

      {showView && selectedContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1D1E20]/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EDEEF0] px-6 py-5">
              <div>
                <h2 className="font-gilroy text-xl font-bold text-[#1D1E20]">
                  Contact Details
                </h2>
              </div>

              <button
                type="button"
                onClick={closeView}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA1AA] hover:bg-[#F5F6F8]"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF4FF] font-inter font-bold text-[#266DF0]">
                  {getInitials(
                    selectedContact.name
                  )}
                </div>

                <div>
                  <h3 className="font-gilroy text-lg font-bold text-[#1D1E20]">
                    {selectedContact.name}
                  </h3>

                  <p className="font-inter text-sm text-[#8A9099]">
                    {selectedContact.jobTitle ||
                      "Contact"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Detail
                  label="Email"
                  value={selectedContact.email}
                />

                <Detail
                  label="Phone"
                  value={selectedContact.phone}
                />

                <Detail
                  label="Company"
                  value={
                    selectedContact.company || "—"
                  }
                />

                <Detail
                  label="Department"
                  value={
                    selectedContact.department || "—"
                  }
                />

                <Detail
                  label="Customer"
                  value={
                    selectedContact.customer?.name ||
                    "—"
                  }
                />

                <Detail
                  label="Lead"
                  value={
                    selectedContact.lead?.name || "—"
                  }
                />

                <Detail
                  label="Assigned To"
                  value={
                    selectedContact.assignedTo?.name ||
                    "Unassigned"
                  }
                />

                <Detail
                  label="Created"
                  value={formatDate(
                    selectedContact.createdAt
                  )}
                />
              </div>

              <div>
                <p className="mb-2 font-inter text-xs font-bold uppercase tracking-wider text-[#9CA1AA]">
                  Notes
                </p>

                <div className="rounded-xl bg-[#F7F8FA] p-4 font-inter text-sm leading-6 text-[#555E67]">
                  {selectedContact.notes ||
                    "No notes added."}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeView}
                  className="rounded-xl bg-[#1D1E20] px-5 py-2.5 font-inter text-sm font-semibold text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          ASSIGN MODAL
      ================================================== */}

      {showAssign && selectedContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1D1E20]/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EDEEF0] px-6 py-5">
              <div>
                <h2 className="font-gilroy text-xl font-bold text-[#1D1E20]">
                  Assign Contact
                </h2>

                <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                  Assign this contact to a Sales
                  Executive.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAssign}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA1AA] hover:bg-[#F5F6F8]"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-5 rounded-xl bg-[#F7F8FA] p-4">
                <p className="font-inter text-xs text-[#9CA1AA]">
                  Contact
                </p>

                <p className="mt-1 font-inter text-sm font-semibold text-[#1D1E20]">
                  {selectedContact.name}
                </p>
              </div>

              <label className="mb-2 block font-inter text-xs font-semibold text-[#555E67]">
                Sales Executive
              </label>

              <select
                value={assignedTo}
                onChange={(e) =>
                  setAssignedTo(e.target.value)
                }
                className="h-11 w-full rounded-xl border border-[#E4E6EA] bg-white px-3 font-inter text-sm text-[#555E67] outline-none focus:border-[#266DF0]"
              >
                <option value="">
                  Select Sales Executive
                </option>

                {salesExecutives.map((user) => (
                  <option
                    key={user._id}
                    value={user._id}
                  >
                    {user.name} — {user.email}
                  </option>
                ))}
              </select>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeAssign}
                  className="rounded-xl border border-[#E4E6EA] px-5 py-2.5 font-inter text-sm font-medium text-[#555E67]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleAssign}
                  className="rounded-xl bg-[#266DF0] px-5 py-2.5 font-inter text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving
                    ? "Assigning..."
                    : "Assign Contact"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ======================================================
// REUSABLE INPUT
// ======================================================

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
}) {
  return (
    <div>
      <label className="mb-2 block font-inter text-xs font-semibold text-[#555E67]">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-[#E4E6EA] px-4 font-inter text-sm text-[#1D1E20] outline-none transition focus:border-[#266DF0] focus:ring-2 focus:ring-[#266DF0]/10"
      />
    </div>
  );
}

// ======================================================
// REUSABLE SELECT
// ======================================================

function Select({
  label,
  name,
  value,
  onChange,
  children,
}) {
  return (
    <div>
      <label className="mb-2 block font-inter text-xs font-semibold text-[#555E67]">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-11 w-full rounded-xl border border-[#E4E6EA] bg-white px-3 font-inter text-sm text-[#555E67] outline-none focus:border-[#266DF0]"
      >
        {children}
      </select>
    </div>
  );
}

// ======================================================
// DETAIL
// ======================================================

function Detail({ label, value }) {
  return (
    <div className="rounded-xl bg-[#F7F8FA] p-3">
      <p className="font-inter text-[10px] font-bold uppercase tracking-wider text-[#9CA1AA]">
        {label}
      </p>

      <p className="mt-1 break-words font-inter text-sm font-medium text-[#555E67]">
        {value || "—"}
      </p>
    </div>
  );
}

export default Contacts;