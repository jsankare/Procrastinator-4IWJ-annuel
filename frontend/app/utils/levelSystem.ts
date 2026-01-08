export function getLevelFromPoints(points: number | undefined): number {
  if (!points || points < 0) return 0;
  return Math.floor(points / 100);
}

export function getNextLevelPoints(level: number): number {
  return level * 100;
}

export function getPointsProgress(points: number | undefined): number {
  if (!points) return 0;
  const level = getLevelFromPoints(points);
  const baseXP = level * 100;
  return points - baseXP;
}
