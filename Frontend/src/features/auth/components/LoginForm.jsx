import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import {
  signIn,
  getCurrentSession,
} from "../services/authService";
import OAuthButtons from "./OAuthButtons";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LoginForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Remove previous login error when user starts editing.
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      await signIn(form);

      const session = await getCurrentSession();
      const user = session?.user;

      if (!user?.id) {
        throw new Error(
          "Unable to read your session. Please refresh."
        );
      }

      localStorage.setItem("edi-user", JSON.stringify(user));

      const profileResponse = await fetch(
        `${API_URL}/api/profile/${user.id}`
      );

      if (!profileResponse.ok) {
        navigate("/onboarding");
        return;
      }

      const profileData = await profileResponse.json();

      if (
        profileData.success &&
        profileData.user?.profile_completed
      ) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative w-full max-w-[440px] border border-[#747982]
                 bg-[#fffdf8] px-8 py-7
                 sm:px-9 sm:py-8"
    >
      {/* ORANGE OFFSET BORDER */}
      <div
        className="pointer-events-none absolute -bottom-[7px] -right-[7px]
                   h-[calc(100%-1px)] w-[calc(100%-1px)]
                   border-b border-r border-[#ff4b16]"
      />

      <div className="relative z-10">
        {/* HEADER */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="h-[2px] w-5 bg-[#ff4b16]" />

            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#e94716]">
              Account
            </span>
          </div>

          <h2 className="text-[32px] font-black leading-none tracking-[-0.045em] text-[#02081f]">
            Sign in
          </h2>

          <p className="mt-2 text-[14px] text-slate-500">
            Enter your details to continue.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          {/* EMAIL */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-[11px] font-bold uppercase
                         tracking-[0.12em] text-slate-700"
            >
              Email
            </label>

            <div className="group relative">
              <Mail
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2
                           text-slate-400 transition-colors duration-200
                           group-focus-within:text-[#ff4b16]"
              />

              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                autoComplete="email"
                required
                className="h-[48px] w-full border border-slate-300 bg-white
                           pl-12 pr-4 text-sm text-[#02081f] outline-none
                           transition-all duration-200
                           placeholder:text-slate-400
                           hover:border-slate-400
                           focus:border-[#ff4b16]
                           focus:ring-2 focus:ring-[#ff4b16]/10"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="mt-4">
            <label
              htmlFor="password"
              className="mb-2 block text-[11px] font-bold uppercase
                         tracking-[0.12em] text-slate-700"
            >
              Password
            </label>

            <div className="group relative">
              <LockKeyhole
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2
                           text-slate-400 transition-colors duration-200
                           group-focus-within:text-[#ff4b16]"
              />

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
                autoComplete="current-password"
                required
                className="h-[48px] w-full border border-slate-300 bg-white
                           pl-12 pr-12 text-sm text-[#02081f] outline-none
                           transition-all duration-200
                           placeholder:text-slate-400
                           hover:border-slate-400
                           focus:border-[#ff4b16]
                           focus:ring-2 focus:ring-[#ff4b16]/10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                className="absolute right-2 top-1/2 flex h-9 w-9
                           -translate-y-1/2 cursor-pointer items-center
                           justify-center text-slate-400
                           transition-all duration-200
                           hover:bg-[#ff4b16]/5 hover:text-[#ff4b16]"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>

            {/* FORGOT PASSWORD */}
            <div className="mt-3 flex justify-end">
              <Link
                to="/forgot-password"
                className="cursor-pointer text-[13px] font-medium
                           text-indigo-600 transition-colors duration-200
                           hover:text-[#ff4b16]"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div
              className="mt-4 border border-red-200 bg-red-50
                         px-4 py-3 text-[13px] text-red-600"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* SIGN IN */}
          <button
            type="submit"
            disabled={loading}
            className="group mt-5 flex h-[48px] w-full cursor-pointer
                       items-center justify-between bg-[#02081f]
                       px-5 text-sm font-semibold text-white
                       transition-all duration-200
                       hover:bg-[#ff4b16]
                       disabled:cursor-not-allowed
                       disabled:opacity-60"
          >
            <span>
              {loading ? "Signing in..." : "Sign in"}
            </span>

            <ArrowRight
              size={18}
              className="transition-transform duration-200
                         group-hover:translate-x-1"
            />
          </button>
        </form>

        {/* DIVIDER */}
        <div className="my-5 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />

          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Or
          </span>

          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* GOOGLE */}
        <OAuthButtons />

        {/* CREATE ACCOUNT */}
        <div className="mt-5 border-t border-slate-200 pt-5 text-center">
          <p className="text-[13px] text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="cursor-pointer border-b-2 border-[#ff4b16]
                         pb-[1px] font-bold text-[#02081f]
                         transition-colors duration-200
                         hover:text-[#ff4b16]"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;