const Metric = ({ label, value, status }) => {
  return (
    <div className="flex items-center justify-between border-b border-black/5 py-2 last:border-b-0">
      <span className="text-xs text-black/55">
        {label}
      </span>

      <span
        className={`text-xs font-semibold ${
          status === "good"
            ? "text-orange-600"
            : status === "bad"
              ? "text-red-500"
              : "text-black"
        }`}
      >
        {value}
      </span>
    </div>
  );
};

const CameraDebugPanel = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="mt-3 rounded-xl border border-black/10 bg-white p-4">
        <div className="text-sm font-semibold text-black">
          Camera Debug
        </div>

        <div className="mt-2 text-xs text-black/50">
          Waiting for camera analysis...
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-black">
            Camera Behavior Debug
          </h3>

          <p className="text-[11px] text-black/45">
            Development metrics
          </p>
        </div>

        <div className="rounded-full bg-orange-50 px-2 py-1 text-[10px] font-semibold text-orange-600">
          DEV
        </div>
      </div>

      <Metric
        label="Face detected"
        value={metrics.faceDetected ? "YES" : "NO"}
        status={metrics.faceDetected ? "good" : "bad"}
      />

      <Metric
        label="Face visibility"
        value={`${Math.round(metrics.faceVisibility ?? 0)}%`}
      />

      <Metric
        label="Camera-facing"
        value={metrics.eyeContact ? "YES" : "NO"}
        status={metrics.eyeContact ? "good" : "bad"}
      />

      <Metric
        label="Eye contact score"
        value={`${Math.round(metrics.eyeContactScore ?? 0)}%`}
      />

      <Metric
        label="Looking away"
        value={metrics.lookingAway ? "YES" : "NO"}
        status={metrics.lookingAway ? "bad" : "good"}
      />

      <Metric
        label="Head movement"
        value={(metrics.headMovement ?? 0).toFixed(2)}
      />

      <Metric
        label="Head stability"
        value={`${Math.round(
          metrics.headStabilityScore ?? 0
        )}%`}
      />

      <Metric
        label="Blink count"
        value={metrics.blinkCount ?? 0}
      />

      <Metric
        label="Blink rate"
        value={`${(metrics.blinkRate ?? 0).toFixed(1)}/min`}
      />

      <Metric
        label="Facial expressiveness"
        value={`${Math.round(
          metrics.facialExpressiveness ?? 0
        )}%`}
      />

      <Metric
        label="Behavioral indicator"
        value={`${Math.round(
          metrics.behavioralStressIndicator ?? 0
        )}%`}
      />
    </div>
  );
};

export default CameraDebugPanel;