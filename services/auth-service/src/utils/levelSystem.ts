export function getLevelFromPoints(points: number | undefined): number {
  if (!points || points < 0) return 1;
  return 1 + Math.floor(points / 100);
}

export function getNextLevelPoints(level: number): number {
  return level * 100;
}

export function getPointsProgress(points: number | undefined): number {
  if (!points) return 0;
  const level = getLevelFromPoints(points);
  const baseXP = (level - 1) * 100;
  return points - baseXP;
}
