import type { MissionObjectiveProgress } from '../../game/simulation/types';

export function formatDecimal(value: number, digits = 1): string {
  return Number.isFinite(value) ? value.toFixed(digits) : '資料缺漏';
}

export function formatSignedDecimal(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return '資料缺漏';
  return `${value > 0 ? '+' : ''}${value.toFixed(digits)}`;
}

export function formatPercent(value: number): string {
  return Number.isFinite(value) ? `${Math.round(value * 100)}%` : '資料缺漏';
}

export function formatLargeNumber(value: number): string {
  if (!Number.isFinite(value)) return '資料缺漏';
  return Math.round(value).toLocaleString('zh-TW');
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatObjectiveValue(objective: MissionObjectiveProgress): string {
  const value = Number.isInteger(objective.current) ? String(objective.current) : objective.current.toFixed(1);
  return `${value}${objective.unit ?? ''}`;
}

export function formatMoney(value: number): string {
  return `${Math.round(value)} 百萬`;
}

export function formatSdgs(sdgs: string[]): string {
  const labels: Record<string, string> = {
    'SDG 3': '健康福祉',
    'SDG 6': '潔淨水',
    'SDG 7': '可負擔能源',
    'SDG 9': '產業創新',
    'SDG 10': '減少不平等',
    'SDG 11': '永續城市',
    'SDG 12': '責任消費',
    'SDG 13': '氣候行動',
    'SDG 15': '陸域生態'
  };

  return sdgs.map((sdg) => `${sdg} ${labels[sdg] ?? ''}`.trim()).join(' / ');
}

export function metricLabel(key: string): string {
  const labels: Record<string, string> = {
    emissions: '排放',
    heatRisk: '熱風險',
    floodRisk: '洪水風險',
    airQualityRisk: '空氣風險',
    publicHealth: '公共健康',
    equity: '公平性',
    publicTrust: '公共信任',
    biodiversity: '生物多樣性',
    energySecurity: '能源安全',
    educationScore: '教育分數'
  };

  return labels[key] ?? key;
}

export function isRiskMetric(key: string): boolean {
  return key === 'emissions' || key === 'heatRisk' || key === 'floodRisk' || key === 'airQualityRisk';
}

export function riskTone(value: number): 'good' | 'warn' | 'danger' {
  if (value >= 72) return 'danger';
  if (value >= 54) return 'warn';
  return 'good';
}

export function positiveTone(value: number): 'good' | 'warn' | 'danger' {
  if (value >= 68) return 'good';
  if (value >= 50) return 'warn';
  return 'danger';
}
