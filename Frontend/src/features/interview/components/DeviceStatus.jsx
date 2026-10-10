import { Check, X } from "lucide-react";

const DeviceStatus = ({ label, ready, error }) => {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-4 last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>

        {error && (
          <p className="mt-1 text-xs text-red-500">
            {error}
          </p>
        )}
      </div>

      <div
        className={`flex items-center gap-2 text-sm ${
          ready ? "text-green-600" : "text-zinc-400"
        }`}
      >
        {ready ? <Check size={16} /> : <X size={16} />}

        {ready ? "Ready" : "Not ready"}
      </div>
    </div>
  );
};

export default DeviceStatus;