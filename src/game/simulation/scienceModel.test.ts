/**
 * scienceModel.test.ts — 以文獻數值驗證科學引擎（無框架，node 直接執行）。
 * 執行：npx tsx src/game/simulation/scienceModel.test.ts
 */
import assert from 'node:assert';
import {
  airHazardFromAqi,
  aqiFromPm25,
  computeDistrictScience,
  getAqiCategory,
  getClimateHazardLayer,
  heatHealthBurden,
  HEAT_HEALTH_THRESHOLD,
  UHI_CANOPY_C_PER_FRACTION,
  UHI_IMPERV_C_PER_FRACTION
} from './scienceModel';
import type { ClimateSignals, DistrictState } from './types';

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

const baseClimate: ClimateSignals = {
  meanTemperatureC: 28.4,
  temperatureAnomalyC: 1.4,
  heatwaveDaysPerSeason: 18,
  tropicalNightsPerSeason: 64,
  monthlyPrecipitationMm: 265,
  precipitationAnomalyRatio: 1.18,
  heavyRainDaysPerSeason: 8,
  pm25UgM3: 14.8,
  solarKwhM2Day: 3.78,
  population: 2_490_000,
  urbanPopulationRatio: 0.95
};

const baseDistrict: DistrictState = {
  id: 't',
  name: 'test',
  cells: new Array(16).fill('pavement'),
  archetype: 'residential',
  population: 100_000,
  elevationM: 10,
  imperviousness: 0.5,
  canopyCover: 0.2,
  transitAccess: 0.5,
  solarCoverage: 0.2,
  floodDefense: 0.4,
  coolingAccess: 0.45,
  industryLoad: 0.2,
  heatExposure: 0,
  floodExposure: 0,
  airPollution: 0,
  healthIndex: 65,
  equityIndex: 58,
  resilienceIndex: 0,
  baselineHealthIndex: 65,
  healthModifier: 0,
  resilienceModifier: 0
};

console.log('scienceModel tests:');

// 1. EPA AQI breakpoint 對齊官方端點值
check('AQI: PM2.5 9.0 → 50 (Good 上界)', () => assert.strictEqual(aqiFromPm25(9.0), 50));
check('AQI: PM2.5 35.4 → 100 (Moderate 上界)', () => assert.strictEqual(aqiFromPm25(35.4), 100));
check('AQI: PM2.5 55.4 → 150', () => assert.strictEqual(aqiFromPm25(55.4), 150));
check('AQI: PM2.5 125.4 → 200', () => assert.strictEqual(aqiFromPm25(125.4), 200));
check('AQI: 線性誤用已修正 (12µg ≠ 12*2.1)', () => assert.notStrictEqual(aqiFromPm25(12), Math.round(12 * 2.1)));

// 2. UHI 升溫實證靈敏度：樹冠 +10% 應使 UHI 約 −2.5°C
check('UHI: 樹冠 +10% → ΔuhiDeltaC ≈ −2.5°C', () => {
  const a = computeDistrictScience(baseDistrict, getClimateHazardLayer(baseClimate));
  const greener = computeDistrictScience(
    { ...baseDistrict, canopyCover: baseDistrict.canopyCover + 0.1 },
    getClimateHazardLayer(baseClimate)
  );
  const delta = greener.uhiDeltaC - a.uhiDeltaC;
  assert.ok(Math.abs(delta - -2.5) < 0.01, `expected ≈ -2.5, got ${delta}`);
  assert.strictEqual(UHI_CANOPY_C_PER_FRACTION, 25.0);
});

// 3. 不透水 +10% → UHI 約 +1.87°C
check('UHI: 不透水 +10% → ΔuhiDeltaC ≈ +1.87°C', () => {
  const a = computeDistrictScience(baseDistrict, getClimateHazardLayer(baseClimate));
  const paved = computeDistrictScience(
    { ...baseDistrict, imperviousness: baseDistrict.imperviousness + 0.1 },
    getClimateHazardLayer(baseClimate)
  );
  const delta = paved.uhiDeltaC - a.uhiDeltaC;
  assert.ok(Math.abs(delta - 1.87) < 0.01, `expected ≈ 1.87, got ${delta}`);
  assert.strictEqual(UHI_IMPERV_C_PER_FRACTION, 18.7);
});

// 4. 逕流係數：合理化公式範圍
check('逕流: 不透水 0.5 → C ≈ 0.475', () => {
  const r = computeDistrictScience(baseDistrict, getClimateHazardLayer(baseClimate));
  assert.ok(Math.abs(r.runoffCoefficient - 0.475) < 0.01, `got ${r.runoffCoefficient}`);
});
check('逕流: 全鋪面 → C 接近 0.9', () => {
  const r = computeDistrictScience(
    { ...baseDistrict, imperviousness: 1 },
    getClimateHazardLayer(baseClimate)
  );
  assert.ok(r.runoffCoefficient >= 0.85, `got ${r.runoffCoefficient}`);
});

// 5. 方向性：更綠的街區熱暴露應更低
check('方向: 增加樹冠 → 熱暴露下降', () => {
  const a = computeDistrictScience(baseDistrict, getClimateHazardLayer(baseClimate));
  const greener = computeDistrictScience(
    { ...baseDistrict, canopyCover: 0.45 },
    getClimateHazardLayer(baseClimate)
  );
  assert.ok(greener.heatExposure < a.heatExposure);
});

// 6. 全部分數落在 0–100
check('範圍: 所有分數 0–100', () => {
  const r = computeDistrictScience(baseDistrict, getClimateHazardLayer(baseClimate));
  for (const v of [r.heatExposure, r.floodExposure, r.airPollution, r.healthIndex, r.resilienceIndex]) {
    assert.ok(v >= 0 && v <= 100, `out of range: ${v}`);
  }
});

// 7. Hazard / Vulnerability 分層：冷房可及性不應改變 UHI ΔT（°C 為物理量）
check('分層: coolingAccess 不影響 uhiDeltaC，但降低熱暴露', () => {
  const hazard = getClimateHazardLayer(baseClimate);
  const a = computeDistrictScience(baseDistrict, hazard);
  const cooler = computeDistrictScience({ ...baseDistrict, coolingAccess: 0.85 }, hazard);
  assert.strictEqual(cooler.uhiDeltaC, a.uhiDeltaC, 'uhiDeltaC 應為純物理量');
  assert.ok(cooler.heatExposure < a.heatExposure, '冷房應透過脆弱度降低熱暴露');
});

// 8. AQI 官方類別映射
check('AQI 類別: 40 → Good, 120 → USG', () => {
  assert.strictEqual(getAqiCategory(40).name, 'Good');
  assert.strictEqual(getAqiCategory(120).name, 'Unhealthy for Sensitive Groups');
});
check('AQI 危害分數: 類別邊界單調且 50→20 / 150→60', () => {
  assert.ok(Math.abs(airHazardFromAqi(50) - 20) < 0.5);
  assert.ok(Math.abs(airHazardFromAqi(150) - 60) < 0.5);
  assert.ok(airHazardFromAqi(80) > airHazardFromAqi(40));
});

// 9. 熱-健康非線性（Gasparrini 2015 曲線形狀：凸性）
check('熱-健康: 門檻以下無額外負荷，超過後凸性上升', () => {
  assert.strictEqual(heatHealthBurden(HEAT_HEALTH_THRESHOLD - 5), 0);
  const low = heatHealthBurden(55) - heatHealthBurden(45);
  const high = heatHealthBurden(95) - heatHealthBurden(85);
  assert.ok(high > low, '相同增量在高暴露區的健康負荷應更大（凸性）');
});

console.log(`\n${passed} tests passed.`);
