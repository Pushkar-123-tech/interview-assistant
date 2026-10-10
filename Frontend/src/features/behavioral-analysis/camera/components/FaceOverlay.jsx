const FaceOverlay = ({
  metrics,
}) => {
  if (!metrics?.faceDetected) {
    return null;
  }

  const eyeContact =
    metrics.eyeContactScore >= 55;

  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className={`absolute left-4 top-4 rounded-lg border px-3 py-2 backdrop-blur-md ${
          eyeContact
            ? "border-orange-300 bg-white/90"
            : "border-gray-300 bg-white/90"
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              eyeContact
                ? "bg-orange-500"
                : "bg-gray-400"
            }`}
          />

          <span className="text-xs font-semibold text-[#071936]">
            {eyeContact
              ? "Camera-facing"
              : "Looking away"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FaceOverlay;