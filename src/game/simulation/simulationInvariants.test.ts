import assert from 'node:assert/strict';
import { createInitialCityState } from '../content/cityScenario';
import {
  applyPolicyToState,
  previewPolicyImpact,
  recalculateCityMetrics,
  startMission
} from './advanceTurn';

function derivedSnapshot(state: ReturnType<typeof createInitialCityState>) {
  return {
    emissions: state.emissions,
    heatRisk: state.heatRisk,
    floodRisk: state.floodRisk,
    airQualityRisk: state.airQualityRisk,
    publicHealth: state.publicHealth,
    equity: state.equity,
    publicTrust: state.publicTrust,
    biodiversity: state.biodiversity,
    energySecurity: state.energySecurity,
    educationScore: state.educationScore,
    sdgScore: state.sdgScore,
    districts: state.districts.map((district) => ({
      id: district.id,
      heatExposure: district.heatExposure,
      floodExposure: district.floodExposure,
      airPollution: district.airPollution,
      healthIndex: district.healthIndex,
      resilienceIndex: district.resilienceIndex
    }))
  };
}

console.log('simulation invariant tests:');

const initial = createInitialCityState(undefined, { seed: 20260711 });
const once = recalculateCityMetrics(initial);
const twice = recalculateCityMetrics(once);
assert.deepEqual(derivedSnapshot(twice), derivedSnapshot(once));
console.log('  ✓ derived metrics are idempotent');

const beforePreview = JSON.stringify(once);
previewPolicyImpact(once, 'urban-tree-canopy');
assert.equal(JSON.stringify(once), beforePreview);
console.log('  ✓ policy preview does not mutate authoritative state');

const active = startMission(once);
const protectedCity = applyPolicyToState(active, 'cooling-shelters', 'core');
const protectedCore = protectedCity.districts.find((district) => district.id === 'core');
assert.equal(protectedCore?.healthModifier, 5);
assert.equal(recalculateCityMetrics(protectedCity).districts.find((district) => district.id === 'core')?.healthModifier, 5);
console.log('  ✓ policy health capacity survives recalculation');

assert.equal(protectedCity.appliedPolicies[0]?.missionId, protectedCity.mission.id);
console.log('  ✓ policy logs are scoped to the active chapter');

console.log('\n4 invariant tests passed.');
