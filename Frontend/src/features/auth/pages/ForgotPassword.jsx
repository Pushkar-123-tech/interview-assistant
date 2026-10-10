import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await forgotPassword(email);

      setSuccess("Check your email for the password reset link.");
    } catch (err) {
      setError(err.message || "Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080808] p-6 text-white">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="mb-12 inline-flex text-sm text-white/40 hover:text-white"
        >
          ← Back to sign in
        </Link>

        <p className="mb-3 text-xs font-semibold tracking-[0.3em] text-white/35">
          PASSWORD RESET
        </p>

        <h1 className="text-3xl font-semibold tracking-tight">
          Forgot your password?
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/40">
          Enter your email and we'll send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm text-white/60">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full rounded-xl border border-white/10
                         bg-white/[0.04] px-4 py-3 text-sm text-white
                         outline-none placeholder:text-white/25
                         focus:border-white/30"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {success && (
            <p className="text-sm text-green-400">{success}</p>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-white px-4 py-3
                       text-sm font-semibold text-black transition
                       hover:bg-white/90 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default ForgotPassword;  