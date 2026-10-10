const distance = (a, b) => {
  if (!a || !b) return 0;

  return Math.sqrt(
    Math.pow(a.x - b.x, 2) +
      Math.pow(a.y - b.y, 2)
  );
};

export const calculateHeadMovement = (
  currentLandmarks,
  previousLandmarks
) => {
  if (
    !currentLandmarks ||
    !previousLandmarks
  ) {
    return 0;
  }

  const currentNose =
    currentLandmarks[1];

  const previousNose =
    previousLandmarks[1];

  if (
    !currentNose ||
    !previousNose
  ) {
    return 0;
  }

  return distance(
    currentNose,
    previousNose
  );
};

export const calculateHeadStability = (
  movement
) => {
  return Math.max(
    0,
    Math.min(
      100,
      100 - movement * 150
    )
  );
};