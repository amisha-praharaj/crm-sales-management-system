import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Calendar,
  Edit3,
  Eye,
  Plus,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import {
  getDeals,
  getCustomers,
  getUsers,
  createDeal,
  updateDeal,
  deleteDeal,
  assignDeal,
} from "../../services/api";

const STAGES = [
  "Prospecting",
  "Qualification",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];

const emptyForm = {
  title: "",
  customer: "",
  value: "",
  stage: "Prospecting",
  expectedCloseDate: "",
  notes: "",
};

function Deals() {
  const [deals, setDeals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  const [editingDeal, setEditingDeal] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [assignedTo, setAssignedTo] = useState("");

  const [saving, setSaving] = useState(false);

  // ======================================================
  // LOAD DATA
  // ======================================================

  const loadDeals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDeals({
        search,
        stage,
        page: 1,
        limit: 100,
      });

      setDeals(response.deals || []);
    } catch (err) {
      setError(err.message || "Failed to load deals");
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

  const loadUsers = async () => {
    try {
      const response = await getUsers();

      setUsers(response.users || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load current user:", error);
    }
  }, []);

  useEffect(() => {
    loadDeals();
  }, [search, stage]);

  useEffect(() => {
    loadCustomers();
    loadUsers();
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
    setEditingDeal(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (deal) => {
    setEditingDeal(deal);

    setForm({
      title: deal.title || "",
      customer: deal.customer?._id || "",
      value: deal.value ?? "",
      stage: deal.stage || "Prospecting",
      expectedCloseDate: deal.expectedCloseDate
        ? deal.expectedCloseDate.slice(0, 10)
        : "",
      notes: deal.notes || "",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingDeal(null);
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

      if (
        editingDeal &&
        (editingDeal.stage === "Closed Won" ||
          editingDeal.stage === "Closed Lost") &&
        form.stage !== editingDeal.stage
      ) {
        setError("Closed deals cannot be moved to another stage.");
        return;
      }

      const payload = {
        title: form.title.trim(),
        customer: form.customer,
        value: Number(form.value),
        stage: form.stage,
        expectedCloseDate: form.expectedCloseDate || undefined,
        notes: form.notes.trim(),
      };

      if (editingDeal) {
        await updateDeal(editingDeal._id, payload);
      } else {
        await createDeal(payload);
      }

      closeForm();
      await loadDeals();
    } catch (err) {
      if (err.status === 409) {
        setError(err.message || "This deal cannot be moved to another stage.");
      } else {
        setError(err.message || "Failed to save deal");
      }
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // VIEW
  // ======================================================

  const openView = (deal) => {
    setSelectedDeal(deal);
    setShowView(true);
  };

  const closeView = () => {
    setShowView(false);
    setSelectedDeal(null);
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (deal) => {
    const confirmed = window.confirm(`Delete "${deal.title}"?`);

    if (!confirmed) return;

    try {
      setError("");
      await deleteDeal(deal._id);
      await loadDeals();
    } catch (err) {
      if (err.status === 403) {
        setError(err.message || "You are not authorized to delete this deal.");
        return;
      }

      setError(err.message || "Failed to delete deal");
    }
  };

  // ======================================================
  // ASSIGN
  // ======================================================

  const openAssign = (deal) => {
    if (!canAssign) {
      setError("Only Admin and Sales Manager can assign deals.");
      return;
    }

    setSelectedDeal(deal);
    setAssignedTo(deal.assignedTo?._id || "");
    setShowAssign(true);
  };

  const closeAssign = () => {
    setShowAssign(false);
    setSelectedDeal(null);
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

      await assignDeal(
        selectedDeal._id,
        assignedTo
      );

      closeAssign();
      await loadDeals();
    } catch (err) {
      if (err.status === 403) {
        setError(err.message || "You are not authorized to assign this deal.");
      } else {
        setError(err.message || "Failed to assign deal");
      }
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // SALES EXECUTIVES
  // ======================================================

  const salesExecutives = useMemo(
    () =>
      users.filter(
        (user) => user.role === "SALES_EXECUTIVE"
      ),
    [users]
  );

  const canAssign =
    currentUser?.role === "ADMIN" ||
    currentUser?.role === "SALES_MANAGER";

  const canDelete = currentUser?.role === "ADMIN";

  const canEdit =
    currentUser?.role === "ADMIN" ||
    currentUser?.role === "SALES_MANAGER" ||
    currentUser?.role === "SALES_EXECUTIVE";

  // ======================================================
  // HELPERS
  // ======================================================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return "â€”";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStageClass = (currentStage) => {
    const classes = {
      Prospecting:
        "bg-slate-100 text-slate-700",
      Qualification:
        "bg-blue-50 text-blue-600",
      Proposal:
        "bg-purple-50 text-purple-600",
      Negotiation:
        "bg-orange-50 text-orange-600",
      "Closed Won":
        "bg-green-50 text-green-600",
      "Closed Lost":
        "bg-red-50 text-red-600",
    };

    return classes[currentStage] || classes.Prospecting;
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div>
      {/* Header */}
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-inter text-sm font-medium text-[#266DF0]">
            Sales
          </p>

          <h1 className="mt-1 font-gilroy text-3xl font-bold tracking-tight text-[#1D1E20]">
            Deals
          </h1>

          <p className="mt-2 font-inter text-sm text-[#9CA1AA]">
            Manage your sales opportunities and pipeline.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#266DF0] px-5 font-inter text-sm font-semibold text-white shadow-[0_7px_18px_rgba(38,109,240,0.20)] transition hover:bg-[#1F5ED1]"
        >
          <Plus size={18} />
          Add Deal
        </button>
      </div>

      {/* Error */}
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

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#EDEEF0] bg-white p-4 shadow-[0_4px_20px_rgba(35,37,41,0.03)] md:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA1AA]"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search deals..."
            className="h-11 w-full rounded-xl border border-[#EDEEF0] bg-[#F5F8FE] pl-11 pr-4 font-inter text-sm outline-none transition focus:border-[#B3CCFA] focus:bg-white focus:ring-4 focus:ring-[#D9E5FC]"
          />
        </div>

        <select
          value={stage}
          onChange={(e) =>
            setStage(e.target.value)
          }
          className="h-11 rounded-xl border border-[#EDEEF0] bg-[#F5F8FE] px-4 font-inter text-sm text-[#555E67] outline-none focus:border-[#B3CCFA] focus:bg-white"
        >
          <option value="">All Stages</option>

          {STAGES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#EDEEF0] bg-white shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-[#EDEEF0] bg-[#FAFBFC]">
                <th className="px-5 py-4 text-left font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                  Deal
                </th>

                <th className="px-5 py-4 text-left font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                  Customer
                </th>

                <th className="px-5 py-4 text-left font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                  Value
                </th>

                <th className="px-5 py-4 text-left font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                  Stage
                </th>

                <th className="px-5 py-4 text-left font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                  Close Date
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
                    colSpan="7"
                    className="px-5 py-12 text-center font-inter text-sm text-[#9CA1AA]"
                  >
                    Loading deals...
                  </td>
                </tr>
              ) : deals.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center font-inter text-sm text-[#9CA1AA]"
                  >
                    No deals found.
                  </td>
                </tr>
              ) : (
                deals.map((deal) => (
                  <tr
                    key={deal._id}
                    className="border-b border-[#F0F1F3] last:border-0 hover:bg-[#FAFBFD]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-inter text-sm font-semibold text-[#232529]">
                        {deal.title}
                      </p>

                      {deal.notes && (
                        <p className="mt-1 max-w-[230px] truncate font-inter text-xs text-[#9CA1AA]">
                          {deal.notes}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-inter text-sm font-medium text-[#232529]">
                        {deal.customer?.name || "â€”"}
                      </p>

                      <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                        {deal.customer?.company || ""}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-inter text-sm font-semibold text-[#232529]">
                      {formatCurrency(deal.value)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 font-inter text-xs font-semibold ${getStageClass(
                          deal.stage
                        )}`}
                      >
                        {deal.stage}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 font-inter text-sm text-[#555E67]">
                        <Calendar
                          size={15}
                          className="text-[#9CA1AA]"
                        />
                        {formatDate(
                          deal.expectedCloseDate
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {deal.assignedTo ? (
                        <div>
                          <p className="font-inter text-sm font-medium text-[#232529]">
                            {deal.assignedTo.name}
                          </p>

                          <p className="font-inter text-xs text-[#9CA1AA]">
                            {deal.assignedTo.email}
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
                            openView(deal)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#555E67] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
                        >
                          <Eye size={17} />
                        </button>

                        {canEdit && (
                          <button
                            type="button"
                            title="Edit"
                            onClick={() => openEdit(deal)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#555E67] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
                          >
                            <Edit3 size={16} />
                          </button>
                        )}

                        {canAssign && (
                          <button
                            type="button"
                            title="Assign"
                            onClick={() => openAssign(deal)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#555E67] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
                          >
                            <UserPlus size={17} />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            type="button"
                            title="Delete"
                            onClick={() => handleDelete(deal)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA1AA] hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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
                  {editingDeal
                    ? "Edit Deal"
                    : "Add Deal"}
                </h2>

                <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                  {editingDeal
                    ? "Update deal information."
                    : "Create a new sales opportunity."}
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
              <div>
                <label className="mb-2 block font-inter text-sm font-medium text-[#555E67]">
                  Deal Title
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  maxLength={150}
                  placeholder="CRM Implementation Project"
                  className="h-11 w-full rounded-xl border border-[#EDEEF0] px-4 font-inter text-sm outline-none focus:border-[#B3CCFA] focus:ring-4 focus:ring-[#D9E5FC]"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-inter text-sm font-medium text-[#555E67]">
                    Customer
                  </label>

                  <select
                    name="customer"
                    value={form.customer}
                    onChange={handleChange}
                    required
                    className="h-11 w-full rounded-xl border border-[#EDEEF0] bg-white px-4 font-inter text-sm outline-none focus:border-[#B3CCFA] focus:ring-4 focus:ring-[#D9E5FC]"
                  >
                    <option value="">
                      Select customer
                    </option>

                    {customers.map((customer) => (
                      <option
                        key={customer._id}
                        value={customer._id}
                      >
                        {customer.name}
                        {customer.company
                          ? ` â€” ${customer.company}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-inter text-sm font-medium text-[#555E67]">
                    Deal Value
                  </label>

                  <input
                    name="value"
                    type="number"
                    min="0"
                    step="1"
                    value={form.value}
                    onChange={handleChange}
                    required
                    placeholder="150000"
                    className="h-11 w-full rounded-xl border border-[#EDEEF0] px-4 font-inter text-sm outline-none focus:border-[#B3CCFA] focus:ring-4 focus:ring-[#D9E5FC]"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-inter text-sm font-medium text-[#555E67]">
                    Stage
                  </label>

                  <select
                    name="stage"
                    value={form.stage}
                    onChange={handleChange}
                    disabled={
                      !!editingDeal &&
                      (editingDeal.stage === "Closed Won" ||
                        editingDeal.stage === "Closed Lost")
                    }
                    className="h-11 w-full rounded-xl border border-[#EDEEF0] bg-white px-4 font-inter text-sm outline-none focus:border-[#B3CCFA] focus:ring-4 focus:ring-[#D9E5FC]"
                  >
                    {STAGES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-inter text-sm font-medium text-[#555E67]">
                    Expected Close Date
                  </label>

                  <input
                    name="expectedCloseDate"
                    type="date"
                    value={form.expectedCloseDate}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-[#EDEEF0] px-4 font-inter text-sm outline-none focus:border-[#B3CCFA] focus:ring-4 focus:ring-[#D9E5FC]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block font-inter text-sm font-medium text-[#555E67]">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  maxLength={2000}
                  rows={4}
                  placeholder="Add notes about this opportunity..."
                  className="w-full resize-none rounded-xl border border-[#EDEEF0] px-4 py-3 font-inter text-sm outline-none focus:border-[#B3CCFA] focus:ring-4 focus:ring-[#D9E5FC]"
                />
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
                    : editingDeal
                    ? "Update Deal"
                    : "Create Deal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          VIEW MODAL
      ================================================== */}

      {showView && selectedDeal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1D1E20]/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EDEEF0] px-6 py-5">
              <div>
                <p className="font-inter text-xs font-medium text-[#266DF0]">
                  Deal Details
                </p>

                <h2 className="mt-1 font-gilroy text-xl font-bold text-[#1D1E20]">
                  {selectedDeal.title}
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
                  Customer
                </p>

                <p className="mt-1 font-inter text-sm font-semibold text-[#232529]">
                  {selectedDeal.customer?.name || "â€”"}
                </p>
              </div>

              <div>
                <p className="font-inter text-xs text-[#9CA1AA]">
                  Company
                </p>

                <p className="mt-1 font-inter text-sm font-semibold text-[#232529]">
                  {selectedDeal.customer?.company || "â€”"}
                </p>
              </div>

              <div>
                <p className="font-inter text-xs text-[#9CA1AA]">
                  Value
                </p>

                <p className="mt-1 font-inter text-sm font-semibold text-[#232529]">
                  {formatCurrency(selectedDeal.value)}
                </p>
              </div>

              <div>
                <p className="font-inter text-xs text-[#9CA1AA]">
                  Probability
                </p>

                <p className="mt-1 font-inter text-sm font-semibold text-[#232529]">
                  {selectedDeal.probability ?? 0}%
                </p>
              </div>

              <div>
                <p className="font-inter text-xs text-[#9CA1AA]">
                  Expected Revenue
                </p>

                <p className="mt-1 font-inter text-sm font-semibold text-[#232529]">
                  {formatCurrency(selectedDeal.expectedRevenue)}
                </p>
              </div>

              <div>
                <p className="font-inter text-xs text-[#9CA1AA]">
                  Stage
                </p>

                <span
                  className={`mt-1 inline-flex rounded-full px-3 py-1 font-inter text-xs font-semibold ${getStageClass(
                    selectedDeal.stage
                  )}`}
                >
                  {selectedDeal.stage}
                </span>
              </div>

              <div>
                <p className="font-inter text-xs text-[#9CA1AA]">
                  Expected Close
                </p>

                <p className="mt-1 font-inter text-sm font-semibold text-[#232529]">
                  {formatDate(
                    selectedDeal.expectedCloseDate
                  )}
                </p>
              </div>

              <div>
                <p className="font-inter text-xs text-[#9CA1AA]">
                  Assigned To
                </p>

                <p className="mt-1 font-inter text-sm font-semibold text-[#232529]">
                  {selectedDeal.assignedTo?.name ||
                    "Unassigned"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="font-inter text-xs text-[#9CA1AA]">
                  Notes
                </p>

                <p className="mt-1 whitespace-pre-wrap font-inter text-sm text-[#555E67]">
                  {selectedDeal.notes || "No notes"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="font-inter text-xs text-[#9CA1AA]">
                  Stage History
                </p>

                {!selectedDeal.stageHistory?.length ? (
                  <p className="mt-2 font-inter text-sm text-[#9CA1AA]">
                    No stage history available.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {selectedDeal.stageHistory.map((history) => (
                      <div
                        key={history._id}
                        className="rounded-xl border border-[#EDEEF0] bg-[#FAFBFC] p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-inter text-sm font-semibold text-[#232529]">
                            {history.fromStage
                              ? `${history.fromStage} → ${history.toStage}`
                              : history.toStage}
                          </p>

                          <span className="font-inter text-xs text-[#9CA1AA]">
                            {formatDate(history.changedAt)}
                          </span>
                        </div>

                        <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                          Changed by {history.changedBy?.name || "Unknown user"}
                        </p>

                        {history.note && (
                          <p className="mt-2 font-inter text-xs text-[#555E67]">
                            {history.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          ASSIGN MODAL
      ================================================== */}

      {showAssign && selectedDeal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1D1E20]/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EDEEF0] px-6 py-5">
              <div>
                <h2 className="font-gilroy text-xl font-bold text-[#1D1E20]">
                  Assign Deal
                </h2>

                <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                  Assign this deal to a Sales Executive.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAssign}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA1AA] hover:bg-[#F5F8FE]"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-5 rounded-xl bg-[#F5F8FE] p-4">
                <p className="font-inter text-sm font-semibold text-[#232529]">
                  {selectedDeal.title}
                </p>

                <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                  {formatCurrency(
                    selectedDeal.value
                  )}
                </p>
              </div>

              <label className="mb-2 block font-inter text-sm font-medium text-[#555E67]">
                Sales Executive
              </label>

              <select
                value={assignedTo}
                onChange={(e) =>
                  setAssignedTo(e.target.value)
                }
                className="h-11 w-full rounded-xl border border-[#EDEEF0] bg-white px-4 font-inter text-sm outline-none focus:border-[#B3CCFA] focus:ring-4 focus:ring-[#D9E5FC]"
              >
                <option value="">
                  Select Sales Executive
                </option>

                {salesExecutives.map((user) => (
                  <option
                    key={user._id}
                    value={user._id}
                  >
                    {user.name} â€” {user.email}
                  </option>
                ))}
              </select>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeAssign}
                  className="h-11 rounded-xl border border-[#EDEEF0] px-5 font-inter text-sm font-semibold text-[#555E67] hover:bg-[#F5F8FE]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleAssign}
                  disabled={saving}
                  className="h-11 rounded-xl bg-[#266DF0] px-6 font-inter text-sm font-semibold text-white hover:bg-[#1F5ED1] disabled:opacity-60"
                >
                  {saving
                    ? "Assigning..."
                    : "Assign Deal"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Deals;