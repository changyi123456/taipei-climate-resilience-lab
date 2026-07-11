export type DistrictArchetype =
  | 'coastal'
  | 'downtown'
  | 'river'
  | 'industrial'
  | 'residential'
  | 'upland';

export type GamePhase = 'planning' | 'resolution' | 'complete';

export type MissionStatus = 'briefing' | 'active' | 'won' | 'lost';

export type PolicyCategory =
  | 'cooling'
  | 'flood'
  | 'mobility'
  | 'energy'
  | 'health'
  | 'biodiversity'
  | 'industry'
  | 'governance';

export type PolicyTarget = 'city' | 'district';

export type DistrictMetricKey =
  | 'imperviousness'
  | 'canopyCover'
  | 'transitAccess'
  | 'solarCoverage'
  | 'floodDefense'
  | 'coolingAccess'
  | 'industryLoad'
  | 'healthIndex'
  | 'equityIndex'
  | 'resilienceIndex';

export type CityMetricKey =
  | 'emissions'
  | 'heatRisk'
  | 'floodRisk'
  | 'airQualityRisk'
  | 'publicHealth'
  | 'equity'
  | 'publicTrust'
  | 'biodiversity'
  | 'energySecurity'
  | 'educationScore';

export type SdgId =
  | 'SDG 3'
  | 'SDG 6'
  | 'SDG 7'
  | 'SDG 9'
  | 'SDG 10'
  | 'SDG 11'
  | 'SDG 12'
  | 'SDG 13'
  | 'SDG 15';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ClimateSignals {
  meanTemperatureC: number;
  temperatureAnomalyC: number;
  heatwaveDaysPerSeason: number;
  tropicalNightsPerSeason: number;
  monthlyPrecipitationMm: number;
  precipitationAnomalyRatio: number;
  heavyRainDaysPerSeason: number;
  pm25UgM3: number;
  solarKwhM2Day: number;
  population: number;
  urbanPopulationRatio: number;
}

import type { CellType } from './cells';

export interface DistrictState {
  id: string;
  name: string;
  /** 政策落地後的 4×4 地表格網（科學模型與 3D 呈現的共同來源）。 */
  cells: CellType[];
  archetype: DistrictArchetype;
  population: number;
  elevationM: number;
  imperviousness: number;
  canopyCover: number;
  transitAccess: number;
  solarCoverage: number;
  floodDefense: number;
  coolingAccess: number;
  industryLoad: number;
  heatExposure: number;
  floodExposure: number;
  airPollution: number;
  healthIndex: number;
  equityIndex: number;
  resilienceIndex: number;
  /** 不隨重算漂移的健康基準；政策效果另外記在 healthModifier。 */
  baselineHealthIndex: number;
  /** 政策累積的健康照護能力修正。 */
  healthModifier: number;
  /** 政策累積的街區韌性修正。 */
  resilienceModifier: number;
  /** 都市熱島升溫（°C，相對參考街區）— 科學中間量，供 CER 舉證。 */
  uhiDeltaC?: number;
  /** 逕流係數 0–1 — 科學中間量。 */
  runoffCoefficient?: number;
}

export interface PolicyAction {
  id: string;
  name: string;
  category: PolicyCategory;
  target: PolicyTarget;
  cost: number;
  sdgs: SdgId[];
  summary: string;
  evidencePrompt: string;
  learningFocus: string;
  scienceNote: string;
  classroomPrompt: string;
  effectExplanation: string[];
  /** 需要玩家理解的成本、副作用或執行限制。 */
  tradeoffs?: string[];
  cityEffects?: Partial<Record<CityMetricKey, number>>;
  districtEffects?: Partial<Record<DistrictMetricKey, number>>;
}

export interface AppliedPolicyLog {
  turn: number;
  year: number;
  policyId: string;
  policyName: string;
  missionId?: string;
  targetDistrictId?: string;
  note: string;
}

export interface CivicChallenge {
  id: string;
  title: string;
  body: string;
  scienceNote: string;
  soundCue: 'heat' | 'rain' | 'air' | 'energy' | 'civic';
  pressure: Partial<Record<CityMetricKey, number>>;
}

export type MissionObjectiveMetric =
  | CityMetricKey
  | 'budget'
  | 'coolingInterventions'
  | 'selectedEvidence'
  | 'turn';

export interface MissionObjectiveDefinition {
  id: string;
  label: string;
  metric: MissionObjectiveMetric;
  comparator: '<=' | '>=';
  target: number;
  unit?: string;
  helper: string;
}

export interface MissionObjectiveProgress extends MissionObjectiveDefinition {
  current: number;
  passed: boolean;
}

export interface MissionState {
  id: string;
  chapter: string;
  title: string;
  briefing: string;
  stakes: string;
  turnLimit: number;
  policyLimitPerTurn: number;
  /** 任務開始時的全域回合，讓章節可以保留城市狀態而不重置時間。 */
  startTurn: number;
  status: MissionStatus;
  objectives: MissionObjectiveProgress[];
  advisorName: string;
  advisorRole: string;
  advisorMessage: string;
  debriefTitle?: string;
  debriefBody?: string;
}

export interface TurnResolution {
  year: number;
  title: string;
  summary: string;
  scienceNote: string;
  soundCue: CivicChallenge['soundCue'];
  deltas: Partial<Record<CityMetricKey | 'budget' | 'sdgScore', number>>;
  objectiveSnapshot: MissionObjectiveProgress[];
}

import type { SspScenarioId } from './scenarios';

/** 每回合自動收集的科學證據（CER 舉證素材）。 */
export interface EvidenceEntry {
  id: string;
  turn: number;
  year: number;
  /** 證據種類：氣候訊號、街區科學量、政策效果。 */
  kind: 'climate' | 'district' | 'policy';
  label: string;
  value: string;
  source: string;
}

export interface CityState {
  cityId: string;
  /** 可重現亂數種子（同 seed → 同事件序列，課堂/研究可重現）。 */
  seed: number;
  /** IPCC AR6 SSP 排放情境（驅動逐年氣候演化）。 */
  scenario: SspScenarioId;
  /** 戰役（章節任務線）或沙盒（無限回合自由經營）。 */
  mode: 'campaign' | 'sandbox';
  /** 戰役章節索引（0 起算）。 */
  missionIndex: number;
  /** 戰役已解鎖的最高章節。 */
  unlockedMissionIndex: number;
  /** 已完成章節 ID。 */
  completedMissionIds: string[];
  cityName: string;
  coordinates: Coordinates;
  countryCode: string;
  turn: number;
  maxTurns: number;
  year: number;
  phase: GamePhase;
  budget: number;
  emissions: number;
  heatRisk: number;
  floodRisk: number;
  airQualityRisk: number;
  publicHealth: number;
  equity: number;
  publicTrust: number;
  biodiversity: number;
  energySecurity: number;
  educationScore: number;
  sdgScore: number;
  /** 政策造成的永久城市修正；衍生指標不再寫回自己。 */
  cityModifiers: Partial<Record<CityMetricKey, number>>;
  /** 最近一次年度事件造成的暫時壓力，維持到下一次年度結算。 */
  turnPressure: Partial<Record<CityMetricKey, number>>;
  climateSignals: ClimateSignals;
  selectedDistrictId: string;
  currentChallenge: CivicChallenge;
  mission: MissionState;
  lastResolution?: TurnResolution;
  districts: DistrictState[];
  appliedPolicies: AppliedPolicyLog[];
  eventLog: string[];
  /** CER 證據抽屜：每回合自動收集的科學證據。 */
  evidenceLog: EvidenceEntry[];
  /** 玩家主動選入 CER 論證的證據。 */
  selectedEvidenceIds: string[];
}
