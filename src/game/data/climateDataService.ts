import { FALLBACK_CLIMATE_SIGNALS } from '../content/cityScenario';
import type { CityState, ClimateSignals } from '../simulation/types';
import {
  fetchNasaPowerSignals,
  fetchOpenAqSignals,
  fetchOpenMeteoAirQuality,
  fetchOpenMeteoSignals
} from './apiClients';

/**
 * 台灣官方人口統計（內政部戶政司，2024 年底，臺北市）。
 * 採靜態內建：World Bank API 沒有台灣（TWN）資料（實測回傳空集合），
 * 這本身是「資料庫覆蓋缺口」的好教材，已寫入來源說明。
 */
const TAIWAN_OFFICIAL_POPULATION = {
  population: 2_455_000,
  urbanPopulationRatio: 0.95
} as const;

export interface ClimateDataOptions {
  useNetwork: boolean;
  openAqApiKey?: string;
}

export type ClimateDataSourceStatusKind = 'loaded' | 'failed' | 'skipped' | 'fallback';

export interface ClimateDataSourceStatus {
  id: 'openMeteo' | 'openMeteoAir' | 'nasaPower' | 'taiwanPop' | 'openAq' | 'localBaseline';
  name: string;
  status: ClimateDataSourceStatusKind;
  fields: string[];
  note: string;
}

export interface ClimateDataBundle {
  signals: ClimateSignals;
  sources: ClimateDataSourceStatus[];
}

// ── API 快取（localStorage, TTL 12 小時）──
// 課堂 30 人同時載入會打 5 個公開 API；快取讓同一台機器當天只打一次，
// 避免被限流，也加快重新整理後的載入。
const CACHE_PREFIX = 'climate-resilience-lab/api-cache/v1/';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

async function withCache<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const storageKey = `${CACHE_PREFIX}${key}`;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      const cached = JSON.parse(raw) as { t: number; v: T };
      if (Date.now() - cached.t < CACHE_TTL_MS) return cached.v;
    }
  } catch {
    /* 快取毀損時直接重新載入 */
  }

  const value = await loader();
  try {
    window.localStorage.setItem(storageKey, JSON.stringify({ t: Date.now(), v: value }));
  } catch {
    /* 容量不足時略過 */
  }
  return value;
}

export async function getClimateSignals(
  city: Pick<CityState, 'coordinates' | 'countryCode'>,
  options: ClimateDataOptions
): Promise<ClimateSignals> {
  return (await getClimateDataBundle(city, options)).signals;
}

export async function getClimateDataBundle(
  city: Pick<CityState, 'coordinates' | 'countryCode'>,
  options: ClimateDataOptions
): Promise<ClimateDataBundle> {
  const localBaseline = await loadLocalBaseline();
  const localBaselineStatus: ClimateDataSourceStatus = {
    id: 'localBaseline',
    name: '台北本地基準補值',
    status: 'fallback',
    fields: ['暖季均溫', '熱浪日', '熱夜日', '暖季月雨量', '強降雨日', 'PM2.5', '日照', '人口背景'],
    note: '公開 API 缺漏或無法連線時用來補足欄位，讓課堂仍可討論資料不確定性。'
  };

  if (!options.useNetwork) {
    return {
      signals: localBaseline,
      sources: [{ ...localBaselineStatus, status: 'loaded', note: '目前使用本地台北基準資料。' }]
    };
  }

  const coordKey = `${city.coordinates.latitude},${city.coordinates.longitude}`;
  const sources = [
    {
      id: 'nasaPower' as const,
      name: 'NASA POWER',
      fields: ['近 5 個完整暖季的太陽輻射、暖季均溫與降雨補充'],
      loader: () => withCache(`nasaPower/${coordKey}`, () => fetchNasaPowerSignals(city.coordinates))
    },
    {
      id: 'openMeteo' as const,
      name: 'Open-Meteo',
      fields: ['近 5 個完整暖季的熱浪日、熱夜日、強降雨日、暖季月雨量'],
      loader: () => withCache(`openMeteo/${coordKey}`, () => fetchOpenMeteoSignals(city.coordinates))
    },
    {
      id: 'taiwanPop' as const,
      name: '內政部戶政司人口統計（靜態內建）',
      fields: ['人口背景（臺北市 2024 年底）', '都市人口比'],
      // World Bank API 無台灣資料（非會員國），改用官方統計靜態內建。
      loader: () => Promise.resolve({ ...TAIWAN_OFFICIAL_POPULATION })
    },
    {
      id: 'openMeteoAir' as const,
      name: 'Open-Meteo 空氣品質（CAMS）',
      fields: ['PM2.5（免金鑰，CAMS 全球/歐洲再分析）'],
      loader: () => withCache(`openMeteoAir/${coordKey}`, () => fetchOpenMeteoAirQuality(city.coordinates))
    },
    {
      id: 'openAq' as const,
      name: 'OpenAQ（選用，需 API key）',
      fields: ['PM2.5（地面測站，若提供 key 則覆蓋上者）'],
      loader: () =>
        options.openAqApiKey
          ? withCache(`openAq/${coordKey}`, () => fetchOpenAqSignals(city.coordinates, options.openAqApiKey))
          : fetchOpenAqSignals(city.coordinates, options.openAqApiKey)
    }
  ];

  const results = await Promise.allSettled(sources.map((source) => source.loader()));

  const merged = results.reduce<Partial<ClimateSignals>>((signals, result) => {
    if (result.status === 'fulfilled') {
      return { ...signals, ...removeUndefined(result.value) };
    }
    return signals;
  }, {});

  const sourceStatuses: ClimateDataSourceStatus[] = results.map((result, index) => {
    const source = sources[index];

    if (result.status === 'rejected') {
      return {
        id: source.id,
        name: source.name,
        status: 'failed',
        fields: source.fields,
        note: String(result.reason)
      };
    }

    const cleaned = removeUndefined(result.value);
    const hasValues = Object.keys(cleaned).length > 0;

    if (hasValues) {
      return {
        id: source.id,
        name: source.name,
        status: 'loaded',
        fields: source.fields,
        note: '已載入並覆蓋同名起始欄位。'
      };
    }

    return {
      id: source.id,
      name: source.name,
      status: 'skipped',
      fields: source.fields,
      note:
        source.id === 'openAq'
          ? '未設定 OpenAQ API key；PM2.5 已改由 Open-Meteo 空氣品質（CAMS）提供真實值。'
          : 'API 回傳資料缺漏，相關欄位使用台北本地基準補值。'
    };
  });

  return {
    signals: normalizeClimateSignals({
      ...localBaseline,
      ...merged
    }),
    sources: [...sourceStatuses, localBaselineStatus]
  };
}

async function loadLocalBaseline(): Promise<ClimateSignals> {
  try {
    // 用 BASE_URL 組路徑：部署在 GitHub Pages 子路徑（/repo/）時也能正確載入。
    const response = await fetch(`${import.meta.env.BASE_URL}data/taipei-climate-baseline.json`);
    if (!response.ok) throw new Error('Local baseline missing');
    const data = await response.json();
    return normalizeClimateSignals(data.baseline);
  } catch {
    return FALLBACK_CLIMATE_SIGNALS;
  }
}

function normalizeClimateSignals(signals: ClimateSignals): ClimateSignals {
  const meanTemperatureC = clamp(
    numberOr(signals.meanTemperatureC, FALLBACK_CLIMATE_SIGNALS.meanTemperatureC),
    15,
    45
  );
  const monthlyPrecipitationMm = clamp(
    numberOr(signals.monthlyPrecipitationMm, FALLBACK_CLIMATE_SIGNALS.monthlyPrecipitationMm),
    0,
    1500
  );

  return {
    meanTemperatureC,
    temperatureAnomalyC: clamp(meanTemperatureC - 27, -10, 15),
    heatwaveDaysPerSeason: clamp(
      numberOr(signals.heatwaveDaysPerSeason, FALLBACK_CLIMATE_SIGNALS.heatwaveDaysPerSeason),
      0,
      184
    ),
    tropicalNightsPerSeason: clamp(
      numberOr(signals.tropicalNightsPerSeason, FALLBACK_CLIMATE_SIGNALS.tropicalNightsPerSeason),
      0,
      184
    ),
    monthlyPrecipitationMm,
    precipitationAnomalyRatio: clamp(
      numberOr(signals.precipitationAnomalyRatio, FALLBACK_CLIMATE_SIGNALS.precipitationAnomalyRatio),
      0.2,
      5
    ),
    heavyRainDaysPerSeason: clamp(
      numberOr(signals.heavyRainDaysPerSeason, FALLBACK_CLIMATE_SIGNALS.heavyRainDaysPerSeason),
      0,
      80
    ),
    pm25UgM3: clamp(numberOr(signals.pm25UgM3, FALLBACK_CLIMATE_SIGNALS.pm25UgM3), 0, 500),
    solarKwhM2Day: clamp(numberOr(signals.solarKwhM2Day, FALLBACK_CLIMATE_SIGNALS.solarKwhM2Day), 0, 12),
    population: clamp(numberOr(signals.population, FALLBACK_CLIMATE_SIGNALS.population), 1, 100_000_000),
    urbanPopulationRatio: clamp(
      numberOr(signals.urbanPopulationRatio, FALLBACK_CLIMATE_SIGNALS.urbanPopulationRatio),
      0,
      1
    )
  };
}

function numberOr(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) ? Number(value) : fallback;
}

function removeUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as Partial<T>;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
