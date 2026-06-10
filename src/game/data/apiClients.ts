import type { ClimateSignals, Coordinates } from '../simulation/types';

type PartialSignals = Partial<ClimateSignals>;
type NumericRange = { min: number; max: number };
type WarmSeasonSlice = { start: string; end: string; year: number };
type WarmSeasonRange = {
  ranges: WarmSeasonSlice[];
  years: number;
  startYear: number;
  endYear: number;
};

const API_TIMEOUT_MS = 5500;
const TEMPERATURE_RANGE = { min: -30, max: 55 };
const PRECIPITATION_RANGE = { min: 0, max: 1000 };
const SOLAR_RANGE = { min: 0, max: 12 };
const PM25_RANGE = { min: 0, max: 500 };
const WORLD_BANK_PERCENT_RANGE = { min: 0, max: 100 };
const WARM_SEASON_YEARS = 5;
const WARM_SEASON_MONTHS = 6;
const WARM_SEASON_BASELINE_TEMP_C = 27;
const WARM_SEASON_BASELINE_MONTHLY_RAIN_MM = 260;
const WARM_SEASON_BASELINE_HEAVY_RAIN_DAYS = 7;
// 台灣中央氣象署 CWA 高溫資訊門檻：日最高溫 ≥ 36°C。
const HEATWAVE_MAX_TEMP_C = 36;
// 熱夜（tropical night）：亞熱帶都市常用日最低溫 ≥ 25°C（WMO 全球 ≥20°C）。
const TROPICAL_NIGHT_MIN_TEMP_C = 25;
// 強降雨：氣象署「大雨」概念，日累積 ≥ 50mm。
const HEAVY_RAIN_MM_PER_DAY = 50;

export async function fetchOpenMeteoSignals(coordinates: Coordinates): Promise<PartialSignals> {
  const seasonRange = getLatestCompleteWarmSeasonRange();
  const seasons = await Promise.all(seasonRange.ranges.map((range) => fetchOpenMeteoSeason(coordinates, range)));
  const dailyMeanTemps = seasons.reduce<number[]>((values, season) => values.concat(season.dailyMeanTemps), []);
  const dailyMaxTemps = seasons.reduce<number[]>((values, season) => values.concat(season.dailyMaxTemps), []);
  const dailyMinTemps = seasons.reduce<number[]>((values, season) => values.concat(season.dailyMinTemps), []);
  const dailyRain = seasons.reduce<number[]>((values, season) => values.concat(season.dailyRain), []);

  const meanTemperatureC = average(dailyMeanTemps, 28, TEMPERATURE_RANGE);
  const heatwaveDaysPerSeason = countDaysAtOrAbove(dailyMaxTemps, HEATWAVE_MAX_TEMP_C, TEMPERATURE_RANGE) / seasonRange.years;
  const tropicalNightsPerSeason =
    countDaysAtOrAbove(dailyMinTemps, TROPICAL_NIGHT_MIN_TEMP_C, TEMPERATURE_RANGE) / seasonRange.years;
  const heavyRainDaysPerSeason =
    countDaysAtOrAbove(dailyRain, HEAVY_RAIN_MM_PER_DAY, PRECIPITATION_RANGE) / seasonRange.years;
  const seasonalRainTotal = sum(
    dailyRain,
    WARM_SEASON_BASELINE_MONTHLY_RAIN_MM * WARM_SEASON_MONTHS * seasonRange.years,
    PRECIPITATION_RANGE
  );
  const monthlyPrecipitationMm = clamp(seasonalRainTotal / (seasonRange.years * WARM_SEASON_MONTHS), 0, 1500);
  const precipitationAnomalyRatio = clamp(
    monthlyPrecipitationMm / WARM_SEASON_BASELINE_MONTHLY_RAIN_MM * 0.62 +
      heavyRainDaysPerSeason / WARM_SEASON_BASELINE_HEAVY_RAIN_DAYS * 0.38,
    0.2,
    4
  );

  return {
    meanTemperatureC,
    temperatureAnomalyC: meanTemperatureC - WARM_SEASON_BASELINE_TEMP_C,
    heatwaveDaysPerSeason: round(heatwaveDaysPerSeason, 1),
    tropicalNightsPerSeason: round(tropicalNightsPerSeason, 1),
    monthlyPrecipitationMm,
    precipitationAnomalyRatio,
    heavyRainDaysPerSeason: round(heavyRainDaysPerSeason, 1)
  };
}

export async function fetchNasaPowerSignals(coordinates: Coordinates): Promise<PartialSignals> {
  const seasonRange = getLatestCompleteWarmSeasonRange();
  const seasons = await Promise.all(seasonRange.ranges.map((range) => fetchNasaPowerSeason(coordinates, range)));
  const temp = seasons.reduce<number[]>((values, season) => values.concat(season.temp), []);
  const precipitation = seasons.reduce<number[]>((values, season) => values.concat(season.precipitation), []);
  const solar = seasons.reduce<number[]>((values, season) => values.concat(season.solar), []);
  const meanTemperatureC = averageOrUndefined(temp, TEMPERATURE_RANGE);
  const precipitationTotal = sumOrUndefined(precipitation, PRECIPITATION_RANGE);
  const solarKwhM2Day = averageOrUndefined(solar, SOLAR_RANGE);
  const signals: PartialSignals = {};

  if (meanTemperatureC !== undefined) signals.meanTemperatureC = meanTemperatureC;
  if (precipitationTotal !== undefined) {
    signals.monthlyPrecipitationMm = clamp(precipitationTotal / (seasonRange.years * WARM_SEASON_MONTHS), 0, 1500);
  }
  if (solarKwhM2Day !== undefined) signals.solarKwhM2Day = solarKwhM2Day;

  return signals;
}

export async function fetchWorldBankSignals(countryCode: string): Promise<PartialSignals> {
  const indicators = ['SP.POP.TOTL', 'SP.URB.TOTL.IN.ZS'];
  const [population, urbanRatio] = await Promise.all(
    indicators.map((indicator) => fetchWorldBankLatest(countryCode, indicator))
  );

  return {
    population: cleanNumber(population, { min: 1, max: 100_000_000 }) ?? undefined,
    urbanPopulationRatio:
      cleanNumber(urbanRatio, WORLD_BANK_PERCENT_RANGE) != null ? Number(urbanRatio) / 100 : undefined
  };
}

export async function fetchOpenMeteoAirQuality(coordinates: Coordinates): Promise<PartialSignals> {
  // Open-Meteo 空氣品質 API：免金鑰提供 PM2.5（CAMS 全球/歐洲）。
  const params = new URLSearchParams({
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
    hourly: 'pm2_5',
    past_days: '7',
    timezone: 'auto',
    cell_selection: 'land'
  });

  const response = await fetchWithTimeout(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`);
  if (!response.ok) throw new Error(`Open-Meteo Air Quality failed: ${response.status}`);

  const data = await response.json();
  const pm25Values: number[] = Array.isArray(data.hourly?.pm2_5) ? data.hourly.pm2_5 : [];
  const pm25UgM3 = averageOrUndefined(pm25Values, PM25_RANGE);
  return pm25UgM3 !== undefined ? { pm25UgM3 } : {};
}

export async function fetchOpenAqSignals(coordinates: Coordinates, apiKey?: string): Promise<PartialSignals> {
  if (!apiKey) return {};

  const params = new URLSearchParams({
    coordinates: `${coordinates.latitude},${coordinates.longitude}`,
    radius: '25000',
    limit: '20'
  });

  const response = await fetchWithTimeout(`https://api.openaq.org/v3/locations?${params}`, {
    headers: {
      'X-API-Key': apiKey
    }
  });
  if (!response.ok) throw new Error(`OpenAQ failed: ${response.status}`);

  const data = await response.json();
  const pm25Values: number[] = [];

  for (const location of data.results ?? []) {
    for (const sensor of location.sensors ?? []) {
      const parameterName = String(sensor.parameter?.name ?? '').toLowerCase();
      if (parameterName === 'pm25' || parameterName === 'pm2.5') {
        const value = sensor.latest?.value;
        if (typeof value === 'number') pm25Values.push(value);
      }
    }
  }

  const pm25UgM3 = averageOrUndefined(pm25Values, PM25_RANGE);
  return pm25UgM3 !== undefined ? { pm25UgM3 } : {};
}

export async function fetchSdgIndicatorList(): Promise<Array<{ code: string; description: string }>> {
  const response = await fetchWithTimeout('https://unstats.un.org/SDGAPI/v1/sdg/Indicator/List');
  if (!response.ok) throw new Error(`UNSD SDG API failed: ${response.status}`);

  const data = await response.json();
  return (Array.isArray(data) ? data : []).slice(0, 120).map((entry: Record<string, unknown>) => ({
    code: String(entry.code ?? entry.codeIndicator ?? ''),
    description: String(entry.description ?? entry.desc ?? '')
  }));
}

async function fetchOpenMeteoSeason(
  coordinates: Coordinates,
  range: WarmSeasonSlice
): Promise<{
  dailyMeanTemps: number[];
  dailyMaxTemps: number[];
  dailyMinTemps: number[];
  dailyRain: number[];
}> {
  const params = new URLSearchParams({
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
    start_date: range.start,
    end_date: range.end,
    daily: 'temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum',
    timezone: 'auto',
    cell_selection: 'land'
  });

  const response = await fetchWithTimeout(`https://archive-api.open-meteo.com/v1/archive?${params}`);
  if (!response.ok) throw new Error(`Open-Meteo ${range.year} failed: ${response.status}`);

  const data = await response.json();

  return {
    dailyMeanTemps: data.daily?.temperature_2m_mean ?? [],
    dailyMaxTemps: data.daily?.temperature_2m_max ?? [],
    dailyMinTemps: data.daily?.temperature_2m_min ?? [],
    dailyRain: data.daily?.precipitation_sum ?? []
  };
}

async function fetchNasaPowerSeason(
  coordinates: Coordinates,
  range: WarmSeasonSlice
): Promise<{
  temp: number[];
  precipitation: number[];
  solar: number[];
}> {
  const params = new URLSearchParams({
    parameters: 'T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN',
    community: 'RE',
    longitude: String(coordinates.longitude),
    latitude: String(coordinates.latitude),
    start: toPowerDateFromIso(range.start),
    end: toPowerDateFromIso(range.end),
    format: 'JSON'
  });

  const response = await fetchWithTimeout(`https://power.larc.nasa.gov/api/temporal/daily/point?${params}`);
  if (!response.ok) throw new Error(`NASA POWER ${range.year} failed: ${response.status}`);

  const data = await response.json();
  const parameters = data.properties?.parameter ?? {};

  return {
    temp: Object.values(parameters.T2M ?? {}) as number[],
    precipitation: Object.values(parameters.PRECTOTCORR ?? {}) as number[],
    solar: Object.values(parameters.ALLSKY_SFC_SW_DWN ?? {}) as number[]
  };
}

async function fetchWorldBankLatest(countryCode: string, indicator: string): Promise<number | null> {
  const params = new URLSearchParams({
    format: 'json',
    per_page: '8',
    MRV: '8'
  });

  const response = await fetchWithTimeout(
    `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicator}?${params}`
  );
  if (!response.ok) throw new Error(`World Bank failed: ${response.status}`);

  const data = await response.json();
  const rows = Array.isArray(data?.[1]) ? data[1] : [];
  const latest = rows.find((row: Record<string, unknown>) => typeof row.value === 'number');
  return latest?.value as number | null;
}

function average(values: number[], fallback: number, range?: NumericRange): number {
  const valid = cleanNumbers(values, range);
  if (valid.length === 0) return fallback;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function sum(values: number[], fallback: number, range?: NumericRange): number {
  const valid = cleanNumbers(values, range);
  if (valid.length === 0) return fallback;
  return valid.reduce((total, value) => total + value, 0);
}

function averageOrUndefined(values: number[], range?: NumericRange): number | undefined {
  const valid = cleanNumbers(values, range);
  if (valid.length === 0) return undefined;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function sumOrUndefined(values: number[], range?: NumericRange): number | undefined {
  const valid = cleanNumbers(values, range);
  if (valid.length === 0) return undefined;
  return valid.reduce((total, value) => total + value, 0);
}

function countDaysAtOrAbove(values: number[], threshold: number, range?: NumericRange): number {
  return cleanNumbers(values, range).filter((value) => value >= threshold).length;
}

function cleanNumbers(values: number[], range?: NumericRange): number[] {
  return values
    .map((value) => cleanNumber(value, range))
    .filter((value): value is number => value !== undefined);
}

function cleanNumber(value: unknown, range?: NumericRange): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  if (value <= -900) return undefined;
  if (range && (value < range.min || value > range.max)) return undefined;
  return value;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 0): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: init.signal ?? controller.signal
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

function getLatestCompleteWarmSeasonRange(now = new Date()): WarmSeasonRange {
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth() + 1;
  const endYear = currentMonth >= 11 ? currentYear : currentYear - 1;
  const startYear = endYear - WARM_SEASON_YEARS + 1;
  const ranges = Array.from({ length: WARM_SEASON_YEARS }, (_, index) => {
    const year = startYear + index;
    return {
      year,
      start: `${year}-05-01`,
      end: `${year}-10-31`
    };
  });

  return {
    ranges,
    years: WARM_SEASON_YEARS,
    startYear,
    endYear
  };
}

function toPowerDateFromIso(isoDate: string): string {
  return isoDate.replace(/-/g, '');
}
