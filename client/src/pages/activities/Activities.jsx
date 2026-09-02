import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Edit3,
  Eye,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  getActivities,
  getCustomers,
  getDeals,
  getLeads,
  createActivity,
  updateActivity,
  deleteActivity,
} from "../../services/api";

const ACTIVITY_TYPES = [
  "Call",
  "Email",
  "Meeting",
  "Task",
];

const ACTIVITY_STATUSES = [
  "Pending",
  "Completed",
  "Cancelled",
  "Overdue",
];

const emptyForm = {
  type: "Call",
  subject: "",
  description: "",
  dueDate: "",
  status: "Pending",
  lead: "",
  customer: "",
  deal: "",
};

function Activities() {
  const [activities, setActivities] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [deals, setDeals] = useState([]);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);

  const [selectedActivity, setSelectedActivity] =
    useState(null);

  const [editingActivity, setEditingActivity] =
    useState(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // ======================================================
  // LOAD ACTIVITIES
  // ======================================================

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getActivities({
        search,
        type,
        status,
        page: 1,
        limit: 100,
      });

      setActivities(response.activities || []);
    } catch (err) {
      setError(
        err.message || "Failed to load activities"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOAD RELATED DATA
  // ======================================================

  const loadRelatedData = async () => {
  try {
    const [
      leadsResponse,
      customersResponse,
      dealsResponse,
    ] = await Promise.all([
      getLeads(),
      getCustomers(),
      getDeals({
        page: 1,
        limit: 100,
      }),
    ]);

    setLeads(
      Array.isArray(leadsResponse?.leads)
        ? leadsResponse.leads
        : Array.isArray(leadsResponse?.leads?.leads)
        ? leadsResponse.leads.leads
        : []
    );

    setCustomers(
      Array.isArray(customersResponse?.customers)
        ? customersResponse.customers
        : []
    );

    setDeals(
      Array.isArray(dealsResponse?.deals)
        ? dealsResponse.deals
        : []
    );
  } catch (err) {
    console.error(
      "Failed to load related data:",
      err
    );
  }
};

  useEffect(() => {
    loadActivities();
  }, [search, type, status]);

  useEffect(() => {
    loadRelatedData();
  }, []);

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
    setEditingActivity(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (activity) => {
    setEditingActivity(activity);

    setForm({
      type: activity.type || "Call",
      subject: activity.subject || "",
      description: activity.description || "",
      dueDate: activity.dueDate
        ? formatDateTimeForInput(activity.dueDate)
        : "",
      status: activity.status || "Pending",
      lead: activity.lead?._id || "",
      customer: activity.customer?._id || "",
      deal: activity.deal?._id || "",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingActivity(null);
    setForm(emptyForm);
  };

  // ======================================================
  // CREATE / UPDATE
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        type: form.type,
        subject: form.subject.trim(),
        description: form.description.trim(),
        status: form.status,
        dueDate: form.dueDate
          ? new Date(form.dueDate).toISOString()
          : undefined,
        lead: form.lead || null,
        customer: form.customer || null,
        deal: form.deal || null,
      };

      if (editingActivity) {
        await updateActivity(
          editingActivity._id,
          payload
        );
      } else {
        await createActivity(payload);
      }

      closeForm();
      await loadActivities();
    } catch (err) {
      setError(
        err.message || "Failed to save activity"
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // VIEW
  // ======================================================

  const openView = (activity) => {
    setSelectedActivity(activity);
    setShowView(true);
  };

  const closeView = () => {
    setShowView(false);
    setSelectedActivity(null);
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (activity) => {
    const confirmed = window.confirm(
      `Delete "${activity.subject}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteActivity(activity._id);

      await loadActivities();
    } catch (err) {
      setError(
        err.message || "Failed to delete activity"
      );
    }
  };

  // ======================================================
  // HELPERS
  // ======================================================

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

  const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const formatDateTimeForInput = (date) => {
    const value = new Date(date);

    const year = value.getFullYear();
    const month = String(
      value.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      value.getDate()
    ).padStart(2, "0");
    const hours = String(
      value.getHours()
    ).padStart(2, "0");
    const minutes = String(
      value.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getTypeIcon = (activityType) => {
    if (activityType === "Call") {
      return <Phone size={16} />;
    }

    if (activityType === "Email") {
      return <Mail size={16} />;
    }

    if (activityType === "Meeting") {
      return <Users size={16} />;
    }

    return <CheckCircle2 size={16} />;
  };

  const getTypeClass = (activityType) => {
    const classes = {
      Call: "bg-blue-50 text-blue-600",
      Email: "bg-purple-50 text-purple-600",
      Meeting: "bg-orange-50 text-orange-600",
      Task: "bg-green-50 text-green-600",
    };

    return (
      classes[activityType] ||
      "bg-slate-100 text-slate-600"
    );
  };

  const getStatusClass = (activityStatus) => {
    const classes = {
      Pending: "bg-orange-50 text-orange-600",
      Completed: "bg-green-50 text-green-600",
      Cancelled: "bg-red-50 text-red-600",
      Overdue: "bg-red-50 text-red-600",
    };

    return (
      classes[activityStatus] ||
      "bg-slate-100 text-slate-600"
    );
  };

  const displayedActivities = useMemo(() => {
    return activities.map((activity) => {
      const isOverdue =
        activity.status === "Pending" &&
        activity.dueDate &&
        new Date(activity.dueDate) < new Date();

      return {
        ...activity,
        displayStatus: isOverdue
          ? "Overdue"
          : activity.status,
      };
    });
  }, [activities]);

  return (
    <div>
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-inter text-sm font-medium text-[#266DF0]">
            Workspace
          </p>

          <h1 className="mt-1 font-gilroy text-3xl font-bold tracking-tight text-[#1D1E20]">
            Activities
          </h1>

          <p className="mt-2 font-inter text-sm text-[#9CA1AA]">
            Manage calls, emails, meetings and tasks.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#266DF0] px-5 font-inter text-sm font-semibold text-white shadow-[0_7px_18px_rgba(38,109,240,0.20)] transition hover:bg-[#1F5ED1]"
        >
          <Plus size={18} />
          Add Activity
        </button>
      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 font-inter text-sm text-red-600">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* ==================================================
          FILTERS
      ================================================== */}

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#EDEEF0] bg-white p-4 shadow-[0_4px_20px_rgba(35,37,41,0.03)] md:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA1AA]"
          />

          <input
            type="search"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search activities..."
            className="h-11 w-full rounded-xl border border-[#EDEEF0] bg-[#F5F8FE] pl-11 pr-4 font-inter text-sm outline-none transition focus:border-[#B3CCFA] focus:bg-white focus:ring-4 focus:ring-[#D9E5FC]"
          />
        </div>

        <select
          value={type}
          onChange={(e) =>
            setType(e.target.value)
          }
          className="h-11 rounded-xl border border-[#EDEEF0] bg-[#F5F8FE] px-4 font-inter text-sm text-[#555E67] outline-none focus:border-[#B3CCFA] focus:bg-white"
        >
          <option value="">All Types</option>

          {ACTIVITY_TYPES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          className="h-11 rounded-xl border border-[#EDEEF0] bg-[#F5F8FE] px-4 font-inter text-sm text-[#555E67] outline-none focus:border-[#B3CCFA] focus:bg-white"
        >
          <option value="">All Statuses</option>

          {ACTIVITY_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* ==================================================
          TABLE
      ================================================== */}

      <div className="overflow-hidden rounded-2xl border border-[#EDEEF0] bg-white shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-[#EDEEF0] bg-[#FAFBFC]">
                <th className="px-5 py-4 text-left font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                  Activity
                </th>

                <th className="px-5 py-4 text-left font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                  Related To
                </th>

                <th className="px-5 py-4 text-left font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                  Due Date
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
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center font-inter text-sm text-[#9CA1AA]"
                  >
                    Loading activities...
                  </td>
                </tr>
              ) : displayedActivities.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center font-inter text-sm text-[#9CA1AA]"
                  >
                    No activities found.
                  </td>
                </tr>
              ) : (
                displayedActivities.map(
                  (activity) => (
                    <tr
                      key={activity._id}
                      className="border-b border-[#F0F1F3] last:border-0 hover:bg-[#FAFBFD]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${getTypeClass(
                              activity.type
                            )}`}
                          >
                            {getTypeIcon(
                              activity.type
                            )}
                          </div>

                          <div>
                            <p className="font-inter text-sm font-semibold text-[#232529]">
                              {activity.subject}
                            </p>

                            <p className="mt-1 max-w-[260px] truncate font-inter text-xs text-[#9CA1AA]">
                              {activity.description ||
                                "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {activity.customer ? (
                          <div>
                            <p className="font-inter text-sm font-medium text-[#232529]">
                              {activity.customer.name}
                            </p>

                            <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                              Customer
                            </p>
                          </div>
                        ) : activity.lead ? (
                          <div>
                            <p className="font-inter text-sm font-medium text-[#232529]">
                              {activity.lead.name}
                            </p>

                            <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                              Lead
                            </p>
                          </div>
                        ) : activity.deal ? (
                          <div>
                            <p className="font-inter text-sm font-medium text-[#232529]">
                              {activity.deal.title}
                            </p>

                            <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                              Deal
                            </p>
                          </div>
                        ) : (
                          <span className="font-inter text-sm text-[#B2B6BD]">
                            Not linked
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar
                            size={15}
                            className="text-[#9CA1AA]"
                          />

                          <span className="font-inter text-sm text-[#555E67]">
                            {formatDateTime(
                              activity.dueDate
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 font-inter text-xs font-semibold ${getStatusClass(
                            activity.displayStatus
                          )}`}
                        >
                          {activity.displayStatus}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {activity.assignedTo ? (
                          <div>
                            <p className="font-inter text-sm font-medium text-[#232529]">
                              {
                                activity.assignedTo
                                  .name
                              }
                            </p>

                            <p className="font-inter text-xs text-[#9CA1AA]">
                              {
                                activity.assignedTo
                                  .email
                              }
                            </p>
                          </div>
                        ) : (
                          <span className="font-inter text-sm text-[#B2B6BD]">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            title="View"
                            onClick={() =>
                              openView(activity)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#555E67] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            title="Edit"
                            onClick={() =>
                              openEdit(activity)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#555E67] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            type="button"
                            title="Delete"
                            onClick={() =>
                              handleDelete(
                                activity
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA1AA] hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
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
                  {editingActivity
                    ? "Edit Activity"
                    : "Add Activity"}
                </h2>

                <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                  {editingActivity
                    ? "Update activity information."
                    : "Create a new activity."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA1AA] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-inter text-sm font-medium text-[#555E67]">
                    Type
                  </label>

                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-[#EDEEF0] bg-white px-4 font-inter text-sm outline-none focus:border-[#B3CCFA] focus:ring-4 focus:ring-[#D9E5FC]"
                  >
                    {ACTIVITY_TYPES.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-inter text-sm font-medium text-[#555E67]">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-[#EDEEF0] bg-white px-4 font-inter text-sm outline-none focus:border-[#B3CCFA] focus:ring-4 focus:ring-[#D9E5FC]"
                  >
                    {[
                      "Pending",
                      "Completed",
                      "Cancelled",
                    ].map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block font-inter text-sm font-medium text-[#555E67]">
                  Subject
                </label>

                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  maxLength={150}
                  placeholder="Follow-up with customer"
                  className="h-11 w-full rounded-xl border border-[#EDEEF0] px-4 font-inter text-sm outline-none focus:border-[#B3CCFA] focus:ring-4 focus:ring-[#D9E5FC]"
                />
              </div>

              <div>
                <label className="mb-2 block font-inter text-sm font-medium text-[#555E67]">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={2000}
                  rows={4}
                  placeholder="Discuss CRM implementation requirements..."
                  className="w-full resize-none rounded-xl border border-[#EDEEF0] px-4 py-3 font-inter text-sm outline-none focus:border-[#B3CCFA] focus:ring-4 focus:ring-[#D9E5FC]"
                />
              </div>

              <div>
                <label className="mb-2 block font-inter text-sm font-medium text-[#555E67]">
                  Due Date
                </label>

                <input
                  type="datetime-local"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-[#EDEEF0] px-4 font-inter text-sm outline-none focus:border-[#B3CCFA] focus:ring-4 focus:ring-[#D9E5FC]"
                />
              </div>

              <div className="border-t border-[#EDEEF0] pt-5">
                <p className="mb-4 font-gilroy text-base font-semibold text-[#232529]">
                  Link Activity
                </p>

                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block font-inter text-sm font-medium text-[#555E67]">
                      Lead
                    </label>

                    <select
                      name="lead"
                      value={form.lead}
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-[#EDEEF0] bg-white px-3 font-inter text-sm outline-none focus:border-[#B3CCFA]"
                    >
                      <option value="">
                        None
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
                  </div>

                  <div>
                    <label className="mb-2 block font-inter text-sm font-medium text-[#555E67]">
                      Customer
                    </label>

                    <select
                      name="customer"
                      value={form.customer}
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-[#EDEEF0] bg-white px-3 font-inter text-sm outline-none focus:border-[#B3CCFA]"
                    >
                      <option value="">
                        None
                      </option>

                      {customers.map(
                        (customer) => (
                          <option
                            key={customer._id}
                            value={customer._id}
                          >
                            {customer.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block font-inter text-sm font-medium text-[#555E67]">
                      Deal
                    </label>

                    <select
                      name="deal"
                      value={form.deal}
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-[#EDEEF0] bg-white px-3 font-inter text-sm outline-none focus:border-[#B3CCFA]"
                    >
                      <option value="">
                        None
                      </option>

                      {deals.map((deal) => (
                        <option
                          key={deal._id}
                          value={deal._id}
                        >
                          {deal.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#EDEEF0] pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  className="h-11 rounded-xl border border-[#EDEEF0] px-5 font-inter text-sm font-semibold text-[#555E67] hover:bg-[#F5F8FE]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 rounded-xl bg-[#266DF0] px-6 font-inter text-sm font-semibold text-white hover:bg-[#1F5ED1] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingActivity
                    ? "Update Activity"
                    : "Create Activity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          VIEW MODAL
      ================================================== */}

      {showView && selectedActivity && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1D1E20]/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EDEEF0] px-6 py-5">
              <div>
                <p className="font-inter text-xs font-medium text-[#266DF0]">
                  Activity Details
                </p>

                <h2 className="mt-1 font-gilroy text-xl font-bold text-[#1D1E20]">
                  {selectedActivity.subject}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeView}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA1AA] hover:bg-[#F5F8FE]"
              >
                <X size={19} />
              </button>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <div>
                <p className="font-inter text-xs text-[#9CA1AA]">
                  Type
                </p>

                <span
                  className={`mt-1 inline-flex rounded-full px-3 py-1 font-inter text-xs font-semibold ${getTypeClass(
                    selectedActivity.type
                  )}`}
                >
                  {selectedActivity.type}
                </span>
              </div>

              <div>
                <p className="font-inter text-xs text-[#9CA1AA]">
                  Status
                </p>

                <span
                  className={`mt-1 inline-flex rounded-full px-3 py-1 font-inter text-xs font-semibold ${getStatusClass(
                    selectedActivity.status
                  )}`}
                >
                  {selectedActivity.status}
                </span>
              </div>

              <div>
                <p className="font-inter text-xs text-[#9CA1AA]">
                  Due Date
                </p>

                <p className="mt-1 font-inter text-sm font-semibold text-[#232529]">
                  {formatDateTime(
                    selectedActivity.dueDate
                  )}
                </p>
              </div>

              <div>
                <p className="font-inter text-xs text-[#9CA1AA]">
                  Assigned To
                </p>

                <p className="mt-1 font-inter text-sm font-semibold text-[#232529]">
                  {selectedActivity.assignedTo
                    ?.name || "—"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="font-inter text-xs text-[#9CA1AA]">
                  Description
                </p>

                <p className="mt-1 whitespace-pre-wrap font-inter text-sm text-[#555E67]">
                  {selectedActivity.description ||
                    "No description"}
                </p>
              </div>

              <div>
                <p className="font-inter text-xs text-[#9CA1AA]">
                  Lead
                </p>

                <p className="mt-1 font-inter text-sm font-semibold text-[#232529]">
                  {selectedActivity.lead?.name ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="font-inter text-xs text-[#9CA1AA]">
                  Customer
                </p>

                <p className="mt-1 font-inter text-sm font-semibold text-[#232529]">
                  {selectedActivity.customer
                    ?.name || "—"}
                </p>
              </div>

              <div>
                <p className="font-inter text-xs text-[#9CA1AA]">
                  Deal
                </p>

                <p className="mt-1 font-inter text-sm font-semibold text-[#232529]">
                  {selectedActivity.deal?.title ||
                    "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Activities;