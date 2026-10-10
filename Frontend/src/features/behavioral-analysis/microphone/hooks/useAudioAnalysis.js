import { useCallback, useEffect, useRef, useState } from "react";

import {
  createAudioAnalyzer,
  readAudioFrame,
  closeAudioAnalyzer,
} from "../services/audioAnalyzer";

import {
  createVoiceActivityState,
  updateVoiceActivity,
} from "../services/voiceActivity";

import {
  estimatePitch,
  summarizePitch,
} from "../services/pitchAnalysis";

import {
  createEmptyAudioMetrics,
  getAudioBars,
} from "../utils/audioMetrics";

const UPDATE_INTERVAL_MS = 100;

export default function useAudioAnalysis() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState(createEmptyAudioMetrics);

  const streamRef = useRef(null);
  const audioRef = useRef(null);
  const animationRef = useRef(null);
  const lastFrameRef = useRef(0);
  const lastUpdateRef = useRef(0);

  const activityRef = useRef(createVoiceActivityState());
  const pitchHistoryRef = useRef([]);

  const stopAnalysis = useCallback(async () => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    await closeAudioAnalyzer(audioRef.current);
    audioRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    lastFrameRef.current = 0;
    lastUpdateRef.current = 0;

    setMetrics(createEmptyAudioMetrics());
    setStatus("idle");
  }, []);

  const startAnalysis = useCallback(async () => {
    if (streamRef.current || status === "requesting") return;

    setError("");
    setStatus("requesting");

    let stream;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Microphone access requires HTTPS or localhost."
        );
      }

      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      streamRef.current = stream;

      const audio = createAudioAnalyzer(stream);
      audioRef.current = audio;

      await audio.context.resume();

      activityRef.current = createVoiceActivityState();
      pitchHistoryRef.current = [];
      lastFrameRef.current = 0;
      lastUpdateRef.current = 0;

      setMetrics(createEmptyAudioMetrics());
      setStatus("active");

      const analyze = (timestamp) => {
        if (!audioRef.current) return;

        const frame = readAudioFrame(audioRef.current);

        const deltaSeconds = lastFrameRef.current
          ? Math.min(
              (timestamp - lastFrameRef.current) / 1000,
              0.25
            )
          : 0;

        lastFrameRef.current = timestamp;

        activityRef.current = updateVoiceActivity(
          activityRef.current,
          frame.rms,
          deltaSeconds,
          timestamp
        );

        const activity = activityRef.current;

        // Pitch is estimated only during detected speech.
        let pitch = null;

        if (activity.speaking) {
          pitch = estimatePitch(
            frame.timeData,
            audioRef.current.context.sampleRate
          );

          if (pitch) {
            pitchHistoryRef.current.push(pitch);

            // Keep a bounded history for session-level summaries.
            if (pitchHistoryRef.current.length > 600) {
              pitchHistoryRef.current.shift();
            }
          }
        }

        if (timestamp - lastUpdateRef.current >= UPDATE_INTERVAL_MS) {
          lastUpdateRef.current = timestamp;

          setMetrics({
            level: frame.level,
            rms: frame.rms,
            peak: frame.peak,
            decibels: Number.isFinite(frame.decibels)
              ? frame.decibels
              : null,
            speaking: activity.speaking,
            speakingSeconds: activity.speakingSeconds,
            silenceSeconds: activity.silenceSeconds,
            longPauses: activity.longPauses,
            pitch,
            waveform: getAudioBars(frame.frequencyData, 32),
          });
        }

        animationRef.current = requestAnimationFrame(analyze);
      };

      animationRef.current = requestAnimationFrame(analyze);
    } catch (err) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      await closeAudioAnalyzer(audioRef.current);
      audioRef.current = null;

      stream?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      const message =
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
          ? "Microphone permission was denied. Allow access in browser settings."
          : err.name === "NotFoundError"
            ? "No microphone was found. Connect one and retry."
            : err.message || "Could not start audio analysis.";

      setError(message);
      setStatus("error");
    }
  }, [status]);

  const getPitchSummary = useCallback(() => {
    return summarizePitch(pitchHistoryRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());

      void closeAudioAnalyzer(audioRef.current);
    };
  }, []);

  return {
    status,
    error,
    metrics,
    startAnalysis,
    stopAnalysis,
    getPitchSummary,
  };
}