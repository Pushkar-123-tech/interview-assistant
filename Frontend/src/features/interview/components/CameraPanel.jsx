const CameraPanel = ({ videoRef, cameraReady }) => {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#f3f1ec]">

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`absolute inset-0 h-full w-full object-cover ${
          cameraReady ? "opacity-100" : "opacity-0"
        }`}
      />

      {!cameraReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">

            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 text-zinc-400"
              >
                <path
                  d="M15 10L19.5 7.5V16.5L15 14M4 7H15V17H4C2.9 17 2 16.1 2 15V9C2 7.9 2.9 7 4 7Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <p className="text-xs text-zinc-400">
              Camera preview unavailable
            </p>

          </div>
        </div>
      )}

      {/* Camera indicator */}
      {cameraReady && (
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/45 px-2.5 py-1.5 backdrop-blur-sm">

          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />

          <span className="text-[10px] font-medium text-white">
            Camera active
          </span>

        </div>
      )}

    </div>
  );
};

export default CameraPanel;