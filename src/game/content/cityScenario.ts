import { generateInitialCells } from '../simulation/cells';
import { createSeed, pickFromSeed } from '../simulation/rng';
import { DEFAULT_SCENARIO_ID } from '../simulation/scenarios';
import type { SspScenarioId } from '../simulation/scenarios';
import type { CivicChallenge, CityState, ClimateSignals, Coordinates, DistrictState } from '../simulation/types';
import { createHeatwaveMission } from './missions';

export const TAIPEI_COORDINATES: Coordinates = {
  latitude: 25.033,
  longitude: 121.5654
};

export const FALLBACK_CLIMATE_SIGNALS: ClimateSignals = {
  meanTemperatureC: 28.4,
  temperatureAnomalyC: 1.4,
  heatwaveDaysPerSeason: 18,
  tropicalNightsPerSeason: 64,
  monthlyPrecipitationMm: 265,
  precipitationAnomalyRatio: 1.18,
  heavyRainDaysPerSeason: 8,
  pm25UgM3: 14.8,
  solarKwhM2Day: 3.78,
  population: 2_490_000,
  urbanPopulationRatio: 0.95
};

export const CIVIC_CHALLENGES: CivicChallenge[] = [
  {
    id: 'heat-dome',
    title: '高壓熱穹頂',
    body: '副熱帶高壓盤據，夜間降溫不足。柏油與水泥白天吸熱、夜間釋熱，市中心與弱勢住宅區熱暴露快速升高。',
    scienceNote:
      '熱浪會讓人體散熱變困難，夜間高溫尤其危險，因為身體沒有恢復時間。樹蔭、冷房與低熱容量鋪面都能降低暴露。',
    soundCue: 'heat',
    pressure: { heatRisk: 8, publicHealth: -4, equity: -3 }
  },
  {
    id: 'typhoon-rainband',
    title: '颱風雨帶滯留',
    body: '外圍環流帶來短延時強降雨，河岸與低窪街區排水壓力升高。若不透水面比例高，雨水會更快形成地表逕流。',
    scienceNote:
      '強降雨風險不只看雨量，也看地表能不能吸收或暫存雨水。海綿街廓、濕地與滯洪空間可削減洪峰。',
    soundCue: 'rain',
    pressure: { floodRisk: 10, publicTrust: -3 }
  },
  {
    id: 'stagnant-air',
    title: '靜風空污累積',
    body: '風速偏弱讓污染物不易擴散，工業區與交通幹道周邊 PM2.5 暴露上升，呼吸道敏感族群受到影響。',
    scienceNote:
      '空氣污染濃度會受排放量與擴散條件影響。低風速、逆溫或高排放都會讓污染累積在近地面。',
    soundCue: 'air',
    pressure: { airQualityRisk: 8, publicHealth: -3 }
  },
  {
    id: 'energy-peak',
    title: '尖峰用電拉警報',
    body: '連續高溫推升冷氣用電，電網備轉容量下降。若供電以化石燃料補足，排放與空污可能同步上升。',
    scienceNote:
      '氣候調適與減緩會互相牽動。熱浪需要冷房保護健康，但若能源系統不低碳，降溫也可能增加排放。',
    soundCue: 'energy',
    pressure: { energySecurity: -5, emissions: 5 }
  },
  {
    id: 'budget-review',
    title: '市議會預算審查',
    body: '民眾要求市府解釋每項支出的證據基礎。資料透明與公民參與能提升信任，但缺乏說明會削弱支持度。',
    scienceNote:
      '永續政策需要科學證據，也需要社會溝通。學生可以練習把指標、模型假設與政策取捨說清楚。',
    soundCue: 'civic',
    pressure: { publicTrust: -2, educationScore: 4 }
  }
];

export function createInitialDistricts(seed = 1): DistrictState[] {
  // P2：每個街區先以 archetype 設計值建立，再產生對應的 4×4 地格，
  // 之後 imperviousness/canopyCover/solarCoverage 由地格聚合（見 advanceTurn）。
  return createDistrictBlueprints().map((district) => ({
    ...district,
    cells: generateInitialCells(district, seed)
  }));
}

function createDistrictBlueprints(): Omit<DistrictState, 'cells'>[] {
  return [
    {
      id: 'harbor',
      name: '海港低窪區',
      archetype: 'coastal',
      population: 320_000,
      elevationM: 2.5,
      imperviousness: 0.76,
      canopyCover: 0.13,
      transitAccess: 0.58,
      solarCoverage: 0.16,
      floodDefense: 0.22,
      coolingAccess: 0.34,
      industryLoad: 0.47,
      heatExposure: 62,
      floodExposure: 74,
      airPollution: 55,
      healthIndex: 58,
      equityIndex: 51,
      resilienceIndex: 44
    },
    {
      id: 'core',
      name: '市中心熱島區',
      archetype: 'downtown',
      population: 510_000,
      elevationM: 8,
      imperviousness: 0.89,
      canopyCover: 0.08,
      transitAccess: 0.82,
      solarCoverage: 0.12,
      floodDefense: 0.28,
      coolingAccess: 0.42,
      industryLoad: 0.31,
      heatExposure: 77,
      floodExposure: 48,
      airPollution: 50,
      healthIndex: 61,
      equityIndex: 56,
      resilienceIndex: 49
    },
    {
      id: 'riverbend',
      name: '河岸住宅區',
      archetype: 'river',
      population: 280_000,
      elevationM: 4,
      imperviousness: 0.67,
      canopyCover: 0.21,
      transitAccess: 0.48,
      solarCoverage: 0.1,
      floodDefense: 0.18,
      coolingAccess: 0.31,
      industryLoad: 0.19,
      heatExposure: 59,
      floodExposure: 71,
      airPollution: 41,
      healthIndex: 64,
      equityIndex: 58,
      resilienceIndex: 46
    },
    {
      id: 'industry',
      name: '產業排放區',
      archetype: 'industrial',
      population: 210_000,
      elevationM: 6,
      imperviousness: 0.81,
      canopyCover: 0.07,
      transitAccess: 0.39,
      solarCoverage: 0.21,
      floodDefense: 0.25,
      coolingAccess: 0.24,
      industryLoad: 0.78,
      heatExposure: 72,
      floodExposure: 56,
      airPollution: 78,
      healthIndex: 49,
      equityIndex: 47,
      resilienceIndex: 39
    },
    {
      id: 'garden',
      name: '花園住宅區',
      archetype: 'residential',
      population: 430_000,
      elevationM: 12,
      imperviousness: 0.58,
      canopyCover: 0.29,
      transitAccess: 0.54,
      solarCoverage: 0.18,
      floodDefense: 0.32,
      coolingAccess: 0.43,
      industryLoad: 0.12,
      heatExposure: 48,
      floodExposure: 39,
      airPollution: 33,
      healthIndex: 72,
      equityIndex: 64,
      resilienceIndex: 61
    },
    {
      id: 'hillside',
      name: '山坡保育區',
      archetype: 'upland',
      population: 120_000,
      elevationM: 28,
      imperviousness: 0.32,
      canopyCover: 0.48,
      transitAccess: 0.34,
      solarCoverage: 0.14,
      floodDefense: 0.38,
      coolingAccess: 0.29,
      industryLoad: 0.08,
      heatExposure: 37,
      floodExposure: 31,
      airPollution: 28,
      healthIndex: 75,
      equityIndex: 59,
      resilienceIndex: 68
    }
  ];
}

export function createInitialCityState(
  signals: ClimateSignals = FALLBACK_CLIMATE_SIGNALS,
  options: { seed?: number; scenario?: SspScenarioId; mode?: CityState['mode'] } = {}
): CityState {
  const seed = options.seed ?? createSeed();
  return {
    cityId: 'taipei',
    seed,
    scenario: options.scenario ?? DEFAULT_SCENARIO_ID,
    mode: options.mode ?? 'campaign',
    missionIndex: 0,
    cityName: '台北氣候韌性實驗城',
    coordinates: TAIPEI_COORDINATES,
    countryCode: 'TWN',
    turn: 1,
    maxTurns: 4,
    year: 2026,
    phase: 'planning',
    budget: 64,
    emissions: 72,
    heatRisk: 63,
    floodRisk: 58,
    airQualityRisk: 52,
    publicHealth: 61,
    equity: 56,
    publicTrust: 62,
    biodiversity: 43,
    energySecurity: 55,
    educationScore: 42,
    sdgScore: 56,
    climateSignals: signals,
    selectedDistrictId: 'core',
    currentChallenge: getRandomChallengeForTurn(seed, 1),
    mission: createHeatwaveMission(seed),
    districts: createInitialDistricts(seed),
    appliedPolicies: [],
    eventLog: ['模擬城初始化：請啟動熱浪任務，觀察各區風險差異後再投資政策。'],
    evidenceLog: []
  };
}

export function getChallengeForTurn(turn: number): CivicChallenge {
  return CIVIC_CHALLENGES[(turn - 1) % CIVIC_CHALLENGES.length];
}

/** 以 seed + 回合確定性抽選事件（同 seed → 同事件序列，課堂可重現）。 */
export function getRandomChallengeForTurn(
  seed: number,
  turn: number,
  excludedChallengeId?: string
): CivicChallenge {
  const pool = CIVIC_CHALLENGES.filter((challenge) => challenge.id !== excludedChallengeId);
  const candidates = pool.length > 0 ? pool : CIVIC_CHALLENGES;
  return pickFromSeed(candidates, seed, turn, 0xc4a11);
}
