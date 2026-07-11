import { getTurnsRemaining } from '../../game/content/missions';
import {
  getPoliciesRemainingThisTurn,
  getPoliciesUsedThisTurn,
  previewPolicyImpact
} from '../../game/simulation/advanceTurn';
import { POLICIES } from '../../game/simulation/policies';
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

export function missionPanel(state: CityState): string {
  const mission = state.mission;
  const turnsLeft = getTurnsRemaining(state);
  const used = getPoliciesUsedThisTurn(state);
  const passed = mission.objectives.filter((objective) => objective.passed).length;

  return `
    <section class="mission-chip mission-panel-open">
      <div>
        <span>${mission.chapter}</span>
        <strong>${mission.title}</strong>
      </div>
      <div class="chip-stats">
        <b>${turnsLeft}</b><small>回合</small>
        <b>${used}/${mission.policyLimitPerTurn}</b><small>政策</small>
        <b>${passed}/${mission.objectives.length}</b><small>目標</small>
      </div>
      <div class="mission-objectives">
        ${mission.objectives.map(compactObjectiveRow).join('')}
      </div>
    </section>
  `;
}

export function yearFeed(state: CityState): string {
  return `
    <section class="year-feed">
      <div class="year-feed-row">
        <div>
          <span>本年意外事件</span>
          <strong>${state.currentChallenge.title}</strong>
        </div>
        <button class="text-link" type="button" data-open-guide="challenge">解析</button>
      </div>
      ${
        state.lastResolution
          ? `<div class="year-feed-row previous">
              <div>
                <span>上一年結算</span>
                <strong>${state.lastResolution.year}: ${state.lastResolution.title}</strong>
              </div>
              <button class="text-link" type="button" data-open-guide="resolution">查看</button>
            </div>`
          : ''
      }
    </section>
  `;
}

export function districtChip(state: CityState, selectedDistrict: DistrictState): string {
  return `
    <section class="district-chip-panel">
      <span>目前街區</span>
      <strong>${selectedDistrict.name}</strong>
      <div class="mini-stat-row">
        ${miniStat('熱', selectedDistrict.heatExposure, false)}
        ${miniStat('水', selectedDistrict.floodExposure, false)}
        ${miniStat('空污', selectedDistrict.airPollution, false)}
        ${miniStat('健康', selectedDistrict.healthIndex, true)}
        ${miniStat('公平', selectedDistrict.equityIndex, true)}
        ${miniStat('韌性', selectedDistrict.resilienceIndex, true)}
      </div>
      <button class="text-link" type="button" data-open-guide="district">街區詳情</button>
      <div class="advisor-brief">
        <span>${state.mission.advisorRole}</span>
        <strong>${state.mission.advisorName}</strong>
        <p>${state.mission.advisorMessage}</p>
      </div>
    </section>
  `;
}

export function commandBar(state: CityState, audioEnabled: boolean, yearProcessing: boolean): string {
  const canAdvance = state.mission.status === 'active' && state.phase !== 'complete' && !yearProcessing;
  const remaining = getPoliciesRemainingThisTurn(state);

  return `
    <section class="command-bar" aria-label="主要行動">
      <div>
        <span>${state.mode === 'sandbox' ? '自由實驗' : '政策審議'}</span>
        <strong>本回合還可確認 ${remaining} 項政策</strong>
      </div>
      <div class="dock-actions">
        <button class="ghost-btn sound-btn ${audioEnabled ? 'enabled' : ''}" type="button" data-toggle-audio>
          ${audioEnabled ? '音效開' : '啟動音效'}
        </button>
        <button class="ghost-btn" type="button" data-open-policy-board ${yearProcessing ? 'disabled' : ''}>打開政策桌</button>
        <button class="primary-btn" type="button" data-advance ${!canAdvance ? 'disabled' : ''}>${yearProcessing ? '模擬中' : '下一年'}</button>
      </div>
    </section>
  `;
}

export function metric(label: string, value: number, unit: string, tone: string): string {
  return `
    <div class="metric ${tone}">
      <span>${label}</span>
      <strong>${Math.round(value)}${unit}</strong>
    </div>
  `;
}

export function policyCard(policy: PolicyAction, state: CityState): string {
  const preview = previewPolicyImpact(state, policy.id);
  const locked = !preview?.affordable;

  return `
    <button class="policy-card ${policy.category} ${locked ? 'locked' : ''}" type="button" data-policy="${policy.id}">
      <span class="policy-cost">${formatMoney(policy.cost)}</span>
      <strong>${policy.name}</strong>
      <small>${formatSdgs(policy.sdgs)}</small>
      <p>${policy.summary}</p>
      <span class="inspect-label">查看政策</span>
      ${
        preview
          ? `<div class="preview-row">
              ${deltaChip('熱風險', preview.deltas.heatRisk, true)}
              ${deltaChip('健康', preview.deltas.publicHealth, false)}
              ${deltaChip('公平', preview.deltas.equity, false)}
              ${deltaChip('SDGs', preview.deltas.sdgScore, false)}
            </div>`
          : ''
      }
    </button>
  `;
}

export function objectiveRow(objective: MissionObjectiveProgress): string {
  return `
    <div class="objective ${objective.passed ? 'passed' : ''}">
      <span>${objective.passed ? '達成' : '追蹤'}</span>
      <strong>${objective.label}</strong>
      <small>目前 ${formatObjectiveValue(objective)}</small>
    </div>
  `;
}

export function compactObjectiveRow(objective: MissionObjectiveProgress): string {
  return `
    <div class="mission-objective ${objective.passed ? 'passed' : ''}">
      <span>${objective.passed ? '達成' : '追蹤'}</span>
      <strong>${objective.label}</strong>
      <small>${formatObjectiveValue(objective)}</small>
    </div>
  `;
}

export function districtStat(label: string, value: number, higherIsBetter: boolean): string {
  const tone = higherIsBetter ? positiveTone(value) : riskTone(value);
  return `
    <div class="district-stat ${tone}">
      <span>${label}</span>
      <strong>${Math.round(value)}</strong>
    </div>
  `;
}

export function miniStat(label: string, value: number, higherIsBetter: boolean): string {
  const tone = higherIsBetter ? positiveTone(value) : riskTone(value);
  return `
    <span class="mini-stat ${tone}">
      ${label}<b>${Math.round(value)}</b>
    </span>
  `;
}

export function districtButton(district: DistrictState, selectedDistrictId: string): string {
  return `
    <button
      type="button"
      class="district-chip ${district.id === selectedDistrictId ? 'selected' : ''}"
      data-district="${district.id}"
    >
      ${district.name}
    </button>
  `;
}

export function deltaChip(label: string, value: number, lowerIsBetter: boolean): string {
  const rounded = Math.round(value * 10) / 10;
  const isGood = lowerIsBetter ? rounded < 0 : rounded > 0;
  const isBad = lowerIsBetter ? rounded > 0 : rounded < 0;
  const tone = isGood ? 'good' : isBad ? 'danger' : 'neutral';
  const sign = rounded > 0 ? '+' : '';

  return `
    <span class="delta-chip ${tone}">
      ${label} ${sign}${rounded}
    </span>
  `;
}

export function getPolicyDisabledReason(state: CityState, policy: PolicyAction): string | undefined {
  const preview = previewPolicyImpact(state, policy.id);
  if (state.mission.status === 'briefing') return '請先開始任務，再確認政策投資。';
  if (state.phase === 'complete') return '任務已結束，請使用重製任務重新開始。';
  if (!preview?.canAffordBudget) return `預算不足：目前剩餘 ${formatMoney(state.budget)}。`;
  if ((preview?.remainingActions ?? 0) <= 0) return '本回合政策額度已用完，請進入下一年。';
  return undefined;
}
