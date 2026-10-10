import { useCallback, useEffect, useRef, useState } from "react";
import {
  detectFace,
  initializeFaceLandmarker,
  closeFaceLandmarker,
} from "../services/faceLandmarker";

const CAMERA_ANALYSIS_CONFIG = {
  blinkEarThreshold: 0.22,
  eyeContactThreshold: 58,
  eyeContactHorizontalScale: 1200,
  eyeContactVerticalScale: 900,
  headMovementScale: 700,
  fastBlinkRate: 28,
  mediumBlinkRate: 18,
  minimumExpressiveness: 8,
  gazeStressWeight: 0.28,
  movementStressWeight: 0.22,
  lookingAwayStressWeight: 0.18,
  blinkStressWeight: 0.2,
  expressionStressWeight: 0.12,
};

const INITIAL_METRICS = {
  faceDetected: false,
  faceVisibility: 0,

  eyeContact: false,
  eyeContactScore: 0,
  lookingAway: false,
  lookingAwayPercentage: 0,

  headMovement: 0,
  headStabilityScore: 100,

  blinkCount: 0,
  blinkRate: 0,

  facialExpressiveness: 0,

  behavioralStressIndicator: 0,

  timestamp: 0,
};

const clamp = (value, min = 0, max = 100) =>
  Math.min(Math.max(value, min), max);

const distance = (a, b) => {
  if (!a || !b) return 0;

  return Math.sqrt(
    Math.pow(a.x - b.x, 2) +
      Math.pow(a.y - b.y, 2)
  );
};

const getPoint = (landmarks, index) => {
  return landmarks?.[index] || null;
};

/*
 * MediaPipe Face Mesh landmark references
 *
 * Left eye:
 *   33, 133, 159, 145
 *
 * Right eye:
 *   362, 263, 386, 374
 *
 * Nose:
 *   1
 *
 * Mouth:
 *   61, 291, 13, 14
 *
 * These values are used only for behavioral estimation.
 */

const calculateEyeAspectRatio = (
  landmarks,
  topIndex,
  bottomIndex,
  leftIndex,
  rightIndex
) => {
  const top = getPoint(landmarks, topIndex);
  const bottom = getPoint(landmarks, bottomIndex);
  const left = getPoint(landmarks, leftIndex);
  const right = getPoint(landmarks, rightIndex);

  if (!top || !bottom || !left || !right) {
    return 0;
  }

  const vertical = distance(top, bottom);
  const horizontal = distance(left, right);

  if (horizontal === 0) return 0;

  return vertical / horizontal;
};

const calculateBlink = (landmarks) => {
  const leftEAR = calculateEyeAspectRatio(
    landmarks,
    159,
    145,
    33,
    133
  );

  const rightEAR = calculateEyeAspectRatio(
    landmarks,
    386,
    374,
    362,
    263
  );

  const averageEAR = (leftEAR + rightEAR) / 2;

  return {
    ear: averageEAR,
    blinking:
      averageEAR <
      CAMERA_ANALYSIS_CONFIG.blinkEarThreshold,
  };
};

const calculateEyeContact = (landmarks) => {
  const nose = getPoint(landmarks, 1);

  const leftEye = getPoint(landmarks, 33);
  const rightEye = getPoint(landmarks, 263);

  if (!nose || !leftEye || !rightEye) {
    return {
      score: 0,
      lookingAtCamera: false,
    };
  }

  const eyeCenter = {
    x: (leftEye.x + rightEye.x) / 2,
    y: (leftEye.y + rightEye.y) / 2,
  };

  const horizontalDeviation = Math.abs(
    nose.x - eyeCenter.x
  );

  const verticalDeviation = Math.abs(
    nose.y - eyeCenter.y
  );

  /*
   * This is a camera-facing estimate,
   * not true gaze/iris tracking.
   */

  const horizontalScore = clamp(
    100 -
      horizontalDeviation *
        CAMERA_ANALYSIS_CONFIG.eyeContactHorizontalScale
  );

  const verticalScore = clamp(
    100 -
      verticalDeviation *
        CAMERA_ANALYSIS_CONFIG.eyeContactVerticalScale
  );

  const score = clamp(
    horizontalScore * 0.65 +
      verticalScore * 0.35
  );

  return {
    score,
    lookingAtCamera:
      score >=
      CAMERA_ANALYSIS_CONFIG.eyeContactThreshold,
  };
};

const calculateHeadMovement = (
  currentLandmarks,
  previousLandmarks
) => {
  if (!currentLandmarks || !previousLandmarks) {
    return 0;
  }

  const currentNose = getPoint(currentLandmarks, 1);
  const previousNose = getPoint(previousLandmarks, 1);

  if (!currentNose || !previousNose) {
    return 0;
  }

  const movement = distance(
    currentNose,
    previousNose
  );

  return clamp(
    movement *
      CAMERA_ANALYSIS_CONFIG.headMovementScale
  );
};

const calculateFacialExpressiveness = (landmarks) => {
  const leftMouth = getPoint(landmarks, 61);
  const rightMouth = getPoint(landmarks, 291);

  const upperLip = getPoint(landmarks, 13);
  const lowerLip = getPoint(landmarks, 14);

  if (
    !leftMouth ||
    !rightMouth ||
    !upperLip ||
    !lowerLip
  ) {
    return 0;
  }

  const mouthWidth = distance(
    leftMouth,
    rightMouth
  );

  const mouthHeight = distance(
    upperLip,
    lowerLip
  );

  const expressionRatio =
    mouthHeight / Math.max(mouthWidth, 0.001);

  return clamp(expressionRatio * 1000);
};

export const useCameraAnalysis = ({
  videoRef,
  enabled = false,
}) => {
  const [metrics, setMetrics] = useState(
    INITIAL_METRICS
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const animationFrameRef = useRef(null);

  const previousLandmarksRef = useRef(null);

  const blinkCountRef = useRef(0);

  const blinkStateRef = useRef(false);

  const startTimeRef = useRef(null);

  const lookingAwayFramesRef = useRef(0);

  const totalFramesRef = useRef(0);

  const lastProcessTimeRef = useRef(0);

  const processingRef = useRef(false);

  const resetAnalysis = useCallback(() => {
    setMetrics(INITIAL_METRICS);
    setError("");
    setIsAnalyzing(false);

    previousLandmarksRef.current = null;

    blinkCountRef.current = 0;

    blinkStateRef.current = false;

    startTimeRef.current = null;

    lookingAwayFramesRef.current = 0;

    totalFramesRef.current = 0;
  }, []);

  const processFrame = useCallback(
    async (timestamp) => {
      if (!enabled) return;

      if (processingRef.current) {
        return;
      }

      const video = videoRef?.current;

      if (!video) return;

      if (
        video.readyState < 2 ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        return;
      }

      /*
       * Process approximately 10-15 FPS instead
       * of processing every browser frame.
       */

      if (
        timestamp - lastProcessTimeRef.current <
        70
      ) {
        return;
      }

      lastProcessTimeRef.current = timestamp;

      processingRef.current = true;

      try {
        if (!startTimeRef.current) {
          startTimeRef.current = performance.now();
        }

        const result = await detectFace(
          video,
          timestamp
        );

        totalFramesRef.current += 1;

        const face =
          result?.faceLandmarks?.[0];

        if (!face) {
          setMetrics((previous) => ({
            ...previous,

            faceDetected: false,
            faceVisibility: 0,
            eyeContact: false,
            eyeContactScore: 0,
            lookingAway: true,
            timestamp,
          }));

          return;
        }

        /*
         * FACE VISIBILITY
         */

        const faceVisibility = clamp(
          face.length / 468 * 100
        );

        /*
         * EYE CONTACT
         */

        const eyeContactData =
          calculateEyeContact(face);

        /*
         * BLINK
         */

        const blinkData =
          calculateBlink(face);

        if (
          blinkData.blinking &&
          !blinkStateRef.current
        ) {
          blinkCountRef.current += 1;
        }

        blinkStateRef.current =
          blinkData.blinking;

        /*
         * HEAD MOVEMENT
         */

        const headMovement =
          calculateHeadMovement(
            face,
            previousLandmarksRef.current
          );

        previousLandmarksRef.current = face;

        /*
         * FACIAL EXPRESSIVENESS
         */

        const facialExpressiveness =
          calculateFacialExpressiveness(face);

        /*
         * LOOKING AWAY
         */

        const lookingAway =
          !eyeContactData.lookingAtCamera;

        if (lookingAway) {
          lookingAwayFramesRef.current += 1;
        }

        const lookingAwayPercentage =
          totalFramesRef.current > 0
            ? (lookingAwayFramesRef.current /
                totalFramesRef.current) *
              100
            : 0;

        /*
         * HEAD STABILITY
         */

              const headStabilityScore = clamp(
          100 - headMovement * 0.8
        );

        /*
         * BLINK RATE
         *
         * Approximate blinks/minute.
         */

        const elapsedMinutes =
          (performance.now() -
            startTimeRef.current) /
          60000;

        const blinkRate =
          elapsedMinutes > 0
            ? blinkCountRef.current /
              elapsedMinutes
            : 0;

        /*
         * BEHAVIORAL STRESS INDICATOR
         *
         * This is NOT a medical diagnosis.
         * It only combines observable behavior.
         */

        const gazeFactor =
          (100 - eyeContactData.score) *
          CAMERA_ANALYSIS_CONFIG.gazeStressWeight;

        const movementFactor =
          headMovement *
          CAMERA_ANALYSIS_CONFIG.movementStressWeight;

        const lookingAwayFactor =
          lookingAwayPercentage *
          CAMERA_ANALYSIS_CONFIG.lookingAwayStressWeight;

        const blinkFactor =
          blinkRate >
          CAMERA_ANALYSIS_CONFIG.fastBlinkRate
            ? 18
            : blinkRate >
                CAMERA_ANALYSIS_CONFIG.mediumBlinkRate
              ? 10
              : 0;

        const expressionFactor =
          facialExpressiveness <
          CAMERA_ANALYSIS_CONFIG.minimumExpressiveness
            ? 10
            : 0;

        const behavioralStressIndicator = clamp(
          gazeFactor +
            movementFactor +
            lookingAwayFactor +
            blinkFactor +
            expressionFactor
        );

        setMetrics({
          faceDetected: true,

          faceVisibility,

          eyeContact:
            eyeContactData.lookingAtCamera,

          eyeContactScore:
            Math.round(
              eyeContactData.score
            ),

          lookingAway,

          lookingAwayPercentage:
            Math.round(
              lookingAwayPercentage
            ),

          headMovement:
            Math.round(headMovement * 10) / 10,

          headStabilityScore:
            Math.round(
              headStabilityScore
            ),

          blinkCount:
            blinkCountRef.current,

          blinkRate:
            Math.round(
              blinkRate * 10
            ) / 10,

          facialExpressiveness:
            Math.round(
              facialExpressiveness
            ),

          behavioralStressIndicator:
            Math.round(
              behavioralStressIndicator
            ),

          timestamp,
        });
      } catch (error) {
        console.error(
          "[CameraAnalysis] Frame processing error:",
          error
        );
        setError(
          error instanceof Error
            ? error.message
            : "Camera analysis failed."
        );
      } finally {
        processingRef.current = false;
      }
    },
    [enabled, videoRef]
  );

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!enabled) {
      setIsAnalyzing(false);
      setError("");
      resetAnalysis();
      return undefined;
    }

    let cancelled = false;

    const initialize = async () => {
      try {
        setIsAnalyzing(true);
        setError("");

        await initializeFaceLandmarker();

        if (cancelled) return;

        const loop = async (timestamp) => {
          if (cancelled) return;

          await processFrame(timestamp);

          animationFrameRef.current =
            requestAnimationFrame(loop);
        };

        animationFrameRef.current =
          requestAnimationFrame(loop);
      } catch (error) {
        console.error(
          "[CameraAnalysis] Initialization failed:",
          error
        );
        setError(
          error instanceof Error
            ? error.message
            : "Failed to initialize camera analysis."
        );
        setIsAnalyzing(false);
      }
    };

    initialize();

    return () => {
      cancelled = true;
      setIsAnalyzing(false);

      if (animationFrameRef.current) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }

      animationFrameRef.current = null;
    };
  }, [
    enabled,
    processFrame,
    resetAnalysis,
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    return () => {
      closeFaceLandmarker();
    };
  }, []);

  return {
    metrics,
    resetAnalysis,
    isAnalyzing,
    error,
  };
};

export default useCameraAnalysis;