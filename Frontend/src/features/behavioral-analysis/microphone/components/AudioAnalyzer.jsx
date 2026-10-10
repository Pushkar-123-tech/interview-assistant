import {
  Activity,
  Clock3,
  Mic,
  MicOff,
  Pause,
  Play,
  Volume2,
} from "lucide-react";

import useAudioAnalysis from "../hooks/useAudioAnalysis";

import AudioStatus from "./AudioStatus";

import {
  formatDuration,
  formatDecibels,
} from "../utils/audioMetrics";

const MetricCard = ({ icon: Icon, label, value, description }) => (
  <div className="rounded-xl border border-stone-200 bg-white p-4">
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-medium text-stone-500">
        {label}
      </span>

      <Icon className="h-4 w-4 text-orange-600" />
    </div>

    <p className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
      {value}
    </p>

    {description && (
      <p className="mt-1 text-xs text-stone-500">{description}</p>
    )}
  </div>
);

export default function AudioAnalyzer() {
  const {
    status,
    error,
    metrics,
    startAnalysis,
    stopAnalysis,
    getPitchSummary,
  } = useAudioAnalysis();

  const active = status === "active";
  const requesting = status === "requesting";

  const pitchSummary = getPitchSummary();

  return (
    <section className="space-y-5 rounded-2xl border border-stone-200 bg-[#fffefa] p-5 text-stone-900 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
              <Activity className="h-5 w-5" />
            </span>

            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-700">
              Behavioral Analysis
            </span>
          </div>

          <h2 className="text-xl font-semibold tracking-tight">
            Audio Analysis
          </h2>

          <p className="mt-1 max-w-xl text-sm leading-6 text-stone-500">
            Monitor speaking activity, pauses, audio intensity,
            and pitch variation throughout the interview.
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            active
              ? "bg-orange-100 text-orange-800"
              : status === "error"
                ? "bg-red-50 text-red-700"
                : "bg-stone-100 text-stone-600"
          }`}
        >
          {active
            ? "Live"
            : requesting
              ? "Connecting..."
              : status === "error"
                ? "Unavailable"
                : "Inactive"}
        </span>
      </div>

      {/* Microphone status */}
      <div className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <AudioStatus
          status={status}
          speaking={metrics.speaking}
          error={error}
        />

        <div className="flex shrink-0 gap-2">
          {!active ? (
            <button
              type="button"
              onClick={startAnalysis}
              disabled={requesting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              {requesting ? "Connecting..." : "Start analysis"}
            </button>
          ) : (
            <button
              type="button"
              onClick={stopAnalysis}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              <MicOff className="h-4 w-4" />
              Stop analysis
            </button>
          )}
        </div>
      </div>

      {/* Input meter */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-orange-600" />

            <span className="text-sm font-semibold">
              Microphone input
            </span>
          </div>

          <span className="text-xs tabular-nums text-stone-500">
            {metrics.level}%
          </span>
        </div>

        <div
          className="flex h-8 items-center gap-1"
          role="meter"
          aria-label="Relative microphone input level"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={metrics.level}
        >
          {Array.from({ length: 30 }, (_, index) => {
            const threshold = ((index + 1) / 30) * 100;
            const filled = metrics.level >= threshold;

            return (
              <span
                key={index}
                className={`flex-1 rounded-sm transition-colors duration-100 ${
                  filled ? "bg-orange-500" : "bg-stone-200"
                }`}
                style={{
                  height: `${35 + (index % 4) * 15}%`,
                }}
              />
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 text-xs text-stone-500">
          <span>
            {active
              ? metrics.speaking
                ? "Voice activity detected"
                : "Listening for speech"
              : "Start analysis to monitor input"}
          </span>

          <span>{formatDecibels(metrics.decibels)}</span>
        </div>
      </div>

      {/* Frequency visualization */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-600" />

            <span className="text-sm font-semibold">
              Live frequency profile
            </span>
          </div>

          <span className="text-xs text-stone-500">
            32 frequency bands
          </span>
        </div>

        <div
          className="flex h-16 items-center justify-center gap-1 overflow-hidden rounded-lg bg-stone-50 px-3"
          aria-label="Live audio frequency visualization"
        >
          {metrics.waveform.map((value, index) => (
            <span
              key={index}
              className="max-w-2 flex-1 rounded-full bg-orange-500 transition-[height] duration-100"
              style={{
                height: `${Math.max(4, (value / 255) * 100)}%`,
                opacity: 0.4 + (value / 255) * 0.6,
              }}
            />
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Live metrics</h3>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            icon={Clock3}
            label="Speaking time"
            value={formatDuration(metrics.speakingSeconds)}
            description="Detected voice activity"
          />

          <MetricCard
            icon={Pause}
            label="Current silence"
            value={`${metrics.silenceSeconds.toFixed(1)}s`}
            description="Continuous silence"
          />

          <MetricCard
            icon={Mic}
            label="Long pauses"
            value={metrics.longPauses}
            description="Silence lasting 2+ seconds"
          />

          <MetricCard
            icon={Activity}
            label="Current pitch"
            value={
              metrics.pitch
                ? `${metrics.pitch.frequency} Hz`
                : "—"
            }
            description={
              metrics.pitch
                ? `Est. confidence ${Math.round(
                    metrics.pitch.confidence * 100
                  )}%`
                : "Waiting for voiced speech"
            }
          />
        </div>
      </div>

      {/* Session pitch summary */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <h3 className="text-sm font-semibold">Pitch summary</h3>

        <p className="mt-1 text-xs leading-5 text-stone-500">
          Estimates the fundamental frequency of voiced audio.
          Pitch changes alone do not establish confidence or nervousness.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Average", pitchSummary.average],
            ["Minimum", pitchSummary.minimum],
            ["Maximum", pitchSummary.maximum],
            ["Variation", pitchSummary.variation],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-stone-50 p-3">
              <p className="text-xs text-stone-500">{label}</p>

              <p className="mt-1 text-lg font-semibold">
                {value == null ? "—" : `${value} Hz`}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Guidance */}
      <div className="rounded-xl border border-orange-100 bg-orange-50/70 p-4">
        <p className="text-sm font-semibold">
          {active
            ? metrics.speaking
              ? "Speech activity detected"
              : "Listening for speech"
            : "Ready to analyze"}
        </p>

        <p className="mt-1 text-xs leading-5 text-stone-600">
          {active
            ? "Speak naturally. These metrics describe the audio signal and do not diagnose emotional states."
            : "Allow microphone access to begin measuring your audio."}
        </p>
      </div>
    </section>
  );
}