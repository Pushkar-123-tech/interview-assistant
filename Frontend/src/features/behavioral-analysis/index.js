export {
  CameraAnalyzer,
  CameraStatus,
  FaceOverlay,
  useCameraAnalysis,
} from "./camera";

export {
  AudioAnalyzer,
  AudioStatus,
  useAudioAnalysis,
} from "./microphone";

export { default as BehavioralDashboard } from "./camera/components/BehavioralDashboard";
export { default as BehavioralReport } from "./components/BehavioralReport";

export {
  calculateBehavioralScore,
  getBehavioralScoreLabel,
} from "./scoring/behavioralScore";

export {
  aggregateBehavioralMetrics,
} from "./scoring/behavioralAggregator";