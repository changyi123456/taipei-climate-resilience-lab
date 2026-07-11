import { CIVIC_CHALLENGES, getChallengeForMissionTurn } from '../content/cityScenario';
import { startMission as startMissionFlow, updateMissionProgress } from '../content/missions';
import { convertCellsForPolicy, deriveSurface } from './cells';
import { clamp, clamp01, round, weightedAverage } from './math';
import { getPolicy } from './policies';
import { getScenario } from './scenarios';
import { computeDistrictScience, getClimateHazardLayer } from './scienceModel';
import type {
  CityMetricKey,
  CityState,
  ClimateSignals,
  DistrictMetricKey,
  DistrictState,
  PolicyAction,
  TurnResolution
} from './types';

// 面積型參數由政策所改變的地表格網聚合，玩家不直接編輯地格。
const DISTRICT_SURFACE_KEYS = ['imperviousness', 'canopyCover', 'solarCoverage'] as const;

const DISTRICT_UNIT_KEYS: DistrictMetricKey[] = [
  'transitAccess',
  'floodDefense',
  'coolingAccess',
  'industryLoad'
];

const DISTRICT_SCORE_KEYS: DistrictMetricKey[] = ['healthIndex', 'equityIndex', 'resilienceIndex'];

const CITY_SCORE_KEYS: CityMetricKey[] = [
  'emissions',
  'heatRisk',
  'floodRisk',
  'airQualityRisk',
  'publicHealth',
  'equity',
  'publicTrust',
  'biodiversity',
  'energySecurity',
  'educationScore'
];

const CITY_BASELINES: Record<CityMetricKey, number> = {
  emissions: 72,
  heatRisk: 0,
  floodRisk: 0,
  airQualityRisk: 0,
  publicHealth: 0,
  equity: 0,
  publicTrust: 62,
  biodiversity: 43,
  energySecurity: 55,
  educationScore: 42
};

const PREVIEW_KEYS = [
  'budget',
  'sdgScore',
  'heatRisk',
  'floodRisk',
  'airQualityRisk',
  'publicHealth',
  'equity'
] as const;

export type PreviewMetricKey = (typeof PREVIEW_KEYS)[number];

export interface PolicyPreview {
  policyId: string;
  affordable: boolean;
  canAffordBudget: boolean;
  missionActive: boolean;
  remainingActions: number;
  targetName: string;
  deltas: Record<PreviewMetricKey, number>;
}

export function startMission(state: CityState): CityState {
  return recalculateCityMetrics(startMissionFlow(state));
}

export function getPoliciesUsedThisTurn(state: CityState): number {
  return state.appliedPolicies.filter(
    (entry) => entry.turn === state.turn && entry.year === state.year && entry.missionId === state.mission.id
  ).length;
}

export function getPoliciesRemainingThisTurn(state: CityState): number {
  return Math.max(0, state.mission.policyLimitPerTurn - getPoliciesUsedThisTurn(state));
}

export function applyPolicyToState(
  state: CityState,
  policyId: string,
  districtId = state.selectedDistrictId
): CityState {
  if (state.phase === 'complete') return state;

  if (state.mission.status === 'briefing') {
    return appendLog(state, '請先啟動任務，再審議政策。');
  }

  if (state.mission.status !== 'active') {
    return appendLog(state, '目前任務不在進行中。');
  }

  const policy = getPolicy(policyId);
  if (!policy) {
    return appendLog(state, `找不到政策：${policyId}`);
  }

  if (getPoliciesRemainingThisTurn(state) <= 0) {
    return appendLog(state, `本回合政策上限已用完。請進入下一年後再審議新的政策。`);
  }

  if (state.budget < policy.cost) {
    return appendLog(state, `預算不足，無法投資「${policy.name}」。`);
  }

  const before = state;
  let next = applyPolicyEffects(state, policy, districtId);
  const targetDistrictName = getTargetDistrictName(next, policy, districtId);
  const preview = comparePolicyDeltas(before, next);

  next = {
    ...next,
    lastResolution: undefined,
    appliedPolicies: [
      {
        turn: next.turn,
        year: next.year,
        policyId: policy.id,
        policyName: policy.name,
        missionId: next.mission.id,
        targetDistrictId: policy.target === 'district' ? districtId : undefined,
        note: `${targetDistrictName}: ${policy.evidencePrompt}`
      },
      ...next.appliedPolicies
    ].slice(0, 12),
    eventLog: [
      `${next.year}: 已投資「${policy.name}」於${targetDistrictName}。`,
      formatPolicyImpact(preview),
      ...next.eventLog
    ].slice(0, 10)
  };

  return updateMissionProgress(next, { allowCompletion: false });
}

export function previewPolicyImpact(
  state: CityState,
  policyId: string,
  districtId = state.selectedDistrictId
): PolicyPreview | undefined {
  const policy = getPolicy(policyId);
  if (!policy) return undefined;

  const next = applyPolicyEffects(state, policy, districtId);
  const remainingActions = getPoliciesRemainingThisTurn(state);
  const canAffordBudget = state.budget >= policy.cost;
  const missionActive = state.mission.status === 'active';

  return {
    policyId,
    affordable: canAffordBudget && remainingActions > 0 && missionActive && state.phase !== 'complete',
    canAffordBudget,
    missionActive,
    remainingActions,
    targetName: getTargetDistrictName(state, policy, districtId),
    deltas: comparePolicyDeltas(state, next)
  };
}

export function advanceYear(state: CityState): CityState {
  if (state.phase === 'complete') return state;

  if (state.mission.status === 'briefing') {
    return appendLog(state, '請先啟動任務，再進入下一年。');
  }

  const before = state;
  const resolvedChallenge = state.currentChallenge;
  let next = cloneState(state);

  next.turnPressure = { ...resolvedChallenge.pressure };

  next.budget = round(next.budget + 18 + next.publicTrust * 0.04 - next.emissions * 0.03);
  next.year += 1;
  next.turn += 1;
  next.phase = 'planning';

  // 逐年氣候演化由 IPCC AR6 SSP 情境查表驅動（見 scenarios.ts）。
  // 科學說明：單一城市的減排幾乎不影響全球溫度（減緩是全球集體行動），
  // 因此溫度/極端事件趨勢不再由本市排放回饋；
  // 但 PM2.5 為「區域」污染物，本地排放仍影響本地空品（保留耦合）。
  const scenario = getScenario(next.scenario);
  next.climateSignals = {
    ...next.climateSignals,
    meanTemperatureC: round(next.climateSignals.meanTemperatureC + scenario.warmingPerYearC, 2),
    temperatureAnomalyC: round(next.climateSignals.temperatureAnomalyC + scenario.warmingPerYearC, 2),
    heatwaveDaysPerSeason: round(next.climateSignals.heatwaveDaysPerSeason + scenario.heatwaveDaysPerYear, 1),
    tropicalNightsPerSeason: round(
      next.climateSignals.tropicalNightsPerSeason + scenario.tropicalNightsPerYear,
      1
    ),
    monthlyPrecipitationMm: round(next.climateSignals.monthlyPrecipitationMm + scenario.monthlyPrecipPerYearMm, 1),
    precipitationAnomalyRatio: round(
      next.climateSignals.precipitationAnomalyRatio + scenario.precipAnomalyPerYear,
      2
    ),
    heavyRainDaysPerSeason: round(next.climateSignals.heavyRainDaysPerSeason + scenario.heavyRainDaysPerYear, 1),
    pm25UgM3: round(Math.max(6, next.climateSignals.pm25UgM3 + next.airQualityRisk / 280 - 0.12), 1)
  };

  next.currentChallenge = getChallengeForMissionTurn(
    next.mission.id,
    next.seed,
    next.turn,
    resolvedChallenge.id
  );
  next = recalculateCityMetrics(next);

  const resolution: TurnResolution = {
    year: next.year,
    title: resolvedChallenge.title,
    summary: resolvedChallenge.body,
    scienceNote: resolvedChallenge.scienceNote,
    soundCue: resolvedChallenge.soundCue,
    deltas: comparePolicyDeltas(before, next),
    objectiveSnapshot: next.mission.objectives
  };

  next = {
    ...next,
    lastResolution: resolution,
    eventLog: [
      `${next.year}: ${resolvedChallenge.title}。${resolvedChallenge.body}`,
      `科學提示：${resolvedChallenge.scienceNote}`,
      formatPolicyImpact(resolution.deltas),
      ...next.eventLog
    ].slice(0, 10),
    evidenceLog: [...collectTurnEvidence(before, next), ...next.evidenceLog].slice(0, 60)
  };

  return updateMissionProgress(next, { allowCompletion: true });
}

export function replaceClimateSignals(state: CityState, signals: ClimateSignals): CityState {
  let next = cloneState(state);
  next.climateSignals = signals;
  next.eventLog = ['已載入 Open-Meteo（含空氣品質 CAMS）/ NASA POWER 的最新可用資料與官方人口統計。', ...next.eventLog].slice(0, 10);
  next = recalculateCityMetrics(next);
  return updateMissionProgress(next, { allowCompletion: false });
}

export function recalculateCityMetrics(state: CityState): CityState {
  let next = cloneState(state);
  next.districts = next.districts.map((district) => recalculateDistrict(district, next.climateSignals));
  const climateScores = getClimateHazardLayer(next.climateSignals);

  next.heatRisk = withCityEffects(next, 'heatRisk', weightedAverage(next.districts, (d) => d.heatExposure, (d) => d.population));
  next.floodRisk = withCityEffects(next, 'floodRisk', weightedAverage(next.districts, (d) => d.floodExposure, (d) => d.population));
  next.airQualityRisk = withCityEffects(next, 'airQualityRisk', weightedAverage(next.districts, (d) => d.airPollution, (d) => d.population));
  next.publicHealth = withCityEffects(next, 'publicHealth', weightedAverage(next.districts, (d) => d.healthIndex, (d) => d.population));
  next.equity = withCityEffects(next, 'equity', weightedAverage(next.districts, (d) => d.equityIndex, (d) => d.population));

  const averageTransit = weightedAverage(next.districts, (d) => d.transitAccess, (d) => d.population);
  const averageSolar = weightedAverage(next.districts, (d) => d.solarCoverage, (d) => d.population);
  const averageCanopy = weightedAverage(next.districts, (d) => d.canopyCover, (d) => d.population);
  const averageIndustry = weightedAverage(next.districts, (d) => d.industryLoad, (d) => d.population);

  next.emissions = withCityEffects(
    next,
    'emissions',
    CITY_BASELINES.emissions + averageIndustry * 1.5 - averageSolar * 4.2 - averageTransit * 1.8 + next.heatRisk * 0.01
  );
  next.biodiversity = withCityEffects(
    next,
    'biodiversity',
    CITY_BASELINES.biodiversity + averageCanopy * 4 - next.floodRisk * 0.02
  );
  next.energySecurity = withCityEffects(
    next,
    'energySecurity',
    CITY_BASELINES.energySecurity + averageSolar * 6 + climateScores.solarOpportunity * 0.04 - next.heatRisk * 0.025
  );
  next.publicTrust = withCityEffects(next, 'publicTrust', CITY_BASELINES.publicTrust);
  next.educationScore = withCityEffects(next, 'educationScore', CITY_BASELINES.educationScore);

  next.sdgScore = round(
    0.17 * next.publicHealth +
      0.14 * next.equity +
      0.12 * next.publicTrust +
      0.12 * next.energySecurity +
      0.12 * next.biodiversity +
      0.11 * (100 - next.heatRisk) +
      0.1 * (100 - next.floodRisk) +
      0.08 * (100 - next.airQualityRisk) +
      0.04 * next.educationScore
  );

  for (const key of CITY_SCORE_KEYS) {
    next[key] = clamp(next[key]);
  }

  next = updateMissionProgress(next, { allowCompletion: false });
  return next;
}

function applyPolicyEffects(state: CityState, policy: PolicyAction, districtId: string): CityState {
  const next = cloneState(state);
  next.budget = round(next.budget - policy.cost);

  if (policy.cityEffects) {
    for (const [key, value] of Object.entries(policy.cityEffects) as [CityMetricKey, number][]) {
      next.cityModifiers[key] = round((next.cityModifiers[key] ?? 0) + value, 2);
    }
  }

  if (policy.target === 'district') {
    const target = next.districts.find((district) => district.id === districtId) ?? next.districts[0];

    if (policy.districtEffects) {
      for (const [key, value] of Object.entries(policy.districtEffects) as [DistrictMetricKey, number][]) {
        if ((DISTRICT_SURFACE_KEYS as readonly string[]).includes(key)) {
          // 政策的面積效果轉成地表變化，供科學模型與 3D 場景共同呈現。
          target.cells = convertCellsForPolicy(
            target.cells,
            key as (typeof DISTRICT_SURFACE_KEYS)[number],
            value,
            next.seed + next.turn * 101
          );
        } else if (DISTRICT_UNIT_KEYS.includes(key)) {
          target[key] = clamp01(target[key] + value);
        }

        if (key === 'healthIndex') {
          target.healthModifier = round(target.healthModifier + value, 2);
        } else if (key === 'resilienceIndex') {
          target.resilienceModifier = round(target.resilienceModifier + value, 2);
        } else if (DISTRICT_SCORE_KEYS.includes(key)) {
          target[key] = clamp(target[key] + value);
        }
      }
    }
  }

  return recalculateCityMetrics(next);
}

function withCityEffects(state: CityState, key: CityMetricKey, base: number): number {
  return clamp(round(base + (state.cityModifiers[key] ?? 0) + (state.turnPressure[key] ?? 0)));
}

export function toggleEvidenceSelection(state: CityState, evidenceId: string): CityState {
  if (!state.evidenceLog.some((entry) => entry.id === evidenceId)) return state;
  const selectedEvidenceIds = state.selectedEvidenceIds.includes(evidenceId)
    ? state.selectedEvidenceIds.filter((id) => id !== evidenceId)
    : [...state.selectedEvidenceIds, evidenceId].slice(-6);
  return updateMissionProgress({ ...state, selectedEvidenceIds }, { allowCompletion: true });
}

function recalculateDistrict(district: DistrictState, climate: ClimateSignals): DistrictState {
  // 地格是政策落地後的地表狀態；面積參數由此聚合。
  // 滯洪水體/避難設施提供防洪與降溫加成（不寫回，避免複利累積）。
  const surface = deriveSurface(district.cells);
  const effective: DistrictState = {
    ...district,
    imperviousness: surface.imperviousness,
    canopyCover: surface.canopyCover,
    solarCoverage: surface.solarCoverage,
    floodDefense: clamp01(district.floodDefense + surface.floodDefenseBonus),
    coolingAccess: clamp01(district.coolingAccess + surface.coolingAccessBonus)
  };

  // 文獻依據的科學引擎：Hazard × Exposure × Vulnerability（見 scienceModel.ts）。
  const hazard = getClimateHazardLayer(climate);
  const science = computeDistrictScience(effective, hazard);

  return {
    ...district,
    imperviousness: surface.imperviousness,
    canopyCover: surface.canopyCover,
    solarCoverage: surface.solarCoverage,
    heatExposure: science.heatExposure,
    floodExposure: science.floodExposure,
    airPollution: science.airPollution,
    healthIndex: science.healthIndex,
    resilienceIndex: science.resilienceIndex,
    uhiDeltaC: science.uhiDeltaC,
    runoffCoefficient: science.runoffCoefficient
  };
}

function comparePolicyDeltas(
  before: CityState,
  after: CityState
): Record<PreviewMetricKey, number> {
  return {
    budget: round(after.budget - before.budget),
    sdgScore: round(after.sdgScore - before.sdgScore),
    heatRisk: round(after.heatRisk - before.heatRisk),
    floodRisk: round(after.floodRisk - before.floodRisk),
    airQualityRisk: round(after.airQualityRisk - before.airQualityRisk),
    publicHealth: round(after.publicHealth - before.publicHealth),
    equity: round(after.equity - before.equity)
  };
}

function formatPolicyImpact(deltas: Record<PreviewMetricKey, number> | Partial<Record<PreviewMetricKey, number>>): string {
  const heat = signed(deltas.heatRisk ?? 0);
  const health = signed(deltas.publicHealth ?? 0);
  const equity = signed(deltas.equity ?? 0);
  const sdg = signed(deltas.sdgScore ?? 0);
  return `影響摘要：熱風險 ${heat}、公共健康 ${health}、公平性 ${equity}、SDGs 綜合分數 ${sdg}。`;
}

function signed(value: number): string {
  if (value > 0) return `+${round(value, 1)}`;
  return String(round(value, 1));
}

/**
 * CER 證據抽屜：每回合自動收集科學證據（資料點 + 來源），
 * 供學生在任務結算時組 Claim-Evidence-Reasoning 論證。
 */
function collectTurnEvidence(before: CityState, after: CityState): CityState['evidenceLog'] {
  const selected =
    after.districts.find((district) => district.id === after.selectedDistrictId) ?? after.districts[0];
  const heatDelta = round(after.heatRisk - before.heatRisk, 1);
  const healthDelta = round(after.publicHealth - before.publicHealth, 1);

  return [
    {
      id: `${after.mission.id}-${after.year}-climate`,
      turn: after.turn,
      year: after.year,
      kind: 'climate' as const,
      label: '暖季均溫 / 熱夜',
      value: `${after.climateSignals.meanTemperatureC}°C / ${after.climateSignals.tropicalNightsPerSeason} 夜`,
      source: `SSP 情境（${after.scenario.toUpperCase()}）+ Open-Meteo / NASA POWER 基準`
    },
    {
      id: `${after.mission.id}-${after.year}-district-${selected.id}`,
      turn: after.turn,
      year: after.year,
      kind: 'district' as const,
      label: `${selected.name} UHI ΔT / 逕流係數`,
      value: `${selected.uhiDeltaC ?? '—'}°C / ${selected.runoffCoefficient ?? '—'}`,
      source: 'Ziter et al. 2019 PNAS（UHI 靈敏度）、合理化公式（逕流）'
    },
    {
      id: `${after.mission.id}-${after.year}-policy`,
      turn: after.turn,
      year: after.year,
      kind: 'policy' as const,
      label: '本年度城市指標變化',
      value: `熱風險 ${heatDelta >= 0 ? '+' : ''}${heatDelta}、公共健康 ${healthDelta >= 0 ? '+' : ''}${healthDelta}`,
      source: '模擬引擎（IPCC AR6 Hazard×Exposure×Vulnerability）'
    }
  ];
}

function getTargetDistrictName(state: CityState, policy: PolicyAction, districtId: string): string {
  if (policy.target === 'city') return '全城市';
  return state.districts.find((district) => district.id === districtId)?.name ?? '未知街區';
}

function appendLog(state: CityState, message: string): CityState {
  const next = cloneState(state);
  next.eventLog = [message, ...next.eventLog].slice(0, 10);
  return next;
}

function cloneState(state: CityState): CityState {
  return {
    ...state,
    currentChallenge: {
      ...state.currentChallenge,
      pressure: { ...state.currentChallenge.pressure }
    },
    mission: {
      ...state.mission,
      objectives: state.mission.objectives.map((objective) => ({ ...objective }))
    },
    lastResolution: state.lastResolution
      ? {
          ...state.lastResolution,
          deltas: { ...state.lastResolution.deltas },
          objectiveSnapshot: state.lastResolution.objectiveSnapshot.map((objective) => ({ ...objective }))
        }
      : undefined,
    climateSignals: { ...state.climateSignals },
    districts: state.districts.map((district) => ({ ...district, cells: [...district.cells] })),
    appliedPolicies: state.appliedPolicies.map((entry) => ({ ...entry })),
    eventLog: [...state.eventLog],
    evidenceLog: state.evidenceLog.map((entry) => ({ ...entry })),
    selectedEvidenceIds: [...state.selectedEvidenceIds],
    completedMissionIds: [...state.completedMissionIds],
    cityModifiers: { ...state.cityModifiers },
    turnPressure: { ...state.turnPressure }
  };
}

export { CIVIC_CHALLENGES };
