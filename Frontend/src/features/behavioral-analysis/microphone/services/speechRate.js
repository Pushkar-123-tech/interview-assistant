export function countWords(transcript = "") {
  const normalized = transcript.trim();

  if (!normalized) return 0;

  return normalized.split(/\s+/u).length;
}

export function calculateSpeechRate(
  transcript,
  durationSeconds
) {
  const words = countWords(transcript);

  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return {
      wordCount: words,
      wordsPerMinute: null,
      label: "Duration unavailable",
    };
  }

  const wordsPerMinute = Math.round(
    (words / durationSeconds) * 60
  );

  let label = "Measured pace";

  if (wordsPerMinute < 100) {
    label = "Slower pace";
  } else if (wordsPerMinute <= 160) {
    label = "Moderate pace";
  } else {
    label = "Faster pace";
  }

  return {
    wordCount: words,
    wordsPerMinute,
    label,
  };
}