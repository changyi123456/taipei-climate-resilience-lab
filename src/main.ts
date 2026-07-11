import './styles.css';
import { createGameAudio } from './audio/gameAudio';
import { createInitialCityState } from './game/content/cityScenario';
import { getChallengeForMissionTurn } from './game/content/cityScenario';
import { getClimateDataBundle } from './game/data/climateDataService';
import type { ClimateDataSourceStatus } from './game/data/climateDataService';
import { CAMPAIGN_LENGTH, createCampaignMission, createSandboxMission } from './game/content/missions';
import {
  advanceYear,
  applyPolicyToState,
  recalculateCityMetrics,
  replaceClimateSignals,
  startMission,
  toggleEvidenceSelection
} from './game/simulation/advanceTurn';
import type { CityState } from './game/simulation/types';
import { clearSave, loadGame, saveGame } from './game/save/saveGame';
import type { SspScenarioId } from './game/simulation/scenarios';
import { createGameApp } from './render/app/createGameApp';
import type { DataLayerId } from './render/objects/CityWorld';
import { createHud } from './ui/hud/createHud';

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
const hudRoot = document.querySelector<HTMLElement>('#hud-root');

if (!canvas || !hudRoot) {
  throw new Error('Missing game canvas or HUD root.');
}

const savedState = loadGame();
let state: CityState = recalculateCityMetrics(savedState ?? createInitialCityState());
let audioEnabled = false;
let dataLayer: DataLayerId = 'none';
let yearProcessing = false;
let dataLoadStatus: DataLoadStatus = 'idle';
let dataLoadError: string | undefined;
let dataTutorialOpen = false;
let dataSourceStatuses: ClimateDataSourceStatus[] = [];
let transitionTimer = 0;
let transitionToken = 0;
let pendingYearState: CityState | undefined;

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
    const token = ++transitionToken;
    pendingYearState = next;
    app.playYearTransition(before);
    playYearTransitionAudio(before);
    hud.render();

    transitionTimer = window.setTimeout(() => finishYearTransition(before, token), YEAR_TRANSITION_MS);
  },
  onSkipYearTransition: () => {
    if (!yearProcessing) return;
    finishYearTransition(state, transitionToken);
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
  onToggleEvidence: (evidenceId) => setState(toggleEvidenceSelection(state, evidenceId)),
  getQualityTier: () => app.getQuality(),
  onToggleQuality: () => {
    app.setQuality(app.getQuality() === 'high' ? 'low' : 'high');
    hud.render();
  },
  onRestartGame: () => {
    if (!window.confirm('確定要重新開始嗎？目前的城市進度與存檔將被清除。')) return;
    dataLayer = 'none';
    app.setDataLayer('none');
    resetMission();
  },
  onSelectMission: (index) => {
    if (state.mission.status !== 'briefing') return;
    if (index > state.unlockedMissionIndex) return;
    if (audioEnabled) audio.playSelect();
    const mission = createCampaignMission(state.seed, index, state.turn);
    setState({
      ...state,
      missionIndex: index,
      mission,
      selectedEvidenceIds: [],
      currentChallenge: getChallengeForMissionTurn(mission.id, state.seed, state.turn)
    });
  },
  onBackToMissionSelect: () => {
    if (audioEnabled) audio.playSelect();
    if (state.mission.status === 'won' && state.missionIndex >= CAMPAIGN_LENGTH - 1) {
      const mission = createSandboxMission(state.turn);
      setState({
        ...state,
        mode: 'sandbox',
        phase: 'planning',
        mission,
        lastResolution: undefined,
        selectedEvidenceIds: [],
        turnPressure: {},
        currentChallenge: getChallengeForMissionTurn(mission.id, state.seed, state.turn)
      });
      return;
    }

    if (state.mission.status === 'won') {
      const nextIndex = Math.min(CAMPAIGN_LENGTH - 1, state.missionIndex + 1);
      const mission = createCampaignMission(state.seed, nextIndex, state.turn);
      setState(recalculateCityMetrics({
        ...state,
        missionIndex: nextIndex,
        mission,
        phase: 'planning',
        budget: state.budget + 22,
        lastResolution: undefined,
        selectedEvidenceIds: [],
        turnPressure: {},
        currentChallenge: getChallengeForMissionTurn(mission.id, state.seed, state.turn),
        eventLog: [`戰役推進至${mission.chapter}：市議會核撥 22 百萬章節預算。`, ...state.eventLog].slice(0, 10)
      }));
      return;
    }

    retryCurrentMission();
  }
});

hud.render();
app.start();
window.addEventListener('beforeunload', () => {
  cancelYearTransition();
  hud.dispose();
  app.dispose();
  audio.dispose();
}, { once: true });

function finishYearTransition(before: CityState, token: number): void {
  if (!yearProcessing || token !== transitionToken || !pendingYearState) return;
  window.clearTimeout(transitionTimer);
  const next = {
    ...pendingYearState,
    selectedDistrictId: state.selectedDistrictId
  };
  pendingYearState = undefined;
  yearProcessing = false;

  if (audioEnabled && next.lastResolution) audio.startAmbience(next.currentChallenge.soundCue);
  if (audioEnabled && before.mission.status !== next.mission.status) {
    if (next.mission.status === 'won') audio.playSuccess();
    if (next.mission.status === 'lost') audio.playFailure();
  }
  setState(next);
}

function cancelYearTransition(): void {
  transitionToken += 1;
  window.clearTimeout(transitionTimer);
  pendingYearState = undefined;
  yearProcessing = false;
}

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
  cancelYearTransition();
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

function retryCurrentMission(): void {
  cancelYearTransition();
  const base = recalculateCityMetrics(
    createInitialCityState(undefined, { seed: state.seed, scenario: state.scenario })
  );
  const mission = createCampaignMission(base.seed, state.missionIndex, base.turn);
  setState({
    ...base,
    missionIndex: state.missionIndex,
    unlockedMissionIndex: state.unlockedMissionIndex,
    completedMissionIds: [...state.completedMissionIds],
    mission,
    currentChallenge: getChallengeForMissionTurn(mission.id, base.seed, base.turn)
  });
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
