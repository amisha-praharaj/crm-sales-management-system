import { useEffect, useState } from "react";
import {
  UserPlus,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  X,
  Loader2,
} from "lucide-react";

import {
  getUsers,
  createUser,
  updateUserStatus,
} from "../../services/api";

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "SALES_EXECUTIVE",
  });

  // =====================================================
  // LOAD USERS
  // =====================================================

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getUsers();

      setUsers(
        Array.isArray(response?.users)
          ? response.users
          : []
      );
    } catch (err) {
      console.error("Get users error:", err);

      setError(
        err.message || "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // CREATE USER
  // =====================================================

  const handleCreateUser = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await createUser(form);

      setSuccess("User created successfully.");

      setForm({
        name: "",
        email: "",
        password: "",
        role: "SALES_EXECUTIVE",
      });

      setShowModal(false);

      await loadUsers();
    } catch (err) {
      console.error("Create user error:", err);

      setError(
        err.message || "Failed to create user"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const handleStatusChange = async (
    userId,
    isActive
  ) => {
    try {
      setError("");
      setSuccess("");

      await updateUserStatus(
        userId,
        !isActive
      );

      setSuccess(
        `User ${
          !isActive
            ? "activated"
            : "deactivated"
        } successfully.`
      );

      await loadUsers();
    } catch (err) {
      console.error(
        "Update user status error:",
        err
      );

      setError(
        err.message ||
          "Failed to update user status"
      );
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredUsers = users.filter((user) => {
    const searchValue = search
      .toLowerCase()
      .trim();

    if (!searchValue) {
      return true;
    }

    return (
      user.name
        ?.toLowerCase()
        .includes(searchValue) ||
      user.email
        ?.toLowerCase()
        .includes(searchValue) ||
      user.role
        ?.toLowerCase()
        .includes(searchValue)
    );
  });

  // =====================================================
  // ROLE LABEL
  // =====================================================

  const getRoleLabel = (role) => {
    switch (role) {
      case "ADMIN":
        return "Admin";

      case "SALES_MANAGER":
        return "Sales Manager";

      case "SALES_EXECUTIVE":
        return "Sales Executive";

      default:
        return role;
    }
  };

  // =====================================================
  // ROLE STYLE
  // =====================================================

  const getRoleClass = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-50 text-purple-600";

      case "SALES_MANAGER":
        return "bg-blue-50 text-blue-600";

      case "SALES_EXECUTIVE":
        return "bg-green-50 text-green-600";

      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  // =====================================================
  // INITIALS
  // =====================================================

  const getInitials = (name = "") => {
    return (
      name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "U"
    );
  };

  return (
    <div>
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-inter text-sm font-medium text-[#266DF0]">
            Administration
          </p>

          <h1 className="mt-1 font-gilroy text-3xl font-bold tracking-tight text-[#1D1E20]">
            Users
          </h1>

          <p className="mt-2 font-inter text-sm text-[#9CA1AA]">
            Manage Sales Managers and Sales Executives.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setSuccess("");
            setShowModal(true);
          }}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#266DF0] px-5 font-inter text-sm font-semibold text-white shadow-[0_7px_18px_rgba(38,109,240,0.22)] transition hover:bg-[#1F5ED4]"
        >
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      {/* =================================================
          ALERTS
      ================================================= */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 font-inter text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 font-inter text-sm text-green-600">
          {success}
        </div>
      )}

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="mb-5 rounded-2xl border border-[#EDEEF0] bg-white p-4 shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA1AA]"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search users..."
            className="h-10 w-full rounded-xl border border-[#EDEEF0] bg-[#F8F9FB] pl-10 pr-4 font-inter text-sm text-[#232529] outline-none transition focus:border-[#B3CCFA] focus:bg-white focus:ring-4 focus:ring-[#D9E5FC]"
          />
        </div>
      </div>

      {/* =================================================
          USERS TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-[#EDEEF0] bg-white shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center">
            <div className="flex items-center gap-2 font-inter text-sm text-[#9CA1AA]">
              <Loader2
                size={18}
                className="animate-spin"
              />
              Loading users...
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex min-h-[250px] items-center justify-center px-5 text-center">
            <div>
              <ShieldCheck
                size={32}
                className="mx-auto text-[#B2B6BD]"
              />

              <p className="mt-3 font-inter text-sm font-medium text-[#555E67]">
                No users found
              </p>

              <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                Try another search or add a new user.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="border-b border-[#EDEEF0] bg-[#FAFAFB]">
                  <th className="px-5 py-4 text-left font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                    User
                  </th>

                  <th className="px-5 py-4 text-left font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                    Role
                  </th>

                  <th className="px-5 py-4 text-left font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right font-inter text-xs font-semibold uppercase tracking-wide text-[#9CA1AA]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id || user.id}
                    className="border-b border-[#F0F1F3] last:border-0 hover:bg-[#FCFCFD]"
                  >
                    {/* User */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D9E5FC] font-gilroy text-sm font-bold text-[#266DF0]">
                          {getInitials(
                            user.name
                          )}
                        </div>

                        <div>
                          <p className="font-inter text-sm font-semibold text-[#232529]">
                            {user.name}
                          </p>

                          <p className="mt-0.5 font-inter text-xs text-[#9CA1AA]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 font-inter text-xs font-semibold ${getRoleClass(
                          user.role
                        )}`}
                      >
                        {getRoleLabel(
                          user.role
                        )}
                      </span>
                    </td>

                    {/* Status */}

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 font-inter text-xs font-semibold ${
                          user.isActive
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            user.isActive
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />

                        {user.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    {/* Action */}

                    <td className="px-5 py-4 text-right">
                      {user.role === "ADMIN" ? (
                        <span className="font-inter text-xs font-medium text-[#B2B6BD]">
                          Protected
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(
                              user._id ||
                                user.id,
                              user.isActive
                            )
                          }
                          className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 font-inter text-xs font-semibold transition ${
                            user.isActive
                              ? "bg-red-50 text-red-500 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <UserX
                                size={15}
                              />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck
                                size={15}
                              />
                              Activate
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =================================================
          CREATE USER MODAL
      ================================================= */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1D1E20]/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#EDEEF0] bg-white shadow-2xl">
            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-[#EDEEF0] px-5 py-4">
              <div>
                <h2 className="font-gilroy text-xl font-bold text-[#1D1E20]">
                  Add User
                </h2>

                <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                  Create a Sales Manager or Sales Executive.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowModal(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA1AA] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
              >
                <X size={19} />
              </button>
            </div>

            {/* Form */}

            <form
              onSubmit={handleCreateUser}
              className="space-y-5 p-5"
            >
              {/* Name */}

              <div>
                <label className="mb-1.5 block font-inter text-sm font-medium text-[#555E67]">
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Enter full name"
                  className="h-11 w-full rounded-xl border border-[#EDEEF0] bg-white px-4 font-inter text-sm outline-none focus:border-[#B3CCFA] focus:ring-4 focus:ring-[#D9E5FC]"
                />
              </div>

              {/* Email */}

              <div>
                <label className="mb-1.5 block font-inter text-sm font-medium text-[#555E67]">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="user@company.com"
                  className="h-11 w-full rounded-xl border border-[#EDEEF0] bg-white px-4 font-inter text-sm outline-none focus:border-[#B3CCFA] focus:ring-4 focus:ring-[#D9E5FC]"
                />
              </div>

              {/* Password */}

              <div>
                <label className="mb-1.5 block font-inter text-sm font-medium text-[#555E67]">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className="h-11 w-full rounded-xl border border-[#EDEEF0] bg-white px-4 font-inter text-sm outline-none focus:border-[#B3CCFA] focus:ring-4 focus:ring-[#D9E5FC]"
                />
              </div>

              {/* Role */}

              <div>
                <label className="mb-1.5 block font-inter text-sm font-medium text-[#555E67]">
                  Role
                </label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-[#EDEEF0] bg-white px-4 font-inter text-sm outline-none focus:border-[#B3CCFA] focus:ring-4 focus:ring-[#D9E5FC]"
                >
                  <option value="SALES_EXECUTIVE">
                    Sales Executive
                  </option>

                  <option value="SALES_MANAGER">
                    Sales Manager
                  </option>
                </select>
              </div>

              {/* Actions */}

              <div className="flex justify-end gap-3 border-t border-[#EDEEF0] pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="h-11 rounded-xl border border-[#EDEEF0] px-5 font-inter text-sm font-semibold text-[#555E67] hover:bg-[#F8F9FB]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#266DF0] px-5 font-inter text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {submitting
                    ? "Creating..."
                    : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;