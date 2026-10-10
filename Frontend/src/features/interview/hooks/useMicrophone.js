import {
  useCallback,
  useRef,
  useState,
} from "react";

const useMicrophone = () => {
  const [microphoneReady, setMicrophoneReady] =
    useState(false);

  const [microphoneError, setMicrophoneError] =
    useState("");

  const [analyser, setAnalyser] =
    useState(null);

  const streamRef = useRef(null);
  const audioContextRef = useRef(null);

  const checkMicrophone = useCallback(async () => {
    try {
      setMicrophoneError("");

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });

      streamRef.current = stream;

      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      const audioContext =
        new AudioContext();

      const analyser =
        audioContext.createAnalyser();

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      const microphoneSource =
        audioContext.createMediaStreamSource(
          stream
        );

      microphoneSource.connect(analyser);

      audioContextRef.current =
        audioContext;

      setAnalyser(analyser);
      setMicrophoneReady(true);

      return stream;

    } catch (error) {

      console.error(
        "Microphone error:",
        error
      );

      setMicrophoneReady(false);
      setAnalyser(null);

      if (
        error.name ===
        "NotAllowedError"
      ) {
        setMicrophoneError(
          "Microphone permission was denied."
        );
      } else if (
        error.name ===
        "NotFoundError"
      ) {
        setMicrophoneError(
          "No microphone was found."
        );
      } else if (
        error.name ===
        "NotReadableError"
      ) {
        setMicrophoneError(
          "Microphone is being used by another application."
        );
      } else {
        setMicrophoneError(
          error.message ||
            "Unable to access microphone."
        );
      }

      return null;
    }
  }, []);

  const stopMicrophone =
    useCallback(() => {

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      setAnalyser(null);
      setMicrophoneReady(false);

    }, []);

  return {
    microphoneReady,
    microphoneError,
    checkMicrophone,
    stopMicrophone,
    analyser,
  };
};

export default useMicrophone;