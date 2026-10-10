import { useEffect, useRef, useState } from "react";
import { Activity, Clock3, Mic, Pause, Volume2 } from "lucide-react";

import {
  createVoiceActivityState,
  updateVoiceActivity,
} from "../services/voiceActivity";
import {
  formatDuration,
  formatDecibels,
  getAudioBars,
} from "../utils/audioMetrics";

const EMPTY_METRICS = {
  level: 0,
  decibels: null,
  speaking: false,
  speakingSeconds: 0,
  silenceSeconds: 0,
  longPauses: 0,
  waveform: Array(24).fill(0),
};

export default function LiveAudioBehavior({
  analyser,
  active,
  error,
  listening,
}) {
  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const activityRef = useRef(createVoiceActivityState());
  const liveMetrics = active && analyser ? metrics : EMPTY_METRICS;

  useEffect(() => {
    if (!active || !analyser) {
      return undefined;
    }

    activityRef.current = createVoiceActivityState();
    const timeData = new Float32Array(analyser.fftSize);
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    let animationFrame;
    let previousTimestamp = 0;
    let lastUpdate = 0;

    const update = (timestamp) => {
      analyser.getFloatTimeDomainData(timeData);
      analyser.getByteFrequencyData(frequencyData);

      let sumSquares = 0;
      for (const sample of timeData) {
        sumSquares += sample * sample;
      }

      const rms = Math.sqrt(sumSquares / timeData.length);
      const deltaSeconds = previousTimestamp
        ? Math.min((timestamp - previousTimestamp) / 1000, 0.25)
        : 0;
      previousTimestamp = timestamp;
      activityRef.current = updateVoiceActivity(
        activityRef.current,
        rms,
        deltaSeconds,
        timestamp
      );

      if (timestamp - lastUpdate >= 100) {
        lastUpdate = timestamp;
        setMetrics({
          level: Math.min(100, Math.round(rms * 300)),
          decibels: rms > 0 ? 20 * Math.log10(rms) : null,
          speaking: activityRef.current.speaking,
          speakingSeconds: activityRef.current.speakingSeconds,
          silenceSeconds: activityRef.current.silenceSeconds,
          longPauses: activityRef.current.longPauses,
          waveform: getAudioBars(frequencyData, 24),
        });
      }

      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [active, analyser]);

  const activityLabel = !active
    ? "Microphone unavailable"
    : liveMetrics.speaking
      ? "Speaking detected"
      : listening
        ? "Listening for speech"
        : "Microphone ready";

  return (
    <section aria-label="Live microphone behavior" className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">
            Microphone behavior
          </h3>
          <p className="mt-0.5 text-xs text-zinc-400">
            Live voice activity and audio levels
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-zinc-500" aria-live="polite">
          <span
            className={`h-2 w-2 rounded-full ${
              !active ? "bg-red-400" : metrics.speaking ? "animate-pulse bg-[#ff5a1f]" : "bg-emerald-500"
            }`}
          />
          {activityLabel}
        </div>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-600">
          {error}
        </p>
      ) : (
        <>
          <div className="rounded-xl bg-[#faf9f5] px-3 py-3">
            <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5 text-[#ff5a1f]" />
                Input level
              </span>
              <span className="tabular-nums">{liveMetrics.level}%</span>
            </div>
            <div
              className="flex h-3 items-center gap-1"
              role="meter"
              aria-label="Microphone input level"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={liveMetrics.level}
            >
              {Array.from({ length: 24 }, (_, index) => (
                <span
                  key={index}
                  className={`h-full flex-1 rounded-sm ${
                    liveMetrics.level >= ((index + 1) / 24) * 100
                      ? "bg-[#ff5a1f]"
                      : "bg-zinc-200"
                  }`}
                />
              ))}
            </div>
            <div className="mt-3 flex h-12 items-center gap-1" aria-label="Live audio frequency profile">
              {liveMetrics.waveform.map((value, index) => (
                <span
                  key={index}
                  className="min-w-0 flex-1 rounded-full bg-[#ff5a1f] transition-[height,opacity] duration-100"
                  style={{
                    height: `${Math.max(4, (value / 255) * 100)}%`,
                    opacity: 0.35 + (value / 255) * 0.65,
                  }}
                />
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-zinc-400">
              <span>{liveMetrics.speaking ? "Voice detected" : "No speech detected"}</span>
              <span>{formatDecibels(liveMetrics.decibels)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-zinc-100 text-center">
            <div className="px-1">
              <Mic className="mx-auto mb-1 h-4 w-4 text-[#ff5a1f]" />
              <p className="text-sm font-semibold tabular-nums text-zinc-800">
                {formatDuration(liveMetrics.speakingSeconds)}
              </p>
              <p className="text-[10px] text-zinc-400">Speaking</p>
            </div>
            <div className="px-1">
              <Pause className="mx-auto mb-1 h-4 w-4 text-zinc-400" />
              <p className="text-sm font-semibold tabular-nums text-zinc-800">
                {liveMetrics.speaking ? "0.0s" : `${liveMetrics.silenceSeconds.toFixed(1)}s`}
              </p>
              <p className="text-[10px] text-zinc-400">Current pause</p>
            </div>
            <div className="px-1">
              <Clock3 className="mx-auto mb-1 h-4 w-4 text-zinc-400" />
              <p className="text-sm font-semibold tabular-nums text-zinc-800">
                {liveMetrics.longPauses}
              </p>
              <p className="text-[10px] text-zinc-400">Long pauses</p>
            </div>
          </div>

          <p className="flex items-center gap-1.5 text-[10px] text-zinc-400">
            <Activity className="h-3 w-3" />
            Audio is analyzed locally in your browser.
          </p>
        </>
      )}
    </section>
  );
}