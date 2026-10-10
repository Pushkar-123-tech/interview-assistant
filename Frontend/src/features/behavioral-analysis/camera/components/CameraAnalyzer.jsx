import useCameraAnalysis from "../hooks/useCameraAnalysis";
import CameraDebugPanel from "./CameraDebugPanel";

const CameraAnalyzer = ({
  videoRef,
  cameraReady,
}) => {
  const {
    metrics,
    isAnalyzing,
    error,
  } = useCameraAnalysis({
    videoRef,
    enabled: cameraReady,
  });

  return (
    <div className="w-full">
      {error && (
        <div className="mt-2 rounded-lg bg-red-50 p-3 text-xs text-red-600">
          {error}
        </div>
      )}

      <CameraDebugPanel metrics={metrics} />

      <div className="mt-2 text-[10px] text-black/40">
        {isAnalyzing
          ? "MediaPipe analysis running..."
          : "MediaPipe analysis stopped"}
      </div>
    </div>
  );
};

export default CameraAnalyzer;