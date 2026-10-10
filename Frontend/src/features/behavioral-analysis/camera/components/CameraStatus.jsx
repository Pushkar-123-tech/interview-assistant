const CameraStatus = ({
  cameraReady = false,
  metrics,
}) => {
  if (!cameraReady) {
    return (
      <div className="rounded-xl border border-black/10 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />

          <div>
            <p className="text-sm font-semibold text-[#071936]">
              Camera inactive
            </p>

            <p className="text-xs text-gray-500">
              Start the camera to begin behavioral analysis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics?.faceDetected) {
    return (
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />

          <div>
            <p className="text-sm font-semibold text-[#071936]">
              Face not detected
            </p>

            <p className="text-xs text-gray-600">
              Please position your face clearly inside the camera frame.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-orange-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
        </div>

        <div>
          <p className="text-sm font-semibold text-[#071936]">
            Behavioral analysis active
          </p>

          <p className="text-xs text-gray-500">
            Camera signals are being analyzed locally.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CameraStatus;