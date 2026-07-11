import { getTurnsRemaining } from '../../game/content/missions';
import type { ClimateDataSourceStatus } from '../../game/data/climateDataService';
import { POLICIES } from '../../game/simulation/policies';
import type { CityState } from '../../game/simulation/types';
import {
  commandBar, districtChip, metric, missionPanel, yearFeed
} from './hudComponents';
import { dataTutorialOverlay } from './hudDataPanels';
import { positiveTone, riskTone } from './hudFormat';
import {
  briefingOverlay, challengeGuideOverlay, districtGuideOverlay, endingOverlay,
  evidenceOverlay, missionGuideOverlay, policyBoardOverlay, policyDetailOverlay,
  resolutionGuideOverlay, yearTransitionOverlay
} from './hudOverlays';
import type { DataLayerId } from '../../render/objects/CityWorld';
import type { SspScenarioId } from '../../game/simulation/scenarios';
import type { QualityTier } from '../../render/app/quality';

const DATA_LAYERS: Array<{ id: DataLayerId; label: string }> = [
  { id: 'none', label: '一般' },
  { id: 'heat', label: '熱暴露' },
  { id: 'flood', label: '淹水' },
  { id: 'air', label: '空污' },
  { id: 'uhi', label: 'UHI °C' },
  { id: 'runoff', label: '逕流' }
];

type GuidePanel = 'mission' | 'challenge' | 'district' | 'resolution';
type DataLoadStatus = 'idle' | 'loading' | 'ready' | 'error';
type ClimateSignalKey = keyof CityState['climateSignals'];

export interface HudController {
  getState: () => CityState;
  onStartMission: () => void;
  onApplyPolicy: (policyId: string) => void;
  onAdvanceYear: () => void;
  onLoadLiveData: () => void;
  getDataLoadStatus: () => DataLoadStatus;
  getDataLoadError: () => string | undefined;
  getDataSourceStatuses: () => ClimateDataSourceStatus[];
  isDataTutorialOpen: () => boolean;
  onOpenDataTutorial: () => void;
  onCloseDataTutorial: () => void;
  onSelectDistrict: (districtId: string) => void;
  onResetMission: () => void;
  isAudioEnabled: () => boolean;
  isYearProcessing: () => boolean;
  onSkipYearTransition: () => void;
  onToggleAudio: () => void;
  getDataLayer: () => DataLayerId;
  onSelectDataLayer: (layer: DataLayerId) => void;
  onSelectScenario: (scenario: SspScenarioId) => void;
  onToggleEvidence: (evidenceId: string) => void;
  getQualityTier: () => QualityTier;
  onToggleQuality: () => void;
  onRestartGame: () => void;
  /** 開局/結算時選擇副本任務。 */
  onSelectMission: (index: number) => void;
  /** 結算後返回副本選單。 */
  onBackToMissionSelect: () => void;
}

export interface Hud {
  render: () => void;
  dispose: () => void;
}

export function createHud(root: HTMLElement, controller: HudController): Hud {
  root.className = 'hud-root';
  root.tabIndex = -1;

  let selectedPolicyId: string | undefined;
  let guidePanel: GuidePanel | undefined;
  let policyBoardOpen = false;
  let evidenceOpen = false;

  root.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const policyButton = target.closest<HTMLElement>('[data-policy]');
    const districtButton = target.closest<HTMLElement>('[data-district]');
    const guideButton = target.closest<HTMLElement>('[data-open-guide]');
    const confirmButton = target.closest<HTMLElement>('[data-confirm-policy]');

    const evidenceButton = target.closest<HTMLElement>('[data-toggle-evidence]');
    if (evidenceButton?.dataset.toggleEvidence) {
      controller.onToggleEvidence(evidenceButton.dataset.toggleEvidence);
      return;
    }

    if (target.closest('[data-skip-transition]')) {
      controller.onSkipYearTransition();
      return;
    }

    if (target.closest('[data-open-policy-board]')) {
      policyBoardOpen = true;
      render();
      return;
    }

    if (target.closest('[data-close-policy-board]')) {
      policyBoardOpen = false;
      render();
      return;
    }

    if (target.closest('[data-restart-game]')) {
      controller.onRestartGame();
      return;
    }

    if (target.closest('[data-toggle-quality]')) {
      controller.onToggleQuality();
      return;
    }

    const missionButton = target.closest<HTMLElement>('[data-mission]');
    if (missionButton?.dataset.mission !== undefined) {
      controller.onSelectMission(Number(missionButton.dataset.mission));
      return;
    }

    if (target.closest('[data-pick-mission]')) {
      controller.onBackToMissionSelect();
      return;
    }

    const layerButton = target.closest<HTMLElement>('[data-layer]');
    if (layerButton?.dataset.layer) {
      controller.onSelectDataLayer(layerButton.dataset.layer as DataLayerId);
      return;
    }

    const scenarioButton = target.closest<HTMLElement>('[data-scenario]');
    if (scenarioButton?.dataset.scenario) {
      controller.onSelectScenario(scenarioButton.dataset.scenario as SspScenarioId);
      return;
    }

    if (target.closest('[data-open-evidence]')) {
      evidenceOpen = true;
      render();
      return;
    }

    if (target.closest('[data-close-evidence]')) {
      evidenceOpen = false;
      render();
      return;
    }

    if (target.closest('[data-close-policy]')) {
      selectedPolicyId = undefined;
      render();
      return;
    }

    if (target.closest('[data-close-guide]')) {
      guidePanel = undefined;
      render();
      return;
    }

    if (target.closest('[data-open-data-guide]')) {
      controller.onOpenDataTutorial();
      return;
    }

    if (target.closest('[data-close-data-guide]')) {
      controller.onCloseDataTutorial();
      return;
    }

    if (target.closest('[data-reset-mission]')) {
      selectedPolicyId = undefined;
      guidePanel = undefined;
      policyBoardOpen = false;
      controller.onResetMission();
      return;
    }

    if (target.closest('[data-start-mission]')) {
      controller.onStartMission();
      return;
    }

    if (confirmButton?.dataset.confirmPolicy) {
      selectedPolicyId = undefined;
      controller.onApplyPolicy(confirmButton.dataset.confirmPolicy);
      return;
    }

    if (policyButton?.dataset.policy) {
      selectedPolicyId = policyButton.dataset.policy;
      render();
      return;
    }

    if (isGuidePanel(guideButton?.dataset.openGuide)) {
      guidePanel = guideButton.dataset.openGuide;
      render();
      return;
    }

    if (districtButton?.dataset.district) {
      controller.onSelectDistrict(districtButton.dataset.district);
      return;
    }

    if (target.closest('[data-advance]')) {
      controller.onAdvanceYear();
      return;
    }

    if (target.closest('[data-toggle-audio]')) {
      controller.onToggleAudio();
      return;
    }

    if (target.closest('[data-live-data]')) {
      controller.onLoadLiveData();
    }
  });

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      selectedPolicyId = undefined;
      guidePanel = undefined;
      policyBoardOpen = false;
      evidenceOpen = false;
      render();
    }
  };
  window.addEventListener('keydown', onKeyDown);

  const render = () => {
    const state = controller.getState();
    const selectedDistrict =
      state.districts.find((district) => district.id === state.selectedDistrictId) ?? state.districts[0];
    const selectedPolicy = selectedPolicyId
      ? POLICIES.find((policy) => policy.id === selectedPolicyId)
      : undefined;
    const yearProcessing = controller.isYearProcessing();
    const dataLoadStatus = controller.getDataLoadStatus();
    const dataLoadError = controller.getDataLoadError();
    const dataSourceStatuses = controller.getDataSourceStatuses();
    const dataTutorialOpen = controller.isDataTutorialOpen();

    root.innerHTML = `
      <section class="top-hud" aria-label="城市狀態">
        <div class="brand-lockup">
          <span class="brand-mark"></span>
          <div>
            <strong>${state.cityName}</strong>
            <small>${state.year} 年 / ${state.mission.chapter} · 第 ${Math.min(state.turn - state.mission.startTurn + 1, state.mission.turnLimit)} 回合${
              state.mission.turnLimit > 100 ? '（無上限）' : `，共 ${state.mission.turnLimit} 回合`
            }</small>
          </div>
        </div>
        <div class="metric-strip">
          ${metric('預算', state.budget, '百萬', state.budget < 20 ? 'danger' : 'good')}
          ${metric('SDGs', state.sdgScore, '', state.sdgScore >= 70 ? 'good' : 'warn')}
          ${metric('熱風險', state.heatRisk, '', riskTone(state.heatRisk))}
          ${metric('洪水', state.floodRisk, '', riskTone(state.floodRisk))}
          ${metric('空氣', state.airQualityRisk, '', riskTone(state.airQualityRisk))}
          ${metric('健康', state.publicHealth, '', positiveTone(state.publicHealth))}
        </div>
      </section>

      <section class="layer-bar" aria-label="科學資料圖層">
        <span>圖層</span>
        ${DATA_LAYERS.map(
          (layer) =>
            `<button type="button" class="layer-btn ${controller.getDataLayer() === layer.id ? 'active' : ''}" data-layer="${layer.id}" aria-pressed="${controller.getDataLayer() === layer.id}">${layer.label}</button>`
        ).join('')}
        <button type="button" class="layer-btn evidence ${state.evidenceLog.length > 0 ? 'has-evidence' : ''}" data-open-evidence>
          證據抽屜（${state.evidenceLog.length}）
        </button>
        <button type="button" class="layer-btn restart" data-restart-game>重新開始</button>
        <button type="button" class="layer-btn" data-toggle-quality>畫質：${controller.getQualityTier() === 'high' ? '精緻' : '省電'}</button>
        ${dataLayerLegend(controller.getDataLayer())}
      </section>

      ${missionPanel(state)}
      ${yearFeed(state)}
      ${districtChip(state, selectedDistrict)}
      ${commandBar(state, controller.isAudioEnabled(), yearProcessing)}
      ${yearProcessing ? yearTransitionOverlay(state) : ''}
      ${state.mission.status === 'briefing' ? briefingOverlay(state, dataLoadStatus, dataLoadError) : ''}
      ${dataTutorialOpen ? dataTutorialOverlay(state, dataLoadStatus, dataSourceStatuses, dataLoadError) : ''}
      ${state.mission.status === 'won' || state.mission.status === 'lost' ? endingOverlay(state) : ''}
      ${policyBoardOpen ? policyBoardOverlay(state) : ''}
      ${selectedPolicy ? policyDetailOverlay(state, selectedPolicy) : ''}
      ${guidePanel === 'mission' ? missionGuideOverlay(state) : ''}
      ${guidePanel === 'challenge' ? challengeGuideOverlay(state) : ''}
      ${guidePanel === 'district' ? districtGuideOverlay(state, selectedDistrict) : ''}
      ${guidePanel === 'resolution' ? resolutionGuideOverlay(state.lastResolution) : ''}
      ${evidenceOpen ? evidenceOverlay(state) : ''}
    `;

    const modals = root.querySelectorAll<HTMLElement>('.modal-scrim');
    modals.forEach((modal) => {
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
    });
    const activeModal = modals.item(modals.length - 1);
    if (activeModal && !activeModal.contains(document.activeElement)) {
      activeModal.querySelector<HTMLElement>('button:not([disabled]), [tabindex="0"]')?.focus();
    }
  };

  return {
    render,
    dispose: () => window.removeEventListener('keydown', onKeyDown)
  };
}

function dataLayerLegend(layer: DataLayerId): string {
  if (layer === 'none') return '';
  const labels: Record<Exclude<DataLayerId, 'none'>, [string, string]> = {
    heat: ['低熱暴露', '高熱暴露'],
    flood: ['低淹水風險', '高淹水風險'],
    air: ['低空污', '高空污'],
    uhi: ['−7°C', '+9°C'],
    runoff: ['低逕流', '高逕流']
  };
  return `<div class="layer-legend" aria-label="圖層色階"><span>${labels[layer][0]}</span><i></i><span>${labels[layer][1]}</span></div>`;
}

function isGuidePanel(value: string | undefined): value is GuidePanel {
  return value === 'mission' || value === 'challenge' || value === 'district' || value === 'resolution';
}
