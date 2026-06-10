# 資料架構

## 執行邊界

遊戲分成三層，避免把遊戲規則寫死在 3D 物件裡。

`simulation`

負責可儲存的城市狀態、地區資料、政策效果、年度氣候壓力、分數公式與任務結果。不匯入 Three.js。

`data`

負責外部 API 轉接與資料正規化。所有外部資料會先轉成 `ClimateSignals`，模擬層只讀這個精簡資料形狀。

`render`

負責 Three.js 渲染器、相機、燈光、GLB 載入器、後製效果、3D 物件建立、滑鼠/觸控選取與視覺狀態更新。

## 核心資料模型

```ts
type ClimateSignals = {
  meanTemperatureC: number;        // 平均氣溫
  temperatureAnomalyC: number;     // 氣溫距平
  monthlyPrecipitationMm: number;  // 月降雨量
  precipitationAnomalyRatio: number; // 降雨距平倍率
  pm25UgM3: number;                // PM2.5 濃度
  solarKwhM2Day: number;           // 每日太陽能輻照量
  population: number;              // 人口
  urbanPopulationRatio: number;    // 都市人口比例
};
```

```ts
type DistrictState = {
  population: number;       // 地區人口
  elevationM: number;       // 海拔
  imperviousness: number;   // 不透水鋪面比例
  canopyCover: number;      // 樹冠覆蓋率
  transitAccess: number;    // 大眾運輸可近性
  solarCoverage: number;    // 太陽能覆蓋率
  floodDefense: number;     // 防洪能力
  coolingAccess: number;    // 降溫可近性
  industryLoad: number;     // 產業排放負荷
  heatExposure: number;     // 熱暴露
  floodExposure: number;    // 淹水暴露
  airPollution: number;     // 空污暴露
  healthIndex: number;      // 健康指數
  equityIndex: number;      // 公平指數
  resilienceIndex: number;  // 韌性指數
};
```

## API 正規化

遊戲不直接使用 API 原始回應。API client 只回傳部分氣候訊號，`climateDataService.ts` 會把它們合併成標準化的 `ClimateSignals`。

資料優先順序：

1. Open-Meteo 或 NASA POWER：氣溫、降雨與氣候壓力。
2. OpenAQ：空氣品質，若有免費 API key。
3. World Bank：人口與都市化比例。
4. UNSD SDG API：永續發展目標指標名稱與官方脈絡。
5. 本地基準 JSON：網路不可用或課堂離線時使用。

## 課堂安全性

所有 API 都是可選的。即使學校網路或平板連線不穩，遊戲仍可使用本地基準資料進行。

