/**
 * rng.ts — 可重現的偽隨機數。
 * 課堂用途：全班使用相同 seed 時，事件抽選與任務變體完全一致，
 * 才能比較「不同決策 → 不同結果」；研究用途：實驗可重現。
 *
 * 設計：無共享可變狀態。以 (seed, ...streams) 雜湊出 [0,1) 的值，
 * 同一組輸入永遠回傳同一個數。
 */

/** 32-bit 整數雜湊（splitmix32 變體）。 */
function hash32(value: number): number {
  let h = value | 0;
  h = (h + 0x9e3779b9) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x21f0aaad);
  h = Math.imul(h ^ (h >>> 15), 0x735a2d97);
  return (h ^ (h >>> 15)) >>> 0;
}

/** 由 seed 與任意 stream 值（如回合數、用途代碼）取得確定性的 [0,1) 值。 */
export function randFromSeed(seed: number, ...streams: number[]): number {
  let h = hash32(seed);
  for (const stream of streams) {
    h = hash32(h ^ hash32(stream));
  }
  return h / 4294967296;
}

/** 確定性地從陣列挑一個元素。 */
export function pickFromSeed<T>(items: readonly T[], seed: number, ...streams: number[]): T {
  const index = Math.floor(randFromSeed(seed, ...streams) * items.length);
  return items[Math.min(items.length - 1, index)];
}

/** 產生新 seed（非確定性，只用於開新局）。 */
export function createSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}
