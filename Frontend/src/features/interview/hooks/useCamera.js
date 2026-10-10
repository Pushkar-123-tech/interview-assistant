import { useCallback, useEffect, useRef, useState } from "react";

const useCamera = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const startCamera = useCallback(async () => {
    try {
      setCameraError("");

      // Stop previous stream if one exists
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera access is not supported by this browser."
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: {
            ideal: 1280,
          },
          height: {
            ideal: 720,
          },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Important: wait until video metadata is available
        await new Promise((resolve) => {
          const video = videoRef.current;

          if (video.readyState >= 1) {
            resolve();
            return;
          }

          video.onloadedmetadata = () => {
            resolve();
          };
        });

        await videoRef.current.play();
      }

      setCameraReady(true);

      return stream;
    } catch (error) {
      console.error("Camera error:", error);

      setCameraReady(false);

      if (error.name === "NotAllowedError") {
        setCameraError(
          "Camera permission was denied."
        );
      } else if (error.name === "NotFoundError") {
        setCameraError(
          "No camera was found."
        );
      } else if (error.name === "NotReadableError") {
        setCameraError(
          "Camera is being used by another application."
        );
      } else {
        setCameraError(
          error.message || "Unable to access camera."
        );
      }

      return null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    setCameraReady(false);
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  return {
    videoRef,
    cameraReady,
    cameraError,
    startCamera,
    stopCamera,
  };
};

export default useCamera;