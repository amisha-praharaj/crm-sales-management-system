import { useEffect, useMemo, useState } from "react";
import {
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";

import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  assignCustomer,
  getUsers,
} from "../../services/api";

function Customers() {
  const [user, setUser] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // Create / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
  });

  // View
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Assign
  const [assigningCustomer, setAssigningCustomer] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // --------------------------------------------------
  // LOGGED-IN USER
  // --------------------------------------------------

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user:", error);
      }
    }
  }, []);

  // --------------------------------------------------
  // PERMISSIONS
  // --------------------------------------------------

  const canAssign =
    user?.role === "ADMIN" ||
    user?.role === "SALES_MANAGER";

  const canDelete = user?.role === "ADMIN";

  // --------------------------------------------------
  // LOAD CUSTOMERS
  // --------------------------------------------------

  const loadCustomers = async (params = {}) => {
    try {
      setLoading(true);
      setError("");

      const response = await getCustomers({
        search: params.search ?? search,
      });

      const responseCustomers =
        response?.customers ??
        response?.data?.customers ??
        [];

      setCustomers(
        Array.isArray(responseCustomers)
          ? responseCustomers
          : []
      );
    } catch (error) {
      console.error("Get customers error:", error);

      setError(
        error?.response?.data?.message ||
          "Failed to load customers"
      );

      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // LOAD USERS
  // --------------------------------------------------

  const loadUsers = async () => {
    if (!canAssign) return;

    try {
      const response = await getUsers();

      const responseUsers =
        response?.users ??
        response?.data?.users ??
        [];

      const salesUsers = Array.isArray(responseUsers)
        ? responseUsers.filter(
            (item) =>
              item.role === "SALES_EXECUTIVE"
          )
        : [];

      setUsers(salesUsers);
    } catch (error) {
      console.error("Get users error:", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [canAssign]);

  const handleSearchChange = async (nextValue) => {
    setSearch(nextValue);

    await loadCustomers({ search: nextValue });
  };

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filteredCustomers = customers;

  // --------------------------------------------------
  // FORM
  // --------------------------------------------------

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openCreateModal = () => {
    setEditingCustomer(null);

    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
    });

    setShowModal(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);

    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      company: customer.company || "",
      address: customer.address || "",
    });

    setShowModal(true);
  };

  // --------------------------------------------------
  // CREATE / UPDATE
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      if (editingCustomer) {
        await updateCustomer(
          editingCustomer._id,
          formData
        );
      } else {
        await createCustomer(formData);
      }

      setShowModal(false);

      await loadCustomers();
    } catch (error) {
      console.error("Save customer error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to save customer"
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.name}?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      await deleteCustomer(customer._id);

      await loadCustomers();
    } catch (error) {
      console.error("Delete customer error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to delete customer"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------
  // ASSIGN
  // --------------------------------------------------

  const openAssignModal = (customer) => {
    setAssigningCustomer(customer);

    setSelectedUser(
      customer.assignedTo?._id ||
        customer.assignedTo ||
        ""
    );
  };

  const handleAssign = async () => {
    if (!assigningCustomer) return;

    if (!selectedUser) {
      alert("Please select a Sales Executive");
      return;
    }

    try {
      setActionLoading(true);

      await assignCustomer(
        assigningCustomer._id,
        selectedUser
      );

      setAssigningCustomer(null);
      setSelectedUser("");

      await loadCustomers();
    } catch (error) {
      console.error("Assign customer error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to assign customer"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D9E5FC] border-t-[#266DF0]" />
      </div>
    );
  }

  return (
    <div>
      {/* ------------------------------------------------ */}
      {/* HEADER */}
      {/* ------------------------------------------------ */}

      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="font-inter text-sm font-medium text-[#266DF0]">
            Sales
          </p>

          <h1 className="mt-1 font-gilroy text-3xl font-bold tracking-tight text-[#1D1E20]">
            Customers
          </h1>

          <p className="mt-2 font-inter text-sm text-[#9CA1AA]">
            Manage and track your customers.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#266DF0] px-5 font-inter text-sm font-semibold text-white shadow-[0_8px_20px_rgba(38,109,240,0.2)] transition hover:bg-[#1F5FD6]"
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {/* ------------------------------------------------ */}
      {/* ERROR */}
      {/* ------------------------------------------------ */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 font-inter text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* SEARCH */}
      {/* ------------------------------------------------ */}

      <div className="mb-6 rounded-2xl border border-[#EDEEF0] bg-white p-4 shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA1AA]"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              handleSearchChange(event.target.value)
            }
            placeholder="Search customers..."
            className="h-12 w-full rounded-xl border border-[#EDEEF0] bg-[#F8FAFD] pl-11 pr-4 font-inter text-sm text-[#232529] outline-none placeholder:text-[#9CA1AA] focus:border-[#B3CCFA] focus:bg-white focus:ring-4 focus:ring-[#D9E5FC]"
          />
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* TABLE */}
      {/* ------------------------------------------------ */}

      <div className="overflow-hidden rounded-2xl border border-[#EDEEF0] bg-white shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#EDEEF0]">
                <th className="px-5 py-4 text-left font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                  Customer
                </th>

                <th className="px-5 py-4 text-left font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                  Company
                </th>

                <th className="px-5 py-4 text-left font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                  Phone
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
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-16 text-center"
                  >
                    <div className="mx-auto max-w-sm">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5F8FE] text-[#266DF0]">
                        <Search size={20} />
                      </div>

                      <p className="mt-4 font-inter text-sm font-semibold text-[#31373D]">
                        No customers found
                      </p>

                      <p className="mt-1 font-inter text-sm text-[#9CA1AA]">
                        Try another search or add a new customer.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="border-b border-[#F0F1F3] last:border-b-0 hover:bg-[#FAFBFD]"
                  >
                    {/* CUSTOMER */}

                    <td className="px-5 py-5">
                      <div>
                        <p className="font-inter text-sm font-semibold text-[#232529]">
                          {customer.name}
                        </p>

                        <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                          {customer.email}
                        </p>
                      </div>
                    </td>

                    {/* COMPANY */}

                    <td className="px-5 py-5 font-inter text-sm text-[#555E67]">
                      {customer.company || "—"}
                    </td>

                    {/* PHONE */}

                    <td className="px-5 py-5 font-inter text-sm text-[#555E67]">
                      {customer.phone || "—"}
                    </td>

                    {/* ASSIGNED */}

                    <td className="px-5 py-5">
                      {customer.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D9E5FC] font-inter text-xs font-bold text-[#266DF0]">
                            {customer.assignedTo.name
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-inter text-sm font-medium text-[#31373D]">
                              {customer.assignedTo.name}
                            </p>

                            <p className="font-inter text-[10px] uppercase text-[#9CA1AA]">
                              {customer.assignedTo.role?.replace(
                                "_",
                                " "
                              )}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="font-inter text-sm text-[#9CA1AA]">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-5">
                      <div className="flex justify-end gap-1">
                        {/* VIEW */}

                        <button
                          type="button"
                          title="View Customer"
                          onClick={() =>
                            setSelectedCustomer(customer)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#555E67] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
                        >
                          <Eye size={17} />
                        </button>

                        {/* EDIT */}

                        <button
                          type="button"
                          title="Edit Customer"
                          onClick={() =>
                            openEditModal(customer)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#555E67] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
                        >
                          <Edit size={17} />
                        </button>

                        {/* ASSIGN */}

                        {canAssign && (
                          <button
                            type="button"
                            title="Assign Customer"
                            onClick={() =>
                              openAssignModal(customer)
                            }
                            disabled={actionLoading}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#555E67] hover:bg-[#F5F8FE] hover:text-[#266DF0] disabled:opacity-50"
                          >
                            <UserCheck size={17} />
                          </button>
                        )}

                        {/* DELETE */}

                        {canDelete && (
                          <button
                            type="button"
                            title="Delete Customer"
                            onClick={() =>
                              handleDelete(customer)
                            }
                            disabled={actionLoading}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#555E67] hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        )}

                        <button
                          type="button"
                          title="More"
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA1AA] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
                        >
                          <MoreHorizontal size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================= */}
      {/* CREATE / EDIT MODAL */}
      {/* ================================================= */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1D1E20]/40 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-[0_25px_80px_rgba(35,37,41,0.2)]">
            <div className="flex items-center justify-between border-b border-[#EDEEF0] px-6 py-5">
              <div>
                <h2 className="font-gilroy text-xl font-bold text-[#1D1E20]">
                  {editingCustomer
                    ? "Edit Customer"
                    : "Add Customer"}
                </h2>

                <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                  {editingCustomer
                    ? "Update customer information."
                    : "Create a new customer record."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA1AA] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Customer name"
                  required
                />

                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="customer@example.com"
                  required
                />

                <InputField
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="9876543210"
                  required
                />

                <InputField
                  label="Company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Company name"
                  required
                />

                <div className="sm:col-span-2">
                  <label className="mb-2 block font-inter text-sm font-semibold text-[#31373D]">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Customer address"
                    className="w-full rounded-xl border border-[#EDEEF0] bg-[#F8FAFD] px-4 py-3 font-inter text-sm text-[#232529] outline-none placeholder:text-[#9CA1AA] focus:border-[#B3CCFA] focus:bg-white focus:ring-4 focus:ring-[#D9E5FC]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#EDEEF0] pt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-11 rounded-xl border border-[#EDEEF0] px-5 font-inter text-sm font-semibold text-[#555E67] hover:bg-[#F8FAFD]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 rounded-xl bg-[#266DF0] px-6 font-inter text-sm font-semibold text-white hover:bg-[#1F5FD6] disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingCustomer
                      ? "Update Customer"
                      : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* VIEW MODAL */}
      {/* ================================================= */}

      {selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1D1E20]/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-[0_25px_80px_rgba(35,37,41,0.2)]">
            <div className="flex items-center justify-between border-b border-[#EDEEF0] px-6 py-5">
              <div>
                <p className="font-inter text-xs font-medium uppercase tracking-wider text-[#266DF0]">
                  Customer
                </p>

                <h2 className="mt-1 font-gilroy text-xl font-bold text-[#1D1E20]">
                  {selectedCustomer.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedCustomer(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA1AA] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
              >
                <X size={19} />
              </button>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <Detail
                label="Email"
                value={selectedCustomer.email}
              />

              <Detail
                label="Phone"
                value={selectedCustomer.phone || "—"}
              />

              <Detail
                label="Company"
                value={selectedCustomer.company || "—"}
              />

              <Detail
                label="Address"
                value={selectedCustomer.address || "—"}
              />

              <Detail
                label="Assigned To"
                value={
                  selectedCustomer.assignedTo?.name ||
                  "Unassigned"
                }
              />

              <Detail
                label="Created By"
                value={
                  selectedCustomer.createdBy?.name ||
                  "—"
                }
              />

              {selectedCustomer.sourceLead && (
                <div className="sm:col-span-2">
                  <p className="font-inter text-xs font-medium text-[#9CA1AA]">
                    Source Lead
                  </p>

                  <p className="mt-1 font-inter text-sm font-medium text-[#232529]">
                    {selectedCustomer.sourceLead.name}
                  </p>

                  <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                    {selectedCustomer.sourceLead.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* ASSIGN MODAL */}
      {/* ================================================= */}

      {assigningCustomer && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#1D1E20]/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-[0_25px_80px_rgba(35,37,41,0.2)]">
            <div className="flex items-center justify-between border-b border-[#EDEEF0] px-6 py-5">
              <div>
                <p className="font-inter text-xs font-medium uppercase tracking-wider text-[#266DF0]">
                  Assignment
                </p>

                <h2 className="mt-1 font-gilroy text-xl font-bold text-[#1D1E20]">
                  Assign Customer
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setAssigningCustomer(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA1AA] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <p className="font-inter text-sm font-semibold text-[#31373D]">
                  {assigningCustomer.name}
                </p>

                <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                  {assigningCustomer.company}
                </p>
              </div>

              <div>
                <label className="mb-2 block font-inter text-sm font-semibold text-[#31373D]">
                  Sales Executive
                </label>

                <select
                  value={selectedUser}
                  onChange={(event) =>
                    setSelectedUser(event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-[#EDEEF0] bg-[#F8FAFD] px-4 font-inter text-sm text-[#555E67] outline-none focus:border-[#B3CCFA] focus:bg-white"
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
              </div>

              {users.length === 0 && (
                <p className="rounded-xl bg-yellow-50 px-4 py-3 font-inter text-xs text-yellow-700">
                  No Sales Executives available.
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setAssigningCustomer(null)
                  }
                  className="h-11 rounded-xl border border-[#EDEEF0] px-5 font-inter text-sm font-semibold text-[#555E67] hover:bg-[#F8FAFD]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleAssign}
                  disabled={
                    actionLoading ||
                    !selectedUser
                  }
                  className="h-11 rounded-xl bg-[#266DF0] px-6 font-inter text-sm font-semibold text-white hover:bg-[#1F5FD6] disabled:opacity-60"
                >
                  {actionLoading
                    ? "Assigning..."
                    : "Assign Customer"}
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
// INPUT
// ======================================================

function InputField({
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
// DETAIL
// ======================================================

function Detail({ label, value }) {
  return (
    <div>
      <p className="font-inter text-xs font-medium text-[#9CA1AA]">
        {label}
      </p>

      <p className="mt-1 break-words font-inter text-sm font-medium text-[#232529]">
        {value}
      </p>
    </div>
  );
}

export default Customers;