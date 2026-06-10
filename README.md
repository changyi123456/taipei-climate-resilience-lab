# 台北氣候韌性實驗城

一款以國高中科學教育為目標的 2.5D/3D 城市氣候韌性模擬遊戲。玩家扮演城市韌性決策團隊，在有限預算與每回合政策上限下，閱讀真實氣候與城市資料，選擇降溫、防洪、空污治理、能源韌性與公共健康政策，觀察政策如何影響街區風險與 SDGs 指標。

## 遊戲特色

- Three.js WebGL 2.5D/3D 城市場景。
- 以台北為主題的街區、河岸、海綿街廓、熱島區、產業排放區與山坡保育區。
- 遊戲前置資料教學，將氣候資料轉成國高中生可理解的城市風險問題。
- 真實資料來源與本機 fallback 基準資料並行，外部 API 無法連線時仍可進行教學模擬。
- 政策選擇採「先查看教材，再確認投資」流程，並有每回合政策上限。
- 支援桌面與平板版面。

## 資料來源

遊戲資料層參考並整合下列公開來源：

- Open-Meteo Historical Weather API
- NASA POWER
- OpenAQ
- World Bank Population API
- UN SDG API
- Taipei baseline fallback data: `public/data/taipei-climate-baseline.json`

目前遊戲會以近 5 個完整暖季作為熱浪、防洪與城市氣候風險的主要教學區間，避免只用單日天氣造成「今天不熱就沒有熱浪風險」的誤解。

## 本機執行

```bash
npm install
npm run dev
```

預設 Vite 伺服器會啟動在 `http://127.0.0.1:5177/`。若該連接埠被占用，Vite 會改用下一個可用連接埠。

## 建置

```bash
npm run build
```

## 自動化 QA

啟動本機 dev server 後可執行：

```bash
node scripts/qa-playwright.mjs
```

QA 會檢查桌面與平板視窗中的資料教學、任務目標、街區數值、政策確認、預算扣除、政策上限與下一年轉場流程，並輸出截圖與報告到 `qa/`。此資料夾屬於本機測試產物，不會被提交到 Git。
