/**
 * CityDecor.ts — 美術升級模組（P1/P3/P5）：
 *   1. 地格實體化：綠地格長出樹、太陽能格鋪面板、避難格蓋小屋——
 *      政策因果「看得見」，而不是色塊變色。
 *   2. 世界生命感：街道車流、繞地標的鳥群（數量接生物多樣性）、飄移雲層。
 *   3. 世界內資訊：街區名稱標籤；UHI 圖層時直接顯示 +X.X°C 浮動數字。
 *
 * 全部使用 InstancedMesh / Sprite，維持 40fps 效能預算。
 */

import * as THREE from 'three';
import { CELL_GRID_SIZE } from '../../game/simulation/cells';
import type { CityState, DistrictState } from '../../game/simulation/types';
import type { DataLayerId } from './CityWorld';
import { pseudo } from './cityWorldHelpers';

const DISTRICT_SIZE = 5.2;
const TILE_SIZE = DISTRICT_SIZE / CELL_GRID_SIZE;
const MAX_DISTRICTS = 8;
const MAX_TREES = MAX_DISTRICTS * 16 * 4;
const MAX_PANELS = MAX_DISTRICTS * 16 * 2;
const MAX_SHELTERS = MAX_DISTRICTS * 16;
const CARS_PER_DISTRICT = 4;
const BIRD_COUNT = 12;
const CLOUD_COUNT = 3;

const dummy = new THREE.Object3D();
const hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);

export class CityDecor {
  private readonly trunks: THREE.InstancedMesh;
  private readonly crowns: THREE.InstancedMesh;
  private readonly panels: THREE.InstancedMesh;
  private readonly shelterBodies: THREE.InstancedMesh;
  private readonly shelterRoofs: THREE.InstancedMesh;
  private readonly cars: THREE.InstancedMesh;
  private readonly birds: THREE.InstancedMesh;
  private readonly clouds: THREE.Sprite[] = [];
  private readonly labels = new Map<string, { sprite: THREE.Sprite; cacheKey: string }>();
  private readonly districtOrigins = new Map<string, THREE.Vector3>();
  private birdVisible = 6;
  private birdCenter = new THREE.Vector3(0, 0, -1.2);
  private lastLayer: DataLayerId = 'none';

  constructor(private readonly root: THREE.Group, origins: Map<string, THREE.Vector3>) {
    this.districtOrigins = origins;

    // ── 樹：樹幹 + 多面體樹冠（每綠地格 2–4 棵）──
    this.trunks = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.025, 0.04, 0.26, 5),
      new THREE.MeshStandardMaterial({ color: 0x6b4a2c, roughness: 0.9 }),
      MAX_TREES
    );
    this.crowns = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(0.16, 0),
      new THREE.MeshStandardMaterial({
        color: 0x3da261,
        roughness: 0.8,
        emissive: 0x10331c,
        emissiveIntensity: 0.25
      }),
      MAX_TREES
    );
    this.crowns.castShadow = true;

    // ── 太陽能板：傾斜深藍發光薄板（每太陽能格 2 片）──
    this.panels = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.46, 0.02, 0.3),
      new THREE.MeshStandardMaterial({
        color: 0x1d3a8f,
        roughness: 0.25,
        metalness: 0.7,
        emissive: 0x2244aa,
        emissiveIntensity: 0.35
      }),
      MAX_PANELS
    );

    // ── 避難設施：小屋 + 琥珀色屋頂 ──
    this.shelterBodies = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.34, 0.22, 0.34),
      new THREE.MeshStandardMaterial({ color: 0xd9d2c0, roughness: 0.7 }),
      MAX_SHELTERS
    );
    this.shelterRoofs = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.27, 0.16, 4),
      new THREE.MeshStandardMaterial({
        color: 0xc9913d,
        emissive: 0x7a4a10,
        emissiveIntensity: 0.45,
        roughness: 0.6
      }),
      MAX_SHELTERS
    );

    // ── 車流：沿街區邊緣巡行的小車（instanceColor 上色）──
    this.cars = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.22, 0.09, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.3 }),
      MAX_DISTRICTS * CARS_PER_DISTRICT
    );
    const carPalette = [0xd9655d, 0x5d9ed9, 0xe0c75a, 0x8fd98f, 0xc9c9c9];
    const carColor = new THREE.Color();
    for (let i = 0; i < this.cars.count; i += 1) {
      carColor.setHex(carPalette[i % carPalette.length]);
      this.cars.setColorAt(i, carColor);
    }

    // ── 鳥群：環繞地標的小三角錐，數量接生物多樣性指標 ──
    this.birds = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.05, 0.16, 3),
      new THREE.MeshBasicMaterial({ color: 0xdef3ff, transparent: true, opacity: 0.85 }),
      BIRD_COUNT
    );
    this.birds.frustumCulled = false;

    // ── 雲：半透明 sprite 緩慢飄移 ──
    const cloudTexture = makeCloudTexture();
    for (let i = 0; i < CLOUD_COUNT; i += 1) {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: cloudTexture, transparent: true, opacity: 0.32, depthWrite: false })
      );
      sprite.scale.set(6 + i * 1.6, 2.2 + i * 0.5, 1);
      sprite.position.set(-8 + i * 7, 7.4 + i * 0.7, -4 - i * 2);
      this.clouds.push(sprite);
      root.add(sprite);
    }

    root.add(this.trunks, this.crowns, this.panels, this.shelterBodies, this.shelterRoofs, this.cars, this.birds);
  }

  /** 依地格與州況重建實體配置（呼叫時機：updateFromState）。 */
  update(state: CityState, layer: DataLayerId): void {
    this.lastLayer = layer;
    let treeIndex = 0;
    let panelIndex = 0;
    let shelterIndex = 0;
    const crownColor = new THREE.Color();
    const decorVisible = layer === 'none'; // 圖層模式下隱藏地格實體，讓科學色階可讀

    for (const district of state.districts) {
      const origin = this.districtOrigins.get(district.id);
      if (!origin) continue;

      if (district.id === 'core') this.birdCenter.copy(origin);

      district.cells.forEach((cell, cellIndex) => {
        const col = cellIndex % CELL_GRID_SIZE;
        const row = Math.floor(cellIndex / CELL_GRID_SIZE);
        const cx = origin.x + (col - (CELL_GRID_SIZE - 1) / 2) * TILE_SIZE;
        const cz = origin.z + (row - (CELL_GRID_SIZE - 1) / 2) * TILE_SIZE;
        const cellSeed = district.id.charCodeAt(0) * 97 + cellIndex * 31;

        if (cell === 'green' && decorVisible) {
          const treeCount = 2 + Math.floor(pseudo(cellSeed) * 3);
          for (let t = 0; t < treeCount && treeIndex < MAX_TREES; t += 1) {
            const jx = (pseudo(cellSeed + t * 7) - 0.5) * TILE_SIZE * 0.7;
            const jz = (pseudo(cellSeed + t * 13) - 0.5) * TILE_SIZE * 0.7;
            const s = 0.8 + pseudo(cellSeed + t * 19) * 0.55;

            dummy.position.set(cx + jx, 0.15 + 0.13 * s, cz + jz);
            dummy.scale.setScalar(s);
            dummy.rotation.set(0, pseudo(cellSeed + t) * Math.PI, 0);
            dummy.updateMatrix();
            this.trunks.setMatrixAt(treeIndex, dummy.matrix);

            dummy.position.y = 0.15 + (0.26 + 0.1) * s;
            dummy.updateMatrix();
            this.crowns.setMatrixAt(treeIndex, dummy.matrix);
            // 樹冠色相微抖動，避免「複製貼上」感
            crownColor.setHSL(0.36 + pseudo(cellSeed + t * 5) * 0.05, 0.55, 0.32 + pseudo(cellSeed + t * 3) * 0.1);
            this.crowns.setColorAt(treeIndex, crownColor);
            treeIndex += 1;
          }
        } else if (cell === 'solar' && decorVisible) {
          for (let p = 0; p < 2 && panelIndex < MAX_PANELS; p += 1) {
            dummy.position.set(
              cx + (p - 0.5) * 0.5,
              0.2,
              cz + (pseudo(cellSeed + p) - 0.5) * 0.3
            );
            dummy.rotation.set(-0.42, 0, 0); // 朝南傾角
            dummy.scale.setScalar(1);
            dummy.updateMatrix();
            this.panels.setMatrixAt(panelIndex, dummy.matrix);
            panelIndex += 1;
          }
        } else if (cell === 'shelter' && decorVisible && shelterIndex < MAX_SHELTERS) {
          dummy.position.set(cx, 0.26, cz);
          dummy.rotation.set(0, pseudo(cellSeed) * Math.PI * 0.5, 0);
          dummy.scale.setScalar(1);
          dummy.updateMatrix();
          this.shelterBodies.setMatrixAt(shelterIndex, dummy.matrix);
          dummy.position.y = 0.26 + 0.19;
          dummy.rotation.y += Math.PI / 4;
          dummy.updateMatrix();
          this.shelterRoofs.setMatrixAt(shelterIndex, dummy.matrix);
          shelterIndex += 1;
        }
      });

      this.updateLabel(district, origin, layer);
    }

    // 其餘 instance 縮為 0（隱藏）
    for (let i = treeIndex; i < MAX_TREES; i += 1) {
      this.trunks.setMatrixAt(i, hiddenMatrix);
      this.crowns.setMatrixAt(i, hiddenMatrix);
    }
    for (let i = panelIndex; i < MAX_PANELS; i += 1) this.panels.setMatrixAt(i, hiddenMatrix);
    for (let i = shelterIndex; i < MAX_SHELTERS; i += 1) {
      this.shelterBodies.setMatrixAt(i, hiddenMatrix);
      this.shelterRoofs.setMatrixAt(i, hiddenMatrix);
    }

    this.trunks.instanceMatrix.needsUpdate = true;
    this.crowns.instanceMatrix.needsUpdate = true;
    if (this.crowns.instanceColor) this.crowns.instanceColor.needsUpdate = true;
    this.panels.instanceMatrix.needsUpdate = true;
    this.shelterBodies.instanceMatrix.needsUpdate = true;
    this.shelterRoofs.instanceMatrix.needsUpdate = true;

    // 鳥群數量：生物多樣性的視覺回饋（43 分 ≈ 6 隻，80 分 ≈ 10 隻）
    this.birdVisible = Math.max(3, Math.min(BIRD_COUNT, Math.round(3 + state.biodiversity / 9)));
  }

  /** 每幀動畫：車流、鳥群、雲。 */
  tick(elapsed: number): void {
    // ── 車流：矩形巡行 ──
    let carIndex = 0;
    const half = 2.62;
    const perimeter = half * 8;
    for (const origin of this.districtOrigins.values()) {
      for (let c = 0; c < CARS_PER_DISTRICT; c += 1) {
        const speed = 0.55 + pseudo(carIndex * 23) * 0.35;
        const t = ((elapsed * speed + carIndex * 1.7) % perimeter + perimeter) % perimeter;
        const { x, z, angle } = rectPath(t, half);
        dummy.position.set(origin.x + x, 0.27, origin.z + z);
        dummy.rotation.set(0, angle, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        this.cars.setMatrixAt(carIndex, dummy.matrix);
        carIndex += 1;
      }
    }
    this.cars.instanceMatrix.needsUpdate = true;
    if (this.cars.instanceColor) this.cars.instanceColor.needsUpdate = true;

    // ── 鳥群：環繞地標螺旋盤旋 ──
    for (let i = 0; i < BIRD_COUNT; i += 1) {
      if (i >= this.birdVisible) {
        this.birds.setMatrixAt(i, hiddenMatrix);
        continue;
      }
      const phase = i * 0.7;
      const radius = 3.2 + (i % 4) * 0.55;
      const angle = elapsed * (0.32 + (i % 3) * 0.07) + phase;
      const x = this.birdCenter.x + Math.cos(angle) * radius;
      const z = this.birdCenter.z + Math.sin(angle) * radius;
      const y = 6.4 + Math.sin(elapsed * 1.6 + phase) * 0.4 + (i % 3) * 0.35;
      dummy.position.set(x, y, z);
      // 錐尖朝飛行方向
      dummy.rotation.set(Math.PI / 2, 0, -angle);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      this.birds.setMatrixAt(i, dummy.matrix);
    }
    this.birds.instanceMatrix.needsUpdate = true;

    // ── 雲：緩慢飄移、循環 ──
    this.clouds.forEach((cloud, i) => {
      cloud.position.x += 0.0035 + i * 0.0012;
      if (cloud.position.x > 14) cloud.position.x = -14;
    });
  }

  /** 街區名稱 / UHI ΔT 浮動標籤（canvas sprite）。 */
  private updateLabel(district: DistrictState, origin: THREE.Vector3, layer: DataLayerId): void {
    const text =
      layer === 'uhi'
        ? `${district.name}  ${(district.uhiDeltaC ?? 0) >= 0 ? '+' : ''}${(district.uhiDeltaC ?? 0).toFixed(1)}°C`
        : layer === 'runoff'
          ? `${district.name}  C=${(district.runoffCoefficient ?? 0).toFixed(2)}`
          : district.name;
    const accent = layer === 'uhi' ? '#ffb070' : layer === 'runoff' ? '#7fd4ff' : '#9fe8d8';
    const cacheKey = `${text}|${accent}`;

    let entry = this.labels.get(district.id);
    if (!entry) {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ transparent: true, depthWrite: false, opacity: 0.92 })
      );
      sprite.position.set(origin.x, 3.4, origin.z);
      sprite.renderOrder = 9;
      this.root.add(sprite);
      entry = { sprite, cacheKey: '' };
      this.labels.set(district.id, entry);
    }

    if (entry.cacheKey !== cacheKey) {
      entry.cacheKey = cacheKey;
      const texture = makeLabelTexture(text, accent);
      const material = entry.sprite.material as THREE.SpriteMaterial;
      material.map?.dispose();
      material.map = texture;
      material.needsUpdate = true;
      const aspect = (texture.image as HTMLCanvasElement).width / (texture.image as HTMLCanvasElement).height;
      entry.sprite.scale.set(0.55 * aspect, 0.55, 1);
    }

    // 標籤只在一般與 UHI/逕流圖層顯示，避免干擾其他色階判讀
    entry.sprite.visible = layer === 'none' || layer === 'uhi' || layer === 'runoff';
  }
}

/** 矩形巡行路徑：周長參數 t → 位置與朝向。 */
function rectPath(t: number, half: number): { x: number; z: number; angle: number } {
  const side = half * 2;
  if (t < side) return { x: -half + t, z: -half, angle: Math.PI / 2 };
  if (t < side * 2) return { x: half, z: -half + (t - side), angle: 0 };
  if (t < side * 3) return { x: half - (t - side * 2), z: half, angle: -Math.PI / 2 };
  return { x: -half, z: half - (t - side * 3), angle: Math.PI };
}

/** 柔邊雲朵 canvas 貼圖。 */
function makeCloudTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;
  for (const [x, y, r] of [[70, 56, 38], [120, 44, 46], [175, 56, 36], [120, 64, 50]] as const) {
    const gradient = ctx.createRadialGradient(x, y, 4, x, y, r);
    gradient.addColorStop(0, 'rgba(225,238,248,0.85)');
    gradient.addColorStop(1, 'rgba(225,238,248,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 96);
  }
  return new THREE.CanvasTexture(canvas);
}

/** 街區標籤 canvas 貼圖（深底 + 亮字 + 細框）。 */
function makeLabelTexture(text: string, accent: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = '600 30px "Noto Sans TC", system-ui, sans-serif';
  const width = Math.ceil(ctx.measureText(text).width) + 36;
  canvas.width = width;
  canvas.height = 52;

  const context = canvas.getContext('2d')!;
  context.fillStyle = 'rgba(6, 20, 27, 0.78)';
  roundRect(context, 1, 1, width - 2, 50, 12);
  context.fill();
  context.strokeStyle = accent;
  context.globalAlpha = 0.55;
  roundRect(context, 1, 1, width - 2, 50, 12);
  context.stroke();
  context.globalAlpha = 1;
  context.font = '600 30px "Noto Sans TC", system-ui, sans-serif';
  context.fillStyle = accent;
  context.textBaseline = 'middle';
  context.fillText(text, 18, 27);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 2;
  return texture;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
