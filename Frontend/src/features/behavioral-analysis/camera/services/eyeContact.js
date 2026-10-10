const clamp = (
  value,
  min = 0,
  max = 100
) => {
  return Math.min(
    Math.max(value, min),
    max
  );
};

export const calculateEyeContactScore = (
  landmarks
) => {
  const nose = landmarks?.[1];

  const leftEye = landmarks?.[33];

  const rightEye = landmarks?.[263];

  if (
    !nose ||
    !leftEye ||
    !rightEye
  ) {
    return 0;
  }

  const eyeCenterX =
    (leftEye.x + rightEye.x) / 2;

  const eyeCenterY =
    (leftEye.y + rightEye.y) / 2;

  const horizontalDeviation =
    Math.abs(
      nose.x - eyeCenterX
    );

  const verticalDeviation =
    Math.abs(
      nose.y - eyeCenterY
    );

  const horizontalScore =
    clamp(
      100 -
        horizontalDeviation * 1000
    );

  const verticalScore =
    clamp(
      100 -
        verticalDeviation * 1000
    );

  return Math.round(
    horizontalScore * 0.7 +
      verticalScore * 0.3
  );
};

export const isLookingAtCamera = (
  landmarks,
  threshold = 55
) => {
  return (
    calculateEyeContactScore(
      landmarks
    ) >= threshold
  );
};