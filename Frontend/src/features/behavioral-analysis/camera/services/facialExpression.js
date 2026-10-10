const distance = (a, b) => {
  if (!a || !b) return 0;

  return Math.sqrt(
    Math.pow(a.x - b.x, 2) +
      Math.pow(a.y - b.y, 2)
  );
};

export const calculateMouthOpening = (
  landmarks
) => {
  const upperLip = landmarks?.[13];
  const lowerLip = landmarks?.[14];

  if (!upperLip || !lowerLip) {
    return 0;
  }

  return distance(
    upperLip,
    lowerLip
  );
};

export const calculateSmileWidth = (
  landmarks
) => {
  const leftMouth = landmarks?.[61];
  const rightMouth = landmarks?.[291];

  if (!leftMouth || !rightMouth) {
    return 0;
  }

  return distance(
    leftMouth,
    rightMouth
  );
};

export const calculateFacialExpressiveness =
  (landmarks) => {
    const mouthOpening =
      calculateMouthOpening(
        landmarks
      );

    const smileWidth =
      calculateSmileWidth(
        landmarks
      );

    if (!smileWidth) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (mouthOpening /
          smileWidth) *
          1000
      )
    );
  };