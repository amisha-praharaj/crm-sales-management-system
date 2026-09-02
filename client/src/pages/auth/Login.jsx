import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

import Input from "../../components/Input";
import Button from "../../components/Button";
import { loginUser } from "../../services/api";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser({
        email,
        password,
      });

      console.log("Login successful:", response);

      // JWT is stored in the HTTP-only cookie by the backend.
      // We only store basic user information.
      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FE] text-[#232529]">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left - Login */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-[440px]">

            {/* Brand */}
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#266DF0] shadow-[0_8px_24px_rgba(38,109,240,0.25)]">
                <TrendingUp
                  className="h-5 w-5 text-white"
                  strokeWidth={2.4}
                />
              </div>

              <div>
                <h1 className="font-gilroy text-xl font-bold tracking-tight text-[#1D1E20]">
                  CRM Sales
                </h1>

                <p className="font-inter text-[11px] font-medium uppercase tracking-[0.16em] text-[#9CA1AA]">
                  Management System
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h2 className="font-gilroy text-4xl font-bold tracking-[-0.03em] text-[#1D1E20] sm:text-[42px]">
                Welcome back
              </h2>

              <p className="mt-3 max-w-md font-inter text-[15px] leading-6 text-[#4B4F58]">
                Sign in to manage your leads, customers, deals and sales
                pipeline.
              </p>
            </div>

            {/* Login Card */}
            <div className="rounded-2xl border border-[#EDEEF0] bg-white p-6 shadow-[0_18px_50px_rgba(35,37,41,0.07)] sm:p-8">

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Email */}
                <Input
                  label="Email address"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  icon={Mail}
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="font-inter text-sm font-semibold text-[#31373D]"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      className="font-inter text-xs font-semibold text-[#266DF0] transition-colors hover:text-[#1D5BD1]"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    icon={LockKeyhole}
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    rightElement={
                      <button
                        type="button"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        onClick={() =>
                          setShowPassword(
                            (value) => !value
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA1AA] transition-colors hover:bg-[#F5F8FE] hover:text-[#266DF0]"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    }
                    required
                  />
                </div>

                {/* Remember */}
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(event.target.checked)
                    }
                    className="h-4 w-4 cursor-pointer rounded border-[#B2B6BD] accent-[#266DF0]"
                  />

                  <span className="font-inter text-sm text-[#555E67]">
                    Remember me for 30 days
                  </span>
                </label>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-inter text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}

                  {!loading && (
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  )}
                </Button>
              </form>

              {/* Security */}
              <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#EDEEF0] pt-5">
                <ShieldCheck
                  size={15}
                  className="text-[#266DF0]"
                />

                <span className="font-inter text-xs text-[#9CA1AA]">
                  Secure access to your CRM workspace
                </span>
              </div>
            </div>

            <p className="mt-7 text-center font-inter text-xs text-[#9CA1AA]">
              © 2026 CRM Sales Management System
            </p>
          </div>
        </section>

        {/* Right - Product Visual */}
        <section className="relative hidden overflow-hidden bg-[#1D1E20] lg:flex">

          <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#266DF0]/20 blur-3xl" />

          <div className="absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-[#538BF3]/10 blur-3xl" />

          <div className="relative flex w-full flex-col justify-between p-12 xl:p-16">

            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-[#79A5F6] shadow-[0_0_14px_rgba(121,165,246,0.8)]" />

              <span className="font-inter text-xs font-semibold uppercase tracking-[0.18em] text-[#B2B6BD]">
                Sales intelligence
              </span>
            </div>

            <div className="max-w-xl">
              <p className="mb-4 font-inter text-sm font-medium text-[#79A5F6]">
                Everything your sales team needs
              </p>

              <h2 className="font-gilroy text-5xl font-bold leading-[1.08] tracking-[-0.04em] text-white xl:text-6xl">
                Turn every lead
                <br />
                into an opportunity.
              </h2>

              <p className="mt-6 max-w-lg font-inter text-[15px] leading-7 text-[#9CA1AA]">
                Track your entire sales journey in one place — from the
                first conversation to the final deal closure.
              </p>

              <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                  <Users className="mb-5 h-5 w-5 text-[#79A5F6]" />

                  <p className="font-gilroy text-2xl font-bold text-white">
                    Leads
                  </p>

                  <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                    Manage & assign
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                  <TrendingUp className="mb-5 h-5 w-5 text-[#79A5F6]" />

                  <p className="font-gilroy text-2xl font-bold text-white">
                    Deals
                  </p>

                  <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                    Track pipeline
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                  <ShieldCheck className="mb-5 h-5 w-5 text-[#79A5F6]" />

                  <p className="font-gilroy text-2xl font-bold text-white">
                    Secure
                  </p>

                  <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                    Role-based access
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <span className="font-inter text-xs text-[#555E67]">
                CRM Sales Management System
              </span>

              <span className="font-inter text-xs font-medium text-[#9CA1AA]">
                Built for modern sales teams
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;