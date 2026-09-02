import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  LogOut,
} from "lucide-react";

import { logoutUser } from "../services/api";

function Topbar({ onMenuClick }) {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to load user:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const getInitials = (name = "") => {
    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  };

  const formatRole = (role = "") => {
    return role
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  };

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center border-b border-[#EDEEF0] bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">

      {/* Mobile menu */}
      <button
        type="button"
        onClick={onMenuClick}
        className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl text-[#555E67] hover:bg-[#F5F8FE] hover:text-[#266DF0] lg:hidden"
      >
        <Menu size={21} />
      </button>

      {/* Search */}
      <div className="relative hidden w-full max-w-[360px] sm:block">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA1AA]"
        />

        <input
          type="search"
          placeholder="Search anything..."
          className="h-10 w-full rounded-xl border border-[#EDEEF0] bg-[#F5F8FE] pl-11 pr-4 font-inter text-sm text-[#232529] outline-none transition-all placeholder:text-[#9CA1AA] focus:border-[#B3CCFA] focus:bg-white focus:ring-4 focus:ring-[#D9E5FC]"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">

        {/* Notifications */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#555E67] transition-colors hover:bg-[#F5F8FE] hover:text-[#266DF0]"
        >
          <Bell size={19} />

          <span className="absolute right-[9px] top-[8px] h-2 w-2 rounded-full border-2 border-white bg-[#266DF0]" />
        </button>

        <div className="h-7 w-px bg-[#EDEEF0]" />

        {/* User */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu((value) => !value)}
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-[#F5F8FE]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D9E5FC] font-gilroy text-sm font-bold text-[#266DF0]">
              {getInitials(user?.name)}
            </div>

            <div className="hidden text-left md:block">
              <p className="font-inter text-sm font-semibold text-[#232529]">
                {user?.name || "User"}
              </p>

              <p className="font-inter text-[11px] text-[#9CA1AA]">
                {formatRole(user?.role)}
              </p>
            </div>

            <ChevronDown
              size={16}
              className="hidden text-[#9CA1AA] md:block"
            />
          </button>

          {/* User dropdown */}
          {showMenu && (
            <div className="absolute right-0 top-14 w-64 rounded-xl border border-[#EDEEF0] bg-white p-2 shadow-[0_12px_35px_rgba(35,37,41,0.12)]">

              <div className="border-b border-[#EDEEF0] px-3 py-3">
                <p className="font-inter text-sm font-semibold text-[#232529]">
                  {user?.name || "User"}
                </p>

                <p className="mt-1 truncate font-inter text-xs text-[#9CA1AA]">
                  {user?.email || ""}
                </p>

                <p className="mt-1 font-inter text-xs font-medium text-[#266DF0]">
                  {formatRole(user?.role)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-inter text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                <LogOut size={17} />

                {loggingOut
                  ? "Signing out..."
                  : "Sign out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;