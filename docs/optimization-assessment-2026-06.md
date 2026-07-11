# 氣候韌性實驗室 — 優化評估報告（2026-06）

> 歷史評估：其中的格網建造提案已由 2026-07 的產品決策取代。現行核心鎖定政策審議；地表格網只用於呈現政策結果，不提供玩家直接建造。

評估範圍：`src/` 全部模組（scienceModel、climateDataService、apiClients、advanceTurn、cityScenario、missions、policies、CityWorld、HUD、audio）。
目標：朝「模擬城市（SimCity）級沉浸體驗 + 嚴謹科學教育內容」演進。

---

## 0. 現況快照與總評

| 面向 | 現況 | 評級 |
|---|---|---|
| 科學模型 | IPCC AR6 H×E×V 三層拆解；常數具名附出處（Ziter et al. 2019 PNAS、EPA 2024 PM2.5 AQI breakpoints、合理化公式逕流、CWA/WMO 門檻）；純函式可測試，已有單元測試 | ★★★★（同類教育遊戲少見的嚴謹度） |
| 真實資料 | Open-Meteo、CAMS 空品、NASA POWER、World Bank、OpenAQ（選用）；Promise.allSettled 容錯 + 台北本地基準補值 + 來源狀態面板（教資料不確定性） | ★★★★ |
| 遊戲形態 | 6 個固定街區、8 張政策卡、5 種事件、單一熱浪任務、4 回合即結束 | ★★（離 SimCity 最遠的一環） |
| 視覺呈現 | Three.js 程序化城市 + 粒子特效 + 程序化天空/水面，氛圍有基礎 | ★★★ |
| 互動沉浸 | 點選街區 + 卡片式 HUD；無建造、無圖層、無鏡頭自由度；5 秒年度轉場以 setTimeout 鎖死輸入 | ★★ |

核心結論：**瓶頸不在科學，在「空間性」**。SimCity 的沉浸來自「我把東西放在哪裡，世界就在哪裡改變」。目前政策是套用在整個街區的抽象數值，玩家沒有空間決策。好消息是你的科學模型天生就是空間模型（UHI、逕流、樹冠都是面積分率），把它格網化是一次到位的升級，同時強化兩個方向。

---

## 1. 方向一：遊戲物件、美學與玩家體驗

### 1.1 結構性升級：從「街區卡牌」到「格網建造」（最高優先）

- 把每個街區改成 8×8 ~ 16×16 的 cell grid（全城約 24×24 即可，不必像 SimCity 4 那麼大）。每個 cell 有地表類型：柏油、建築、樹冠、透水鋪面、水體、滯洪池、太陽能屋頂、避難中心…
- 政策從「點卡片」變成「放置建設」：種樹 = 在地圖上刷樹冠 cell；海綿街廓 = 把鋪面 cell 換成透水 cell。**街區的 `imperviousness`、`canopyCover` 等參數改由 cell 統計聚合而來**，現有 scienceModel 完全不用改公式，只是輸入來源從手填變成空間統計。
- 空間鄰近效應（科學上站得住）：樹蔭降溫對鄰近 2–3 cell 衰減擴散（kernel）；滯洪池只削減同集水分區的逕流。這讓「放在哪」變成真實的科學決策——也正是 COV（控制變因）的天然教材。
- 工程量評估：grid 資料結構 + cell 編輯互動 + 聚合函式，約是現有 simulation 層 1.5 倍的程式量；渲染用 `InstancedMesh`（樹、建築各一個 instanced pool）即可支撐數千物件不掉幀。

### 1.2 資料圖層（SimCity 的靈魂，也是科學教育的靈魂）

- 加入可切換的 overlay layers：UHI ΔT°C 熱圖、逕流係數圖、AQI 圖、人口暴露圖、公平指數圖。模型中間量（`uhiDeltaC`、`runoffCoefficient`）已經算好了，只差視覺化。
- 實作：每街區（或每 cell）一張 `DataTexture` 著色到地面 plane，shader 做雙線性平滑；圖層切換按鈕放 HUD 左下，配色用科學標準色階（如 viridis/inferno），順便教「為什麼科學圖不用紅綠色階」。
- 教學玩法：政策套用前後圖層 diff 動畫（before/after swipe），即 CER 的 Evidence 自動生成器。

### 1.3 鏡頭、時間與生命感

- 鏡頭：目前缺自由度。加 orbit + pan + zoom（限制 polar angle 與距離避免穿模），雙擊街區聚焦。SimCity 式 45° 斜視角為預設。
- 晝夜循環：天空 shader 已存在，接上 24 小時循環；夜晚窗燈亮起（windowMaterial emissive 已有材質基礎）。熱夜事件時夜景泛紅 + 熱浪 haze，把 `tropicalNightsPerSeason` 變成「看得見」的危害。
- 季節/天氣：challenge 觸發對應天氣 VFX（颱風雨帶 = 雨幕 + 河水位上升 + 低窪 cell 積水材質；靜風空污 = haze 濃度與 AQI 連動）。haze、water shader 都已存在，只需參數接到模型輸出。
- 環境生命：instanced 小車沿街道 spline 移動、行人點粒子、鳥群。低成本高沉浸。
- 修正既有體驗問題：
  - `YEAR_TRANSITION_MS = 5000` 用 `setTimeout` 硬鎖 5 秒且不可跳過——改成可點擊跳過的演出，或事件序列播完即解鎖。
  - `getRandomChallengeForTurn` 與任務變體用 `Math.random()`——改成**可設定 seed 的 RNG**（mulberry32 即可）。課堂上全班同 seed 才能比較決策差異，研究上才可重現。
  - 加存檔/讀檔（state 已是可序列化純物件，localStorage 即可）與回合 undo。

### 1.4 遊戲循環與內容量

- 4 回合單任務太短，建議三層結構：
  1. **章節任務**（現有 mission 系統擴充）：熱浪 → 洪水 → 空污 → 能源 → 綜合，每章引入一個新圖層與一組新政策，作為漸進式教學（scaffolding）。
  2. **沙盒模式**：無限回合 + 可調 SSP 情境（見 2.2），SimCity 式自由經營。
  3. **挑戰模式**：載入「今天的真實資料」生成任務參數，每週不同。
- 政策 8 張偏少，目標 16–20 張並引入取捨張力：例如「堤防加高」短期降洪但增加熱島與生態破壞（levee effect）、「燃氣調峰」保供電但增排放——目前政策幾乎全是正面效果，缺乏 SimCity 式的痛苦取捨，這也是真實氣候治理的核心。
- 內容外部化：policies / challenges / missions 移到 JSON（含 schema 驗證），讓教師不改碼即可命題。

### 1.5 美學細項

- 建築改用少量 GLTF 模組化資產（每 archetype 3–4 款）+ instancing，取代純 BoxGeometry；保留現有程序化窗燈。
- 後製：已有 post pipeline，建議 bloom（夜景窗燈）+ 輕量 SSAO + vignette；色調分級偏向《天際線》清爽日光而非灰暗，符合高中受眾。
- HUD：資訊密度偏高，建議「預設極簡 + hover 展開」：常駐只留年份/預算/SDG 環形指標與圖層切換，其餘收進側欄。指標變化用 count-up 動畫與 delta 箭頭。
- 音訊：程序化 WebAudio 方向正確，加主/音效分軌音量與依圖層切換的 ambience 變化。

---

## 2. 方向二：真實資料 API 與科學運算邏輯

### 2.1 先肯定再挑刺

做得對的：EPA 2024 breakpoints 取代線性誤用、UHI 用 Ziter et al. (2019) 實證靈敏度、合理化公式逕流、AR6 風險框架、來源狀態面板把「資料缺漏」本身當教材、`normalizeClimateSignals` 防呆夾限、純函式 + 測試。這個底子值得保留並往上蓋。

### 2.2 模型修正與升級（按科學重要性排序）

1. **Hazard/Vulnerability 混層**：`computeDistrictScience` 把 `coolingAccess * 3` 放進 `uhiDeltaC`（°C）裡。冷房可及性不改變戶外氣溫，是脆弱度而非危害——應移到 `heatVulnerability` 項。目前寫法會讓「UHI ΔT」這個給學生做 CER 舉證的物理量失真（蓋避難中心會讓街區「變涼 °C」，是錯誤概念來源）。
2. **氣候演化 ad hoc**：`advanceYear` 用 `+0.04°C/yr + emissions/3200` 自編暖化率。建議改接 **IPCC AR6 SSP 情境**：開局讓玩家選 SSP1-2.6 / SSP2-4.5 / SSP5-8.5，逐年升溫與極端日數查表自 AR6 WG1（或直接用 **Open-Meteo Climate API**，免費提供 CMIP6 降尺度逐日預估到 2050，含台北座標）。城市排放對全球溫度的回饋幾乎為零，現在的寫法在科學上會誤導（「我市減排所以全球變涼」）；正確敘事是「減緩看情境、調適看你的城市」，這本身就是一堂重要的課。
3. **熱-健康關係**：health proxy 目前是線性加權。可升級為文獻型暴露-反應：以 Gasparrini et al. (2015, *The Lancet*) 的熱-死亡相對風險曲線形狀（高於最適溫度後 RR 指數上升）做一階近似，並把熱夜權重明確標注（夜間無恢復 → 額外乘數）。維持「教學一階近似」定位，但曲線形狀對（非線性、有門檻），學生才不會學到「升溫與死亡成正比」。
4. **洪水**：合理化公式適合教學；下一步可加「重現期」概念——challenge 給定降雨重現期（10 年 / 50 年 / 100 年事件），用簡化 IDF 思路換算強度，讓「氣候變遷 = 同重現期雨量上修」可被操作與觀察。
5. **AQI 映射**：`airClimateHazard = AQI/225*100` 的 225 是任意錨點，建議直接以 EPA 類別（Good/Moderate/USG/Unhealthy…）分段給分並在 UI 顯示官方色帶，與課本/新聞一致。

### 2.3 資料來源擴充

| 來源 | 用途 | 備註 |
|---|---|---|
| Open-Meteo **Climate API**（CMIP6） | SSP 情境逐年驅動（2.2 第 2 點） | 免金鑰，與現有 client 同生態，**首推** |
| 中央氣象署開放資料平臺（CWA） | 台灣測站實況、高溫/豪雨特報 | 對台灣課堂在地感最強；需免費金鑰 |
| World Bank **CCKP** | 國家級氣候預估與歷史統計 | 補 World Bank 人口資料的氣候面 |
| NASA GISTEMP / Berkeley Earth | 歷史溫度距平曲線（資料素養單元：自己畫暖化曲線） | 靜態 CSV 即可，不必 API |
| EPA AirNow 或 CAMS 預報 | 「未來 3 天空品」挑戰模式 | CAMS 已在用，加預報端點即可 |

工程面：加 localStorage 快取（TTL 6–24h）避免課堂 30 人同時打 API 被限流；`apiClients` 加上逐來源 timeout 與重試一次。

### 2.4 教學機制（把模型「打開」給學生）

- **實驗模式（COV）**：凍結時間，提供變因滑桿（樹冠率、不透水率、PM2.5…），即時看圖層與指標反應——等於把 scienceModel 變成可操作的 PhET 式模擬。純函式架構讓這幾乎是免費的。
- **CER 證據抽屜**：每回合自動收集「資料點」（本回合 UHI ΔT、逕流係數、AQI、政策前後 delta + 資料來源），任務結算時要求學生用這些證據組 Claim-Evidence-Reasoning 短文（可接你既有的 CER rubric）。
- **模型透明卡**：每個指標附「這個數字怎麼算」展開面板，顯示公式（KaTeX）、常數出處與「模型限制」聲明——把 scienceModel.ts 的註解直接變成 UI 內容，現成素材。
- **學習歷程 log**：記錄每次政策選擇、圖層切換、預覽查看（時間戳 + state snapshot hash），匯出 JSON/CSV，供行為-認知-後設三角驗證分析（可直接套用你 physics-modeling-assessment 的框架，發 PER/科教期刊用）。
- **前後測掛載**：任務開始前/結束後各一組嵌入式選擇題（迷思概念導向：如「種樹降溫主因是遮蔭+蒸散而非製造氧氣」），與 log 一起匯出。

---

## 3. 架構調整建議

現有分層（simulation 純函式 / render / ui / data）方向正確，大改不需推翻，重點調整：

1. `simulation` 抽成獨立 package（zero-DOM），加 seeded RNG 注入——可單測、可在 Node 跑 batch 模擬（平衡性調參用）、可重現。
2. 新增 `world/` 層：grid 資料結構 + cell→district 聚合器，介於 content 與 simulation 之間。
3. 內容（policies/missions/challenges/變體）全部 JSON + zod 驗證，支援教師自製情境包。
4. 渲染改 instancing + 資產載入（loadGltf.ts 已有雛形），加 LOD 與 frustum 剔除預算：目標中階筆電 60fps。
5. 測試：scienceModel 已有測試，補 advanceTurn 的回合不變量測試（預算守恆、clamp 邊界、seed 重現性）。

---

## 4. 優先序路線圖

| 階段 | 內容 | 效益 |
|---|---|---|
| **P0（1–2 週）** | 修 Hazard/Vulnerability 混層；seeded RNG；可跳過轉場；存讀檔；AQI 官方色帶；API 快取 | 科學正確性 + 課堂可用性，全是小改 |
| **P1（3–6 週）** | 資料圖層 overlay + 政策前後 diff；SSP 情境接 Open-Meteo Climate API；實驗模式（COV 滑桿）；CER 證據抽屜；orbit 鏡頭 + 晝夜循環 | 教育價值與沉浸感同步躍升，未動大架構 |
| **P2（2–3 月）** | 格網建造系統 + cell 聚合；政策→建設放置化；章節任務線（熱→洪→空污→能源）+ 沙盒模式；GLTF 資產 + instancing + 後製；學習 log + 前後測 | 真正的「模擬城市式」體驗 + 可發表的研究工具 |

一句話總結：**科學核心已達標，先用 P0/P1 把「模型打開給學生看」，再用 P2 的格網建造把「空間決策」交還給玩家——那一步完成時，它才同時是 SimCity 和科學教室。**
