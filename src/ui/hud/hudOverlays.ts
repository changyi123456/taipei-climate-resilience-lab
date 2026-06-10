import type { ClimateDataSourceStatus } from '../../game/data/climateDataService';
import { POLICIES } from '../../game/simulation/policies';
import { SSP_SCENARIOS } from '../../game/simulation/scenarios';
import { MISSION_CATALOG } from '../../game/content/missions';
import {
  getPoliciesRemainingThisTurn,
  getPoliciesUsedThisTurn,
  previewPolicyImpact
} from '../../game/simulation/advanceTurn';
import type {
  CityState,
  DistrictState,
  MissionObjectiveProgress,
  PolicyAction,
  TurnResolution
} from '../../game/simulation/types';
import {
  escapeHtml, formatDecimal, formatLargeNumber, formatMoney, formatObjectiveValue,
  formatPercent, formatSdgs, formatSignedDecimal, isRiskMetric, metricLabel, positiveTone, riskTone
} from './hudFormat';
import {
  commandBar, compactObjectiveRow, deltaChip, districtButton, districtChip, districtStat,
  getPolicyDisabledReason, metric, miniStat, missionPanel, objectiveRow, policyCard, yearFeed
} from './hudComponents';
import {
  climateRiskStoryRows, climateSignalRows, conceptRows, dataBridgeRows, dataSourceRows,
  dataSourceTeaching, dataTutorialOverlay, sourceQualitySummary, sourceStatusBadge,
  sourceStatusSummaryBadges, studentQuestionRows
} from './hudDataPanels';

type DataLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export function yearTransitionOverlay(state: CityState): string {
  const used = getPoliciesUsedThisTurn(state);
  return `
    <section class="year-transition-panel" aria-live="polite">
      <span>年度模擬中</span>
      <strong>政策施工與意外事件正在城市中發生</strong>
      <div class="year-transition-track">
        <i></i>
      </div>
      <p>正在執行 ${used} 項政策，接著結算本年度意外事件。</p>
    </section>
  `;
}

export function policyBoardOverlay(state: CityState): string {
  return `
    <section class="modal-scrim policy-board-scrim">
      <article class="policy-board-panel">
        <button class="close-btn" type="button" aria-label="關閉政策桌" data-close-policy-board>x</button>
        <span>政策審議桌</span>
        <h1>先閱讀，再確認投資</h1>
        <p>預算以百萬計算。每回合最多確認 ${state.mission.policyLimitPerTurn} 項政策，目前還可確認 ${getPoliciesRemainingThisTurn(state)} 項。</p>
        <div class="policy-row">
          ${POLICIES.map((policy) => policyCard(policy, state)).join('')}
        </div>
      </article>
    </section>
  `;
}

export function briefingOverlay(state: CityState, dataStatus: DataLoadStatus, dataError?: string): string {
  const mission = state.mission;
  const isLoading = dataStatus === 'loading';
  const isReady = dataStatus === 'ready';
  const hasError = dataStatus === 'error';

  return `
    <section class="modal-scrim">
      <div class="briefing-card">
        <span>${mission.chapter}</span>
        <h1>${mission.title}</h1>
        <p>${mission.briefing}</p>
        <p>${mission.stakes}</p>
        <div class="briefing-objectives">
          ${mission.objectives.map((objective) => `<div>${objective.label}</div>`).join('')}
        </div>
        <div class="scenario-picker">
          <strong>選擇副本任務</strong>
          <p>四個獨立副本，各自考驗不同的氣候調適策略。隨時可重新開始換副本。</p>
          <div class="mission-options">
            ${MISSION_CATALOG.map(
              (entry) => `
                <button type="button" class="scenario-option ${state.missionIndex === entry.index ? 'active' : ''}" data-mission="${entry.index}">
                  <strong>${entry.title}</strong>
                  <p>${entry.blurb}</p>
                </button>
              `
            ).join('')}
          </div>
        </div>
        <div class="scenario-picker">
          <strong>選擇全球排放情境（IPCC AR6 SSP）</strong>
          <p>城市減排無法改變全球溫度——「減緩」是全球集體行動，「調適」才是城市能掌握的。情境決定逐年升溫與極端事件趨勢。</p>
          <div class="scenario-options">
            ${SSP_SCENARIOS.map(
              (scenario) => `
                <button type="button" class="scenario-option ${state.scenario === scenario.id ? 'active' : ''}" data-scenario="${scenario.id}">
                  <strong>${scenario.shortName}</strong>
                  <small>+${scenario.warmingPerYearC.toFixed(3)}°C/年</small>
                  <p>${scenario.description}</p>
                </button>
              `
            ).join('')}
          </div>
        </div>
        <div class="briefing-data-note ${hasError ? 'error' : isReady ? 'ready' : ''}">
          <strong>${isReady ? '資料來源已整理' : hasError ? '資料載入失敗' : '任務開始前需先載入公開資料'}</strong>
          <p>
            ${
              isReady
                ? '開始前請先閱讀資料來源、載入狀態、指標意義與模擬判讀方式，理解數據如何連到後面的政策任務。'
                : hasError
                  ? `目前無法完成資料載入：${dataError ?? '未知錯誤'}。請確認網路後重試。`
                  : '系統會呼叫 Open-Meteo、NASA POWER（搭配內政部人口統計與 OpenAQ 選用），整理成台北城市韌性任務的起始數據。'
            }
          </p>
        </div>
        <div class="briefing-actions">
          ${
            isReady
              ? `<button class="ghost-btn large" type="button" data-open-data-guide>查看資料解讀</button>
                 <button class="primary-btn large" type="button" data-start-mission>我已理解，開始任務</button>`
              : `<button class="primary-btn large" type="button" data-live-data ${isLoading ? 'disabled' : ''}>
                  ${isLoading ? '資料載入中...' : hasError ? '重新載入公開資料' : '載入公開資料與前置教學'}
                </button>`
          }
        </div>
      </div>
    </section>
  `;
}

export function endingOverlay(state: CityState): string {
  const won = state.mission.status === 'won';
  const mission = state.mission;

  return `
    <section class="modal-scrim">
      <div class="briefing-card ending ${won ? 'won' : 'lost'}">
        <span>${won ? '任務成功' : '任務失敗'}</span>
        <h1>${mission.debriefTitle ?? mission.title}</h1>
        <p>${mission.debriefBody ?? ''}</p>
        <div class="briefing-objectives">
          ${mission.objectives.map(objectiveRow).join('')}
        </div>
        <div class="briefing-actions">
          <button class="primary-btn large" type="button" data-pick-mission>選擇其他副本</button>
          <button class="ghost-btn large" type="button" data-restart-game>重新開始整場遊戲</button>
        </div>
      </div>
    </section>
  `;
}

export function policyDetailOverlay(state: CityState, policy: PolicyAction): string {
  const preview = previewPolicyImpact(state, policy.id);
  const disabledReason = getPolicyDisabledReason(state, policy);
  const canConfirm = !disabledReason && preview?.affordable;

  return `
    <section class="modal-scrim policy-scrim">
      <article class="policy-detail-card ${policy.category}">
        <button class="close-btn" type="button" aria-label="關閉政策詳情" data-close-policy>x</button>
        <span class="policy-kicker">${formatSdgs(policy.sdgs)}</span>
        <h1>${policy.name}</h1>
        <p class="policy-lead">${policy.summary}</p>
        <div class="policy-detail-meta">
          <div><span>花費</span><strong>${formatMoney(policy.cost)}</strong></div>
          <div><span>投資範圍</span><strong>${preview?.targetName ?? '目前街區'}</strong></div>
          <div><span>學習焦點</span><strong>${policy.learningFocus}</strong></div>
        </div>

        <div class="policy-detail-grid">
          <section>
            <h2>這項政策在科學上做了什麼？</h2>
            <p>${policy.scienceNote}</p>
            <h2>為什麼會影響數值？</h2>
            <ul>
              ${policy.effectExplanation.map((item) => `<li>${item}</li>`).join('')}
            </ul>
          </section>
          <section>
            <h2>投資後預估變化</h2>
            <div class="delta-board">
              ${preview ? deltaChip('預算', preview.deltas.budget, false) : ''}
              ${preview ? deltaChip('熱風險', preview.deltas.heatRisk, true) : ''}
              ${preview ? deltaChip('洪水風險', preview.deltas.floodRisk, true) : ''}
              ${preview ? deltaChip('空氣風險', preview.deltas.airQualityRisk, true) : ''}
              ${preview ? deltaChip('公共健康', preview.deltas.publicHealth, false) : ''}
              ${preview ? deltaChip('公平性', preview.deltas.equity, false) : ''}
              ${preview ? deltaChip('SDGs', preview.deltas.sdgScore, false) : ''}
            </div>
            <div class="classroom-prompt">
              <span>課堂討論</span>
              <p>${policy.classroomPrompt}</p>
            </div>
          </section>
        </div>

        <div class="policy-confirm-row">
          <p>${disabledReason ?? `確認後會花費 ${formatMoney(policy.cost)}，本回合政策額度會減少 1。`}</p>
          <button class="primary-btn large" type="button" data-confirm-policy="${policy.id}" ${canConfirm ? '' : 'disabled'}>
            確認投資
          </button>
        </div>
      </article>
    </section>
  `;
}

/** CER 證據抽屜：列出每回合自動收集的科學證據與來源。 */
export function evidenceOverlay(state: CityState): string {
  const entries = state.evidenceLog;
  const kindLabel = { climate: '氣候訊號', district: '街區科學量', policy: '指標變化' } as const;

  return `
    <section class="modal-scrim">
      <article class="guide-card evidence-card">
        <button class="close-btn" type="button" aria-label="關閉證據抽屜" data-close-evidence>x</button>
        <span>CER 證據抽屜</span>
        <h1>你的科學證據（${entries.length} 筆）</h1>
        <p>每進入新的一年，系統會自動記錄關鍵科學量與資料來源。任務結束時，用這些證據完成你的主張（Claim）—證據（Evidence）—推理（Reasoning）論證。</p>
        ${
          entries.length === 0
            ? '<p class="science-note">還沒有證據。啟動任務並推進年度後，證據會自動出現在這裡。</p>'
            : `<div class="evidence-list">
                ${entries
                  .map(
                    (entry) => `
                      <div class="evidence-entry ${entry.kind}">
                        <small>${entry.year} 年 · ${kindLabel[entry.kind]}</small>
                        <strong>${escapeHtml(entry.label)}</strong>
                        <p>${escapeHtml(entry.value)}</p>
                        <em>來源：${escapeHtml(entry.source)}</em>
                      </div>
                    `
                  )
                  .join('')}
              </div>`
        }
        <p class="science-note">
          提示：好的 Reasoning 會說明「為什麼這個證據支持你的主張」——例如用 UHI ΔT 的°C 變化解釋為何先在市中心種樹，而不是只說「數字變好了」。
        </p>
      </article>
    </section>
  `;
}

export function missionGuideOverlay(state: CityState): string {
  const mission = state.mission;

  return `
    <section class="modal-scrim">
      <article class="guide-card">
        <button class="close-btn" type="button" aria-label="關閉任務教材" data-close-guide>x</button>
        <span>任務教材</span>
        <h1>${mission.title}</h1>
        <p>${mission.stakes}</p>
        <div class="guide-grid">
          ${mission.objectives
            .map(
              (objective) => `
                <div class="guide-tile ${objective.passed ? 'passed' : ''}">
                  <strong>${objective.label}</strong>
                  <p>${objective.helper}</p>
                  <small>目前 ${formatObjectiveValue(objective)}</small>
                </div>
              `
            )
            .join('')}
        </div>
        <p class="science-note">
          遊戲重點：政策不是魔法按鈕。每個數值都來自暴露、脆弱度、可近性與基礎設施的關係。學生要練習先提出證據，再做取捨。
        </p>
      </article>
    </section>
  `;
}

export function challengeGuideOverlay(state: CityState): string {
  const challenge = state.currentChallenge;

  return `
    <section class="modal-scrim">
      <article class="guide-card">
        <button class="close-btn" type="button" aria-label="關閉事件解析" data-close-guide>x</button>
        <span>事件解析</span>
        <h1>${challenge.title}</h1>
        <p>${challenge.body}</p>
        <p class="science-note">${challenge.scienceNote}</p>
        <div class="delta-board">
          ${Object.entries(challenge.pressure)
            .map(([key, value]) => deltaChip(metricLabel(key), value, isRiskMetric(key)))
            .join('')}
        </div>
      </article>
    </section>
  `;
}

export function districtGuideOverlay(state: CityState, selectedDistrict: DistrictState): string {
  return `
    <section class="modal-scrim">
      <article class="guide-card district-guide-card">
        <button class="close-btn" type="button" aria-label="關閉街區詳情" data-close-guide>x</button>
        <span>街區詳情</span>
        <h1>${selectedDistrict.name}</h1>
        <div class="district-grid expanded">
          ${districtStat('熱暴露', selectedDistrict.heatExposure, false)}
          ${districtStat('淹水暴露', selectedDistrict.floodExposure, false)}
          ${districtStat('空污暴露', selectedDistrict.airPollution, false)}
          ${districtStat('健康', selectedDistrict.healthIndex, true)}
          ${districtStat('公平', selectedDistrict.equityIndex, true)}
          ${districtStat('韌性', selectedDistrict.resilienceIndex, true)}
        </div>
        <div class="district-tabs expanded">
          ${state.districts.map((district) => districtButton(district, state.selectedDistrictId)).join('')}
        </div>
      </article>
    </section>
  `;
}

export function resolutionGuideOverlay(resolution?: TurnResolution): string {
  if (!resolution) return '';

  return `
    <section class="modal-scrim">
      <article class="guide-card">
        <button class="close-btn" type="button" aria-label="關閉年度結算" data-close-guide>x</button>
        <span>年度結算</span>
        <h1>${resolution.year}: ${resolution.title}</h1>
        <p>${resolution.summary}</p>
        <p class="science-note">科學解析：${resolution.scienceNote}</p>
        <div class="delta-board">
          ${deltaChip('熱風險', resolution.deltas.heatRisk ?? 0, true)}
          ${deltaChip('公共健康', resolution.deltas.publicHealth ?? 0, false)}
          ${deltaChip('公平性', resolution.deltas.equity ?? 0, false)}
          ${deltaChip('SDGs', resolution.deltas.sdgScore ?? 0, false)}
          ${deltaChip('預算', resolution.deltas.budget ?? 0, false)}
        </div>
      </article>
    </section>
  `;
}
