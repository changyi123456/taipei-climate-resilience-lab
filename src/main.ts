import './styles.css';
import { createGameAudio } from './audio/gameAudio';
import { createInitialCityState } from './game/content/cityScenario';
import { getClimateDataBundle } from './game/data/climateDataService';
import type { ClimateDataSourceStatus } from './game/data/climateDataService';
import { createCampaignMission } from './game/content/missions';
import {
  advanceYear,
  applyPolicyToState,
  recalculateCityMetrics,
  replaceClimateSignals,
  startMission
} from './game/simulation/advanceTurn';
import type { CityState } from './game/simulation/types';
import type { SspScenarioId } from './game/simulation/scenarios';
import { createGameApp } from './render/app/createGameApp';
import type { DataLayerId } from './render/objects/CityWorld';
import { createHud } from './ui/hud/createHud';

const SAVE_KEY = 'climate-resilience-lab/save/v1';

/** 自動存檔：state 為純資料物件，可直接序列化。 */
function saveGame(state: CityState): void {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    /* 私密模式或容量不足時靜默略過 */
  }
}

function loadGame(): CityState | undefined {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as CityState;
    // 舊版存檔缺少新欄位時視為無效（避免半套狀態）。
    if (
      typeof parsed.seed !== 'number' ||
      !parsed.scenario ||
      !Array.isArray(parsed.evidenceLog) ||
      !parsed.mode ||
      typeof parsed.missionIndex !== 'number' ||
      !Array.isArray(parsed.districts?.[0]?.cells)
    ) {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

function clearSave(): void {
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    /* noop */
  }
}

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
const hudRoot = document.querySelector<HTMLElement>('#hud-root');

if (!canvas || !hudRoot) {
  throw new Error('Missing game canvas or HUD root.');
}

const savedState = loadGame();
let state: CityState = savedState ?? recalculateCityMetrics(createInitialCityState());
let audioEnabled = false;
let dataLayer: DataLayerId = 'none';
let yearProcessing = false;
let dataLoadStatus: DataLoadStatus = 'idle';
let dataLoadError: string | undefined;
let dataTutorialOpen = false;
let dataSourceStatuses: ClimateDataSourceStatus[] = [];

const YEAR_TRANSITION_MS = 5000;

type DataLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

const audio = createGameAudio();
const app = createGameApp(canvas, state, {
  onSelectDistrict: (districtId) => selectDistrict(districtId)
});

const hud = createHud(hudRoot, {
  getState: () => state,
  onStartMission: () => {
    if (dataLoadStatus !== 'ready') {
      void loadLiveData();
      return;
    }

    dataTutorialOpen = false;
    const next = startMission(state);
    enableAudio(next.currentChallenge.soundCue);
    audio.startAmbience(next.currentChallenge.soundCue);
    audio.playEvent(next.currentChallenge.soundCue);
    setState(next);
  },
  onApplyPolicy: (policyId) => {
    if (yearProcessing) return;
    const beforeCount = state.appliedPolicies.length;
    const next = applyPolicyToState(state, policyId);
    if (audioEnabled && next.appliedPolicies.length > beforeCount) {
      audio.playPolicy();
    } else if (audioEnabled) {
      audio.playSelect();
    }
    setState(next);
  },
  onAdvanceYear: () => {
    if (yearProcessing) return;

    const before = state;
    const next = advanceYear(before);
    if (next === before || before.mission.status !== 'active') {
      setState(next);
      return;
    }

    yearProcessing = true;
    app.playYearTransition(before);
    playYearTransitionAudio(before);
    hud.render();

    window.setTimeout(() => {
      yearProcessing = false;

      if (audioEnabled && next.lastResolution) {
        audio.startAmbience(next.currentChallenge.soundCue);
      }

      if (audioEnabled && before.mission.status !== next.mission.status) {
        if (next.mission.status === 'won') audio.playSuccess();
        if (next.mission.status === 'lost') audio.playFailure();
      }

      setState(next);
    }, YEAR_TRANSITION_MS);
  },
  onSelectDistrict: (districtId) => selectDistrict(districtId),
  onResetMission: () => resetMission(),
  isAudioEnabled: () => audioEnabled,
  isYearProcessing: () => yearProcessing,
  onToggleAudio: () => toggleAudio(),
  onLoadLiveData: () => {
    if (audioEnabled) audio.playSelect();
    void loadLiveData();
  },
  getDataLoadStatus: () => dataLoadStatus,
  getDataLoadError: () => dataLoadError,
  getDataSourceStatuses: () => dataSourceStatuses,
  isDataTutorialOpen: () => dataTutorialOpen,
  onOpenDataTutorial: () => {
    dataTutorialOpen = true;
    hud.render();
  },
  onCloseDataTutorial: () => {
    dataTutorialOpen = false;
    hud.render();
  },
  getDataLayer: () => dataLayer,
  onSelectDataLayer: (layer) => {
    dataLayer = layer;
    if (audioEnabled) audio.playSelect();
    app.setDataLayer(layer);
    hud.render();
  },
  onSelectScenario: (scenario: SspScenarioId) => {
    if (state.mission.status !== 'briefing') return;
    if (audioEnabled) audio.playSelect();
    setState({ ...state, scenario });
  },
  onRestartGame: () => {
    if (!window.confirm('確定要重新開始嗎？目前的城市進度與存檔將被清除。')) return;
    dataLayer = 'none';
    app.setDataLayer('none');
    resetMission();
  },
  onSelectMission: (index) => {
    if (state.mission.status !== 'briefing') return;
    if (audioEnabled) audio.playSelect();
    setState({
      ...state,
      missionIndex: index,
      mission: createCampaignMission(state.seed, index)
    });
  },
  onBackToMissionSelect: () => {
    // 結算後返回副本選單：城市重置（保留 seed 與情境），任務回到簡報待選狀態。
    if (audioEnabled) audio.playSelect();
    const base = recalculateCityMetrics(
      createInitialCityState(undefined, { seed: state.seed, scenario: state.scenario })
    );
    setState({
      ...base,
      missionIndex: state.missionIndex,
      mission: createCampaignMission(base.seed, state.missionIndex)
    });
  }
});

hud.render();
app.start();

async function loadLiveData(): Promise<void> {
  if (dataLoadStatus === 'loading') return;

  dataLoadStatus = 'loading';
  dataLoadError = undefined;
  dataTutorialOpen = false;
  dataSourceStatuses = [];

  setState({
    ...state,
    eventLog: ['正在載入 Open-Meteo（含空氣品質）/ NASA POWER 公開資料與官方人口統計，並整理成任務起始數據。', ...state.eventLog].slice(0, 10)
  });

  try {
    const bundle = await getClimateDataBundle(state, {
      useNetwork: true,
      openAqApiKey: getEnv('VITE_OPENAQ_API_KEY')
    });
    dataSourceStatuses = bundle.sources;
    dataLoadStatus = 'ready';
    dataTutorialOpen = true;
    setState({
      ...replaceClimateSignals(state, bundle.signals),
      eventLog: ['資料來源已整理，請先閱讀資料科普與來源狀態再開始任務。', ...state.eventLog].slice(0, 10)
    });
  } catch (error) {
    dataLoadStatus = 'error';
    dataLoadError = String(error);
    dataTutorialOpen = false;
    dataSourceStatuses = [];
    setState({
      ...state,
      eventLog: [`公開資料載入失敗，請稍後重試。原因：${String(error)}`, ...state.eventLog].slice(0, 10)
    });
  }
}

function selectDistrict(districtId: string): void {
  if (audioEnabled) audio.playSelect();
  setState({
    ...state,
    selectedDistrictId: districtId,
    eventLog: [
      `已選擇 ${state.districts.find((district) => district.id === districtId)?.name ?? districtId}。`,
      ...state.eventLog
    ].slice(0, 10)
  });
}

function resetMission(): void {
  clearSave();
  yearProcessing = false;
  dataLoadStatus = 'idle';
  dataLoadError = undefined;
  dataTutorialOpen = false;
  dataSourceStatuses = [];
  const next = recalculateCityMetrics(createInitialCityState());
  if (audioEnabled) {
    audio.startAmbience(next.currentChallenge.soundCue);
    audio.playEvent('civic');
  }
  setState(next);
}

function toggleAudio(): void {
  audioEnabled = !audioEnabled;
  audio.setMuted(!audioEnabled);

  if (audioEnabled) {
    audio.startAmbience(state.currentChallenge.soundCue);
    audio.playEvent('civic');
  }

  hud.render();
}

function enableAudio(cue: CityState['currentChallenge']['soundCue']): void {
  audioEnabled = true;
  audio.setMuted(false);
  audio.startAmbience(cue);
}

function setState(nextState: CityState): void {
  state = nextState;
  saveGame(state);
  app.update(state);
  hud.render();
}

function playYearTransitionAudio(before: CityState): void {
  if (!audioEnabled) return;

  const policiesThisTurn = before.appliedPolicies
    .filter((entry) => entry.turn === before.turn)
    .slice()
    .reverse();

  policiesThisTurn.forEach((_, index) => {
    window.setTimeout(() => audio.playPolicy(), 260 + index * 720);
  });

  const hazardDelay = Math.max(1200, 680 + policiesThisTurn.length * 720);
  window.setTimeout(() => audio.playEvent(before.currentChallenge.soundCue), hazardDelay);
}

function getEnv(key: string): string | undefined {
  return import.meta.env[key];
}
