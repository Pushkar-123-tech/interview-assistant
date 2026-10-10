export function estimatePitch(
  samples,
  sampleRate,
  options = {}
) {
  const minFrequency = options.minFrequency ?? 70;
  const maxFrequency = options.maxFrequency ?? 400;

  if (!samples || samples.length < 2 || !sampleRate) {
    return null;
  }

  const minLag = Math.max(
    1,
    Math.floor(sampleRate / maxFrequency)
  );

  const maxLag = Math.min(
    samples.length - 2,
    Math.ceil(sampleRate / minFrequency)
  );

  let bestLag = -1;
  let bestCorrelation = 0;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let correlation = 0;
    let energyA = 0;
    let energyB = 0;

    for (let i = 0; i < samples.length - lag; i++) {
      const a = samples[i];
      const b = samples[i + lag];

      correlation += a * b;
      energyA += a * a;
      energyB += b * b;
    }

    const normalized =
      energyA > 0 && energyB > 0
        ? correlation / Math.sqrt(energyA * energyB)
        : 0;

    if (normalized > bestCorrelation) {
      bestCorrelation = normalized;
      bestLag = lag;
    }
  }

  if (bestLag < 0 || bestCorrelation < 0.65) {
    return null;
  }

  const frequency = sampleRate / bestLag;

  if (frequency < minFrequency || frequency > maxFrequency) {
    return null;
  }

  return {
    frequency: Math.round(frequency),
    confidence: Number(bestCorrelation.toFixed(3)),
  };
}

export function summarizePitch(pitchHistory = []) {
  const values = pitchHistory
    .map((item) =>
      typeof item === "number" ? item : item?.frequency
    )
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!values.length) {
    return {
      average: null,
      minimum: null,
      maximum: null,
      variation: null,
    };
  }

  const average =
    values.reduce((sum, value) => sum + value, 0) /
    values.length;

  const variance =
    values.reduce(
      (sum, value) => sum + (value - average) ** 2,
      0
    ) / values.length;

  return {
    average: Math.round(average),
    minimum: Math.round(Math.min(...values)),
    maximum: Math.round(Math.max(...values)),
    variation: Math.round(Math.sqrt(variance)),
  };
}