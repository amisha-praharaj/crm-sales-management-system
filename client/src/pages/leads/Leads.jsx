import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserRound,
  X,
} from "lucide-react";

import {
  assignLead,
  convertLead,
  createLead,
  deleteLead,
  getLeads,
  getUsers,
  updateLead,
} from "../../services/api";

function Leads() {
  // --------------------------------------------------
  // USER
  // --------------------------------------------------

  const [user, setUser] = useState(null);

  // --------------------------------------------------
  // LEADS
  // --------------------------------------------------

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // SEARCH / FILTER
  // --------------------------------------------------

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");

  // --------------------------------------------------
  // CREATE / EDIT
  // --------------------------------------------------

  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "Other",
    priority: "Medium",
    status: "New",
    notes: "",
  });

  // --------------------------------------------------
  // VIEW
  // --------------------------------------------------

  const [selectedLead, setSelectedLead] = useState(null);

  // --------------------------------------------------
  // ASSIGN
  // --------------------------------------------------

  const [users, setUsers] = useState([]);
  const [assigningLead, setAssigningLead] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // --------------------------------------------------
  // LOAD LOGGED-IN USER
  // --------------------------------------------------

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
      }
    }
  }, []);

  // --------------------------------------------------
  // ROLE PERMISSIONS
  // --------------------------------------------------

  const canAssign =
    user?.role === "ADMIN" ||
    user?.role === "SALES_MANAGER";

  const canConvert =
    user?.role === "ADMIN" ||
    user?.role === "SALES_MANAGER";

  const canDelete = user?.role === "ADMIN";

  // --------------------------------------------------
  // LOAD LEADS
  // --------------------------------------------------

  const loadLeads = async (params = {}) => {
    try {
      setLoading(true);
      setError("");

      const response = await getLeads({
        search: params.search ?? search,
        status: params.status ?? (statusFilter === "All" ? "" : statusFilter),
        source: params.source ?? (sourceFilter === "All" ? "" : sourceFilter),
      });

      const responseLeads =
        response?.leads ??
        response?.data?.leads ??
        [];

      setLeads(Array.isArray(responseLeads) ? responseLeads : []);
    } catch (error) {
      console.error("Get leads error:", error);

      setError(
        error.message || "Failed to load leads"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleSearchChange = async (nextSearch) => {
    setSearch(nextSearch);

    await loadLeads({
      search: nextSearch,
      status: statusFilter === "All" ? "" : statusFilter,
      source: sourceFilter === "All" ? "" : sourceFilter,
    });
  };

  const handleStatusChange = async (nextStatus) => {
    setStatusFilter(nextStatus);

    await loadLeads({
      search,
      status: nextStatus === "All" ? "" : nextStatus,
      source: sourceFilter === "All" ? "" : sourceFilter,
    });
  };

  const handleSourceChange = async (nextSource) => {
    setSourceFilter(nextSource);

    await loadLeads({
      search,
      status: statusFilter === "All" ? "" : statusFilter,
      source: nextSource === "All" ? "" : nextSource,
    });
  };

  // --------------------------------------------------
  // FILTER LEADS
  // --------------------------------------------------

  const filteredLeads = leads;

  // --------------------------------------------------
  // CREATE LEAD
  // --------------------------------------------------

  const openCreateModal = () => {
    setEditingLead(null);

    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      source: "Other",
      priority: "Medium",
      status: "New",
      notes: "",
    });

    setShowModal(true);
  };

  // --------------------------------------------------
  // EDIT LEAD
  // --------------------------------------------------

  const openEditModal = (lead) => {
    setEditingLead(lead);

    setFormData({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "",
      source: lead.source || "Other",
      priority: lead.priority || "Medium",
      status: lead.status || "New",
      notes: lead.notes || "",
    });

    setShowModal(true);
  };

  // --------------------------------------------------
  // FORM CHANGE
  // --------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // CREATE / UPDATE
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      if (editingLead) {
        await updateLead(
          editingLead._id,
          formData
        );
      } else {
        await createLead(formData);
      }

      setShowModal(false);

      await loadLeads();
    } catch (error) {
      console.error("Save lead error:", error);

      alert(
        error.message || "Failed to save lead"
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE LEAD
  // --------------------------------------------------

  const handleDelete = async (lead) => {
    if (!canDelete) {
      alert(
        "You are not authorized to delete leads"
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${lead.name}?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      await deleteLead(lead._id);

      await loadLeads();
    } catch (error) {
      console.error("Delete lead error:", error);

      alert(
        error.message || "Failed to delete lead"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------
  // LOAD SALES EXECUTIVES
  // --------------------------------------------------

  const loadUsers = async () => {
    try {
      const response = await getUsers();

      const responseUsers =
        response?.users ??
        response?.data?.users ??
        [];

      const salesExecutives = (
        Array.isArray(responseUsers) ? responseUsers : []
      ).filter(
        (userItem) =>
          userItem.role === "SALES_EXECUTIVE" &&
          userItem.isActive !== false
      );

      setUsers(salesExecutives);
    } catch (error) {
      console.error("Get users error:", error);

      alert(
        error.message ||
        "Failed to load Sales Executives"
      );
    }
  };

  // --------------------------------------------------
  // OPEN ASSIGN MODAL
  // --------------------------------------------------

  const openAssignModal = async (lead) => {
    if (!canAssignOrConvert) {
      return;
    }

    try {
      setActionLoading(true);

      await loadUsers();

      setAssigningLead(lead);

      setSelectedUser(
        lead.assignedTo?._id || ""
      );
    } catch (error) {
      console.error(
        "Open assign modal error:",
        error
      );
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------
  // ASSIGN LEAD
  // --------------------------------------------------

  const handleAssignLead = async (event) => {
    event.preventDefault();

    if (!assigningLead) {
      return;
    }

    if (!selectedUser) {
      alert(
        "Please select a Sales Executive"
      );
      return;
    }

    try {
      setActionLoading(true);

      await assignLead(
        assigningLead._id,
        selectedUser
      );

      setAssigningLead(null);
      setSelectedUser("");

      await loadLeads();
    } catch (error) {
      console.error(
        "Assign lead error:",
        error
      );

      alert(
        error.message ||
        "Failed to assign lead"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------
  // CONVERT LEAD
  // --------------------------------------------------

  const handleConvertLead = async (lead) => {
    if (!canAssignOrConvert) {
      return;
    }

    if (lead.status !== "Qualified") {
      alert(
        "Only qualified leads can be converted to a customer."
      );
      return;
    }

    if (lead.status === "Converted") {
      alert(
        "Lead has already been converted"
      );
      return;
    }

    const confirmed = window.confirm(
      `Convert ${lead.name} into a customer?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      await convertLead(lead._id);

      alert(
        "Lead converted to customer successfully"
      );

      await loadLeads();
    } catch (error) {
      console.error(
        "Convert lead error:",
        error
      );

      alert(
        error.message ||
        "Failed to convert lead"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------
  // STATUS STYLE
  // --------------------------------------------------

  const getStatusClass = (status) => {
    const classes = {
      New: "bg-blue-50 text-blue-600",
      Contacted: "bg-purple-50 text-purple-600",
      Qualified: "bg-cyan-50 text-cyan-600",
      Proposal: "bg-orange-50 text-orange-600",
      Converted: "bg-green-50 text-green-600",
      Lost: "bg-red-50 text-red-600",
    };

    return (
      classes[status] ||
      "bg-gray-50 text-gray-600"
    );
  };

  const getPriorityClass = (priority) => {
    const classes = {
      Low: "bg-green-50 text-green-700",
      Medium: "bg-yellow-50 text-yellow-700",
      High: "bg-red-50 text-red-700",
    };

    return (
      classes[priority] ||
      "bg-gray-50 text-gray-600"
    );
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div>
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-inter text-sm font-medium text-[#266DF0]">
            Sales
          </p>

          <h1 className="mt-1 font-gilroy text-3xl font-bold tracking-tight text-[#1D1E20]">
            Leads
          </h1>

          <p className="mt-2 font-inter text-sm text-[#9CA1AA]">
            Manage and track your sales leads.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#266DF0] px-5 font-inter text-sm font-semibold text-white shadow-[0_7px_18px_rgba(38,109,240,0.2)] transition hover:bg-[#1F62DD]"
        >
          <Plus size={18} />

          Add Lead
        </button>
      </div>

      {/* ==================================================
          FILTERS
      ================================================== */}

      <div className="mb-5 rounded-2xl border border-[#EDEEF0] bg-white p-4 shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
        <div className="flex flex-col gap-3 md:flex-row">
          {/* Search */}

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA1AA]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                handleSearchChange(event.target.value)
              }
              placeholder="Search leads..."
              className="h-11 w-full rounded-xl border border-[#EDEEF0] bg-[#F8FAFD] pl-11 pr-4 font-inter text-sm text-[#232529] outline-none focus:border-[#B3CCFA] focus:bg-white focus:ring-4 focus:ring-[#D9E5FC]"
            />
          </div>

          {/* Status */}

          <select
            value={statusFilter}
            onChange={(event) =>
              handleStatusChange(event.target.value)
            }
            className="h-11 rounded-xl border border-[#EDEEF0] bg-[#F8FAFD] px-4 font-inter text-sm text-[#555E67] outline-none focus:border-[#B3CCFA]"
          >
            <option value="All">
              All Status
            </option>

            <option value="New">New</option>

            <option value="Contacted">
              Contacted
            </option>

            <option value="Qualified">
              Qualified
            </option>

            <option value="Proposal">
              Proposal
            </option>

            <option value="Converted">
              Converted
            </option>

            <option value="Lost">Lost</option>
          </select>

          {/* Source */}

          <select
            value={sourceFilter}
            onChange={(event) =>
              handleSourceChange(event.target.value)
            }
            className="h-11 rounded-xl border border-[#EDEEF0] bg-[#F8FAFD] px-4 font-inter text-sm text-[#555E67] outline-none focus:border-[#B3CCFA]"
          >
            <option value="All">
              All Sources
            </option>

            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Social Media">Social Media</option>
            <option value="Advertisement">Advertisement</option>
            <option value="Cold Call">Cold Call</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-inter text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ==================================================
          TABLE
      ================================================== */}

      <div className="overflow-hidden rounded-2xl border border-[#EDEEF0] bg-white shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="font-inter text-sm text-[#9CA1AA]">
              Loading leads...
            </p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F8FE]">
              <UserRound
                size={24}
                className="text-[#266DF0]"
              />
            </div>

            <h3 className="mt-4 font-gilroy text-lg font-bold text-[#1D1E20]">
              No leads found
            </h3>

            <p className="mt-1 font-inter text-sm text-[#9CA1AA]">
              Try changing your search or add
              a new lead.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-[#EDEEF0] bg-[#FAFBFD]">
                  <th className="px-5 py-4 text-left font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                    Lead
                  </th>

                  <th className="px-5 py-4 text-left font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                    Company
                  </th>

                  <th className="px-5 py-4 text-left font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                    Phone
                  </th>

                  <th className="px-5 py-4 text-left font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                    Priority
                  </th>

                  <th className="px-5 py-4 text-left font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                    Assigned To
                  </th>

                  <th className="px-5 py-4 text-right font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="border-b border-[#EDEEF0] last:border-0 hover:bg-[#FCFDFF]"
                  >
                    {/* Lead */}

                    <td className="px-5 py-4">
                      <div>
                        <p className="font-inter text-sm font-semibold text-[#232529]">
                          {lead.name}
                        </p>

                        <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                          {lead.email}
                        </p>
                      </div>
                    </td>

                    {/* Company */}

                    <td className="px-5 py-4 font-inter text-sm text-[#555E67]">
                      {lead.company}
                    </td>

                    {/* Phone */}

                    <td className="px-5 py-4 font-inter text-sm text-[#555E67]">
                      {lead.phone}
                    </td>

                    {/* Priority */}

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 font-inter text-xs font-semibold ${getPriorityClass(
                          lead.priority
                        )}`}
                      >
                        {lead.priority || "Medium"}
                      </span>
                    </td>

                    {/* Status */}

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 font-inter text-xs font-semibold ${getStatusClass(
                          lead.status
                        )}`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    {/* Assigned */}

                    <td className="px-5 py-4">
                      {lead.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D9E5FC] font-inter text-[10px] font-bold text-[#266DF0]">
                            {lead.assignedTo.name
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-inter text-sm text-[#555E67]">
                              {lead.assignedTo.name}
                            </p>

                            <p className="font-inter text-[10px] text-[#9CA1AA]">
                              {lead.assignedTo.role}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="font-inter text-xs text-[#9CA1AA]">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Actions */}

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        {/* View */}

                        <button
                          type="button"
                          title="View"
                          onClick={() =>
                            setSelectedLead(lead)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#555E67] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
                        >
                          <Eye size={17} />
                        </button>

                        {/* Edit */}

                        <button
                          type="button"
                          title="Edit"
                          onClick={() =>
                            openEditModal(lead)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#555E67] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
                        >
                          <Edit size={17} />
                        </button>

                        {/* Assign */}

                        {canAssign && (
                            <button
                              type="button"
                              title="Assign Lead"
                              onClick={() =>
                                openAssignModal(
                                  lead
                                )
                              }
                              disabled={actionLoading}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#555E67] hover:bg-[#F5F8FE] hover:text-[#266DF0] disabled:opacity-50"
                            >
                              <UserCheck
                                size={17}
                              />
                            </button>
                          )}

                        {/* Convert */}

                        {canConvert &&
                          lead.status === "Qualified" && (
                            <button
                              type="button"
                              title="Convert to Customer"
                              onClick={() =>
                                handleConvertLead(
                                  lead
                                )
                              }
                              disabled={
                                actionLoading
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#555E67] hover:bg-green-50 hover:text-green-600 disabled:opacity-50"
                            >
                              <CheckCircle2
                                size={17}
                              />
                            </button>
                          )}

                        {/* Delete */}

                        {canDelete && (
                          <button
                            type="button"
                            title="Delete"
                            onClick={() =>
                              handleDelete(lead)
                            }
                            disabled={
                              actionLoading
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#555E67] hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        )}

                        {/* More */}

                        <button
                          type="button"
                          title="More"
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#555E67] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
                        >
                          <MoreHorizontal
                            size={17}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================================================
          CREATE / EDIT MODAL
      ================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1D1E20]/40 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-[0_25px_80px_rgba(35,37,41,0.2)]">
            {/* Header */}

            <div className="flex items-center justify-between border-b border-[#EDEEF0] px-6 py-5">
              <div>
                <h2 className="font-gilroy text-xl font-bold text-[#1D1E20]">
                  {editingLead
                    ? "Edit Lead"
                    : "Add Lead"}
                </h2>

                <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                  {editingLead
                    ? "Update lead information."
                    : "Add a new sales lead."}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowModal(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA1AA] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />

                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />

                <FormField
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  required
                />

                <FormField
                  label="Company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Tech Solutions"
                  required
                />

                <SelectField
                  label="Source"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  options={[
                    "Website",
                    "Referral",
                    "Social Media",
                    "Advertisement",
                    "Cold Call",
                    "Other",
                  ]}
                />

                <SelectField
                  label="Priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  options={["Low", "Medium", "High"]}
                />

                <SelectField
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={[
                    "New",
                    "Contacted",
                    "Qualified",
                    "Proposal",
                    "Converted",
                    "Lost",
                  ]}
                />
              </div>

              {/* Notes */}

              <div>
                <label className="mb-2 block font-inter text-sm font-semibold text-[#31373D]">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Add notes about this lead..."
                  className="w-full rounded-xl border border-[#EDEEF0] bg-[#F8FAFD] px-4 py-3 font-inter text-sm text-[#232529] outline-none placeholder:text-[#9CA1AA] focus:border-[#B3CCFA] focus:bg-white focus:ring-4 focus:ring-[#D9E5FC]"
                />
              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-3 border-t border-[#EDEEF0] pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="h-11 rounded-xl border border-[#EDEEF0] px-5 font-inter text-sm font-semibold text-[#555E67] hover:bg-[#F8FAFD]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 rounded-xl bg-[#266DF0] px-6 font-inter text-sm font-semibold text-white hover:bg-[#1F62DD] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingLead
                      ? "Update Lead"
                      : "Create Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          VIEW LEAD MODAL
      ================================================== */}

      {selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1D1E20]/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-[0_25px_80px_rgba(35,37,41,0.2)]">
            {/* Header */}

            <div className="flex items-center justify-between border-b border-[#EDEEF0] px-6 py-5">
              <div>
                <h2 className="font-gilroy text-xl font-bold text-[#1D1E20]">
                  Lead Details
                </h2>

                <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                  Complete lead information
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedLead(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA1AA] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Details */}

            <div className="space-y-4 p-6">
              <Detail
                label="Name"
                value={selectedLead.name}
              />

              <Detail
                label="Email"
                value={selectedLead.email}
              />

              <Detail
                label="Phone"
                value={selectedLead.phone}
              />

              <Detail
                label="Company"
                value={selectedLead.company}
              />

              <Detail
                label="Source"
                value={selectedLead.source}
              />

              <Detail
                label="Status"
                value={selectedLead.status}
              />

              <Detail
                label="Assigned To"
                value={
                  selectedLead.assignedTo
                    ?.name || "Unassigned"
                }
              />

              <Detail
                label="Notes"
                value={
                  selectedLead.notes ||
                  "No notes added."
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          ASSIGN LEAD MODAL
      ================================================== */}

      {assigningLead && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#1D1E20]/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-[0_25px_80px_rgba(35,37,41,0.2)]">
            {/* Header */}

            <div className="flex items-center justify-between border-b border-[#EDEEF0] px-6 py-5">
              <div>
                <h2 className="font-gilroy text-xl font-bold text-[#1D1E20]">
                  Assign Lead
                </h2>

                <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                  Assign {assigningLead.name} to
                  a Sales Executive.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAssigningLead(null);
                  setSelectedUser("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA1AA] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Assign form */}

            <form
              onSubmit={handleAssignLead}
              className="p-6"
            >
              <label className="mb-2 block font-inter text-sm font-semibold text-[#31373D]">
                Sales Executive
              </label>

              <select
                value={selectedUser}
                onChange={(event) =>
                  setSelectedUser(
                    event.target.value
                  )
                }
                required
                className="h-11 w-full rounded-xl border border-[#EDEEF0] bg-[#F8FAFD] px-4 font-inter text-sm text-[#555E67] outline-none focus:border-[#B3CCFA] focus:bg-white focus:ring-4 focus:ring-[#D9E5FC]"
              >
                <option value="">
                  Select Sales Executive
                </option>

                {users.map((salesUser) => (
                  <option
                    key={salesUser._id}
                    value={salesUser._id}
                  >
                    {salesUser.name} —{" "}
                    {salesUser.email}
                  </option>
                ))}
              </select>

              {users.length === 0 && (
                <p className="mt-2 font-inter text-xs text-orange-500">
                  No active Sales Executives
                  found.
                </p>
              )}

              {/* Buttons */}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAssigningLead(null);
                    setSelectedUser("");
                  }}
                  className="h-11 rounded-xl border border-[#EDEEF0] px-5 font-inter text-sm font-semibold text-[#555E67] hover:bg-[#F8FAFD]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    actionLoading ||
                    !selectedUser
                  }
                  className="h-11 rounded-xl bg-[#266DF0] px-6 font-inter text-sm font-semibold text-white hover:bg-[#1F62DD] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading
                    ? "Assigning..."
                    : "Assign Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ======================================================
// FORM FIELD
// ======================================================

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block font-inter text-sm font-semibold text-[#31373D]">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-xl border border-[#EDEEF0] bg-[#F8FAFD] px-4 font-inter text-sm text-[#232529] outline-none placeholder:text-[#9CA1AA] focus:border-[#B3CCFA] focus:bg-white focus:ring-4 focus:ring-[#D9E5FC]"
      />
    </div>
  );
}

// ======================================================
// SELECT FIELD
// ======================================================

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label className="mb-2 block font-inter text-sm font-semibold text-[#31373D]">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-11 w-full rounded-xl border border-[#EDEEF0] bg-[#F8FAFD] px-4 font-inter text-sm text-[#555E67] outline-none focus:border-[#B3CCFA] focus:bg-white"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

// ======================================================
// DETAIL
// ======================================================

function Detail({ label, value }) {
  return (
    <div>
      <p className="font-inter text-xs font-medium text-[#9CA1AA]">
        {label}
      </p>

      <p className="mt-1 font-inter text-sm font-medium text-[#232529]">
        {value}
      </p>
    </div>
  );
}

export default Leads;