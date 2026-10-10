const DEFAULT_THRESHOLD = 0.025;
const DEFAULT_PAUSE_MS = 2000;

export function detectVoiceActivity(
  rms,
  threshold = DEFAULT_THRESHOLD
) {
  return rms >= threshold;
}

export function updateVoiceActivity(
  state,
  rms,
  deltaSeconds,
  timestamp,
  options = {}
) {
  const threshold = options.threshold ?? DEFAULT_THRESHOLD;
  const pauseMs = options.pauseMs ?? DEFAULT_PAUSE_MS;

  const speaking = detectVoiceActivity(rms, threshold);
  const delta = Math.max(0, Math.min(deltaSeconds, 0.25));

  let speakingSeconds = state.speakingSeconds;
  let silenceSeconds = state.silenceSeconds;
  let longPauses = state.longPauses;
  let pauseRecorded = state.pauseRecorded;

  if (speaking) {
    speakingSeconds += delta;
    silenceSeconds = 0;
    pauseRecorded = false;
  } else {
    silenceSeconds += delta;

    if (
      state.hasSpoken &&
      silenceSeconds * 1000 >= pauseMs &&
      !pauseRecorded
    ) {
      longPauses += 1;
      pauseRecorded = true;
    }
  }

  return {
    speaking,
    speakingSeconds,
    silenceSeconds,
    longPauses,
    pauseRecorded,
    hasSpoken: state.hasSpoken || speaking,
    lastUpdatedAt: timestamp,
  };
}

export function createVoiceActivityState() {
  return {
    speaking: false,
    speakingSeconds: 0,
    silenceSeconds: 0,
    longPauses: 0,
    pauseRecorded: false,
    hasSpoken: false,
    lastUpdatedAt: 0,
  };
}