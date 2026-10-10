export const clamp = (
  value,
  min = 0,
  max = 100
) => {
  return Math.min(
    Math.max(value, min),
    max
  );
};

export const calculatePercentage = (
  value,
  total
) => {
  if (!total || total <= 0) {
    return 0;
  }

  return clamp(
    (value / total) * 100
  );
};

export const average = (values = []) => {
  if (!values.length) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length
  );
};

export const roundMetric = (
  value,
  decimals = 1
) => {
  const multiplier =
    10 ** decimals;

  return (
    Math.round(value * multiplier) /
    multiplier
  );
};

export const createEmptyCameraMetrics =
  () => ({
    faceDetected: false,
    faceVisibility: 0,
    eyeContact: false,
    eyeContactScore: 0,
    lookingAway: false,
    lookingAwayPercentage: 0,
    headMovement: 0,
    headStabilityScore: 100,
    blinkCount: 0,
    blinkRate: 0,
    facialExpressiveness: 0,
    behavioralStressIndicator: 0,
    timestamp: 0,
  });