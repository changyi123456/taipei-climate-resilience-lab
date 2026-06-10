# 音效資源包指引（public/audio/）

遊戲音訊採「**樣本優先，程式生成備援**」：你把音檔放進這個資料夾，引擎自動偵測並使用真實音效；沒放檔就退回內建合成音。所以現在不放也能玩，放了就更真實。

## 怎麼用

1. 從下方推薦來源下載 CC0／免費可商用的音檔。
2. 轉成 `.mp3`（或 `.ogg`），用 `manifest.json` 裡的檔名命名，放到 `public/audio/`。
3. 重新整理遊戲即可。建議每個檔 < 1–2 MB；城市環境音建議是可無縫循環的 20–60 秒 loop。

## 需要的檔案（對應 manifest.json）

| 檔名 | 用途 | 建議找的關鍵字 |
|---|---|---|
| `city-ambience.mp3` | 背景城市噪音（循環） | city ambience loop / urban traffic loop |
| `cash-register.mp3` | 政策花錢聲 | cash register / coins / kaching |
| `policy-confirm.mp3` | 政策確認 | UI confirm / build complete |
| `ui-select.mp3` | 選街區點擊 | UI click / select |
| `success.mp3` / `failure.mp3` | 任務成敗 | success jingle / fail |
| `hazard-heat.mp3` | 熱浪（蟬鳴／熱風） | cicada / hot wind / heat |
| `hazard-rain.mp3` | 強降雨雷雨 | rain thunder city |
| `hazard-air.mp3` | 靜風空污（低頻） | low drone / industrial hum |
| `hazard-energy.mp3` | 用電警報 | alarm / power warning |
| `hazard-civic.mp3` | 公民事件 | notification / civic chime |

## 授權乾淨的推薦來源（CC0 / 免費可商用）

- **Kenney – Audio（全部 CC0，免署名）**：UI Audio、Interface Sounds、Impact Sounds。最適合 `ui-select`、`policy-confirm`、`success`、`failure`、`hazard-energy`。https://kenney.nl/assets/category:Audio
- **Freesound.org（篩選 License = CC0）**：城市環境、收銀機、雷雨、蟬鳴等實錄音。例：Rain Loop by qubodup、approaching thunderstorm by Garuda1982。https://freesound.org/
- **OpenGameArt – CC0 Sound Effects**：遊戲用音效合集。https://opengameart.org/content/cc0-sound-effects
- **Pixabay / Mixkit**：免費、免署名（請確認各檔授權頁）。雨聲、城市環境很齊全。https://pixabay.com/sound-effects/ ｜ https://mixkit.co/free-sound-effects/

> 注意授權：Kenney 與標示 CC0 的 Freesound 檔可自由用於課堂與商用；其他平台請逐檔確認是否需署名或限制。下載後建議在本檔附上你實際採用的檔案與其授權出處，方便日後查核。
