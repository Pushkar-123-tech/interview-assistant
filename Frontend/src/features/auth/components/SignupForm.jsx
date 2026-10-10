import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { signUp } from "../services/authService";
import OAuthButtons from "./OAuthButtons";

const SignupForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // -------------------------------------------------------
  // INPUT CHANGE
  // -------------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // -------------------------------------------------------
  // SUBMIT
  // -------------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await signUp({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      navigate("/onboarding");
    } catch (err) {
      setError(
        err.message || "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative w-full max-w-[440px]
                 border border-[#747982]
                 bg-[#fffdf8]
                 px-8 py-6
                 sm:px-9 sm:py-7"
    >
      {/* ORANGE OFFSET BORDER */}
      <div
        className="pointer-events-none absolute
                   -bottom-[7px] -right-[7px]
                   h-[calc(100%-1px)]
                   w-[calc(100%-1px)]
                   border-b border-r
                   border-[#ff4b16]"
      />

      <div className="relative z-10">
        {/* HEADER */}
        <div className="mb-5">
          <div className="mb-2.5 flex items-center gap-2.5">
            <span className="h-[2px] w-5 bg-[#ff4b16]" />

            <span
              className="text-[10px] font-bold uppercase
                         tracking-[0.3em] text-[#e94716]"
            >
              Account
            </span>
          </div>

          <h2
            className="text-[30px] font-black leading-none
                       tracking-[-0.045em] text-[#02081f]"
          >
            Create account
          </h2>

          <p className="mt-2 text-[13px] text-slate-500">
            Enter your details to get started.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* FULL NAME */}
          <InputField
            label="Full Name"
            name="name"
            type="text"
            placeholder="Your full name"
            value={form.name}
            onChange={handleChange}
            icon={User}
            autoComplete="name"
          />

          {/* EMAIL */}
          <InputField
            label="Email"
            name="email"
            type="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={handleChange}
            icon={Mail}
            autoComplete="email"
          />

          {/* PASSWORD */}
          <PasswordField
            label="Password"
            name="password"
            placeholder="Minimum 6 characters"
            value={form.password}
            onChange={handleChange}
            visible={showPassword}
            toggle={() =>
              setShowPassword((previous) => !previous)
            }
            autoComplete="new-password"
          />

          {/* CONFIRM PASSWORD */}
          <PasswordField
            label="Confirm Password"
            name="confirmPassword"
            placeholder="Enter password again"
            value={form.confirmPassword}
            onChange={handleChange}
            visible={showConfirmPassword}
            toggle={() =>
              setShowConfirmPassword(
                (previous) => !previous
              )
            }
            autoComplete="new-password"
          />

          {/* ERROR */}
          {error && (
            <div
              role="alert"
              className="border border-red-200 bg-red-50
                         px-4 py-2.5 text-[13px]
                         text-red-600"
            >
              {error}
            </div>
          )}

          {/* CREATE ACCOUNT */}
          <button
            type="submit"
            disabled={loading}
            className="group flex h-[46px] w-full
                       cursor-pointer items-center
                       justify-between bg-[#02081f]
                       px-5 text-sm font-semibold
                       text-white transition-all
                       duration-200
                       hover:bg-[#ff4b16]
                       disabled:cursor-not-allowed
                       disabled:opacity-60"
          >
            <span>
              {loading
                ? "Creating account..."
                : "Create account"}
            </span>

            <ArrowRight
              size={18}
              className="transition-transform
                         duration-200
                         group-hover:translate-x-1"
            />
          </button>
        </form>

        {/* OR */}
        <div className="my-4 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />

          <span
            className="text-[10px] font-bold
                       uppercase tracking-[0.2em]
                       text-slate-400"
          >
            Or
          </span>

          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* GOOGLE */}
        <OAuthButtons />

        {/* LOGIN LINK */}
        <div className="mt-4 border-t border-slate-200 pt-4 text-center">
          <p className="text-[13px] text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="cursor-pointer border-b-2
                         border-[#ff4b16] pb-[1px]
                         font-bold text-[#02081f]
                         transition-colors duration-200
                         hover:text-[#ff4b16]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// NORMAL INPUT
// =========================================================

const InputField = ({
  label,
  icon: Icon,
  ...props
}) => {
  return (
    <div>
      <label
        htmlFor={props.name}
        className="mb-1.5 block text-[10px]
                   font-bold uppercase
                   tracking-[0.12em]
                   text-slate-700"
      >
        {label}
      </label>

      <div className="group relative">
        <Icon
          size={16}
          className="absolute left-4 top-1/2
                     -translate-y-1/2
                     text-slate-400
                     transition-colors duration-200
                     group-focus-within:text-[#ff4b16]"
        />

        <input
          id={props.name}
          {...props}
          required
          className="h-[44px] w-full
                     border border-slate-300
                     bg-white pl-11 pr-4
                     text-sm text-[#02081f]
                     outline-none
                     transition-all duration-200
                     placeholder:text-slate-400
                     hover:border-slate-400
                     focus:border-[#ff4b16]
                     focus:ring-2
                     focus:ring-[#ff4b16]/10"
        />
      </div>
    </div>
  );
};

// =========================================================
// PASSWORD INPUT
// =========================================================

const PasswordField = ({
  label,
  visible,
  toggle,
  ...props
}) => {
  return (
    <div>
      <label
        htmlFor={props.name}
        className="mb-1.5 block text-[10px]
                   font-bold uppercase
                   tracking-[0.12em]
                   text-slate-700"
      >
        {label}
      </label>

      <div className="group relative">
        <LockKeyhole
          size={16}
          className="absolute left-4 top-1/2
                     -translate-y-1/2
                     text-slate-400
                     transition-colors duration-200
                     group-focus-within:text-[#ff4b16]"
        />

        <input
          id={props.name}
          {...props}
          type={visible ? "text" : "password"}
          required
          className="h-[44px] w-full
                     border border-slate-300
                     bg-white pl-11 pr-12
                     text-sm text-[#02081f]
                     outline-none
                     transition-all duration-200
                     placeholder:text-slate-400
                     hover:border-slate-400
                     focus:border-[#ff4b16]
                     focus:ring-2
                     focus:ring-[#ff4b16]/10"
        />

        <button
          type="button"
          onClick={toggle}
          className="absolute right-2 top-1/2
                     flex h-8 w-8
                     -translate-y-1/2
                     cursor-pointer
                     items-center justify-center
                     text-slate-400
                     transition-all duration-200
                     hover:bg-[#ff4b16]/5
                     hover:text-[#ff4b16]"
          aria-label={
            visible
              ? "Hide password"
              : "Show password"
          }
        >
          {visible ? (
            <EyeOff size={16} />
          ) : (
            <Eye size={16} />
          )}
        </button>
      </div>
    </div>
  );
};

export default SignupForm;