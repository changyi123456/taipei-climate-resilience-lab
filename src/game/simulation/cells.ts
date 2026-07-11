/**
 * cells.ts — 政策地表格網的核心（純函式）。
 *
 * 每個街區是 4×4 = 16 格地格（cell）。地格是政策落地後的地表狀態，
 * 科學模型的 imperviousness / canopyCover / solarCoverage 不再是手填參數，
 * 而是由已採納政策造成的土地利用變化聚合而來。
 */

import { randFromSeed } from './rng';
import type { DistrictState } from './types';

/** 確定性偽隨機（0–1），與 rng.ts 共用雜湊。 */
function pseudo(n: number): number {
  return randFromSeed(0x9e3779, n);
}

export type CellType =
  | 'pavement' // 不透水鋪面（柏油/水泥）
  | 'building' // 建築
  | 'green' // 樹冠綠地
  | 'permeable' // 透水鋪面 / 雨水花園
  | 'water' // 水體 / 滯洪空間
  | 'solar' // 太陽能屋頂鋪面
  | 'shelter'; // 降溫避難設施

export const CELLS_PER_DISTRICT = 16;
export const CELL_GRID_SIZE = 4;

export interface CellInfo {
  /** 渲染地格磚的顏色。 */
  color: number;
  /** 各地格對街區參數的貢獻（聚合用）。 */
  imperviousness: number;
  canopy: number;
  solar: number;
}

export const CELL_INFO: Record<CellType, CellInfo> = {
  pavement: {
    color: 0x4d565e,
    imperviousness: 1,
    canopy: 0,
    solar: 0
  },
  building: {
    color: 0x3a4a56,
    imperviousness: 1,
    canopy: 0,
    solar: 0
  },
  green: {
    color: 0x2e8b4f,
    imperviousness: 0.05,
    canopy: 1,
    solar: 0
  },
  permeable: {
    color: 0x7d9c6a,
    imperviousness: 0.2,
    canopy: 0.1,
    solar: 0
  },
  water: {
    color: 0x2d7fa8,
    imperviousness: 0,
    canopy: 0,
    solar: 0
  },
  solar: {
    color: 0x8a6fc9,
    imperviousness: 0.9,
    canopy: 0,
    solar: 1
  },
  shelter: {
    color: 0xc9913d,
    imperviousness: 0.9,
    canopy: 0,
    solar: 0
  }
};

export interface DerivedSurface {
  imperviousness: number;
  canopyCover: number;
  solarCoverage: number;
  /** 滯洪水體格的防洪加成（每格 +0.04）。 */
  floodDefenseBonus: number;
  /** 避難設施格的降溫可及性加成（每格 +0.06）。 */
  coolingAccessBonus: number;
}

/** 地格 → 街區地表參數的聚合（科學模型的輸入來源）。 */
export function deriveSurface(cells: CellType[]): DerivedSurface {
  let imperv = 0;
  let canopy = 0;
  let solar = 0;
  let waterCells = 0;
  let shelterCells = 0;

  for (const cell of cells) {
    const info = CELL_INFO[cell];
    imperv += info.imperviousness;
    canopy += info.canopy;
    solar += info.solar;
    if (cell === 'water') waterCells += 1;
    if (cell === 'shelter') shelterCells += 1;
  }

  const n = Math.max(1, cells.length);
  return {
    imperviousness: imperv / n,
    canopyCover: canopy / n,
    solarCoverage: solar / n,
    floodDefenseBonus: waterCells * 0.04,
    coolingAccessBonus: shelterCells * 0.06
  };
}

/**
 * 依街區的目標參數（archetype 設計值）+ seed 產生初始地格。
 * 讓初始地格的聚合值近似原本手填的 imperviousness/canopyCover/solarCoverage。
 */
export function generateInitialCells(
  district: Pick<DistrictState, 'id' | 'imperviousness' | 'canopyCover' | 'solarCoverage' | 'coolingAccess'>,
  seed: number
): CellType[] {
  const cells: CellType[] = [];
  const greenCount = Math.round(district.canopyCover * CELLS_PER_DISTRICT);
  const solarCount = Math.round(district.solarCoverage * CELLS_PER_DISTRICT * 0.8);
  const shelterCount = district.coolingAccess > 0.38 ? 1 : 0;
  const permeableCount = Math.max(
    0,
    Math.round((1 - district.imperviousness) * CELLS_PER_DISTRICT) - greenCount
  );
  const buildingCount = Math.min(
    CELLS_PER_DISTRICT - greenCount - solarCount - shelterCount - permeableCount,
    6 + Math.floor(pseudoFromId(district.id, seed) * 3)
  );

  for (let i = 0; i < greenCount; i += 1) cells.push('green');
  for (let i = 0; i < permeableCount; i += 1) cells.push('permeable');
  for (let i = 0; i < solarCount; i += 1) cells.push('solar');
  for (let i = 0; i < shelterCount; i += 1) cells.push('shelter');
  for (let i = 0; i < Math.max(0, buildingCount); i += 1) cells.push('building');
  while (cells.length < CELLS_PER_DISTRICT) cells.push('pavement');
  cells.length = CELLS_PER_DISTRICT;

  // 以 seed 確定性洗牌（同 seed → 同地圖）
  for (let i = cells.length - 1; i > 0; i -= 1) {
    const j = Math.floor(pseudo(seed % 9973 + i * 37 + district.id.length * 11) * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  return cells;
}

function pseudoFromId(id: string, seed: number): number {
  let h = seed;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) | 0;
  return pseudo(Math.abs(h));
}

/**
 * 政策的面積效果 → 地格轉換。
 * 例：樹冠 +0.09 → 把 round(0.09×16)=1~2 格硬鋪面換成綠地。
 * 回傳新的 cells 陣列（不足可轉換格時盡量轉換）。
 */
export function convertCellsForPolicy(
  cells: CellType[],
  key: 'canopyCover' | 'imperviousness' | 'solarCoverage',
  delta: number,
  seed: number
): CellType[] {
  const next = [...cells];
  // 無條件進位：避免面積效果被取整稀釋（0.09×16=1.44 → 2 格），維持政策設計強度。
  const count = Math.max(1, Math.ceil(Math.abs(delta) * CELLS_PER_DISTRICT));

  const convert = (from: CellType[], to: CellType, n: number) => {
    let remaining = n;
    // 從 seed 決定的起點開始找，避免每次都改同一格
    const start = Math.floor(pseudo(seed + n * 13) * CELLS_PER_DISTRICT);
    for (let step = 0; step < CELLS_PER_DISTRICT && remaining > 0; step += 1) {
      const index = (start + step) % CELLS_PER_DISTRICT;
      if (from.includes(next[index])) {
        next[index] = to;
        remaining -= 1;
      }
    }
  };

  if (key === 'canopyCover' && delta > 0) {
    convert(['pavement', 'permeable'], 'green', count);
  } else if (key === 'imperviousness' && delta < 0) {
    convert(['pavement'], 'permeable', count);
  } else if (key === 'solarCoverage' && delta > 0) {
    convert(['building', 'pavement'], 'solar', count);
  }

  return next;
}
