export function createAudioAnalyzer(stream) {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error("Web Audio API is not supported by this browser.");
  }

  const context = new AudioContextClass();
  const source = context.createMediaStreamSource(stream);
  const analyser = context.createAnalyser();

  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.7;

  source.connect(analyser);

  return {
    context,
    source,
    analyser,
    timeData: new Float32Array(analyser.fftSize),
    frequencyData: new Uint8Array(analyser.frequencyBinCount),
  };
}

export function readAudioFrame(audio) {
  const { analyser, timeData, frequencyData } = audio;

  analyser.getFloatTimeDomainData(timeData);
  analyser.getByteFrequencyData(frequencyData);

  let sumSquares = 0;

  for (const sample of timeData) {
    sumSquares += sample * sample;
  }

  const rms = Math.sqrt(sumSquares / timeData.length);

  const peak = timeData.reduce(
    (maximum, sample) => Math.max(maximum, Math.abs(sample)),
    0
  );

  const decibels = rms > 0
    ? 20 * Math.log10(rms)
    : -Infinity;

  const level = Math.min(100, Math.round(rms * 300));

  return {
    rms,
    peak,
    decibels,
    level,
    frequencyData: Array.from(frequencyData),
    timeData: Array.from(timeData),
  };
}

export async function closeAudioAnalyzer(audio) {
  if (!audio) return;

  audio.source?.disconnect();

  if (audio.context && audio.context.state !== "closed") {
    await audio.context.close().catch(() => {});
  }
}