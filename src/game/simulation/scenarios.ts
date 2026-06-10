/**
 * scenarios.ts — IPCC AR6 SSP 排放情境驅動的氣候演化。
 *
 * 科學定位（重要的教學訊息）：
 *   單一城市的減排幾乎不影響全球溫度——「減緩」是全球集體行動，
 *   「調適」才是城市自己能掌握的。因此遊戲中的逐年氣候變化由
 *   玩家選定的全球情境（SSP）查表驅動，而非由本市排放量回饋。
 *   本市排放仍會影響「本地」空氣品質（PM2.5 為區域污染物）。
 *
 * 數值為 IPCC AR6 WG1（2021）近期（2021–2050）趨勢的一階教學近似：
 *   - SSP1-2.6：全球升溫率約 +0.02°C/yr（本世紀中前趨穩）
 *   - SSP2-4.5：約 +0.027°C/yr
 *   - SSP5-8.5：約 +0.043°C/yr
 * 極端指標（熱浪日、熱夜、強降雨）的逐年趨勢按情境等比放大，
 * 屬方向正確的教學近似，非降尺度預估（教師說明已標注）。
 */

export type SspScenarioId = 'ssp126' | 'ssp245' | 'ssp585';

export interface SspScenario {
  id: SspScenarioId;
  name: string;
  shortName: string;
  description: string;
  /** 全球平均升溫率（°C/yr，近期一階近似）。 */
  warmingPerYearC: number;
  /** 熱浪日逐年趨勢（日/季/yr）。 */
  heatwaveDaysPerYear: number;
  /** 熱夜逐年趨勢（日/季/yr）。 */
  tropicalNightsPerYear: number;
  /** 暖季月雨量逐年趨勢（mm/yr）。 */
  monthlyPrecipPerYearMm: number;
  /** 強降雨日逐年趨勢（日/季/yr）。 */
  heavyRainDaysPerYear: number;
  /** 降雨異常比逐年趨勢。 */
  precipAnomalyPerYear: number;
}

export const SSP_SCENARIOS: ReadonlyArray<SspScenario> = [
  {
    id: 'ssp126',
    name: 'SSP1-2.6 永續轉型',
    shortName: 'SSP1-2.6',
    description: '全球快速減排、本世紀中接近淨零。升溫趨緩，但已鎖定的暖化仍需要調適。',
    warmingPerYearC: 0.02,
    heatwaveDaysPerYear: 0.25,
    tropicalNightsPerYear: 0.45,
    monthlyPrecipPerYearMm: 0.7,
    heavyRainDaysPerYear: 0.08,
    precipAnomalyPerYear: 0.005
  },
  {
    id: 'ssp245',
    name: 'SSP2-4.5 中間路線',
    shortName: 'SSP2-4.5',
    description: '全球延續目前政策力道。升溫與極端事件持續增加，是常用的「中間」參考情境。',
    warmingPerYearC: 0.027,
    heatwaveDaysPerYear: 0.4,
    tropicalNightsPerYear: 0.7,
    monthlyPrecipPerYearMm: 1.2,
    heavyRainDaysPerYear: 0.15,
    precipAnomalyPerYear: 0.01
  },
  {
    id: 'ssp585',
    name: 'SSP5-8.5 高排放',
    shortName: 'SSP5-8.5',
    description: '化石燃料密集發展。升溫最快、極端事件最劇烈，常作為高風險壓力測試情境。',
    warmingPerYearC: 0.043,
    heatwaveDaysPerYear: 0.7,
    tropicalNightsPerYear: 1.1,
    monthlyPrecipPerYearMm: 1.9,
    heavyRainDaysPerYear: 0.24,
    precipAnomalyPerYear: 0.016
  }
];

export const DEFAULT_SCENARIO_ID: SspScenarioId = 'ssp245';

export function getScenario(id: SspScenarioId): SspScenario {
  return SSP_SCENARIOS.find((scenario) => scenario.id === id) ?? SSP_SCENARIOS[1];
}
