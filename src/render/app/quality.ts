export type QualityTier = 'low' | 'high';

export interface QualityProfile {
  pixelRatioCap: number;
  targetFps: number;
  shadows: boolean;
  postProcessing: boolean;
}

export const QUALITY_PROFILES: Record<QualityTier, QualityProfile> = {
  low: {
    pixelRatioCap: 1,
    targetFps: 30,
    shadows: false,
    postProcessing: false
  },
  high: {
    pixelRatioCap: 1.5,
    targetFps: 60,
    shadows: true,
    postProcessing: true
  }
};

export function detectQualityTier(): QualityTier {
  // 自動化與軟體 WebGL 環境先走省電路徑，避免無頭瀏覽器的陰影 shader 不穩定。
  if (navigator.webdriver) return 'low';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = window.innerWidth < 820;
  const lowConcurrency = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
  return reducedMotion || narrow || lowConcurrency ? 'low' : 'high';
}
