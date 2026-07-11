/**
 * scienceModel.ts
 * ------------------------------------------------------------------
 * 氣候韌性實驗室：文獻依據的科學運算核心（純函式，可單元測試）。
 *
 * 設計原則（見 docs/science-model-redesign.md）：
 *   1. 先把氣候訊號轉成「有物理/流行病學意義的中間量」
 *      （UHI 升溫 °C、EPA AQI、逕流係數），再合成風險。
 *   2. 風險採 IPCC AR6 框架：Risk = f(Hazard, Exposure, Vulnerability)。
 *   3. 係數盡量對齊權威門檻與同儕審查實證，常數均具名並附出處。
 *
 * 此為「教學一階近似」：方向正確、可解釋、與權威門檻一致，
 * 非工程級水文/空品模式（此定位寫入教師說明）。
 */

import type { ClimateSignals, DistrictState } from './types';

// ──────────────────────────────────────────────────────────────────
// 文獻常數（出處見 docs/science-model-redesign.md 參考來源）
// ──────────────────────────────────────────────────────────────────

/** 台灣中央氣象署 CWA 高溫資訊門檻：日最高溫 ≥ 36°C。 */
export const CWA_HEAT_DAY_THRESHOLD_C = 36;
/** 熱夜（tropical night）：亞熱帶都市常用日最低溫 ≥ 25°C（WMO 全球 ≥20°C）。 */
export const TROPICAL_NIGHT_THRESHOLD_C = 25;

/**
 * 都市熱島（UHI）升溫實證靈敏度（街區尺度、夏季）：
 *   - 樹冠覆蓋 +10% → 氣溫約 −2.5°C  (Ziter et al., PNAS 2019, 116(15):7575)
 *   - 不透水面 +10% → 氣溫約 +1.87°C (Ziter et al., PNAS 2019；UHI 機制另見 Manoli et al., Nature 2019, 573:55)
 * 換算為「每單位面積分率(0–1)」的 °C 靈敏度。
 */
export const UHI_CANOPY_C_PER_FRACTION = 25.0; // 2.5°C / 0.1
export const UHI_IMPERV_C_PER_FRACTION = 18.7; // 1.87°C / 0.1
/** 參考基準街區（用來計算相對升溫）：不透水 50%、樹冠 20%。 */
export const REF_IMPERVIOUSNESS = 0.5;
export const REF_CANOPY = 0.2;
/** 每 1°C UHI 升溫對熱危害分數的貢獻（教學標定）。 */
export const HAZARD_PER_DEGREE_C = 5;

/**
 * US EPA PM2.5 24 小時 AQI breakpoints（2024/5/6 生效）。
 * 每列：[C_lo, C_hi, I_lo, I_hi]，單位 µg/m³ 與 AQI。
 */
export const EPA_PM25_AQI_BREAKPOINTS: ReadonlyArray<readonly [number, number, number, number]> = [
  [0.0, 9.0, 0, 50],
  [9.1, 35.4, 51, 100],
  [35.5, 55.4, 101, 150],
  [55.5, 125.4, 151, 200],
  [125.5, 225.4, 201, 300],
  [225.5, 325.4, 301, 500]
];

/** WHO 2021 空氣品質指引（健康目標線，供 UI 標註）。 */
export const WHO_PM25_ANNUAL_UG = 5;
export const WHO_PM25_24H_UG = 15;

/**
 * US EPA AQI 官方類別（名稱、色帶、危害分數區間 0–100）。
 * 危害分數採類別分段線性，取代舊版 AQI/225 任意錨點，
 * 讓遊戲內分數與課本/新聞的 AQI 色帶一致。
 */
export interface AqiCategory {
  name: string;
  nameZh: string;
  color: string;
  aqiLo: number;
  aqiHi: number;
  hazardLo: number;
  hazardHi: number;
}

export const EPA_AQI_CATEGORIES: ReadonlyArray<AqiCategory> = [
  { name: 'Good', nameZh: '良好', color: '#00e400', aqiLo: 0, aqiHi: 50, hazardLo: 0, hazardHi: 20 },
  { name: 'Moderate', nameZh: '普通', color: '#ffff00', aqiLo: 51, aqiHi: 100, hazardLo: 20, hazardHi: 40 },
  { name: 'Unhealthy for Sensitive Groups', nameZh: '對敏感族群不健康', color: '#ff7e00', aqiLo: 101, aqiHi: 150, hazardLo: 40, hazardHi: 60 },
  { name: 'Unhealthy', nameZh: '不健康', color: '#ff0000', aqiLo: 151, aqiHi: 200, hazardLo: 60, hazardHi: 80 },
  { name: 'Very Unhealthy', nameZh: '非常不健康', color: '#8f3f97', aqiLo: 201, aqiHi: 300, hazardLo: 80, hazardHi: 95 },
  { name: 'Hazardous', nameZh: '危害', color: '#7e0023', aqiLo: 301, aqiHi: 500, hazardLo: 95, hazardHi: 100 }
];

/** 取得 AQI 對應的 EPA 官方類別（供 HUD 色帶與文字標示）。 */
export function getAqiCategory(aqi: number): AqiCategory {
  const value = Math.max(0, Math.min(500, aqi));
  return (
    EPA_AQI_CATEGORIES.find((category) => value <= category.aqiHi) ??
    EPA_AQI_CATEGORIES[EPA_AQI_CATEGORIES.length - 1]
  );
}

/** AQI → 遊戲危害分數 0–100（依 EPA 類別分段線性）。 */
export function airHazardFromAqi(aqi: number): number {
  const category = getAqiCategory(aqi);
  const span = Math.max(1, category.aqiHi - category.aqiLo);
  const t = (Math.max(category.aqiLo, Math.min(category.aqiHi, aqi)) - category.aqiLo) / span;
  return category.hazardLo + t * (category.hazardHi - category.hazardLo);
}

/**
 * 熱-健康非線性負荷（教學一階近似）。
 * 流行病學實證（Gasparrini et al. 2015, The Lancet 386:369）顯示
 * 高於「最適溫度」後死亡相對風險呈非線性（凸性）上升，而非線性正比。
 * 以熱暴露分數模擬此形狀：低於門檻幾乎無額外負荷，超過後加速上升。
 */
export const HEAT_HEALTH_THRESHOLD = 40; // 熱暴露分數門檻（近似最適溫度區）
export const HEAT_HEALTH_EXPONENT = 1.7; // 凸性指數（>1 → 加速上升）

export function heatHealthBurden(heatExposure: number): number {
  const excess = Math.max(0, Math.min(100, heatExposure) - HEAT_HEALTH_THRESHOLD);
  const scale = 100 - HEAT_HEALTH_THRESHOLD;
  return Math.min(100, 100 * (excess / scale) ** HEAT_HEALTH_EXPONENT);
}

/** 合理化公式逕流係數近似：C ≈ 0.05 + 0.85·不透水率（綠地~0.1，全鋪面~0.9）。 */
export const RUNOFF_BASE = 0.05;
export const RUNOFF_IMPERV_SLOPE = 0.85;

// ──────────────────────────────────────────────────────────────────
// 小工具
// ──────────────────────────────────────────────────────────────────

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

// ──────────────────────────────────────────────────────────────────
// 中間量 1：PM2.5 → EPA AQI（分段線性內插）
// ──────────────────────────────────────────────────────────────────

/**
 * 依 EPA 官方公式將 PM2.5 濃度(µg/m³)換算為 AQI(0–500)。
 *   I = (I_hi − I_lo)/(C_hi − C_lo) · (C − C_lo) + I_lo
 * 取代舊版 `pm25 * 2.1` 的線性誤用。
 */
export function aqiFromPm25(pm25: number): number {
  const c = Math.max(0, pm25);
  for (const [cLo, cHi, iLo, iHi] of EPA_PM25_AQI_BREAKPOINTS) {
    if (c <= cHi) {
      return Math.round(((iHi - iLo) / (cHi - cLo)) * (c - cLo) + iLo);
    }
  }
  return 500; // 超過最高 breakpoint 視為爆表
}

// ──────────────────────────────────────────────────────────────────
// 中間量 2：氣候危害層（全市層級，IPCC「Hazard」）
// ──────────────────────────────────────────────────────────────────

export interface ClimateHazardLayer {
  /** 全市熱危害基準 0–100（尚未加入街區 UHI）。 */
  heatClimateHazard: number;
  /** 全市洪水危害基準 0–100。 */
  floodClimateHazard: number;
  /** 對齊 EPA 的 PM2.5 AQI（0–500）。 */
  aqiPm25: number;
  /** 區域空污危害基準 0–100（由 AQI 映射）。 */
  airClimateHazard: number;
  /** 太陽能機會 0–100（用於能源安全）。 */
  solarOpportunity: number;
}

export function getClimateHazardLayer(climate: ClimateSignals): ClimateHazardLayer {
  // 熱：溫度異常 + 高溫日(≥36°C) + 熱夜(≥25°C)。熱夜對健康風險權重高（夜間無法恢復）。
  const heatClimateHazard = clamp(
    20 +
      climate.temperatureAnomalyC * 6 +
      climate.heatwaveDaysPerSeason * 0.7 +
      climate.tropicalNightsPerSeason * 0.25
  );

  // 洪水：降雨異常比 + 暴雨日 + 暖季月雨量。對應「危害＝極端降雨」。
  const floodClimateHazard = clamp(
    15 +
      climate.precipitationAnomalyRatio * 10 +
      climate.heavyRainDaysPerSeason * 1.6 +
      climate.monthlyPrecipitationMm / 20
  );

  // 空污：先轉成 AQI，再依 EPA 官方類別分段映射到 0–100。
  const aqiPm25 = aqiFromPm25(climate.pm25UgM3);
  const airClimateHazard = clamp(airHazardFromAqi(aqiPm25));

  // 太陽能機會：日照 kWh/m²/day（NASA POWER ALLSKY_SFC_SW_DWN）。
  const solarOpportunity = clamp(28 + climate.solarKwhM2Day * 9);

  return { heatClimateHazard, floodClimateHazard, aqiPm25, airClimateHazard, solarOpportunity };
}

// ──────────────────────────────────────────────────────────────────
// 中間量 3：街區層級（Hazard × Exposure × Vulnerability）
// ──────────────────────────────────────────────────────────────────

export interface DistrictScienceResult {
  /** 街區相對基準的都市熱島升溫（°C），供 CER 舉證。 */
  uhiDeltaC: number;
  /** 逕流係數 0–1（多少雨變成地表逕流）。 */
  runoffCoefficient: number;
  /** 熱暴露分數 0–100。 */
  heatExposure: number;
  /** 洪水暴露分數 0–100。 */
  floodExposure: number;
  /** 空污分數 0–100。 */
  airPollution: number;
  /** 公共健康指數 0–100。 */
  healthIndex: number;
  /** 韌性指數 0–100。 */
  resilienceIndex: number;
}

/**
 * 計算單一街區的科學指標。
 * 三層拆解（IPCC AR6）：
 *   Hazard       ← 氣候危害層 + 街區 UHI / 逕流（物理）
 *   Exposure     ← 街區類型放大（海岸/河岸/市中心/工業）
 *   Vulnerability← 降溫設施、防洪設施、公平、調適能力（折減/放大）
 */
export function computeDistrictScience(
  district: DistrictState,
  hazard: ClimateHazardLayer
): DistrictScienceResult {
  // ── Hazard：都市熱島升溫（°C），相對參考街區 ──
  // 注意：這裡只放「會改變戶外氣溫的物理因子」（不透水面、樹冠、街區型態）。
  // 冷房可及性不改變氣溫，屬於 Vulnerability（見下方），避免混淆概念層次。
  const uhiDeltaC =
    UHI_IMPERV_C_PER_FRACTION * (district.imperviousness - REF_IMPERVIOUSNESS) -
    UHI_CANOPY_C_PER_FRACTION * (district.canopyCover - REF_CANOPY) +
    (district.archetype === 'downtown' ? 1.5 : 0) +
    (district.archetype === 'industrial' ? 0.8 : 0);

  const heatHazard = clamp(hazard.heatClimateHazard + uhiDeltaC * HAZARD_PER_DEGREE_C);

  // Vulnerability（熱）：降溫設施（冷房/避難點）與公平不足 → 放大；充足 → 折減。
  // 冷房權重含原 Hazard 層移入的部分，約束 0.6–1.4。
  const heatVulnerability = clamp(
    1 + (0.45 - district.coolingAccess) * 0.75 + (58 - district.equityIndex) / 200,
    0.6,
    1.4
  );
  const heatExposure = clamp(heatHazard * heatVulnerability);

  // ── Hazard：逕流係數（合理化公式）──
  const runoffCoefficient = clamp(
    RUNOFF_BASE + RUNOFF_IMPERV_SLOPE * district.imperviousness,
    0,
    0.95
  );
  // 危害 × 逕流比例（地表能吸收越少，洪峰越高）
  const floodHazard = clamp(hazard.floodClimateHazard * (0.4 + runoffCoefficient));
  // Vulnerability（洪）：防洪設施與高程降低脆弱；河岸/海岸暴露放大。
  const floodVulnerability = clamp(
    1 +
      (0.5 - district.floodDefense) * 0.6 -
      district.elevationM * 0.012 +
      (district.archetype === 'coastal' || district.archetype === 'river' ? 0.18 : 0),
    0.6,
    1.5
  );
  const floodExposure = clamp(floodHazard * floodVulnerability);

  // ── 空污：區域 AQI 基準 + 街區排放源（工業/交通）− 綠覆吸附 ──
  const airPollution = clamp(
    hazard.airClimateHazard * 0.6 +
      district.industryLoad * 42 -
      district.transitAccess * 14 -
      district.canopyCover * 6
  );

  // ── 公共健康：熱-死亡、PM2.5-呼吸道等流行病學關係的綜合代理 ──
  // 熱負荷採非線性（Gasparrini et al. 2015 曲線形狀）：低暴露幾乎無負荷，
  // 超過門檻後加速上升；夜間高溫與 PM2.5 對健康負荷大。
  const healthIndex = clamp(
    district.baselineHealthIndex * 0.5 +
      (100 - heatHealthBurden(heatExposure)) * 0.18 +
      (100 - floodExposure) * 0.12 +
      (100 - airPollution) * 0.16 +
      district.coolingAccess * 13 +
      district.equityIndex * 0.08 +
      district.healthModifier
  );

  // ── 韌性：調適能力（防洪、綠基盤、運輸、太陽能）抵減各風險 ──
  const resilienceIndex = clamp(
    100 -
      heatExposure * 0.22 -
      floodExposure * 0.23 -
      airPollution * 0.17 +
      district.floodDefense * 17 +
      district.canopyCover * 14 +
      district.transitAccess * 8 +
      district.solarCoverage * 7 +
      district.resilienceModifier
  );

  return {
    uhiDeltaC: Math.round(uhiDeltaC * 100) / 100,
    runoffCoefficient: Math.round(runoffCoefficient * 100) / 100,
    heatExposure: Math.round(heatExposure),
    floodExposure: Math.round(floodExposure),
    airPollution: Math.round(airPollution),
    healthIndex: Math.round(healthIndex),
    resilienceIndex: Math.round(resilienceIndex)
  };
}
