# 遊戲物件美術掃描報告（climate-resilience-lab）

> 歷史掃描：其中的地格建造建議已停止採用。現行 3D 地表物件只作為政策落地後的視覺回饋。

掃描範圍：`CityWorld.ts`（~1900 行渲染層）、`cityWorldHelpers.ts`、後製管線。
評估鏡頭：physics-rpg-3d skill 的 3D 視覺準則（發光材質、燈光分層、世界內文字、低環境光+焦點色光），改編適用於 vanilla Three.js。

---

## 總評

| 面向 | 現況 | 評級 |
|---|---|---|
| 程序化幾何 | 全 BoxGeometry 建築 + 程序化窗燈 + 101 地標 | ★★★ |
| 材質 | MeshStandardMaterial 平色，少量 emissive | ★★ |
| 燈光 | cue palette 驅動天空/霧色，事件點光源 | ★★★ |
| 特效 | 雨絲/濺水/閃電/塔吊等已升級 | ★★★★ |
| 世界生命感 | 無車流、無行人、無樹木實體 | ★ |
| 資訊圖形 | 地格磚、圖層色階、選取外框 | ★★★ |

最大缺口：**地格是「色塊」而不是「東西」**。綠地格是一塊綠色平面，而不是樹。

---

## P1：把地格變成實體物件（最高價值，美術×教學雙贏）

政策種樹後，玩家應該「看到樹長出來」，而不是色塊變綠。用 InstancedMesh 依地格類型放置實體：

- `green` 格 → 3–5 棵程序化樹（圓錐+圓柱，或 icosahedron 樹冠），帶輕微風搖（vertex 或 group rotation）
- `solar` 格 → 深藍發光斜面板陣列（`emissive: #2244aa`，白天反光）
- `water` 格 → 小水面（複用現有 water shader uniforms）
- `permeable` 格 → 淺綠灰交錯小磚紋（canvas texture）
- `shelter` 格 → 小屋 + 琥珀色 emissive 標誌

實作：每種類型一個 `InstancedMesh` pool（樹 ~600 instances 上限），`updateFromState` 時依 cells 重排 instance matrix。成本：一個渲染模組；效益：政策因果「看得見」，這正是這款遊戲的教學核心。

## P2：建築材質與輪廓多樣化

1. **每棟建築 hue/高度抖動**：現在同街區建築共用一個 material。改 `InstancedMesh` + `instanceColor`，每棟 ±5% 色相、±10% 明度抖動，立刻擺脫「箱子陣」感。
2. **屋頂道具**：水塔（圓柱+錐頂）、空調箱（小盒）、欄杆（line）隨機放在 20% 屋頂——天際線豐富度的最便宜手段。
3. **archetype 剪影差異**：工業區加 2–3 根煙囪（圓柱+程序化煙粒子，接 `industryLoad`）；海港區加貨櫃堆（彩色小盒陣）與岸吊；住宅區屋頂改低斜頂（兩個傾斜 box）。
4. **窗燈升級**：現在是整面 opacity。改 canvas texture 每棟隨機點亮窗格（夜間 + `energySecurity` 連動閃爍），配合 bloom 效果極好。

## P3：世界生命感（SimCity 沉浸的關鍵差距）

- **車流**：InstancedMesh 小車沿街道線移動（每街區 4–6 台，沿現有 streetGrid 線段 lerp），夜間頭尾燈 emissive。
- **河面船隻**：1–2 艘小船沿河道緩慢往返。
- **鳥群**：10–15 個三角形 billboard 繞 101 盤旋（山坡區樹冠多時數量增加 → 生物多樣性的視覺回饋！）。
- **雲**：3–4 團半透明 billboard 雲緩慢飄移，颱風事件時變暗加速。

## P4：燈光與後製（對齊 skill 風格準則）

- 低環境光 + 焦點色光已有雛形；建議加 **hemisphere light**（天空藍上/地面暖下）改善 box 立面的平板感。
- **晝夜循環**（之前評估過）：與回合綁定——每回合從清晨到夜晚，熱夜事件夜景泛紅，窗燈亮起。skill 準則的「Low ambient + colored point lights at physics focus」在夜景下最出效果。
- 後製補 **vignette + 輕量 color grading**：白天偏清爽青綠（對齊 #5eead4 系），災害時偏對應 cue 色。
- 選取街區：外框已有，加 **呼吸式 emissive 脈動** + 街區名稱 canvas sprite billboard（skill 的 Text/Billboard 概念，vanilla 用 CanvasTexture sprite 實現）。

## P5：資訊圖形精緻化

- 圖層模式：色階改 viridis 漸層紋理（1D texture lookup）取代 HSL 線性，並在畫面角落加色階圖例（HUD 已可放）。
- UHI 圖層時：每街區頂部浮動 `+2.3°C` canvas sprite——數字直接放在世界裡，比側欄更直觀（skill 的 world-space Text 原則）。
- 政策施工完成瞬間：目標地格白光 flash + 上升光柱，把「哪幾格被轉換」標出來。

---

## 建議順序

P1（地格實體化）→ P2.1+P2.2（建築抖動+屋頂道具，半天等級）→ P3.1（車流）→ P4（晝夜+後製）→ 其餘。
P1 與 P2 都走 InstancedMesh，效能預算安全（現有 40fps 上限策略不變）。
