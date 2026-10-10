import { useState } from "react";
import { signInWithGoogle } from "../services/authService";

const OAuthButtons = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    try {
      setLoading(true);
      setError("");

      await signInWithGoogle();
    } catch (err) {
      setError(
        err.message || "Unable to continue with Google."
      );

      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="group flex h-[48px] w-full cursor-pointer
                   items-center justify-center gap-3
                   border border-slate-300 bg-white px-4
                   text-sm font-semibold text-[#02081f]
                   transition-all duration-200
                   hover:border-[#ff4b16]
                   hover:bg-[#fff8f4]
                   hover:text-[#ff4b16]
                   disabled:cursor-not-allowed
                   disabled:opacity-60"
      >
        <GoogleIcon />

        <span>
          {loading
            ? "Connecting..."
            : "Continue with Google"}
        </span>
      </button>

      {error && (
        <p className="mt-2 text-center text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

const GoogleIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.18c0-.74-.07-1.46-.19-2.18H12v4.13h5.24a4.49 4.49 0 0 1-1.94 2.94v2.68h3.14c1.84-1.7 2.91-4.2 2.91-7.57Z"
      />

      <path
        fill="#34A853"
        d="M12 21.5c2.62 0 4.82-.87 6.44-2.35l-3.14-2.68c-.87.58-1.98.93-3.3.93-2.53 0-4.68-1.71-5.45-4.01H3.31v2.76A9.73 9.73 0 0 0 12 21.5Z"
      />

      <path
        fill="#FBBC05"
        d="M6.55 13.39A5.84 5.84 0 0 1 6.25 12c0-.48.1-.95.3-1.39V7.85H3.31A9.5 9.5 0 0 0 2.5 12c0 1.49.36 2.9.81 4.15l3.24-2.76Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.6c1.43 0 2.71.49 3.72 1.45l2.79-2.79A9.36 9.36 0 0 0 12 2.5a9.73 9.73 0 0 0-8.69 5.35l3.24 2.76C7.32 8.31 9.47 6.6 12 6.6Z"
      />
    </svg>
  );
};

export default OAuthButtons;