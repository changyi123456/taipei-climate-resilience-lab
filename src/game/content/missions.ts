import { round } from '../simulation/math';
import type {
  CityState,
  MissionObjectiveDefinition,
  MissionObjectiveMetric,
  MissionObjectiveProgress,
  MissionState
} from '../simulation/types';

const HEAT_PROTECTION_POLICY_IDS = new Set([
  'urban-tree-canopy',
  'cooling-shelters',
  'wetland-buffer',
  'citizen-science-network'
]);

interface HeatwaveMissionVariant {
  name: string;
  briefingHook: string;
  heatTarget: number;
  healthTarget: number;
  equityTarget: number;
  budgetTarget: number;
  coolingActionsTarget: number;
  policyLimitPerTurn: number;
}

// 單一標準變體（依使用者需求簡化，不再隨機抽選）。
const HEATWAVE_VARIANTS: HeatwaveMissionVariant[] = [
  {
    name: '標準熱浪警戒',
    briefingHook: '中央氣象單位發布連續高溫警戒，市府要求在四回合內完成降溫、健康與公平三項調適目標。',
    heatTarget: 55,
    healthTarget: 66,
    equityTarget: 58,
    budgetTarget: 10,
    coolingActionsTarget: 2,
    policyLimitPerTurn: 2
  }
];

export function createHeatwaveMission(_seed: number, startTurn = 1): MissionState {
  const variant = HEATWAVE_VARIANTS[0];

  return {
    id: 'heatwave-watch',
    chapter: '第 1 章',
    title: `熱浪警戒：${variant.name}`,
    briefing:
      `${variant.briefingHook} 每回合最多只能審議 ${variant.policyLimitPerTurn} 項政策，請先閱讀政策說明，再決定是否花費預算。`,
    stakes:
      '你扮演城市韌性小組，必須在有限預算與有限行政量能下保護居民。成功不是把所有政策買完，而是用證據判斷哪個區域最需要哪種介入。',
    turnLimit: 4,
    policyLimitPerTurn: variant.policyLimitPerTurn,
    startTurn,
    status: 'briefing',
    advisorName: '林以晴醫師',
    advisorRole: '公共衛生與熱傷害顧問',
    advisorMessage: '平均值會掩蓋風險。先找出熱、人口與降溫可近性同時不利的街區。',
    objectives: buildHeatwaveObjectives(variant).map((objective) => ({
      ...objective,
      current: 0,
      passed: false
    }))
  };
}

// ──────────────────────────────────────────────────────────────────
// 副本任務：四個獨立副本，開局自由選擇（熱浪 / 颱風 / 空污 / 能源）
// ──────────────────────────────────────────────────────────────────

export const CAMPAIGN_LENGTH = 4;

/** 副本目錄（開局選單用）。 */
export const MISSION_CATALOG: ReadonlyArray<{ index: number; title: string; blurb: string }> = [
  { index: 0, title: '熱浪警戒', blurb: '高溫與熱夜衝擊健康與公平，用樹冠、避難網絡與海綿街廓降溫。' },
  { index: 1, title: '颱風洪峰', blurb: '短延時強降雨考驗排水。觀察逕流圖層，布置透水與滯洪設施。' },
  { index: 2, title: '靜風空污', blurb: '靜風期 PM2.5 累積。管制排放、綠運輸與綠帶多管齊下。' },
  { index: 3, title: '能源轉型', blurb: '尖峰用電逼近極限。鋪設太陽能、強化綠運輸，兼顧健康與減排。' }
];

interface CampaignChapter {
  id: string;
  chapter: string;
  title: string;
  briefing: string;
  stakes: string;
  advisorName: string;
  advisorRole: string;
  advisorMessage: string;
  objectives: MissionObjectiveDefinition[];
}

const CAMPAIGN_CHAPTERS: CampaignChapter[] = [
  // 第 1 章由 createHeatwaveMission 動態產生（保留變體機制），此處佔位。
  {
    id: 'heatwave-watch',
    chapter: '第 1 章',
    title: '熱浪警戒',
    briefing: '',
    stakes: '',
    advisorName: '林以晴醫師',
    advisorRole: '公共衛生與熱傷害顧問',
    advisorMessage: '平均值會掩蓋風險。先找出熱、人口與降溫可近性同時不利的街區。',
    objectives: []
  },
  {
    id: 'typhoon-flood',
    chapter: '第 2 章',
    title: '颱風洪峰：海綿城市考驗',
    briefing:
      '颱風季來臨，外圍環流的短延時強降雨將考驗排水系統。河岸與海港低窪區的逕流係數是關鍵——觀察「逕流」圖層，把透水設施放在最需要的地方。',
    stakes: '上一章的降溫投資仍然有效，但這一章雨水不會等你。每回合最多審議 2 項政策，必須在防洪效益、預算與公平之間取捨。',
    advisorName: '陳維港工程師',
    advisorRole: '都市水文與防災顧問',
    advisorMessage: '不要只看總雨量。低窪地、不透水面與防洪缺口重疊的地方，才是洪峰會先擊中的地方。',
    objectives: [
      { id: 'lower-flood', label: '洪水風險 <= 56', metric: 'floodRisk', comparator: '<=', target: 56, helper: '洪水風險由極端降雨（Hazard）×逕流（地表）×防洪設施（Vulnerability）組成。' },
      { id: 'protect-health-2', label: '公共健康 >= 64', metric: 'publicHealth', comparator: '>=', target: 64, helper: '淹水會直接衝擊健康（傷亡、傳染病、心理壓力）。' },
      { id: 'keep-trust', label: '公眾信任 >= 58', metric: 'publicTrust', comparator: '>=', target: 58, helper: '防災溝通與透明決策維持市民信任。' },
      { id: 'keep-budget-2', label: '剩餘預算 >= 10', metric: 'budget', comparator: '>=', target: 10, unit: ' 百萬', helper: '颱風季後還需要修復預算。' },
      { id: 'evidence-2', label: '選入 CER 證據 >= 2', metric: 'selectedEvidence', comparator: '>=', target: 2, helper: '從證據抽屜挑出至少兩筆資料，支持你的防洪主張。' }
    ]
  },
  {
    id: 'stagnant-smog',
    chapter: '第 3 章',
    title: '靜風空污：呼吸保衛戰',
    briefing:
      '秋冬靜風期讓 PM2.5 不易擴散，工業區與交通幹道周邊暴露上升。切換「空污」圖層找出熱點，用排放管制、綠運輸與綠帶吸附多管齊下。',
    stakes: 'AQI 已對齊 EPA 官方類別——讓城市離開橘色（對敏感族群不健康）區間。',
    advisorName: '周若岑老師',
    advisorRole: '環境正義與公民科學顧問',
    advisorMessage: '同一個 AQI 不代表每個人承受相同風險。請把污染源、人口與健康脆弱度放在同一張圖上。',
    objectives: [
      { id: 'lower-air', label: '空氣風險 <= 38', metric: 'airQualityRisk', comparator: '<=', target: 38, helper: '空氣風險由區域 AQI 基準與街區排放源組成。' },
      { id: 'protect-health-3', label: '公共健康 >= 67', metric: 'publicHealth', comparator: '>=', target: 67, helper: 'PM2.5 與呼吸道、心血管疾病有明確的劑量反應關係。' },
      { id: 'lower-emissions', label: '排放 <= 62', metric: 'emissions', comparator: '<=', target: 62, helper: '管制本地排放同時改善空品與碳排。' },
      { id: 'keep-budget-3', label: '剩餘預算 >= 8', metric: 'budget', comparator: '>=', target: 8, unit: ' 百萬', helper: '保留下一章能源轉型的本錢。' },
      { id: 'evidence-3', label: '選入 CER 證據 >= 2', metric: 'selectedEvidence', comparator: '>=', target: 2, helper: '選擇能說明污染暴露與政策效果的證據。' }
    ]
  },
  {
    id: 'energy-transition',
    chapter: '第 4 章',
    title: '能源轉型：尖峰與淨零',
    briefing:
      '連年熱浪推升冷氣用電，電網逼近極限。比較屋頂太陽能、綠運輸與需求管理政策，在不犧牲健康的前提下完成能源轉型。',
    stakes: '最終章：調適與減緩必須同時成立。完成後城市進入自由沙盒。',
    advisorName: '許安哲研究員',
    advisorRole: '能源系統與轉型正義顧問',
    advisorMessage: '太陽能、儲能與需求管理必須一起看；也別讓轉型成本只落在最弱勢的居民身上。',
    objectives: [
      { id: 'energy-secure', label: '能源安全 >= 68', metric: 'energySecurity', comparator: '>=', target: 68, helper: '分散式太陽能降低尖峰時段的電網壓力。' },
      { id: 'deep-cut', label: '排放 <= 52', metric: 'emissions', comparator: '<=', target: 52, helper: '淨零路徑需要運輸、產業、能源同時減排。' },
      { id: 'protect-health-4', label: '公共健康 >= 68', metric: 'publicHealth', comparator: '>=', target: 68, helper: '能源轉型不能以健康為代價。' },
      { id: 'keep-trust-4', label: '公眾信任 >= 60', metric: 'publicTrust', comparator: '>=', target: 60, helper: '轉型正義：讓市民理解並支持轉型的代價與效益。' },
      { id: 'evidence-4', label: '選入 CER 證據 >= 2', metric: 'selectedEvidence', comparator: '>=', target: 2, helper: '用兩筆以上證據說明調適與減緩如何同時成立。' }
    ]
  }
];

/** 建立第 index 個副本任務（index 0 = 熱浪）。 */
export function createCampaignMission(seed: number, index: number, startTurn = 1): MissionState {
  if (index <= 0) return createHeatwaveMission(seed, startTurn);

  const chapter = CAMPAIGN_CHAPTERS[Math.min(index, CAMPAIGN_CHAPTERS.length - 1)];
  return {
    id: chapter.id,
    chapter: chapter.chapter,
    title: chapter.title,
    briefing: chapter.briefing,
    stakes: chapter.stakes,
    turnLimit: 4,
    policyLimitPerTurn: 2,
    startTurn,
    status: 'briefing',
    advisorName: chapter.advisorName,
    advisorRole: chapter.advisorRole,
    advisorMessage: chapter.advisorMessage,
    objectives: chapter.objectives.map((objective) => ({ ...objective, current: 0, passed: false }))
  };
}

export function createSandboxMission(startTurn: number): MissionState {
  return {
    id: 'resilience-sandbox',
    chapter: '自由沙盒',
    title: '台北韌性長期實驗',
    briefing: '四章任務已完成。現在可以自由測試政策組合，並觀察不同 SSP 情境下的長期變化。',
    stakes: '沙盒沒有勝敗，但預算、年度事件與科學模型仍然有效。',
    turnLimit: 999,
    policyLimitPerTurn: 3,
    startTurn,
    status: 'active',
    objectives: [],
    advisorName: '城市科學委員會',
    advisorRole: '跨領域研究團隊',
    advisorMessage: '把每次改造視為實驗：先提出假設，再用圖層與 CER 證據檢查結果。'
  };
}

export function startMission(state: CityState): CityState {
  if (state.mission.status !== 'briefing') return state;

  const next: CityState = {
    ...state,
    mission: {
      ...state.mission,
      status: 'active'
    },
    eventLog: [
      '任務開始：先觀察城市指標與選定街區，再查看政策詳情並確認投資。',
      ...state.eventLog
    ].slice(0, 10)
  };

  return updateMissionProgress(next, { allowCompletion: false });
}

export function updateMissionProgress(
  state: CityState,
  options: { allowCompletion: boolean }
): CityState {
  const mission = state.mission;
  const objectives = mission.objectives.map((objective) => evaluateObjective(state, objective));
  const allPassed = objectives.every((objective) => objective.passed);
  const outOfTime = state.turn - mission.startTurn >= mission.turnLimit;

  let status = mission.status;
  let phase = state.phase;
  let debriefTitle = mission.debriefTitle;
  let debriefBody = mission.debriefBody;

  // 沙盒模式：無目標，永不結束。
  if (objectives.length === 0) {
    return { ...state, mission: { ...mission, objectives } };
  }

  if (options.allowCompletion && status === 'active' && allPassed) {
    status = 'won';
    phase = 'complete';
    debriefTitle = `副本「${mission.title}」達成`;
    debriefBody =
      '本副本目標全部達成！可以挑戰其他副本，比較不同災害需要的調適策略——降溫、防洪、空品與能源其實共用同一套科學框架。';
  } else if (options.allowCompletion && status === 'active' && outOfTime) {
    status = 'lost';
    phase = 'complete';
    debriefTitle = '任務未達標';
    debriefBody = buildFailureDebrief(objectives);
  }

  const completedMissionIds =
    status === 'won' && !state.completedMissionIds.includes(mission.id)
      ? [...state.completedMissionIds, mission.id]
      : state.completedMissionIds;

  return {
    ...state,
    phase,
    completedMissionIds,
    unlockedMissionIndex:
      status === 'won' ? Math.min(CAMPAIGN_LENGTH - 1, Math.max(state.unlockedMissionIndex, state.missionIndex + 1)) : state.unlockedMissionIndex,
    mission: {
      ...mission,
      status,
      objectives,
      debriefTitle,
      debriefBody
    }
  };
}

export function getTurnsRemaining(state: CityState): number {
  return Math.max(0, state.mission.turnLimit - (state.turn - state.mission.startTurn));
}

function buildHeatwaveObjectives(variant: HeatwaveMissionVariant): MissionObjectiveDefinition[] {
  return [
    {
      id: 'lower-heat',
      label: `熱風險 <= ${variant.heatTarget}`,
      metric: 'heatRisk',
      comparator: '<=',
      target: variant.heatTarget,
      helper: '熱風險越高，代表高溫暴露、硬鋪面與降溫不足的壓力越大。'
    },
    {
      id: 'protect-health',
      label: `公共健康 >= ${variant.healthTarget}`,
      metric: 'publicHealth',
      comparator: '>=',
      target: variant.healthTarget,
      helper: '公共健康受到熱暴露、淹水、空污與照護可近性的共同影響。'
    },
    {
      id: 'protect-equity',
      label: `公平性 >= ${variant.equityTarget}`,
      metric: 'equity',
      comparator: '>=',
      target: variant.equityTarget,
      helper: '公平性代表弱勢族群能否同樣取得降溫、交通與資訊服務。'
    },
    {
      id: 'heat-actions',
      label: `降溫介入 >= ${variant.coolingActionsTarget}`,
      metric: 'coolingInterventions',
      comparator: '>=',
      target: variant.coolingActionsTarget,
      helper: '至少完成兩項與熱保護有關的政策，避免只靠單一方案。'
    },
    {
      id: 'keep-budget',
      label: `剩餘預算 >= ${variant.budgetTarget}`,
      metric: 'budget',
      comparator: '>=',
      target: variant.budgetTarget,
      unit: ' 百萬',
      helper: '保留預算代表城市還能面對下一次災害或維護支出。'
    },
    {
      id: 'evidence-heat',
      label: '選入 CER 證據 >= 2',
      metric: 'selectedEvidence',
      comparator: '>=',
      target: 2,
      helper: '從證據抽屜挑出至少兩筆資料，支持你的降溫與公平主張。'
    }
  ];
}

function evaluateObjective(
  state: CityState,
  objective: MissionObjectiveProgress
): MissionObjectiveProgress {
  const current = getObjectiveValue(state, objective.metric);
  const passed = objective.comparator === '>=' ? current >= objective.target : current <= objective.target;

  return {
    ...objective,
    current: round(current, objective.metric === 'coolingInterventions' ? 0 : 1),
    passed
  };
}

function getObjectiveValue(state: CityState, metric: MissionObjectiveMetric): number {
  if (metric === 'budget') return state.budget;
  if (metric === 'turn') return state.turn;
  if (metric === 'coolingInterventions') {
    return state.appliedPolicies.filter(
      (entry) => entry.missionId === state.mission.id && HEAT_PROTECTION_POLICY_IDS.has(entry.policyId)
    ).length;
  }
  if (metric === 'selectedEvidence') return state.selectedEvidenceIds.length;

  return state[metric];
}

function buildFailureDebrief(objectives: MissionObjectiveProgress[]): string {
  const missed = objectives
    .filter((objective) => !objective.passed)
    .map((objective) => objective.label)
    .join('、');

  return `城市已經完成部分調適，但還沒有達成任務門檻。未達標項目：${missed || '無'}。下次可以先閱讀政策詳情，找出哪些政策能直接處理熱暴露、健康或公平性。`;
}
