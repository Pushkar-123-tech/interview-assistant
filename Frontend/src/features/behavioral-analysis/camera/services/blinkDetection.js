const distance = (a, b) => {
  if (!a || !b) return 0;

  return Math.sqrt(
    Math.pow(a.x - b.x, 2) +
      Math.pow(a.y - b.y, 2)
  );
};

const eyeAspectRatio = (
  landmarks,
  top,
  bottom,
  left,
  right
) => {
  const vertical = distance(
    landmarks[top],
    landmarks[bottom]
  );

  const horizontal = distance(
    landmarks[left],
    landmarks[right]
  );

  if (!horizontal) {
    return 0;
  }

  return vertical / horizontal;
};

export const calculateEyeAspectRatio = (
  landmarks
) => {
  const left = eyeAspectRatio(
    landmarks,
    159,
    145,
    33,
    133
  );

  const right = eyeAspectRatio(
    landmarks,
    386,
    374,
    362,
    263
  );

  return (left + right) / 2;
};

export const isBlinking = (
  landmarks,
  threshold = 0.18
) => {
  const ear =
    calculateEyeAspectRatio(
      landmarks
    );

  return ear > 0 && ear < threshold;
};

export const calculateBlinkRate = (
  blinkCount,
  elapsedMilliseconds
) => {
  if (
    !elapsedMilliseconds ||
    elapsedMilliseconds <= 0
  ) {
    return 0;
  }

  const minutes =
    elapsedMilliseconds / 60000;

  return blinkCount / minutes;
};