import type { CityState } from '../simulation/types';

const SAVE_KEY = 'climate-resilience-lab/save/v2';
const LEGACY_SAVE_KEY = 'climate-resilience-lab/save/v1';
const SCHEMA_VERSION = 2;
const CONTENT_VERSION = '2026.07-campaign';

interface SaveEnvelope {
  schemaVersion: number;
  contentVersion: string;
  savedAt: string;
  state: CityState;
}

export function saveGame(state: CityState): void {
  try {
    const envelope: SaveEnvelope = {
      schemaVersion: SCHEMA_VERSION,
      contentVersion: CONTENT_VERSION,
      savedAt: new Date().toISOString(),
      state
    };
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(envelope));
  } catch {
    // 私密模式或容量不足時維持遊戲，不讓存檔問題中斷課堂。
  }
}

export function loadGame(): CityState | undefined {
  try {
    const current = window.localStorage.getItem(SAVE_KEY);
    if (current) {
      const envelope = JSON.parse(current) as Partial<SaveEnvelope>;
      if (envelope.schemaVersion === SCHEMA_VERSION && envelope.state) {
        return migrateState(envelope.state);
      }
    }

    const legacy = window.localStorage.getItem(LEGACY_SAVE_KEY);
    if (!legacy) return undefined;
    return migrateState(JSON.parse(legacy) as CityState);
  } catch {
    return undefined;
  }
}

export function clearSave(): void {
  try {
    window.localStorage.removeItem(SAVE_KEY);
    window.localStorage.removeItem(LEGACY_SAVE_KEY);
  } catch {
    // noop
  }
}

function migrateState(input: CityState): CityState | undefined {
  if (
    typeof input?.seed !== 'number' ||
    !input.scenario ||
    !input.mission ||
    !Array.isArray(input.districts) ||
    !Array.isArray(input.districts[0]?.cells)
  ) {
    return undefined;
  }

  const mission = {
    ...input.mission,
    startTurn: input.mission.startTurn ?? 1,
    advisorName: input.mission.advisorName ?? '城市科學委員會',
    advisorRole: input.mission.advisorRole ?? '跨領域顧問團隊',
    advisorMessage: input.mission.advisorMessage ?? '先觀察風險分布，再用證據決定資源要放在哪裡。'
  };

  return {
    ...input,
    mission,
    mode: input.mode ?? 'campaign',
    missionIndex: input.missionIndex ?? 0,
    unlockedMissionIndex: input.unlockedMissionIndex ?? input.missionIndex ?? 0,
    completedMissionIds: [...(input.completedMissionIds ?? [])],
    cityModifiers: { ...(input.cityModifiers ?? {}) },
    turnPressure: { ...(input.turnPressure ?? {}) },
    evidenceLog: (input.evidenceLog ?? []).map((entry, index) => ({
      ...entry,
      id: entry.id ?? `legacy-${entry.year}-${entry.kind}-${index}`
    })),
    selectedEvidenceIds: [...(input.selectedEvidenceIds ?? [])],
    appliedPolicies: (input.appliedPolicies ?? []).map((entry) => ({
      ...entry,
      missionId: entry.missionId ?? mission.id
    })),
    districts: input.districts.map((district) => ({
      ...district,
      cells: [...district.cells],
      baselineHealthIndex: district.baselineHealthIndex ?? district.healthIndex,
      healthModifier: district.healthModifier ?? 0,
      resilienceModifier: district.resilienceModifier ?? 0
    }))
  };
}
