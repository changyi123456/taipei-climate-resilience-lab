import * as THREE from 'three';
import { CELL_GRID_SIZE, CELL_INFO } from '../../game/simulation/cells';
import { CityDecor } from './CityDecor';
import { clamp } from '../../game/simulation/math';
import { getPolicy } from '../../game/simulation/policies';
import type {
  AppliedPolicyLog,
  CivicChallenge,
  CityState,
  DistrictState,
  PolicyCategory
} from '../../game/simulation/types';
import {
  createGroundTexture, getBuildingCount, getBuildingHeight, getBuildingSpec, getCuePalette,
  getDistrictBaseColor, getEventParticleSettings, getHazardOrigin, getHillsideSurfaceY,
  getLatestPolicyKey, getPolicyCategoryColor, getPolicyFxTargetPosition, getResolutionKey,
  mixColorHex, pseudo, resetEventParticle, resetHazardParticle, resetPolicyParticle,
  DISTRICT_POSITIONS
} from './cityWorldHelpers';
import type { BuildingSpec, CuePalette } from './cityWorldHelpers';

/** 科學資料圖層（SimCity 式 overlay）：街區底色改以單一科學量著色。 */
export type DataLayerId = 'none' | 'heat' | 'flood' | 'air' | 'uhi' | 'runoff';

/** 取街區圖層值並正規化到 0–1（undefined = 不著色）。 */
function getDataLayerValue(district: DistrictState, layer: DataLayerId): number | undefined {
  switch (layer) {
    case 'heat':
      return clamp(district.heatExposure / 100, 0, 1);
    case 'flood':
      return clamp(district.floodExposure / 100, 0, 1);
    case 'air':
      return clamp(district.airPollution / 100, 0, 1);
    case 'uhi':
      // UHI ΔT 大致落在 −7°C ~ +9°C
      return clamp(((district.uhiDeltaC ?? 0) + 7) / 16, 0, 1);
    case 'runoff':
      return clamp((district.runoffCoefficient ?? 0) / 0.95, 0, 1);
    default:
      return undefined;
  }
}

interface DistrictVisual {
  root: THREE.Group;
  base: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
  cellTiles: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>[];
  buildingMaterial: THREE.MeshStandardMaterial;
  windowMaterial: THREE.MeshBasicMaterial;
  streetMaterial: THREE.LineBasicMaterial;
  waterOverlay: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>;
  heatDome: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  selectedOutline: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>;
}

interface ParticleFx {
  group: THREE.Group;
  points: THREE.Points;
  material: THREE.PointsMaterial;
  positions: Float32Array;
}

export class CityWorld {
  readonly root = new THREE.Group();
  readonly pickables: THREE.Object3D[] = [];

  private readonly scene: THREE.Scene;
  private readonly districtVisuals = new Map<string, DistrictVisual>();
  private readonly waterMaterial: THREE.ShaderMaterial;
  private readonly skyMaterial: THREE.ShaderMaterial;
  private readonly hazeMaterial: THREE.PointsMaterial;
  private readonly haze: THREE.Points;
  private readonly eventParticleMaterial: THREE.PointsMaterial;
  private readonly eventParticles: THREE.Points;
  private readonly eventParticlePositions: Float32Array;
  private readonly eventLight: THREE.PointLight;
  private readonly eventHalo: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  private readonly policyFx: ParticleFx;
  private readonly policyScaffold: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private readonly policyWorkers: THREE.Group;
  private readonly policyWorkPad: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private readonly hazardFx: ParticleFx;
  private readonly hazardShockwave: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  private readonly hazardProps: {
    group: THREE.Group;
    sun: THREE.Mesh;
    corona: THREE.Mesh;
    sunRays: THREE.LineSegments;
    mirage: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
    cloud: THREE.Group;
    bolt: THREE.LineSegments;
    rain: THREE.LineSegments;
    splashes: THREE.Group;
    smog: THREE.Group;
    spark: THREE.LineSegments;
  };
  private readonly policyCrane!: THREE.Group;
  private readonly policyCones!: THREE.Group;
  private readonly clockOffset = Math.random() * 100;
  private currentCue: CivicChallenge['soundCue'] = 'civic';
  private elapsedSeconds = 0;
  private eventPulse = 0;
  private policyFxStart = -100;
  private hazardFxStart = -100;
  private activePolicyCategory: PolicyCategory = 'governance';
  private activeHazardCue: CivicChallenge['soundCue'] = 'civic';
  private policyShowConstruction = true;
  private seenPolicyKey = '';
  private seenResolutionKey = '';
  private seenChallengeId = '';
  private missionStarted = false;
  private dataLayerId: DataLayerId = 'none';
  private lastState!: CityState;
  private readonly decor: CityDecor;
  /** 地格轉換閃光：tile → 起始秒數。 */
  private readonly tileFlashes = new Map<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>, number>();
  private readonly prevCellsKeys = new Map<string, string>();

  constructor(scene: THREE.Scene, state: CityState) {
    this.scene = scene;
    this.root.name = 'ClimateResilienceCityWorld';
    scene.add(this.root);

    this.skyMaterial = this.createSkyDome();
    this.createTaipeiBasinBackdrop();
    this.createTerrain();
    this.waterMaterial = this.createWater();
    this.createRiverCorridor();

    for (let index = 0; index < state.districts.length; index += 1) {
      const visual = this.createDistrict(state.districts[index], index);
      this.districtVisuals.set(state.districts[index].id, visual);
      this.root.add(visual.root);
    }

    // 美術升級模組：地格實體（樹/太陽能/避難所）+ 車流 + 鳥群 + 雲 + 街區標籤
    const districtOrigins = new Map<string, THREE.Vector3>();
    for (const [id, visual] of this.districtVisuals) {
      districtOrigins.set(id, visual.root.position.clone());
    }
    this.decor = new CityDecor(this.root, districtOrigins);

    const { points, material } = this.createAtmosphere();
    this.haze = points;
    this.hazeMaterial = material;
    this.root.add(this.haze);

    const particleFx = this.createEventParticles();
    this.eventParticles = particleFx.points;
    this.eventParticleMaterial = particleFx.material;
    this.eventParticlePositions = particleFx.positions;
    this.root.add(this.eventParticles);

    const eventFx = this.createEventFx();
    this.eventLight = eventFx.light;
    this.eventHalo = eventFx.halo;
    this.root.add(this.eventLight, this.eventHalo);

    const policyFx = this.createPolicyFx();
    this.policyFx = policyFx.fx;
    this.policyScaffold = policyFx.scaffold;
    this.policyWorkers = policyFx.workers;
    this.policyWorkPad = policyFx.workPad;
    this.policyCrane = policyFx.crane;
    this.policyCones = policyFx.cones;
    this.root.add(this.policyFx.group);

    const hazardFx = this.createHazardFx();
    this.hazardFx = hazardFx.fx;
    this.hazardShockwave = hazardFx.shockwave;
    this.root.add(this.hazardFx.group);

    this.hazardProps = this.createHazardProps();
    this.root.add(this.hazardProps.group);

    this.seenChallengeId = state.currentChallenge.id;
    this.seenPolicyKey = getLatestPolicyKey(state.appliedPolicies[0]);
    this.seenResolutionKey = getResolutionKey(state);
    this.updateFromState(state);
  }

  /** 切換科學資料圖層並立即重新著色。 */
  setDataLayer(layer: DataLayerId): void {
    this.dataLayerId = layer;
    if (this.lastState) this.updateFromState(this.lastState);
  }

  updateFromState(state: CityState): void {
    this.lastState = state;
    this.currentCue = state.currentChallenge.soundCue;

    const palette = getCuePalette(this.currentCue);
    if (this.scene.background instanceof THREE.Color) {
      this.scene.background.setHex(palette.background);
    } else {
      this.scene.background = new THREE.Color(palette.background);
    }
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.setHex(palette.fog);
      this.scene.fog.density = palette.fogDensity + state.airQualityRisk / 12000;
    }

    this.skyMaterial.uniforms.uSkyTop.value.setHex(palette.skyTop);
    this.skyMaterial.uniforms.uSkyBottom.value.setHex(palette.skyBottom);
    this.skyMaterial.uniforms.uAccent.value.setHex(palette.skyAccent);
    this.waterMaterial.uniforms.uCueColor.value.setHex(palette.waterGlow);
    this.waterMaterial.uniforms.uFlood.value = clamp(state.floodRisk / 100, 0, 1);

    for (const district of state.districts) {
      const visual = this.districtVisuals.get(district.id);
      if (!visual) continue;

      const layerValue = getDataLayerValue(district, this.dataLayerId);
      if (layerValue !== undefined) {
        // 圖層模式：藍（低）→ 黃 → 紅（高）的科學色階，方便跨街區比較。
        visual.base.material.color.setHSL(0.62 - layerValue * 0.62, 0.78, 0.34 + layerValue * 0.14);
        visual.base.material.emissive.setHSL(0.62 - layerValue * 0.62, 0.7, 0.1);
        visual.base.material.emissiveIntensity = 0.35 + layerValue * 0.4;
      } else {
        const risk = Math.max(district.heatExposure, district.floodExposure, district.airPollution);
        const stressColor = mixColorHex(getDistrictBaseColor(district), 0xc86a46, clamp((risk - 42) / 120, 0, 0.38));
        visual.base.material.color.setHex(stressColor);
        visual.base.material.emissive.setHex(district.heatExposure > 70 ? 0x301008 : 0x07131a);
        visual.base.material.emissiveIntensity = district.heatExposure / 160;
      }

      visual.buildingMaterial.color.setHSL(0.56 - district.airPollution / 450, 0.42, 0.42);
      visual.buildingMaterial.emissiveIntensity = district.solarCoverage * 0.18;
      visual.windowMaterial.color.setHex(this.currentCue === 'energy' ? 0xfff0a6 : palette.windowGlow);
      visual.windowMaterial.opacity = clamp(
        0.16 + district.solarCoverage * 0.32 + state.energySecurity / 420 - district.airPollution / 520,
        0.12,
        0.78
      );
      visual.streetMaterial.color.setHex(district.transitAccess > 0.58 ? palette.street : 0x4e7480);
      visual.streetMaterial.opacity = clamp(0.2 + district.transitAccess * 0.42, 0.22, 0.74);

      // P2 地格磚：依地格類型著色；切到資料圖層時隱藏，讓科學色階可見
      const tilesVisible = this.dataLayerId === 'none';
      const prevKey = this.prevCellsKeys.get(district.id);
      const cellsKey = district.cells.join(',');
      visual.cellTiles.forEach((tile, cellIndex) => {
        tile.visible = tilesVisible;
        const cellType = district.cells[cellIndex] ?? 'pavement';
        tile.material.color.setHex(CELL_INFO[cellType].color);
        // 地格被政策轉換 → 白光閃爍標記（在 tick 中衰減）
        if (prevKey && prevKey.split(',')[cellIndex] !== cellType) {
          this.tileFlashes.set(tile, this.elapsedSeconds);
        }
      });
      this.prevCellsKeys.set(district.id, cellsKey);

      visual.waterOverlay.visible = false;
      visual.heatDome.visible = false;

      visual.selectedOutline.visible = district.id === state.selectedDistrictId;
      visual.selectedOutline.material.opacity = district.id === state.selectedDistrictId ? 0.92 : 0;
      visual.root.position.y = district.id === state.selectedDistrictId ? 0.16 : 0;
    }

    this.hazeMaterial.opacity = clamp(state.airQualityRisk / 330, 0.045, 0.28);
    this.hazeMaterial.size = state.currentChallenge.soundCue === 'air' ? 0.055 : 0.035;
    this.hazeMaterial.color.setHex(palette.particle);

    const particleSettings = getEventParticleSettings(this.currentCue);
    this.eventParticleMaterial.color.setHex(palette.particle);
    this.eventParticleMaterial.size = particleSettings.size;
    this.eventParticleMaterial.opacity = particleSettings.opacity;
    this.eventLight.color.setHex(palette.particle);
    this.eventHalo.material.color.setHex(palette.particle);
    this.eventHalo.visible = false;

    if (state.lastResolution) {
      this.eventPulse = 1;
    }

    if (state.mission.status === 'active' && !this.missionStarted) {
      this.triggerHazardFx(state.currentChallenge.soundCue);
      this.missionStarted = true;
    }

    this.decor.update(state, this.dataLayerId);
  }

  playYearTransition(state: CityState): void {
    const policiesThisTurn = state.appliedPolicies
      .filter((entry) => entry.turn === state.turn)
      .slice()
      .reverse();

    policiesThisTurn.forEach((entry, index) => {
      window.setTimeout(() => this.triggerPolicyFx(entry, state), 260 + index * 720);
    });

    const hazardDelay = Math.max(1200, 680 + policiesThisTurn.length * 720);
    window.setTimeout(() => this.triggerHazardFx(state.currentChallenge.soundCue), hazardDelay);
  }

  tick(elapsedSeconds: number): void {
    this.elapsedSeconds = elapsedSeconds;
    this.skyMaterial.uniforms.uTime.value = elapsedSeconds;
    this.waterMaterial.uniforms.uTime.value = elapsedSeconds;

    this.haze.rotation.y = Math.sin((elapsedSeconds + this.clockOffset) * 0.08) * 0.06;
    this.haze.position.y = 2.2 + Math.sin(elapsedSeconds * 0.42) * 0.12;

    // 美術升級：車流 / 鳥群 / 雲動畫
    this.decor.tick(elapsedSeconds);

    // 選取街區：呼吸式脈動外框
    for (const visual of this.districtVisuals.values()) {
      if (visual.selectedOutline.visible) {
        visual.selectedOutline.material.opacity = 0.55 + Math.sin(elapsedSeconds * 3.2) * 0.35;
      }
    }

    // 地格轉換閃光衰減（1.4 秒淡出）
    for (const [tile, start] of this.tileFlashes) {
      const age = elapsedSeconds - start;
      const strength = Math.max(0, 1 - age / 1.4);
      if (strength <= 0) {
        tile.material.emissiveIntensity = 0;
        this.tileFlashes.delete(tile);
      } else {
        tile.material.emissive.setHex(0xfff3d0);
        tile.material.emissiveIntensity = strength * 1.4;
      }
    }
    this.animateEventParticles(elapsedSeconds);
    this.animatePolicyFx(elapsedSeconds);
    this.animateHazardFx(elapsedSeconds);

    const shimmer = 0.5 + Math.sin((elapsedSeconds + this.clockOffset) * 1.7) * 0.5;
    this.eventLight.intensity = 0.42 + shimmer * 0.18 + this.eventPulse * 2.1;
    this.eventHalo.material.opacity = 0.045 + shimmer * 0.028 + this.eventPulse * 0.16;
    this.eventHalo.scale.setScalar(1 + shimmer * 0.05 + this.eventPulse * 0.34);
    this.eventPulse = Math.max(0, this.eventPulse - 0.018);
  }

  /** 拾取結果若是地格磚，回傳街區 + 地格索引（建造模式用）。 */
  findCellTarget(object: THREE.Object3D | null): { districtId: string; cellIndex: number } | undefined {
    let current: THREE.Object3D | null = object;
    while (current) {
      if (typeof current.userData.cellIndex === 'number' && typeof current.userData.districtId === 'string') {
        return { districtId: current.userData.districtId, cellIndex: current.userData.cellIndex };
      }
      current = current.parent;
    }
    return undefined;
  }

  findDistrictId(object: THREE.Object3D | null): string | undefined {
    let current: THREE.Object3D | null = object;
    while (current) {
      if (typeof current.userData.districtId === 'string') return current.userData.districtId;
      current = current.parent;
    }
    return undefined;
  }

  private createTaipeiBasinBackdrop(): void {
    const mountainMaterial = new THREE.MeshStandardMaterial({
      color: 0x2f6f57,
      roughness: 0.94,
      metalness: 0.02,
      emissive: 0x07170f,
      emissiveIntensity: 0.08
    });
    const ridgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e4c42,
      roughness: 0.96,
      metalness: 0.01
    });

    const mountainSpecs = [
      [-10.2, -10.8, 4.8, 3.2],
      [-6.8, -12.1, 6.2, 4.5],
      [-2.3, -11.4, 5.5, 3.7],
      [2.6, -12.2, 6.5, 4.9],
      [7.2, -11.2, 5.4, 3.6],
      [10.6, -10.4, 4.2, 2.9]
    ] as const;

    for (const [x, z, width, height] of mountainSpecs) {
      const mountain = new THREE.Mesh(new THREE.ConeGeometry(width, height, 5), mountainMaterial);
      mountain.position.set(x, height / 2 - 0.35, z);
      mountain.scale.z = 0.55;
      mountain.rotation.y = Math.PI / 5;
      mountain.castShadow = true;
      mountain.receiveShadow = true;
      this.root.add(mountain);
    }

    const basin = new THREE.Mesh(
      new THREE.CylinderGeometry(18, 20, 0.18, 7),
      new THREE.MeshStandardMaterial({
        color: 0x1b3b34,
        roughness: 0.9,
        metalness: 0.02,
        transparent: true,
        opacity: 0.74
      })
    );
    basin.position.set(0, -0.36, -2.4);
    basin.scale.set(1.2, 1, 0.82);
    basin.rotation.y = Math.PI / 7;
    basin.receiveShadow = true;
    this.root.add(basin);

    const ridgeLine = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute(
        'position',
        new THREE.Float32BufferAttribute(
          [
            -11.8, 1.8, -10.2, -7.8, 3.3, -11.6,
            -7.8, 3.3, -11.6, -3.8, 2.4, -10.8,
            -3.8, 2.4, -10.8, 1.4, 3.8, -11.9,
            1.4, 3.8, -11.9, 6.2, 2.6, -10.9,
            6.2, 2.6, -10.9, 11.7, 1.7, -10.2
          ],
          3
        )
      ),
      new THREE.LineBasicMaterial({
        color: 0x8bd6a4,
        transparent: true,
        opacity: 0.26
      })
    );
    ridgeLine.renderOrder = 2;
    this.root.add(ridgeLine);

    const foothill = new THREE.Mesh(new THREE.BoxGeometry(23, 0.22, 3.8), ridgeMaterial);
    foothill.position.set(0, -0.22, -8.3);
    foothill.receiveShadow = true;
    this.root.add(foothill);
  }

  private createRiverCorridor(): void {
    const riverMaterial = new THREE.MeshStandardMaterial({
      color: 0x168aa4,
      roughness: 0.24,
      metalness: 0.06,
      transparent: true,
      opacity: 0.76,
      emissive: 0x083d4b,
      emissiveIntensity: 0.18
    });
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-10.4, 0.02, 5.8),
      new THREE.Vector3(-6.6, 0.03, 4.6),
      new THREE.Vector3(-2.1, 0.03, 4.9),
      new THREE.Vector3(2.2, 0.03, 3.9),
      new THREE.Vector3(7.8, 0.03, 4.7),
      new THREE.Vector3(11.5, 0.03, 6.2)
    ]);
    const river = new THREE.Mesh(new THREE.TubeGeometry(curve, 90, 0.34, 12, false), riverMaterial);
    river.rotation.x = 0;
    river.receiveShadow = true;
    this.root.add(river);

    const bridgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xabc7bd,
      roughness: 0.72,
      metalness: 0.16,
      emissive: 0x112a25,
      emissiveIntensity: 0.08
    });
    for (const [x, z, rotation] of [
      [-5.2, 4.7, -0.28],
      [0.8, 4.4, -0.16],
      [6.0, 4.8, 0.22]
    ] as const) {
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.16, 0.34), bridgeMaterial);
      bridge.position.set(x, 0.32, z);
      bridge.rotation.y = rotation;
      bridge.castShadow = true;
      bridge.receiveShadow = true;
      this.root.add(bridge);
    }
  }

  private createSkyDome(): THREE.ShaderMaterial {
    const material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uSkyTop: { value: new THREE.Color(0x12324a) },
        uSkyBottom: { value: new THREE.Color(0x0a1820) },
        uAccent: { value: new THREE.Color(0x66d9ff) }
      },
      vertexShader: `
        varying vec3 vDirection;

        void main() {
          vDirection = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vDirection;
        uniform float uTime;
        uniform vec3 uSkyTop;
        uniform vec3 uSkyBottom;
        uniform vec3 uAccent;

        void main() {
          vec3 dir = normalize(vDirection);
          float horizon = smoothstep(-0.2, 0.72, dir.y);
          float ribbon = sin(dir.x * 8.0 + dir.z * 3.0 + uTime * 0.05) * 0.5 + 0.5;
          float glow = pow(max(0.0, 1.0 - abs(dir.y - 0.08) * 3.8), 2.0);
          vec3 sky = mix(uSkyBottom, uSkyTop, horizon);
          sky += uAccent * ribbon * glow * 0.13;
          gl_FragColor = vec4(sky, 1.0);
        }
      `
    });

    const sky = new THREE.Mesh(new THREE.SphereGeometry(44, 64, 32), material);
    sky.name = 'ProceduralClimateSky';
    sky.renderOrder = -20;
    this.scene.add(sky);
    return material;
  }

  private createTerrain(): void {
    const material = new THREE.MeshStandardMaterial({
      color: 0x203b37,
      map: createGroundTexture(),
      roughness: 0.88,
      metalness: 0.04,
      emissive: 0x041014,
      emissiveIntensity: 0.12
    });
    const terrain = new THREE.Mesh(new THREE.BoxGeometry(22.5, 0.25, 18.8), material);
    terrain.position.set(0, -0.26, -1.8);
    terrain.receiveShadow = true;
    this.root.add(terrain);
  }

  private createWater(): THREE.ShaderMaterial {
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uCueColor: { value: new THREE.Color(0x5bd6ff) },
        uFlood: { value: 0.5 }
      },
      vertexShader: `
        varying vec2 vUv;
        uniform float uTime;

        void main() {
          vUv = uv;
          vec3 p = position;
          p.z += sin((p.x + uTime * 0.7) * 1.8) * 0.035;
          p.z += sin((p.y - uTime * 0.45) * 3.2) * 0.018;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        uniform vec3 uCueColor;
        uniform float uFlood;

        void main() {
          float wave = sin((vUv.x + uTime * 0.035) * 48.0) * 0.5 + 0.5;
          float ripple = sin((vUv.y - uTime * 0.05) * 34.0) * 0.5 + 0.5;
          float shore = smoothstep(0.0, 0.22, vUv.y) * (1.0 - smoothstep(0.78, 1.0, vUv.y));
          vec3 deep = vec3(0.015, 0.13, 0.18);
          vec3 surface = mix(deep, uCueColor, 0.34 + wave * 0.12 + ripple * 0.08);
          float foam = smoothstep(0.88, 1.0, wave * ripple) * shore;
          float alpha = mix(0.46, 0.82, uFlood) * shore;
          gl_FragColor = vec4(surface + foam * 0.28, alpha);
        }
      `
    });

    const water = new THREE.Mesh(new THREE.PlaneGeometry(23, 8, 96, 28), material);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.08, 7.4);
    water.receiveShadow = true;
    this.root.add(water);
    return material;
  }

  private createDistrict(district: DistrictState, index: number): DistrictVisual {
    const [x, z] = DISTRICT_POSITIONS[district.id] ?? [index * 4, 0];
    const root = new THREE.Group();
    root.position.set(x, 0, z);
    root.userData.districtId = district.id;

    const baseMaterial = new THREE.MeshStandardMaterial({
      color: getDistrictBaseColor(district),
      roughness: 0.78,
      metalness: 0.08,
      emissive: 0x061014,
      emissiveIntensity: 0.08
    });
    const base = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.28, 5.2), baseMaterial);
    base.castShadow = true;
    base.receiveShadow = true;
    base.userData.districtId = district.id;
    root.add(base);
    this.pickables.push(base);

    // P2 格網建造：4×4 地格磚（土地利用視圖 + 點擊建造的拾取目標）
    const cellTiles: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>[] = [];
    const tileSize = 5.2 / CELL_GRID_SIZE;
    for (let cellIndex = 0; cellIndex < CELL_GRID_SIZE * CELL_GRID_SIZE; cellIndex += 1) {
      const col = cellIndex % CELL_GRID_SIZE;
      const row = Math.floor(cellIndex / CELL_GRID_SIZE);
      const tile = new THREE.Mesh(
        new THREE.PlaneGeometry(tileSize * 0.88, tileSize * 0.88),
        new THREE.MeshStandardMaterial({
          color: CELL_INFO[district.cells[cellIndex] ?? 'pavement'].color,
          roughness: 0.85,
          metalness: 0.02,
          transparent: true,
          opacity: 0.85
        })
      );
      tile.rotation.x = -Math.PI / 2;
      tile.position.set(
        (col - (CELL_GRID_SIZE - 1) / 2) * tileSize,
        0.152,
        (row - (CELL_GRID_SIZE - 1) / 2) * tileSize
      );
      tile.userData.districtId = district.id;
      tile.userData.cellIndex = cellIndex;
      tile.renderOrder = 2;
      root.add(tile);
      this.pickables.push(tile);
      cellTiles.push(tile);
    }

    if (district.archetype === 'upland') {
      const hillside = this.createHillsideTerrain(index);
      hillside.userData.districtId = district.id;
      root.add(hillside);
    }

    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0x5b8ea3,
      roughness: 0.53,
      metalness: 0.18,
      emissive: 0x163c48,
      emissiveIntensity: 0.08
    });
    const buildings = this.createBuildingCluster(district, buildingMaterial, index);
    buildings.userData.districtId = district.id;
    root.add(buildings);
    this.pickables.push(buildings);

    // 美術升級：屋頂水塔 + archetype 專屬剪影（工業煙囪 / 海港貨櫃與岸吊）
    const rooftopProps = this.createRooftopProps(district, index);
    rooftopProps.userData.districtId = district.id;
    root.add(rooftopProps);
    if (district.archetype === 'industrial') {
      const chimneys = this.createChimneys(index);
      chimneys.userData.districtId = district.id;
      root.add(chimneys);
    }
    if (district.archetype === 'coastal') {
      const containers = this.createContainers(index);
      containers.userData.districtId = district.id;
      root.add(containers);
    }

    if (district.id === 'core') {
      const landmark = this.createTaipeiLandmark(buildingMaterial);
      landmark.userData.districtId = district.id;
      root.add(landmark);
      this.pickables.push(landmark);
    }

    const windows = this.createWindowCluster(district, index);
    windows.mesh.userData.districtId = district.id;
    root.add(windows.mesh);

    const streets = this.createStreetGrid(district, index);
    streets.lines.userData.districtId = district.id;
    root.add(streets.lines);

    const trees = this.createCanopyCluster(district, index);
    trees.userData.districtId = district.id;
    root.add(trees);

    const waterOverlay = new THREE.Mesh(
      new THREE.CircleGeometry(3, 48),
      new THREE.MeshBasicMaterial({
        color: 0x37bdf8,
        transparent: true,
        opacity: 0.2,
        depthWrite: false
      })
    );
    waterOverlay.rotation.x = -Math.PI / 2;
    waterOverlay.position.y = 0.17;
    waterOverlay.visible = false;
    waterOverlay.userData.districtId = district.id;
    root.add(waterOverlay);

    const heatDome = new THREE.Mesh(
      new THREE.SphereGeometry(3.2, 36, 18),
      new THREE.MeshBasicMaterial({
        color: 0xff7b3d,
        transparent: true,
        opacity: 0.08,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    heatDome.scale.y = 0.28;
    heatDome.position.y = 1.4;
    heatDome.visible = false;
    heatDome.userData.districtId = district.id;
    root.add(heatDome);

    const selectedOutline = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute(
        'position',
        new THREE.Float32BufferAttribute(
          [
            -2.72, 0.24, -2.72, 2.72, 0.24, -2.72,
            2.72, 0.24, -2.72, 2.72, 0.24, 2.72,
            2.72, 0.24, 2.72, -2.72, 0.24, 2.72,
            -2.72, 0.24, 2.72, -2.72, 0.24, -2.72
          ],
          3
        )
      ),
      new THREE.LineBasicMaterial({
        color: 0x8fffd2,
        transparent: true,
        opacity: 0.92
      })
    );
    selectedOutline.visible = false;
    root.add(selectedOutline);

    return {
      root,
      base,
      cellTiles,
      buildingMaterial,
      windowMaterial: windows.material,
      streetMaterial: streets.material,
      waterOverlay,
      heatDome,
      selectedOutline
    };
  }

  private createHillsideTerrain(seed: number): THREE.Group {
    const group = new THREE.Group();
    const segments = 18;
    const size = 5.2;
    const positions: number[] = [];
    const indices: number[] = [];

    for (let zIndex = 0; zIndex <= segments; zIndex += 1) {
      for (let xIndex = 0; xIndex <= segments; xIndex += 1) {
        const x = -size / 2 + (xIndex / segments) * size;
        const z = -size / 2 + (zIndex / segments) * size;
        const y = getHillsideSurfaceY(x, z, seed);
        positions.push(x, y, z);
      }
    }

    for (let zIndex = 0; zIndex < segments; zIndex += 1) {
      for (let xIndex = 0; xIndex < segments; xIndex += 1) {
        const a = zIndex * (segments + 1) + xIndex;
        const b = a + 1;
        const c = a + segments + 1;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const terrain = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: 0x3f8d58,
        roughness: 0.9,
        metalness: 0.02,
        emissive: 0x0b2314,
        emissiveIntensity: 0.06
      })
    );
    terrain.receiveShadow = true;
    terrain.castShadow = true;
    group.add(terrain);

    const contourPositions: number[] = [];
    for (let level = 0; level < 5; level += 1) {
      const z = -2.05 + level * 0.72;
      const y = 0.4 + level * 0.22;
      contourPositions.push(-2.15, y, z, 2.15, y + 0.05, z + 0.12);
    }
    const contours = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(contourPositions, 3)),
      new THREE.LineBasicMaterial({
        color: 0xb7e0a0,
        transparent: true,
        opacity: 0.46
      })
    );
    contours.renderOrder = 3;
    group.add(contours);

    return group;
  }

  private createTaipeiLandmark(material: THREE.MeshStandardMaterial): THREE.Group {
    const group = new THREE.Group();
    const towerMaterial = material.clone();
    towerMaterial.color.setHex(0x6fa8a0);
    towerMaterial.emissive.setHex(0x1f514d);
    towerMaterial.emissiveIntensity = 0.16;

    for (let stack = 0; stack < 7; stack += 1) {
      const width = 0.92 - stack * 0.055;
      const block = new THREE.Mesh(new THREE.BoxGeometry(width, 0.7, width), towerMaterial);
      block.position.set(-0.7, 2.1 + stack * 0.72, -0.4);
      block.castShadow = true;
      block.receiveShadow = true;
      group.add(block);
    }

    const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.2, 1.1), towerMaterial);
    base.position.set(-0.7, 0.82, -0.4);
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    const spire = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 1.4, 8),
      new THREE.MeshStandardMaterial({
        color: 0xc7fff3,
        emissive: 0x6fffe8,
        emissiveIntensity: 0.28,
        roughness: 0.36,
        metalness: 0.34
      })
    );
    spire.position.set(-0.7, 7.8, -0.4);
    spire.castShadow = true;
    group.add(spire);

    return group;
  }

  private createBuildingCluster(
    district: DistrictState,
    material: THREE.MeshStandardMaterial,
    seed: number
  ): THREE.InstancedMesh {
    const count = getBuildingCount(district);
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), material, count);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const tint = new THREE.Color();
    for (let i = 0; i < count; i += 1) {
      const spec = getBuildingSpec(district, seed, i);
      dummy.position.set(spec.x, spec.baseY + spec.height / 2, spec.z);
      dummy.scale.set(spec.scaleX, spec.height, spec.scaleZ);
      dummy.rotation.y = spec.rotationY;
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // 每棟建築明度/色溫微抖動（instanceColor 與材質色相乘），擺脫「複製箱子陣」感
      const v = 0.82 + pseudo(seed * 53 + i * 7) * 0.36;
      tint.setRGB(
        v * (0.95 + pseudo(seed * 11 + i) * 0.1),
        v,
        v * (0.95 + pseudo(seed * 29 + i * 3) * 0.12)
      );
      mesh.setColorAt(i, tint);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    return mesh;
  }

  /** 屋頂道具：約 1/4 較高建築放水塔，天際線層次最便宜的升級。 */
  private createRooftopProps(district: DistrictState, seed: number): THREE.InstancedMesh {
    const count = getBuildingCount(district);
    const mesh = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.16, 8),
      new THREE.MeshStandardMaterial({ color: 0x9aa7ad, roughness: 0.6, metalness: 0.35 }),
      count
    );
    const dummy = new THREE.Object3D();
    let used = 0;
    for (let i = 0; i < count; i += 1) {
      const spec = getBuildingSpec(district, seed, i);
      if (spec.height < 1.1 || pseudo(seed * 71 + i * 13) > 0.28) continue;
      dummy.position.set(
        spec.x + (pseudo(seed + i) - 0.5) * spec.scaleX * 0.4,
        spec.baseY + spec.height + 0.08,
        spec.z + (pseudo(seed * 3 + i) - 0.5) * spec.scaleZ * 0.4
      );
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(0.8 + pseudo(seed * 5 + i) * 0.5);
      dummy.updateMatrix();
      mesh.setMatrixAt(used, dummy.matrix);
      used += 1;
    }
    mesh.count = used;
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }

  /** 工業區煙囪：深磚紅圓柱 + 白色警示環。 */
  private createChimneys(seed: number): THREE.Group {
    const group = new THREE.Group();
    const body = new THREE.MeshStandardMaterial({ color: 0x8a4a3a, roughness: 0.8 });
    const band = new THREE.MeshStandardMaterial({ color: 0xe8e2d4, roughness: 0.6 });
    for (let i = 0; i < 3; i += 1) {
      const height = 1.5 + pseudo(seed * 17 + i) * 0.9;
      const x = -1.6 + i * 1.1 + (pseudo(seed + i) - 0.5) * 0.5;
      const z = 1.4 + (pseudo(seed * 7 + i) - 0.5) * 1.2;
      const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, height, 8), body);
      chimney.position.set(x, 0.2 + height / 2, z);
      chimney.castShadow = true;
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.1, 0.12, 8), band);
      ring.position.set(x, 0.2 + height - 0.15, z);
      group.add(chimney, ring);
    }
    return group;
  }

  /** 海港區貨櫃堆：彩色小盒陣 + 簡易岸吊。 */
  private createContainers(seed: number): THREE.Group {
    const group = new THREE.Group();
    const palette = [0xc25b4e, 0x3f7fb5, 0xd9a440, 0x4f9e6b];
    for (let i = 0; i < 10; i += 1) {
      const material = new THREE.MeshStandardMaterial({
        color: palette[Math.floor(pseudo(seed * 13 + i) * palette.length)],
        roughness: 0.65,
        metalness: 0.2
      });
      const container = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.2, 0.22), material);
      const stack = Math.floor(pseudo(seed * 31 + i) * 2);
      container.position.set(
        1.2 + (i % 4) * 0.58,
        0.3 + stack * 0.21,
        1.5 + Math.floor(i / 4) * 0.3
      );
      container.rotation.y = (pseudo(seed + i) - 0.5) * 0.08;
      container.castShadow = true;
      group.add(container);
    }

    // 岸吊：門型架 + 斜臂
    const steel = new THREE.MeshStandardMaterial({ color: 0x4d7f9e, roughness: 0.5, metalness: 0.4 });
    const legGeometry = new THREE.BoxGeometry(0.07, 1.5, 0.07);
    for (const [lx, lz] of [[-0.3, 0], [0.3, 0]] as const) {
      const leg = new THREE.Mesh(legGeometry, steel);
      leg.position.set(2.0 + lx, 0.95, 1.0 + lz);
      group.add(leg);
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.08), steel);
    beam.position.set(2.0, 1.7, 1.0);
    beam.rotation.z = -0.12;
    group.add(beam);

    return group;
  }

  private createWindowCluster(
    district: DistrictState,
    seed: number
  ): { mesh: THREE.InstancedMesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>; material: THREE.MeshBasicMaterial } {
    const buildingCount = getBuildingCount(district);
    const maxFloors = district.archetype === 'downtown' ? 12 : district.archetype === 'industrial' ? 4 : 6;
    const material = new THREE.MeshBasicMaterial({
      color: 0xffe7a8,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.085, 0.014), material, buildingCount * maxFloors * 2);
    mesh.frustumCulled = false;

    const dummy = new THREE.Object3D();
    let instance = 0;
    for (let i = 0; i < buildingCount; i += 1) {
      const spec = getBuildingSpec(district, seed, i);
      const floors = Math.max(1, Math.min(maxFloors, Math.round(spec.height * 1.25)));

      for (let floor = 0; floor < floors; floor += 1) {
        const y = spec.baseY + 0.2 + (spec.height * (floor + 1)) / (floors + 1);
        const offset = (pseudo(seed * 211 + i * 17 + floor) - 0.5) * 0.22;

        dummy.position.set(spec.x + offset, y, spec.z + spec.scaleZ * 0.51);
        dummy.rotation.set(0, spec.rotationY, 0);
        dummy.scale.setScalar(district.archetype === 'industrial' ? 1.25 : 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(instance, dummy.matrix);
        instance += 1;

        dummy.position.set(spec.x + spec.scaleX * 0.51, y, spec.z + offset);
        dummy.rotation.set(0, spec.rotationY + Math.PI / 2, 0);
        dummy.scale.setScalar(district.archetype === 'industrial' ? 1.25 : 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(instance, dummy.matrix);
        instance += 1;
      }
    }

    mesh.count = instance;
    mesh.instanceMatrix.needsUpdate = true;
    return { mesh, material };
  }

  private createStreetGrid(
    district: DistrictState,
    seed: number
  ): { lines: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>; material: THREE.LineBasicMaterial } {
    const positions: number[] = [];
    const laneCount = district.archetype === 'downtown' ? 5 : district.archetype === 'upland' ? 3 : 4;
    const width = 2.5;
    const y = 0.205;

    for (let i = 0; i < laneCount; i += 1) {
      const t = i / (laneCount - 1);
      const offset = -width + t * width * 2 + (pseudo(seed * 81 + i) - 0.5) * 0.16;
      positions.push(-width, y, offset, width, y, offset);
      positions.push(offset, y, -width, offset, y, width);
    }

    positions.push(-width, y, -width, width, y, -width);
    positions.push(width, y, -width, width, y, width);
    positions.push(width, y, width, -width, y, width);
    positions.push(-width, y, width, -width, y, -width);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: 0x85e8d7,
      transparent: true,
      opacity: 0.42,
      depthWrite: false
    });
    const lines = new THREE.LineSegments(geometry, material);
    lines.renderOrder = 3;
    return { lines, material };
  }

  private createCanopyCluster(district: DistrictState, seed: number): THREE.InstancedMesh {
    const count = Math.max(4, Math.round(district.canopyCover * 46));
    const material = new THREE.MeshStandardMaterial({
      color: 0x57c785,
      roughness: 0.72,
      metalness: 0.03,
      emissive: 0x0b2d18,
      emissiveIntensity: 0.04
    });
    const mesh = new THREE.InstancedMesh(new THREE.ConeGeometry(0.25, 0.72, 7), material, count);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i += 1) {
      const angle = pseudo(seed * 99 + i) * Math.PI * 2;
      const radius = 1.2 + pseudo(seed * 11 + i) * 1.5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = district.archetype === 'upland' ? getHillsideSurfaceY(x, z, seed) + 0.5 : 0.62;
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(0.72 + pseudo(seed * 42 + i) * 0.5);
      dummy.rotation.y = angle;
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }

  private createAtmosphere(): { points: THREE.Points; material: THREE.PointsMaterial } {
    const count = 900;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = 0.8 + Math.random() * 4.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xd4a15b,
      size: 0.035,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    return { points: new THREE.Points(geometry, material), material };
  }

  private createEventParticles(): {
    points: THREE.Points;
    material: THREE.PointsMaterial;
    positions: Float32Array;
  } {
    const count = 760;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      resetEventParticle(positions, i, this.currentCue);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x8fffd2,
      size: 0.04,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    points.renderOrder = 4;
    return { points, material, positions };
  }

  private animateEventParticles(elapsedSeconds: number): void {
    const positions = this.eventParticlePositions;
    const count = positions.length / 3;
    const cue = this.currentCue;

    for (let i = 0; i < count; i += 1) {
      const offset = i * 3;
      const drift = Math.sin(elapsedSeconds * 0.6 + i * 0.37) * 0.006;

      if (cue === 'rain') {
        positions[offset] += drift;
        positions[offset + 1] -= 0.052 + pseudo(i * 19) * 0.034;
        positions[offset + 2] += 0.01;
        if (positions[offset + 1] < 0.08) resetEventParticle(positions, i, cue, 6.8);
      } else if (cue === 'heat') {
        positions[offset] += drift * 0.8;
        positions[offset + 1] += 0.012 + pseudo(i * 13) * 0.012;
        positions[offset + 2] += Math.sin(elapsedSeconds * 0.9 + i) * 0.003;
        if (positions[offset + 1] > 5.8) resetEventParticle(positions, i, cue, 0.32);
      } else if (cue === 'air') {
        positions[offset] += 0.012 + pseudo(i * 7) * 0.012;
        positions[offset + 1] += Math.sin(elapsedSeconds + i) * 0.002;
        positions[offset + 2] += drift;
        if (positions[offset] > 12) {
          positions[offset] = -12;
          positions[offset + 1] = 0.9 + Math.random() * 3.6;
          positions[offset + 2] = (Math.random() - 0.5) * 18;
        }
      } else if (cue === 'energy') {
        positions[offset] += Math.sin(elapsedSeconds * 2.4 + i) * 0.006;
        positions[offset + 1] += Math.sin(elapsedSeconds * 3.2 + i * 0.25) * 0.004;
        positions[offset + 2] += Math.cos(elapsedSeconds * 2.1 + i) * 0.006;
      } else {
        positions[offset] += drift * 0.55;
        positions[offset + 1] += Math.sin(elapsedSeconds * 0.72 + i) * 0.002;
      }
    }

    const position = this.eventParticles.geometry.getAttribute('position');
    position.needsUpdate = true;
    this.eventParticles.rotation.y = Math.sin(elapsedSeconds * 0.09) * 0.045;
  }

  private createPolicyFx(): {
    fx: ParticleFx;
    scaffold: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>;
    workers: THREE.Group;
    workPad: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
    crane: THREE.Group;
    cones: THREE.Group;
  } {
    const group = new THREE.Group();
    group.visible = false;

    const count = 340;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      resetPolicyParticle(positions, i, 'governance');
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x8fffd2,
      size: 0.085,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    group.add(points);

    const scaffold = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute(
        'position',
        new THREE.Float32BufferAttribute(
          [
            -1.9, 0.25, -1.4, -1.9, 2.4, -1.4,
            -1.9, 2.4, -1.4, 0.9, 2.4, -1.4,
            0.9, 2.4, -1.4, 1.35, 1.85, -1.4,
            -1.9, 0.95, -1.4, 0.9, 2.4, -1.4,
            -1.9, 1.62, -1.4, -0.45, 0.25, -1.4,
            1.4, 0.25, 1.35, 1.4, 1.55, 1.35,
            0.6, 1.55, 1.35, 2.0, 1.55, 1.35,
            0.6, 1.55, 1.35, 1.4, 0.25, 1.35,
            2.0, 1.55, 1.35, 1.4, 0.25, 1.35
          ],
          3
        )
      ),
      new THREE.LineBasicMaterial({
        color: 0xffd75f,
        transparent: true,
        opacity: 0
      })
    );
    scaffold.renderOrder = 5;
    group.add(scaffold);

    const workPad = new THREE.Mesh(
      new THREE.PlaneGeometry(3.0, 2.15),
      new THREE.MeshBasicMaterial({
        color: 0xffd75f,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    workPad.rotation.x = -Math.PI / 2;
    workPad.position.y = 0.08;
    workPad.renderOrder = 4;
    group.add(workPad);

    const workers = this.createPolicyWorkers();
    group.add(workers);

    const crane = this.createPolicyCrane();
    group.add(crane);

    const cones = this.createTrafficCones();
    group.add(cones);

    return { fx: { group, points, material, positions }, scaffold, workers, workPad, crane, cones };
  }

  /** 工地塔吊：底座 + 塔身 + 可旋轉吊臂 + 吊鉤（程序化，無外部資產）。 */
  private createPolicyCrane(): THREE.Group {
    const crane = new THREE.Group();
    const steel = new THREE.MeshStandardMaterial({
      color: 0xffc23d,
      roughness: 0.5,
      metalness: 0.35,
      emissive: 0x33230a,
      emissiveIntensity: 0.18
    });

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.5), steel);
    base.position.y = 0.06;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 2.6, 6), steel);
    mast.position.y = 1.42;
    crane.add(base, mast);

    // 吊臂組（旋轉軸在塔頂）
    const jib = new THREE.Group();
    jib.position.y = 2.74;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.07, 0.07), steel);
    arm.position.x = 0.78;
    const counterArm = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.09, 0.09), steel);
    counterArm.position.x = -0.42;
    const counterWeight = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.16), steel);
    counterWeight.position.set(-0.66, -0.08, 0);
    // 拉索（塔頂 → 臂端）
    const tieGeometry = new THREE.BufferGeometry().setAttribute(
      'position',
      new THREE.Float32BufferAttribute([0, 0.34, 0, 1.68, 0.02, 0, 0, 0.34, 0, -0.6, 0.02, 0], 3)
    );
    const tie = new THREE.LineSegments(
      tieGeometry,
      new THREE.LineBasicMaterial({ color: 0xd8d8d8, transparent: true, opacity: 0.85 })
    );
    // 吊纜 + 吊鉤（吊鉤上下移動）
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.0, 4), steel);
    cable.position.set(1.55, -0.5, 0);
    const hook = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), steel);
    hook.position.set(1.55, -1.05, 0);
    jib.add(arm, counterArm, counterWeight, tie, cable, hook);
    jib.userData.cable = cable;
    jib.userData.hook = hook;
    crane.add(jib);
    crane.userData.jib = jib;

    crane.position.set(1.95, 0.1, -0.7);
    return crane;
  }

  /** 工地交通錐：圍出施工範圍，增加「真的在施工」的臨場感。 */
  private createTrafficCones(): THREE.Group {
    const cones = new THREE.Group();
    const coneMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6a2a,
      roughness: 0.6,
      emissive: 0x551703,
      emissiveIntensity: 0.32
    });
    const bandMaterial = new THREE.MeshStandardMaterial({
      color: 0xf2f2f2,
      roughness: 0.5,
      emissive: 0x404040,
      emissiveIntensity: 0.25
    });

    for (let i = 0; i < 8; i += 1) {
      const cone = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.085, 0.2, 8), coneMaterial);
      body.position.y = 0.1;
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.058, 0.035, 8), bandMaterial);
      band.position.y = 0.11;
      cone.add(body, band);

      const angle = (i / 8) * Math.PI * 2 + 0.32;
      const radius = 1.7 + pseudo(i * 23) * 0.5;
      cone.position.set(Math.cos(angle) * radius, 0.02, Math.sin(angle) * radius);
      cones.add(cone);
    }

    return cones;
  }

  private createPolicyWorkers(): THREE.Group {
    const group = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd75f,
      roughness: 0.62,
      metalness: 0.08,
      emissive: 0x3a2108,
      emissiveIntensity: 0.14
    });
    const helmetMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff08a,
      roughness: 0.46,
      metalness: 0.1,
      emissive: 0x4a3506,
      emissiveIntensity: 0.16
    });

    for (let i = 0; i < 10; i += 1) {
      const worker = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.105, 0.34, 8), bodyMaterial);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.105, 10, 8), helmetMaterial);
      body.position.y = 0.2;
      head.position.y = 0.42;
      worker.add(body, head);

      const angle = (i / 10) * Math.PI * 2;
      const radius = 0.9 + pseudo(i * 31) * 1.45;
      worker.position.set(Math.cos(angle) * radius, 0.16, Math.sin(angle) * radius);
      worker.rotation.y = -angle;
      worker.userData.phase = pseudo(i * 19) * Math.PI * 2;
      group.add(worker);
    }

    const vehicleMaterial = new THREE.MeshStandardMaterial({
      color: 0xffb84d,
      roughness: 0.54,
      metalness: 0.16,
      emissive: 0x3a1c05,
      emissiveIntensity: 0.12
    });
    const truck = new THREE.Group();
    const bed = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.24, 0.32), vehicleMaterial);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.32), vehicleMaterial);
    bed.position.set(0, 0.22, 0);
    cab.position.set(0.42, 0.26, 0);
    truck.add(bed, cab);
    truck.position.set(-1.75, 0.18, 1.55);
    truck.userData.phase = 0;
    group.add(truck);

    return group;
  }

  private createHazardFx(): {
    fx: ParticleFx;
    shockwave: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  } {
    const group = new THREE.Group();
    group.visible = false;

    const count = 680;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      resetHazardParticle(positions, i, 'civic');
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xff8a4a,
      size: 0.075,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    points.renderOrder = 6;
    group.add(points);

    const shockwave = new THREE.Mesh(
      new THREE.RingGeometry(0.7, 0.96, 96),
      new THREE.MeshBasicMaterial({
        color: 0xff8a4a,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      })
    );
    shockwave.rotation.x = -Math.PI / 2;
    shockwave.position.y = 0.24;
    shockwave.renderOrder = 7;
    group.add(shockwave);

    return { fx: { group, points, material, positions }, shockwave };
  }

  private triggerPolicyFx(entry: AppliedPolicyLog, state: CityState): void {
    const policy = getPolicy(entry.policyId);
    const category = policy?.category ?? 'governance';
    const targetDistrictId = entry.targetDistrictId ?? state.selectedDistrictId;
    const targetRoot = this.districtVisuals.get(targetDistrictId)?.root.position ?? new THREE.Vector3(0, 0, -1.2);
    const target = getPolicyFxTargetPosition(targetDistrictId, targetRoot);
    const color = getPolicyCategoryColor(category);

    this.activePolicyCategory = category;
    this.policyFx.group.visible = true;
    this.policyFx.group.position.set(target.x, 0.12, target.z);
    this.policyFx.group.scale.setScalar(policy?.target === 'city' ? 1.55 : 1);
    this.policyFx.material.color.setHex(color);

    // 硬體建設類別才出現施工隊；軟性政策（降溫/健康/生態）呈現為純粒子現象。
    const construction =
      category === 'flood' || category === 'energy' || category === 'mobility' ||
      category === 'industry' || category === 'governance';
    this.policyShowConstruction = construction;
    this.policyScaffold.visible = construction;
    this.policyWorkers.visible = construction;
    this.policyScaffold.material.color.setHex(color);
    this.policyWorkPad.material.color.setHex(color);
    this.tintPolicyWorkers(color); // 施工隊染上政策類別色，一眼可辨
    this.policyFxStart = this.elapsedSeconds;

    for (let i = 0; i < this.policyFx.positions.length / 3; i += 1) {
      resetPolicyParticle(this.policyFx.positions, i, category);
    }
    this.policyFx.points.geometry.getAttribute('position').needsUpdate = true;
  }

  private createHazardProps(): {
    group: THREE.Group;
    sun: THREE.Mesh;
    corona: THREE.Mesh;
    sunRays: THREE.LineSegments;
    mirage: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
    cloud: THREE.Group;
    bolt: THREE.LineSegments;
    rain: THREE.LineSegments;
    splashes: THREE.Group;
    smog: THREE.Group;
    spark: THREE.LineSegments;
  } {
    const group = new THREE.Group();
    group.visible = false;

    // 熱浪：發光太陽 + 加色光暈球
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(1.25, 24, 18),
      new THREE.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0 })
    );
    sun.position.set(3.6, 6.6, -3.4);
    sun.renderOrder = 8;
    group.add(sun);
    const corona = new THREE.Mesh(
      new THREE.SphereGeometry(2.0, 20, 16),
      new THREE.MeshBasicMaterial({
        color: 0xffb24a,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    corona.position.copy(sun.position);
    group.add(corona);

    // 熱浪：太陽光芒（放射狀線段，緩慢旋轉）
    const rayPts: number[] = [];
    for (let i = 0; i < 12; i += 1) {
      const angle = (i / 12) * Math.PI * 2;
      const inner = 1.45;
      const outer = 2.3 + pseudo(i * 7) * 0.7;
      rayPts.push(Math.cos(angle) * inner, Math.sin(angle) * inner, 0);
      rayPts.push(Math.cos(angle) * outer, Math.sin(angle) * outer, 0);
    }
    const sunRays = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(rayPts, 3)),
      new THREE.LineBasicMaterial({
        color: 0xffcf6a,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
      })
    );
    sunRays.position.copy(sun.position);
    sunRays.renderOrder = 8;
    group.add(sunRays);

    // 熱浪：近地面熱蜃樓環（柏油上方扭曲空氣的視覺隱喻）
    const mirage = new THREE.Mesh(
      new THREE.RingGeometry(2.4, 4.8, 64),
      new THREE.MeshBasicMaterial({
        color: 0xffb070,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      })
    );
    mirage.rotation.x = -Math.PI / 2;
    mirage.position.y = 0.32;
    mirage.renderOrder = 7;
    group.add(mirage);

    // 降雨：雷雨雲團 + 閃電（雲帶 emissive，閃電打亮雲體）
    const cloud = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0x39424f,
      roughness: 1,
      metalness: 0,
      transparent: true,
      opacity: 0,
      emissive: 0x9fc4ff,
      emissiveIntensity: 0
    });
    for (const [cx, cz, r] of [[-1.0, 0, 0.95], [0.1, 0.25, 1.2], [1.1, -0.1, 0.92], [0.25, -0.55, 0.82]] as const) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), cloudMat);
      puff.position.set(cx, 0, cz);
      puff.scale.y = 0.6;
      cloud.add(puff);
    }
    cloud.position.set(0, 5.6, -1);
    group.add(cloud);

    const bolt = new THREE.LineSegments(
      this.makeBoltGeometry(),
      new THREE.LineBasicMaterial({ color: 0xd4ecff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
    );
    bolt.position.set(0, 4.9, -1);
    bolt.renderOrder = 8;
    group.add(bolt);

    // 降雨：雨絲（傾斜線段，比圓點更像真實降雨）
    const STREAK_COUNT = 320;
    const rainPositions = new Float32Array(STREAK_COUNT * 6);
    const rainSpeeds = new Float32Array(STREAK_COUNT);
    for (let i = 0; i < STREAK_COUNT; i += 1) {
      this.respawnRainStreak(rainPositions, rainSpeeds, i, true);
    }
    const rain = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(rainPositions, 3)),
      new THREE.LineBasicMaterial({
        color: 0xb6d4ea,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
      })
    );
    rain.frustumCulled = false;
    rain.renderOrder = 7;
    rain.userData.positions = rainPositions;
    rain.userData.speeds = rainSpeeds;
    group.add(rain);

    // 降雨：地面濺水圈（雨絲觸地時的漣漪池，循環使用）
    const splashes = new THREE.Group();
    for (let i = 0; i < 14; i += 1) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.05, 0.085, 18),
        new THREE.MeshBasicMaterial({
          color: 0xcfe6f5,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set((pseudo(i * 13) - 0.5) * 9, 0.1, (pseudo(i * 29) - 0.5) * 9);
      ring.userData.phase = i / 14;
      splashes.add(ring);
    }
    splashes.renderOrder = 7;
    group.add(splashes);

    // 空污：煙塵團
    const smog = new THREE.Group();
    const smogMat = new THREE.MeshStandardMaterial({ color: 0x8c7d63, roughness: 1, transparent: true, opacity: 0 });
    ([[-1.5, 0.2, 0, 1.0], [-0.2, 0.7, 0.3, 1.35], [1.2, 0.3, -0.2, 1.05], [0.3, 1.2, 0.1, 0.9]] as const).forEach(
      ([sx, sy, sz, r], index) => {
        const blob = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), smogMat);
        blob.position.set(sx, sy, sz);
        // 漂移/脹縮動畫用的基準位置與相位
        blob.userData.base = new THREE.Vector3(sx, sy, sz);
        blob.userData.phase = index * 1.7;
        smog.add(blob);
      }
    );
    smog.position.set(0, 3.3, -1);
    group.add(smog);

    // 尖峰用電：放射狀電弧
    const spark = new THREE.LineSegments(
      this.makeSparkGeometry(),
      new THREE.LineBasicMaterial({ color: 0xffe681, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
    );
    spark.position.set(0, 2.6, -1);
    spark.renderOrder = 8;
    group.add(spark);

    return { group, sun, corona, sunRays, mirage, cloud, bolt, rain, splashes, smog, spark };
  }

  /** 重生單條雨絲：隨機落點、隨機高度與速度，帶固定風向斜率。 */
  private respawnRainStreak(
    positions: Float32Array,
    speeds: Float32Array,
    index: number,
    randomHeight = false
  ): void {
    const offset = index * 6;
    const x = (pseudo(index * 7 + 1) - 0.5) * 13 + (Math.random() - 0.5) * 4;
    const z = (pseudo(index * 11 + 3) - 0.5) * 13 + (Math.random() - 0.5) * 4;
    const top = randomHeight ? 1 + Math.random() * 6 : 6 + Math.random() * 1.5;
    const length = 0.32 + Math.random() * 0.22;
    // 風向斜率：與粒子雨一致的向 +x/+z 傾斜
    const slantX = 0.07;
    const slantZ = 0.16;

    positions[offset] = x;
    positions[offset + 1] = top;
    positions[offset + 2] = z;
    positions[offset + 3] = x - slantX * length * 6;
    positions[offset + 4] = top + length;
    positions[offset + 5] = z - slantZ * length * 6;
    speeds[index] = 0.16 + Math.random() * 0.1;
  }

  private makeBoltGeometry(): THREE.BufferGeometry {
    const pts: number[] = [];
    let px = 0;
    let py = 0;
    for (let i = 1; i <= 9; i += 1) {
      const nx = (Math.random() - 0.5) * 1.3;
      const ny = -i * 0.4;
      pts.push(px, py, 0, nx, ny, 0);
      px = nx;
      py = ny;
    }
    return new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  }

  private makeSparkGeometry(): THREE.BufferGeometry {
    const pts: number[] = [];
    for (let a = 0; a < 7; a += 1) {
      const ang = (a / 7) * Math.PI * 2;
      let px = 0;
      let py = 0;
      let pz = 0;
      for (let seg = 1; seg <= 4; seg += 1) {
        const r = seg * 0.62;
        const jx = Math.cos(ang) * r + (Math.random() - 0.5) * 0.34;
        const jz = Math.sin(ang) * r + (Math.random() - 0.5) * 0.34;
        const jy = (Math.random() - 0.5) * 0.45;
        pts.push(px, py, pz, jx, jy, jz);
        px = jx;
        py = jy;
        pz = jz;
      }
    }
    return new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  }

  private updateHazardProps(cue: CivicChallenge['soundCue'], fade: number, elapsed: number): void {
    const hp = this.hazardProps;
    hp.group.visible = true;
    hp.sun.visible = hp.corona.visible = hp.sunRays.visible = hp.mirage.visible = cue === 'heat';
    hp.cloud.visible = hp.bolt.visible = hp.rain.visible = hp.splashes.visible = cue === 'rain';
    hp.smog.visible = cue === 'air';
    hp.spark.visible = cue === 'energy';

    if (cue === 'heat') {
      const pulse = 0.5 + Math.sin(elapsed * 4) * 0.5;
      (hp.sun.material as THREE.MeshBasicMaterial).opacity = 0.95 * fade;
      (hp.corona.material as THREE.MeshBasicMaterial).opacity = (0.28 + pulse * 0.3) * fade;
      hp.sun.scale.setScalar(1 + pulse * 0.08);
      hp.corona.scale.setScalar(1 + pulse * 0.16);
      hp.sun.position.y = 6.6 + Math.sin(elapsed * 1.3) * 0.12;
      hp.corona.position.copy(hp.sun.position);
      // 太陽光芒：緩慢旋轉 + 呼吸式明暗
      hp.sunRays.position.copy(hp.sun.position);
      hp.sunRays.rotation.z = elapsed * 0.18;
      (hp.sunRays.material as THREE.LineBasicMaterial).opacity = (0.32 + pulse * 0.3) * fade;
      // 熱蜃樓環：近地面緩慢脹縮，模擬柏油上方的扭曲熱空氣
      const shimmer = 0.5 + Math.sin(elapsed * 2.6) * 0.5;
      hp.mirage.scale.setScalar(1 + shimmer * 0.12 + Math.sin(elapsed * 5.1) * 0.03);
      hp.mirage.material.opacity = (0.05 + shimmer * 0.07) * fade;
    } else if (cue === 'rain') {
      const o = 0.9 * fade;
      const flash = Math.sin(elapsed * 7.5) > 0.86 ? 1 : 0;
      hp.cloud.traverse((c) => {
        const m = (c as THREE.Mesh).material as THREE.Material | undefined;
        if (m && 'opacity' in m) {
          const cloudMaterial = m as THREE.MeshStandardMaterial;
          cloudMaterial.opacity = o;
          // 閃電打亮雲體（雲內放電的視覺）
          cloudMaterial.emissiveIntensity = flash * 1.5 + Math.max(0, Math.sin(elapsed * 3.3)) * 0.06;
        }
      });
      hp.cloud.position.y = 5.6 + Math.sin(elapsed * 1.5) * 0.16;
      hp.cloud.position.x = Math.sin(elapsed * 0.3) * 0.5;
      (hp.bolt.material as THREE.LineBasicMaterial).opacity = flash * fade;
      if (flash > 0) {
        (hp.bolt.geometry as THREE.BufferGeometry).copy(this.makeBoltGeometry());
        // 閃電同步打亮整座城市（短促白光脈衝）
        this.eventPulse = Math.max(this.eventPulse, 0.42);
      }

      // 雨絲：逐條下落、觸地重生
      const rainPositions = hp.rain.userData.positions as Float32Array;
      const rainSpeeds = hp.rain.userData.speeds as Float32Array;
      for (let i = 0; i < rainSpeeds.length; i += 1) {
        const offset = i * 6;
        const fall = rainSpeeds[i];
        rainPositions[offset + 1] -= fall;
        rainPositions[offset + 4] -= fall;
        rainPositions[offset] += fall * 0.42;
        rainPositions[offset + 3] += fall * 0.42;
        rainPositions[offset + 2] += fall * 0.94;
        rainPositions[offset + 5] += fall * 0.94;
        if (rainPositions[offset + 1] < 0.1) this.respawnRainStreak(rainPositions, rainSpeeds, i);
      }
      hp.rain.geometry.getAttribute('position').needsUpdate = true;
      (hp.rain.material as THREE.LineBasicMaterial).opacity = 0.55 * fade;

      // 濺水圈：相位循環擴大-淡出，相位歸零時換落點
      hp.splashes.children.forEach((child) => {
        const ring = child as THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
        const phase = (elapsed * 1.7 + (ring.userData.phase as number)) % 1;
        if (phase < (ring.userData.lastPhase ?? 1)) {
          ring.position.set((Math.random() - 0.5) * 10, 0.1, (Math.random() - 0.5) * 10);
        }
        ring.userData.lastPhase = phase;
        ring.scale.setScalar(0.3 + phase * 2.6);
        ring.material.opacity = Math.max(0, (1 - phase) * 0.5) * fade;
      });
    } else if (cue === 'air') {
      const o = 0.62 * fade;
      hp.smog.children.forEach((child) => {
        const blob = child as THREE.Mesh;
        const material = blob.material as THREE.MeshStandardMaterial;
        const base = blob.userData.base as THREE.Vector3;
        const phase = blob.userData.phase as number;
        // 低層煙較濃（近地面能見度差），高層較淡
        material.opacity = o * (1.15 - base.y * 0.28);
        // 呼吸式脹縮 + 緩慢水平漂移，避免「固定球體」的人工感
        blob.scale.setScalar(1 + Math.sin(elapsed * 0.6 + phase) * 0.14);
        blob.position.set(
          base.x + Math.sin(elapsed * 0.24 + phase) * 0.5,
          base.y + Math.sin(elapsed * 0.4 + phase * 2) * 0.12,
          base.z + Math.cos(elapsed * 0.19 + phase) * 0.4
        );
      });
      hp.smog.rotation.y = elapsed * 0.1;
      hp.smog.position.y = 3.3 + Math.sin(elapsed * 0.8) * 0.12;
      hp.smog.position.x = Math.sin(elapsed * 0.12) * 0.9;
    } else if (cue === 'energy') {
      const flash = Math.sin(elapsed * 24) > 0 ? 1 : 0.22;
      (hp.spark.material as THREE.LineBasicMaterial).opacity = flash * fade;
      hp.spark.rotation.y = elapsed * 3.2;
      if (Math.sin(elapsed * 24) > 0.96) {
        (hp.spark.geometry as THREE.BufferGeometry).copy(this.makeSparkGeometry());
        // 跳電瞬間城市閃爍
        this.eventPulse = Math.max(this.eventPulse, 0.3);
      }
    } else {
      hp.group.visible = false;
    }
  }

  private tintPolicyWorkers(color: number): void {
    this.policyWorkers.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat && mat.color) mat.color.setHex(color);
      }
    });
  }

  private triggerHazardFx(cue: CivicChallenge['soundCue']): void {
    this.activeHazardCue = cue;
    this.hazardFx.group.visible = true;
    this.hazardFx.group.position.copy(getHazardOrigin(cue));
    this.hazardFx.material.color.setHex(getCuePalette(cue).particle);
    this.hazardFx.material.size =
      cue === 'rain' ? 0.07 : cue === 'air' ? 0.13 : cue === 'heat' ? 0.1 : cue === 'energy' ? 0.075 : 0.08;
    this.hazardShockwave.material.color.setHex(getCuePalette(cue).particle);
    this.hazardShockwave.visible = true;
    this.hazardShockwave.scale.setScalar(0.4);
    this.hazardFxStart = this.elapsedSeconds;

    for (let i = 0; i < this.hazardFx.positions.length / 3; i += 1) {
      resetHazardParticle(this.hazardFx.positions, i, cue);
    }
    this.hazardFx.points.geometry.getAttribute('position').needsUpdate = true;
  }

  private animatePolicyFx(elapsedSeconds: number): void {
    const age = elapsedSeconds - this.policyFxStart;
    if (age < 0 || age > 2.9) {
      this.policyFx.group.visible = false;
      this.policyFx.material.opacity = 0;
      this.policyScaffold.material.opacity = 0;
      this.policyWorkers.visible = false;
      this.policyCrane.visible = false;
      this.policyCones.visible = false;
      this.policyWorkPad.material.opacity = 0;
      return;
    }

    const t = clamp(age / 2.9, 0, 1);
    const fade = Math.sin(t * Math.PI);
    const category = this.activePolicyCategory;
    const show = this.policyShowConstruction;
    const positions = this.policyFx.positions;
    this.policyFx.material.opacity = 0.92 * fade; // 粒子更亮，避免被施工隊蓋過
    this.policyScaffold.material.opacity = show ? 0.86 * fade : 0;
    this.policyWorkPad.material.opacity = show ? 0.26 * fade : 0;
    this.policyWorkPad.scale.set(1 + Math.sin(elapsedSeconds * 5.5) * 0.025, 1, 1 + Math.cos(elapsedSeconds * 4.5) * 0.025);
    // 鷹架「逐段搭建」：前 60% 的時間內 draw range 漸增，像真的在施工
    const scaffoldVertexCount = 18;
    const builtVertices = Math.max(2, 2 * Math.ceil(clamp(age / 1.75, 0, 1) * (scaffoldVertexCount / 2)));
    this.policyScaffold.geometry.setDrawRange(0, builtVertices);
    this.policyWorkers.visible = show && fade > 0.04;
    this.policyCrane.visible = show && fade > 0.04;
    this.policyCones.visible = show && fade > 0.04;
    if (show) {
      this.policyWorkers.children.forEach((worker, index) => {
        const phase = typeof worker.userData.phase === 'number' ? worker.userData.phase : 0;
        const isTruck = index === this.policyWorkers.children.length - 1;
        if (isTruck) {
          // 卡車沿工地邊緣來回行駛（取代原本不合理的原地旋轉）
          const travel = Math.sin(elapsedSeconds * 0.75);
          worker.position.x = -1.75 + travel * 1.1;
          worker.position.y = 0.18;
          worker.rotation.y = Math.cos(elapsedSeconds * 0.75) >= 0 ? 0 : Math.PI;
        } else {
          worker.position.y = 0.16 + Math.abs(Math.sin(elapsedSeconds * 7.5 + phase)) * 0.08;
          worker.rotation.y += Math.sin(elapsedSeconds * 4 + phase) * 0.012;
        }
      });

      // 塔吊：吊臂緩慢迴轉、吊鉤升降（吊纜長度同步）
      const jib = this.policyCrane.userData.jib as THREE.Group;
      jib.rotation.y = elapsedSeconds * 0.55;
      const hook = jib.userData.hook as THREE.Mesh;
      const cable = jib.userData.cable as THREE.Mesh;
      const hookY = -1.05 + Math.sin(elapsedSeconds * 1.3) * 0.32;
      hook.position.y = hookY;
      const cableLength = Math.max(0.2, -hookY - 0.03);
      cable.scale.y = cableLength;
      cable.position.y = hookY / 2;
    }

    for (let i = 0; i < positions.length / 3; i += 1) {
      const offset = i * 3;
      const x = positions[offset];
      const z = positions[offset + 2];
      if (category === 'flood') {
        // 防洪：低矮水流向外漫延
        positions[offset] += Math.sin(elapsedSeconds * 3 + i) * 0.008;
        positions[offset + 1] = 0.16 + Math.sin(elapsedSeconds * 5 + i) * 0.03;
        positions[offset + 2] += 0.03;
        if (positions[offset + 2] > 2.9) resetPolicyParticle(positions, i, category);
      } else if (category === 'energy') {
        // 能源：快速上沖的火花
        positions[offset + 1] += 0.034 + pseudo(i * 11) * 0.024;
        positions[offset] += Math.sin(elapsedSeconds * 6 + i) * 0.014;
        if (positions[offset + 1] > 4.8) resetPolicyParticle(positions, i, category);
      } else if (category === 'cooling') {
        // 降溫：高處冷霧緩緩下沉
        // 降溫：高處冷霧緩緩下沉
        positions[offset + 1] -= 0.024 + pseudo(i * 9) * 0.014;
        positions[offset] += Math.sin(elapsedSeconds * 2 + i) * 0.007;
        if (positions[offset + 1] < 0.08) resetPolicyParticle(positions, i, category);
      } else if (category === 'mobility') {
        // 交通：貼地向外放射的路網流動
        const a = Math.atan2(z, x);
        positions[offset] += Math.cos(a) * 0.034;
        positions[offset + 2] += Math.sin(a) * 0.034;
        positions[offset + 1] = 0.12 + Math.sin(elapsedSeconds * 7 + i) * 0.03;
        if (Math.hypot(positions[offset], positions[offset + 2]) > 3.5) resetPolicyParticle(positions, i, category);
      } else if (category === 'health') {
        // 健康：脈動式上升的光環
        positions[offset + 1] += 0.02 + Math.abs(Math.sin(elapsedSeconds * 3 + i)) * 0.012;
        positions[offset] += Math.sin(elapsedSeconds * 2.4 + i) * 0.006;
        positions[offset + 2] += Math.cos(elapsedSeconds * 2.4 + i) * 0.006;
        if (positions[offset + 1] > 3.2) resetPolicyParticle(positions, i, category);
      } else if (category === 'biodiversity') {
        // 生態：貼地向外擴張、緩慢抽高，像綠意生長
        const a = Math.atan2(z, x);
        positions[offset] += Math.cos(a) * 0.014;
        positions[offset + 2] += Math.sin(a) * 0.014;
        positions[offset + 1] += 0.012 + pseudo(i * 5) * 0.008;
        if (positions[offset + 1] > 2.4) resetPolicyParticle(positions, i, category);
      } else if (category === 'industry') {
        // 工業：歪斜上飄的煙塵
        positions[offset + 1] += 0.026;
        positions[offset] += 0.008 + Math.sin(elapsedSeconds * 1.5 + i) * 0.016;
        if (positions[offset + 1] > 3.8) resetPolicyParticle(positions, i, category);
      } else {
        // 治理／其他：整齊垂直上升的光柱
        positions[offset + 1] += 0.03;
        if (positions[offset + 1] > 3.6) resetPolicyParticle(positions, i, category);
      }
    }

    this.policyFx.points.geometry.getAttribute('position').needsUpdate = true;
  }

  private animateHazardFx(elapsedSeconds: number): void {
    const age = elapsedSeconds - this.hazardFxStart;
    if (age < 0 || age > 3.6) {
      this.hazardFx.group.visible = false;
      this.hazardFx.material.opacity = 0;
      this.hazardShockwave.visible = false;
      this.hazardShockwave.material.opacity = 0;
      this.hazardProps.group.visible = false;
      return;
    }

    const t = clamp(age / 3.6, 0, 1);
    const fade = Math.sin(t * Math.PI);
    const cue = this.activeHazardCue;
    const positions = this.hazardFx.positions;
    this.hazardFx.material.opacity = (cue === 'air' ? 0.72 : 0.9) * fade;
    this.updateHazardProps(cue, fade, elapsedSeconds);

    // 擴散環／衝擊波：每種災害不同型態
    const sw = this.hazardShockwave;
    sw.visible = true;
    if (cue === 'rain') {
      // 水面漣漪：扁平、快速向外擴大
      sw.scale.setScalar(0.35 + t * 9.6);
      sw.material.opacity = Math.max(0, 0.62 * (1 - t));
      sw.rotation.z = 0;
    } else if (cue === 'heat') {
      // 熱穹：脈動的紅環，緩慢膨脹
      const pulse = 0.5 + Math.sin(elapsedSeconds * 6.5) * 0.5;
      sw.scale.setScalar(0.7 + t * 4.6 + pulse * 0.6);
      sw.material.opacity = Math.max(0, (0.45 + pulse * 0.4) * (1 - t * 0.65));
      sw.rotation.z = elapsedSeconds * 0.25;
    } else if (cue === 'air') {
      // 霧霾盤：很大、很淡、緩慢
      sw.scale.setScalar(0.6 + t * 11.5);
      sw.material.opacity = Math.max(0, 0.3 * (1 - t));
      sw.rotation.z = elapsedSeconds * 0.12;
    } else if (cue === 'energy') {
      // 電弧：高速閃爍 + 抖動的雙環
      const flash = Math.sin(elapsedSeconds * 34) > -0.2 ? 1 : 0.25;
      sw.scale.setScalar(0.4 + t * 7.2 + Math.sin(elapsedSeconds * 20) * 0.35);
      sw.material.opacity = Math.max(0, 0.9 * flash * (1 - t));
      sw.rotation.z = elapsedSeconds * 2.6;
    } else {
      sw.scale.setScalar(0.4 + t * 5);
      sw.material.opacity = Math.max(0, 0.5 * (1 - t));
      sw.rotation.z = elapsedSeconds * 0.35;
    }

    for (let i = 0; i < positions.length / 3; i += 1) {
      const offset = i * 3;
      if (cue === 'rain') {
        // 傾斜大雨，觸地重生
        positions[offset] += 0.022;
        positions[offset + 1] -= 0.17 + pseudo(i * 5) * 0.09;
        positions[offset + 2] += 0.05;
        if (positions[offset + 1] < 0.08) resetHazardParticle(positions, i, cue);
      } else if (cue === 'heat') {
        // 強烈上升的熱氣 + 左右扭動
        positions[offset + 1] += 0.06 + pseudo(i * 7) * 0.045;
        positions[offset] += Math.sin(elapsedSeconds * 4.2 + i) * 0.03;
        positions[offset + 2] += Math.cos(elapsedSeconds * 3.1 + i) * 0.02;
        if (positions[offset + 1] > 6.4) resetHazardParticle(positions, i, cue);
      } else if (cue === 'air') {
        // 橫向翻滾擴散的濃煙
        positions[offset] += 0.058 + pseudo(i * 17) * 0.03;
        positions[offset + 1] += Math.sin(elapsedSeconds * 1.2 + i) * 0.014;
        positions[offset + 2] += Math.sin(elapsedSeconds * 0.8 + i) * 0.02;
        if (positions[offset] > 7.6) resetHazardParticle(positions, i, cue);
      } else if (cue === 'energy') {
        // 電火花：劇烈隨機抖動，離散過遠就重生
        positions[offset] += (pseudo(i * 3 + Math.floor(elapsedSeconds * 22)) - 0.5) * 0.11;
        positions[offset + 1] += (pseudo(i * 7 + Math.floor(elapsedSeconds * 22)) - 0.5) * 0.11;
        positions[offset + 2] += (pseudo(i * 13 + Math.floor(elapsedSeconds * 22)) - 0.5) * 0.11;
        if (Math.hypot(positions[offset], positions[offset + 2]) > 5.2) resetHazardParticle(positions, i, cue);
      } else {
        positions[offset + 1] += 0.02;
        positions[offset] += Math.sin(elapsedSeconds * 3 + i) * 0.012;
      }
    }

    this.hazardFx.points.geometry.getAttribute('position').needsUpdate = true;
  }

  private createEventFx(): {
    light: THREE.PointLight;
    halo: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  } {
    const light = new THREE.PointLight(0xffb15f, 0.8, 24, 1.7);
    light.position.set(0, 7.5, 1.2);

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(8.2, 48, 24),
      new THREE.MeshBasicMaterial({
        color: 0xffb15f,
        transparent: true,
        opacity: 0.08,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
      })
    );
    halo.position.set(0, 2.4, -0.8);
    halo.scale.y = 0.46;

    return { light, halo };
  }
}
