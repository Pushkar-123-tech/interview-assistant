export function formatDuration(totalSeconds = 0) {
  const seconds = Math.max(
    0,
    Math.floor(Number(totalSeconds) || 0)
  );

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainder
  ).padStart(2, "0")}`;
}

export function formatDecibels(decibels) {
  if (!Number.isFinite(decibels)) return "—";

  return `${decibels.toFixed(1)} dBFS`;
}

export function getInputLevelLabel(level = 0) {
  if (level < 3) return "Very low input";
  if (level < 12) return "Low input";
  if (level < 65) return "Moderate input";

  return "High input";
}

export function getAudioBars(frequencyData = [], count = 32) {
  if (!frequencyData.length) {
    return Array(count).fill(0);
  }

  return Array.from({ length: count }, (_, index) => {
    const start = Math.floor(
      (index / count) * frequencyData.length
    );

    const end = Math.max(
      start + 1,
      Math.floor(((index + 1) / count) * frequencyData.length)
    );

    const slice = frequencyData.slice(start, end);

    const average =
      slice.reduce((sum, value) => sum + value, 0) /
      slice.length;

    return Math.round(average);
  });
}

export function createEmptyAudioMetrics() {
  return {
    level: 0,
    rms: 0,
    peak: 0,
    decibels: null,
    speaking: false,
    speakingSeconds: 0,
    silenceSeconds: 0,
    longPauses: 0,
    pitch: null,
    waveform: Array(32).fill(0),
  };
}