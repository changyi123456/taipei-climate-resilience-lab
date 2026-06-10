export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

export function round(value: number, digits = 0): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function weightedAverage<T>(
  items: T[],
  value: (item: T) => number,
  weight: (item: T) => number
): number {
  const totalWeight = items.reduce((sum, item) => sum + weight(item), 0);
  if (totalWeight <= 0) return 0;
  return items.reduce((sum, item) => sum + value(item) * weight(item), 0) / totalWeight;
}

export function riskColorMix(low: number, high: number, value: number): number {
  return low + (high - low) * clamp(value, 0, 100) / 100;
}

