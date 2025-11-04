export function getLevelFromPoints(points) {
    const base = 1000;
    const growth = 1.25;
    if (points < base) return 1;
    return Math.floor(Math.log(points / base) / Math.log(growth)) + 1;
}

export function getNextLevelPoints(level) {
    const base = 1000;
    const growth = 1.25;
    return Math.floor(base * Math.pow(growth, level - 1));
}