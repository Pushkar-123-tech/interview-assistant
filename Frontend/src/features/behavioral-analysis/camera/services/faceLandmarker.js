import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

let faceLandmarker = null;
let initializationPromise = null;

const MODEL_PATH = "/models/mediapipe/face_landmarker.task";

const WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm";

export const initializeFaceLandmarker = async () => {
  if (faceLandmarker) {
    return faceLandmarker;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_PATH);

      faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_PATH,
          delegate: "GPU",
        },

        runningMode: "VIDEO",

        numFaces: 1,

        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,

        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
      });

      return faceLandmarker;
    } catch (error) {
      console.error(
        "[FaceLandmarker] Initialization failed:",
        error
      );

      faceLandmarker = null;
      initializationPromise = null;

      throw error;
    }
  })();

  return initializationPromise;
};

export const detectFace = async (videoElement, timestamp) => {
  const landmarker = await initializeFaceLandmarker();

  if (!videoElement) {
    return null;
  }

  if (
    videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
    videoElement.videoWidth === 0 ||
    videoElement.videoHeight === 0
  ) {
    return null;
  }

  try {
    return landmarker.detectForVideo(videoElement, timestamp);
  } catch (error) {
    console.error(
      "[FaceLandmarker] Detection failed:",
      error
    );

    return null;
  }
};

export const closeFaceLandmarker = () => {
  if (faceLandmarker) {
    faceLandmarker.close();
    faceLandmarker = null;
  }

  initializationPromise = null;
};

export const getFaceLandmarker = () => {
  return faceLandmarker;
};