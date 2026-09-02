import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Contact,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Target,
  Users,
  X,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import { logoutUser } from "../services/api";

const navigation = [
  {
    label: "Overview",
    items: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Sales",
    items: [
      {
        name: "Leads",
        path: "/leads",
        icon: Target,
      },
      {
        name: "Customers",
        path: "/customers",
        icon: Users,
      },
      {
        name: "Deals",
        path: "/deals",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        name: "Activities",
        path: "/activities",
        icon: ClipboardCheck,
      },
      {
        name: "Contacts",
        path: "/contacts",
        icon: Contact,
      },
    ],
  },
];

function Sidebar({
  collapsed,
  mobileOpen,
  onClose,
  onToggle,
}) {
  const navigate = useNavigate();

  // Get logged-in user
  const storedUser = localStorage.getItem("user");

  let currentUser = null;

  try {
    currentUser = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.error(
      "Failed to parse stored user:",
      error
    );
  }

  const isAdmin =
    currentUser?.role === "ADMIN";

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");

      onClose?.();

      navigate("/login", {
        replace: true,
      });
    }
  };

  return (
    <>
      {/* Mobile overlay */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#1D1E20]/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#EDEEF0]
          bg-white transition-all duration-300
          ${collapsed ? "w-[80px]" : "w-[260px]"}
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Logo */}

        <div className="flex h-[76px] items-center border-b border-[#EDEEF0] px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#266DF0] shadow-[0_7px_18px_rgba(38,109,240,0.22)]">
              <BarChart3
                size={19}
                className="text-white"
                strokeWidth={2.3}
              />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="font-gilroy text-[17px] font-bold tracking-tight text-[#1D1E20]">
                  CRM Sales
                </p>

                <p className="font-inter text-[9px] font-semibold uppercase tracking-[0.14em] text-[#9CA1AA]">
                  Management
                </p>
              </div>
            )}
          </div>

          {/* Mobile close */}

          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA1AA] hover:bg-[#F5F8FE] hover:text-[#266DF0] lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {navigation.map((section) => (
            <div
              key={section.label}
              className="mb-6"
            >
              {!collapsed && (
                <p className="mb-2 px-3 font-inter text-[10px] font-bold uppercase tracking-[0.16em] text-[#B2B6BD]">
                  {section.label}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      title={
                        collapsed
                          ? item.name
                          : undefined
                      }
                      className={({ isActive }) =>
                        `
                        group flex h-11 items-center rounded-xl px-3
                        font-inter text-sm font-medium transition-all
                        ${
                          isActive
                            ? "bg-[#F5F8FE] text-[#266DF0]"
                            : "text-[#555E67] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
                        }
                        ${
                          collapsed
                            ? "justify-center"
                            : "gap-3"
                        }
                        `
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={19}
                            strokeWidth={
                              isActive
                                ? 2.2
                                : 1.9
                            }
                            className="shrink-0"
                          />

                          {!collapsed && (
                            <span>
                              {item.name}
                            </span>
                          )}

                          {!collapsed &&
                            isActive && (
                              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#266DF0]" />
                            )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {/* =================================================
              ADMINISTRATION
          ================================================= */}

          {isAdmin && (
            <div className="mb-6">
              {!collapsed && (
                <p className="mb-2 px-3 font-inter text-[10px] font-bold uppercase tracking-[0.16em] text-[#B2B6BD]">
                  Administration
                </p>
              )}

              <NavLink
                to="/users"
                onClick={onClose}
                title={
                  collapsed
                    ? "Users"
                    : undefined
                }
                className={({ isActive }) =>
                  `
                  group flex h-11 items-center rounded-xl px-3
                  font-inter text-sm font-medium transition-all
                  ${
                    isActive
                      ? "bg-[#F5F8FE] text-[#266DF0]"
                      : "text-[#555E67] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
                  }
                  ${
                    collapsed
                      ? "justify-center"
                      : "gap-3"
                  }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    <ShieldCheck
                      size={19}
                      strokeWidth={
                        isActive ? 2.2 : 1.9
                      }
                      className="shrink-0"
                    />

                    {!collapsed && (
                      <span>Users</span>
                    )}

                    {!collapsed &&
                      isActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#266DF0]" />
                      )}
                  </>
                )}
              </NavLink>
            </div>
          )}
        </nav>

        {/* Bottom */}

        <div className="border-t border-[#EDEEF0] p-3">
          {/* Settings */}

          <NavLink
            to="/settings"
            title={
              collapsed
                ? "Settings"
                : undefined
            }
            className={({ isActive }) =>
              `
              flex h-11 items-center rounded-xl px-3 font-inter text-sm
              font-medium transition-all
              ${
                collapsed
                  ? "justify-center"
                  : "gap-3"
              }
              ${
                isActive
                  ? "bg-[#F5F8FE] text-[#266DF0]"
                  : "text-[#555E67] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
              }
              `
            }
          >
            <Settings size={19} />

            {!collapsed && (
              <span>Settings</span>
            )}
          </NavLink>

          {/* Logout */}

          <button
            type="button"
            onClick={handleLogout}
            title={
              collapsed
                ? "Logout"
                : undefined
            }
            className={`
              mt-1 flex h-11 w-full items-center rounded-xl px-3
              font-inter text-sm font-medium text-[#555E67]
              transition-all hover:bg-red-50 hover:text-red-500
              ${
                collapsed
                  ? "justify-center"
                  : "gap-3"
              }
            `}
          >
            <LogOut size={19} />

            {!collapsed && (
              <span>Logout</span>
            )}
          </button>
        </div>

        {/* Collapse */}

        <button
          type="button"
          onClick={onToggle}
          className="absolute -right-3 top-[88px] hidden h-7 w-7 items-center justify-center rounded-full border border-[#EDEEF0] bg-white text-[#9CA1AA] shadow-sm transition-colors hover:text-[#266DF0] lg:flex"
        >
          {collapsed ? (
            <ChevronRight size={15} />
          ) : (
            <ChevronLeft size={15} />
          )}
        </button>
      </aside>
    </>
  );
}

export default Sidebar;