import { useEffect, useState } from "react";

const AudioStatus = ({ status, speaking, error }) => {
  const [permission, setPermission] = useState("unknown");

  useEffect(() => {
    let mounted = true;
    let permissionStatus;

    async function checkPermission() {
      try {
        if (!navigator.permissions?.query) return;

        permissionStatus = await navigator.permissions.query({
          name: "microphone",
        });

        if (mounted) {
          setPermission(permissionStatus.state);
        }

        permissionStatus.onchange = () => {
          if (mounted) {
            setPermission(permissionStatus.state);
          }
        };
      } catch {
        // Permission querying is not supported consistently.
      }
    }

    checkPermission();

    return () => {
      mounted = false;

      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, []);

  const active = status === "active";

  const label = {
    idle: "Microphone not started",
    requesting: "Requesting microphone access",
    active: speaking ? "Voice detected" : "Listening for speech",
    error: "Microphone unavailable",
  }[status] || "Unknown status";

  return (
    <div
      className="flex items-start gap-3"
      aria-live="polite"
    >
      <span
        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
          active
            ? "bg-orange-500"
            : status === "error"
              ? "bg-red-500"
              : "bg-stone-300"
        }`}
      />

      <div className="min-w-0">
        <p className="text-sm font-semibold text-stone-900">
          {label}
        </p>

        <p className="mt-1 text-xs text-stone-500">
          {active
            ? "Audio is being processed locally in your browser."
            : permission === "denied"
              ? "Microphone permission is blocked."
              : permission === "granted"
                ? "Browser permission granted."
                : "Microphone permission has not been confirmed."}
        </p>

        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};

export default AudioStatus;