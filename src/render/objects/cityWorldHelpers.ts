import * as THREE from 'three';
import { clamp } from '../../game/simulation/math';
import { getPolicy } from '../../game/simulation/policies';
import type {
  AppliedPolicyLog,
  CivicChallenge,
  CityState,
  DistrictState,
  PolicyCategory
} from '../../game/simulation/types';

export interface CuePalette {
  background: number;
  fog: number;
  fogDensity: number;
  skyTop: number;
  skyBottom: number;
  skyAccent: number;
  waterGlow: number;
  particle: number;
  street: number;
  windowGlow: number;
}

export interface BuildingSpec {
  x: number;
  z: number;
  baseY: number;
  height: number;
  scaleX: number;
  scaleZ: number;
  rotationY: number;
}

export const DISTRICT_POSITIONS: Record<string, [number, number]> = {
  harbor: [-6.2, -2.6],
  core: [0, -1.2],
  riverbend: [3.1, 4.4],
  industry: [-4.2, 4],
  garden: [6.2, -2.6],
  hillside: [1.4, -7.9]
};

export function getDistrictBaseColor(district: DistrictState): number {
  if (district.archetype === 'downtown') return 0x536d67;
  if (district.archetype === 'industrial') return 0x596159;
  if (district.archetype === 'residential') return 0x5e8f69;
  if (district.archetype === 'upland') return 0x477a44;
  if (district.archetype === 'river') return 0x557f83;
  return 0x657f6f;
}

export function getBuildingCount(district: DistrictState): number {
  if (district.archetype === 'downtown') return 42;
  if (district.archetype === 'industrial') return 14;
  if (district.archetype === 'residential') return 20;
  if (district.archetype === 'upland') return 7;
  if (district.archetype === 'river') return 18;
  return 20;
}

export function getBuildingSpec(district: DistrictState, seed: number, i: number): BuildingSpec {
  const count = getBuildingCount(district);
  const columns =
    district.archetype === 'downtown' ? 7 : district.archetype === 'industrial' ? 4 : district.archetype === 'upland' ? 3 : 5;
  const rows = Math.ceil(count / columns);
  const spacing = district.archetype === 'industrial' ? 1.28 : district.archetype === 'upland' ? 1.35 : 0.86;
  const column = i % columns;
  const row = Math.floor(i / columns);
  const jitterX = (pseudo(seed * 41 + i * 3) - 0.5) * (district.archetype === 'downtown' ? 0.14 : 0.24);
  const jitterZ = (pseudo(seed * 61 + i * 7) - 0.5) * (district.archetype === 'upland' ? 0.38 : 0.18);
  const x = -((columns - 1) * spacing) / 2 + column * spacing + jitterX;
  const z = -((rows - 1) * spacing) / 2 + row * spacing + jitterZ;
  const height = getBuildingHeight(district, i);
  const rotationY = (pseudo(seed * 70 + i) - 0.5) * (district.archetype === 'residential' ? 0.34 : 0.16);
  const baseY = district.archetype === 'upland' ? getHillsideSurfaceY(x, z, seed) + 0.08 : 0.18;

  if (district.archetype === 'industrial') {
    return {
      x,
      z,
      baseY,
      height,
      scaleX: 1.12 + pseudo(seed * 17 + i) * 0.58,
      scaleZ: 0.74 + pseudo(seed * 23 + i) * 0.62,
      rotationY
    };
  }

  if (district.archetype === 'residential') {
    return {
      x,
      z,
      baseY,
      height,
      scaleX: 0.92 + pseudo(seed * 13 + i) * 0.2,
      scaleZ: 0.54 + pseudo(seed * 29 + i) * 0.22,
      rotationY
    };
  }

  if (district.archetype === 'upland') {
    return {
      x,
      z,
      baseY,
      height,
      scaleX: 0.55 + pseudo(seed * 19 + i) * 0.18,
      scaleZ: 0.5 + pseudo(seed * 31 + i) * 0.18,
      rotationY
    };
  }

  return {
    x,
    z,
    baseY,
    height,
    scaleX: district.archetype === 'downtown' ? 0.68 + pseudo(seed * 13 + i) * 0.2 : 0.72,
    scaleZ: district.archetype === 'downtown' ? 0.68 + pseudo(seed * 17 + i) * 0.2 : 0.68,
    rotationY
  };
}

export function getBuildingHeight(district: DistrictState, i: number): number {
  const density = district.imperviousness;
  const noise = pseudo((i + 1) * 17);
  if (district.archetype === 'downtown') return clamp(2.3 + density * 4.1 + noise * 4.4, 2.2, 9.4);
  if (district.archetype === 'industrial') return clamp(0.7 + density * 0.85 + noise * 0.9, 0.85, 2.3);
  if (district.archetype === 'residential') return clamp(0.95 + density * 1.1 + noise * 1.1, 1.0, 3.1);
  if (district.archetype === 'upland') return clamp(0.42 + density * 0.55 + noise * 0.45, 0.45, 1.15);
  if (district.archetype === 'river') return clamp(0.9 + density * 1.7 + noise * 1.4, 0.9, 4.0);
  return clamp(1.0 + density * 1.8 + noise * 1.6, 1.0, 4.4);
}

export function getHillsideSurfaceY(x: number, z: number, seed = 0): number {
  const ridge = Math.max(0, (2.6 - z) / 5.2);
  const mound = Math.sin((x + seed) * 1.7) * 0.12 + Math.cos((z - seed) * 1.3) * 0.1;
  return 0.12 + ridge * 1.25 + mound;
}

export function pseudo(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function mixColorHex(low: number, high: number, t: number): number {
  const amount = clamp(t, 0, 1);
  const lowColor = new THREE.Color(low);
  lowColor.lerp(new THREE.Color(high), amount);
  return lowColor.getHex();
}

export function getCuePalette(cue: CivicChallenge['soundCue']): CuePalette {
  if (cue === 'heat') {
    return {
      background: 0x4a2a21,
      fog: 0xa75f38,
      fogDensity: 0.024,
      skyTop: 0xb86f43,
      skyBottom: 0x38565d,
      skyAccent: 0xff8a4a,
      waterGlow: 0x35b9d4,
      particle: 0xff8a4a,
      street: 0xffc06a,
      windowGlow: 0xffd08a
    };
  }
  if (cue === 'rain') {
    return {
      background: 0x17384b,
      fog: 0x376d86,
      fogDensity: 0.032,
      skyTop: 0x4b7890,
      skyBottom: 0x17384b,
      skyAccent: 0x5bd6ff,
      waterGlow: 0x63d8ff,
      particle: 0x7be2ff,
      street: 0x72d9ff,
      windowGlow: 0xc9f4ff
    };
  }
  if (cue === 'air') {
    return {
      background: 0x4d4932,
      fog: 0xa48b52,
      fogDensity: 0.039,
      skyTop: 0x9d8b62,
      skyBottom: 0x39473b,
      skyAccent: 0xd4b05b,
      waterGlow: 0x4fa6b4,
      particle: 0xd4b05b,
      street: 0xc7c078,
      windowGlow: 0xffdf8a
    };
  }
  if (cue === 'energy') {
    return {
      background: 0x3a3724,
      fog: 0x8b7b3d,
      fogDensity: 0.024,
      skyTop: 0x8a7540,
      skyBottom: 0x263f44,
      skyAccent: 0xffe07a,
      waterGlow: 0x67dbc8,
      particle: 0xffe07a,
      street: 0xffe998,
      windowGlow: 0xfff0a6
    };
  }
  return {
    background: 0x173b45,
    fog: 0x3e786f,
    fogDensity: 0.025,
    skyTop: 0x6fa3a5,
    skyBottom: 0x173b45,
    skyAccent: 0x94ffd0,
    waterGlow: 0x5bd6ff,
    particle: 0x94ffd0,
    street: 0x8fffd2,
    windowGlow: 0xddffe9
  };
}

export function getEventParticleSettings(cue: CivicChallenge['soundCue']): { size: number; opacity: number } {
  if (cue === 'rain') return { size: 0.033, opacity: 0.4 };
  if (cue === 'heat') return { size: 0.052, opacity: 0.34 };
  if (cue === 'air') return { size: 0.058, opacity: 0.27 };
  if (cue === 'energy') return { size: 0.045, opacity: 0.42 };
  return { size: 0.038, opacity: 0.22 };
}

export function getPolicyCategoryColor(category: PolicyCategory): number {
  if (category === 'cooling' || category === 'biodiversity') return 0x7cff8e;
  if (category === 'flood') return 0x68d9ff;
  if (category === 'energy') return 0xffe681;
  if (category === 'mobility') return 0x7de7ff;
  if (category === 'health') return 0xff9fb0;
  if (category === 'industry') return 0xb9d1d0;
  return 0xbda6ff;
}

export function getHazardOrigin(cue: CivicChallenge['soundCue']): THREE.Vector3 {
  if (cue === 'rain') return new THREE.Vector3(1.8, 0.2, 3.6);
  if (cue === 'heat') return new THREE.Vector3(0, 0.25, -1.2);
  if (cue === 'air') return new THREE.Vector3(-4.2, 0.45, 4.0);
  if (cue === 'energy') return new THREE.Vector3(0, 2.2, -1.2);
  return new THREE.Vector3(0, 0.6, -1.2);
}

export function getPolicyFxTargetPosition(districtId: string, base: THREE.Vector3): THREE.Vector3 {
  const offsets: Record<string, [number, number]> = {
    core: [-2.0, 1.85],
    harbor: [1.3, 1.45],
    riverbend: [-1.65, -1.35],
    industry: [1.5, -1.25],
    garden: [-1.4, 1.55],
    hillside: [-1.25, -0.75]
  };
  const [x, z] = offsets[districtId] ?? [0, 0];
  return new THREE.Vector3(base.x + x, base.y, base.z + z);
}

export function getLatestPolicyKey(entry: AppliedPolicyLog | undefined): string {
  if (!entry) return '';
  return `${entry.year}:${entry.turn}:${entry.policyId}:${entry.targetDistrictId ?? 'city'}`;
}

export function getResolutionKey(state: CityState): string {
  if (!state.lastResolution) return '';
  return `${state.lastResolution.year}:${state.lastResolution.title}:${state.lastResolution.soundCue}`;
}

export function resetPolicyParticle(positions: Float32Array, index: number, category: PolicyCategory): void {
  const offset = index * 3;
  const angle = Math.random() * Math.PI * 2;
  // 不同類別的初始分布半徑與高度，讓施工特效一眼可辨。
  const wide = category === 'mobility' || category === 'biodiversity' || category === 'governance';
  const radius = Math.sqrt(Math.random()) * (wide ? 3.4 : 2.2);

  positions[offset] = Math.cos(angle) * radius;
  positions[offset + 2] = Math.sin(angle) * radius;

  if (category === 'flood' || category === 'mobility' || category === 'biodiversity') {
    positions[offset + 1] = 0.08 + Math.random() * 0.3; // 貼地（水/車流/綠化）
  } else if (category === 'energy') {
    positions[offset + 1] = 1.2 + Math.random() * 1.9; // 高處火花
  } else if (category === 'cooling') {
    positions[offset + 1] = 1.0 + Math.random() * 1.9; // 高處冷霧，之後下沉
  } else {
    positions[offset + 1] = 0.18 + Math.random() * 0.7;
  }
}

export function resetHazardParticle(
  positions: Float32Array,
  index: number,
  cue: CivicChallenge['soundCue']
): void {
  const offset = index * 3;
  if (cue === 'rain') {
    // 大範圍高空雨幕
    positions[offset] = (Math.random() - 0.5) * 13;
    positions[offset + 1] = 3.0 + Math.random() * 6.5;
    positions[offset + 2] = (Math.random() - 0.5) * 7.5;
    return;
  }

  if (cue === 'heat') {
    // 貼地熱氣，之後強烈上升
    positions[offset] = (Math.random() - 0.5) * 7;
    positions[offset + 1] = 0.2 + Math.random() * 1.0;
    positions[offset + 2] = (Math.random() - 0.5) * 5.4;
    return;
  }

  if (cue === 'air') {
    // 從一側湧入的濃霾，之後橫向擴散
    positions[offset] = -7.0 + Math.random() * 1.6;
    positions[offset + 1] = 0.6 + Math.random() * 3.6;
    positions[offset + 2] = (Math.random() - 0.5) * 6.4;
    return;
  }

  if (cue === 'energy') {
    // 環狀電弧
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.6 + Math.random() * 3.4;
    positions[offset] = Math.cos(angle) * radius;
    positions[offset + 1] = 0.6 + Math.random() * 4.8;
    positions[offset + 2] = Math.sin(angle) * radius;
    return;
  }

  positions[offset] = (Math.random() - 0.5) * 7.5;
  positions[offset + 1] = 0.5 + Math.random() * 3;
  positions[offset + 2] = (Math.random() - 0.5) * 6;
}

export function resetEventParticle(
  positions: Float32Array,
  index: number,
  cue: CivicChallenge['soundCue'],
  forcedY?: number
): void {
  const offset = index * 3;
  positions[offset] = (Math.random() - 0.5) * 22;
  positions[offset + 1] =
    forcedY ?? (cue === 'rain' ? 3.2 + Math.random() * 4.2 : 0.45 + Math.random() * 4.8);
  positions[offset + 2] = (Math.random() - 0.5) * 18;
}

export function createGroundTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  const gradient = context.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, '#173034');
  gradient.addColorStop(0.52, '#10282d');
  gradient.addColorStop(1, '#0b1d23');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 512);

  context.globalAlpha = 0.18;
  context.strokeStyle = '#7be2d4';
  context.lineWidth = 3;
  for (let i = 42; i < 512; i += 74) {
    context.beginPath();
    context.moveTo(i, 0);
    context.lineTo(i + 36, 512);
    context.stroke();

    context.beginPath();
    context.moveTo(0, i);
    context.lineTo(512, i + 18);
    context.stroke();
  }

  context.globalAlpha = 0.12;
  context.strokeStyle = '#f5d57a';
  context.lineWidth = 1;
  for (let i = 18; i < 512; i += 38) {
    context.beginPath();
    context.moveTo(i, 0);
    context.lineTo(i, 512);
    context.stroke();
  }

  context.globalAlpha = 0.08;
  context.fillStyle = '#d7fff2';
  for (let i = 0; i < 320; i += 1) {
    const x = pseudo(i * 23) * 512;
    const y = pseudo(i * 41) * 512;
    context.fillRect(x, y, 1.2, 1.2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.anisotropy = 4;
  return texture;
}
