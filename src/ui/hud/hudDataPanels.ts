import type { ClimateDataSourceStatus } from '../../game/data/climateDataService';
import { API_RESOURCES } from '../../game/data/resourceRegistry';
import type {
  CityState,
  DistrictState,
  MissionObjectiveProgress,
  PolicyAction,
  TurnResolution
} from '../../game/simulation/types';
import {
  escapeHtml, formatDecimal, formatLargeNumber, formatMoney, formatObjectiveValue,
  formatPercent, formatSdgs, formatSignedDecimal, isRiskMetric, metricLabel, positiveTone, riskTone
} from './hudFormat';

type DataLoadStatus = 'idle' | 'loading' | 'ready' | 'error';
type ClimateSignalKey = keyof CityState['climateSignals'];

export function dataTutorialOverlay(
  state: CityState,
  dataStatus: DataLoadStatus,
  sourceStatuses: ClimateDataSourceStatus[],
  dataError?: string
): string {
  const signalRows = climateSignalRows(state);
  const riskStories = climateRiskStoryRows(state);
  const sourceSummary = sourceQualitySummary(sourceStatuses);

  return `
    <section class="modal-scrim data-scrim">
      <article class="guide-card data-briefing-card">
        <button class="close-btn" type="button" aria-label="關閉資料教學" data-close-data-guide>x</button>
        <span>城市資料診斷課</span>
        <h1>今天的台北，哪裡最需要被保護？</h1>
        <p>
          你現在不是在看一份 API 清單，而是在替一座城市做上場前的健康檢查。等一下你會用有限預算做政策選擇，
          所以先要讀懂：現在最危險的是熱、雨、空氣，還是哪個街區特別脆弱。
        </p>
        ${dataStatus === 'loading' ? `<div class="data-loading-strip">公開資料載入中，請稍候...</div>` : ''}
        ${
          dataStatus === 'error'
            ? `<div class="data-status-error">資料載入失敗：${escapeHtml(dataError ?? '未知錯誤')}</div>`
            : ''
        }

        <div class="data-lesson-hero">
          <section class="lesson-role-card">
            <span>你的角色</span>
            <h2>城市韌性決策小組</h2>
            <p>
              你要在 4 回合內降低風險、守住公共健康，還要注意政策是否照顧到弱勢街區。
              每次按下政策前，都要能說出「我根據哪個資料做判斷」。
            </p>
          </section>
          <section class="lesson-checklist">
            <span>開始前先回答</span>
            <b>這些數據正在告訴我什麼風險？</b>
            <ul>
              <li>哪一種災害壓力最明顯？</li>
              <li>哪一種街區會被放大傷害？</li>
              <li>哪個政策最能對準任務目標？</li>
            </ul>
          </section>
        </div>

        <section class="data-section">
          <div class="data-section-title">
            <span>1</span>
            <div>
              <h2>先讀城市病歷：四個風險問題</h2>
              <p>不要先背數字。先把每個數字翻成一個生活問題，才會知道政策為什麼有用。</p>
            </div>
          </div>
          <div class="risk-story-grid">
            ${riskStories
              .map(
                (story) => `
                  <article class="risk-story-card ${story.tone}">
                    <span>${story.kicker}</span>
                    <h3>${story.title}</h3>
                    <strong>${story.value}</strong>
                    <p>${story.question}</p>
                    <small>${story.whyItMatters}</small>
                    <b>${story.policyHint}</b>
                  </article>
                `
              )
              .join('')}
          </div>
        </section>

        <section class="data-section">
          <div class="data-section-title">
            <span>2</span>
            <div>
              <h2>四個科學概念：為什麼同一場災害傷害不同人？</h2>
              <p>氣候災害不是只有天氣本身，還要看城市表面、地形、服務可近性與社會差異。</p>
            </div>
          </div>
          <div class="concept-grid">
            ${conceptRows()}
          </div>
        </section>

        <section class="data-section">
          <div class="data-section-title">
            <span>3</span>
            <div>
              <h2>本次任務起始數據：看單位，也看方向</h2>
              <p>這些數字會變成遊戲初始條件。數值越大不一定越好或越壞，要看它代表壓力、資源還是人口背景。</p>
            </div>
          </div>
          <div class="data-signal-grid">
            ${signalRows
              .map(
                (row) => `
                  <article class="data-signal-card" data-signal="${row.key}">
                    <span>${row.label}</span>
                    <strong>${row.value}</strong>
                    <p>${row.meaning}</p>
                    <small>${row.gameLink}</small>
                  </article>
                `
              )
              .join('')}
          </div>
        </section>

        <section class="data-section">
          <div class="data-section-title">
            <span>4</span>
            <div>
              <h2>資料如何接到後面的模擬任務</h2>
              <p>同一個城市壓力會因街區條件不同而放大或降低，所以政策不是平均撒錢，而是要找出脆弱處。</p>
            </div>
          </div>
          <div class="data-bridge-grid">
            ${dataBridgeRows(state)}
          </div>
        </section>

        <section class="data-section data-reading-flow">
          <div class="data-section-title">
            <span>5</span>
            <div>
              <h2>開始任務前的三個判讀題</h2>
              <p>這不是操作說明，而是進入模擬前的科學推理暖身。</p>
            </div>
          </div>
          <div class="student-question-grid">
            ${studentQuestionRows()}
          </div>
        </section>

        <section class="data-section">
          <div class="data-section-title">
            <span>6</span>
            <div>
              <h2>資料品質與限制</h2>
              <p>${sourceSummary}</p>
            </div>
          </div>
          <div class="source-summary-strip">
            ${sourceStatusSummaryBadges(sourceStatuses)}
          </div>
          <div class="data-source-table">
            <div class="data-source-head">
              <b>來源</b><b>提供的線索</b><b>判讀限制</b>
            </div>
            ${dataSourceRows(sourceStatuses)}
          </div>
        </section>

        <div class="data-tutorial-actions">
          <button class="ghost-btn large" type="button" data-close-data-guide>回到任務簡介</button>
          <button class="primary-btn large" type="button" data-start-mission ${dataStatus === 'ready' ? '' : 'disabled'}>
            我已理解資料，開始任務
          </button>
        </div>
      </article>
    </section>
  `;
}

export function climateRiskStoryRows(state: CityState): Array<{
  kicker: string;
  title: string;
  value: string;
  question: string;
  whyItMatters: string;
  policyHint: string;
  tone: 'heat' | 'rain' | 'air' | 'civic';
}> {
  const signals = state.climateSignals;

  return [
    {
      kicker: '熱',
      title: '近年暑季是否已經有熱浪壓力？',
      value: `${formatDecimal(signals.heatwaveDaysPerSeason)} 熱浪日 / ${formatDecimal(signals.tropicalNightsPerSeason)} 熱夜`,
      question: '這裡看的是近 5 個完整暖季，不是今天。熱浪日越多，代表城市每年需要面對的高溫壓力越常出現。',
      whyItMatters: '熱夜會讓身體沒有恢復時間，會增加中暑、用電尖峰與戶外工作風險。',
      policyHint: '等一下優先檢查：樹冠降溫、降溫避難網、弱勢街區可近性。',
      tone: 'heat'
    },
    {
      kicker: '雨',
      title: '雨季強降雨是否讓街區更容易積水？',
      value: `${formatDecimal(signals.heavyRainDaysPerSeason)} 強降雨日 / ${formatDecimal(signals.precipitationAnomalyRatio, 2)} 倍`,
      question: '這裡看近 5 個完整暖季的強降雨日與雨量異常，不是某一天剛好下大雨。',
      whyItMatters: '同一場雨，低窪河岸和鋪面多的街區會比高地或濕地旁更容易積水。',
      policyHint: '等一下優先檢查：海綿街廓、濕地緩衝、防洪能力。',
      tone: 'rain'
    },
    {
      kicker: '空氣',
      title: '空污會不會讓健康分數掉得更快？',
      value: `${formatDecimal(signals.pm25UgM3)} µg/m³ PM2.5`,
      question: 'PM2.5 很小，可以進入呼吸系統；產業排放、交通與風速都會影響暴露。',
      whyItMatters: '老人、兒童、氣喘族群與戶外工作者，通常不是平均承受風險。',
      policyHint: '等一下優先檢查：產業空污治理、電動公車、空氣監測網。',
      tone: 'air'
    },
    {
      kicker: '城市',
      title: '人口集中會不會放大政策後果？',
      value: `${formatLargeNumber(signals.population)} 人 / 都市人口 ${formatPercent(signals.urbanPopulationRatio)}`,
      question: '人越集中，交通、排水、能源、綠地和避難設施就越需要精準配置。',
      whyItMatters: '公共健康與公平性不是抽象分數，而是關係到許多人的日常風險與服務可近性。',
      policyHint: '等一下優先檢查：公共健康、公平性、SDG 11 永續城市。',
      tone: 'civic'
    }
  ];
}

export function conceptRows(): string {
  const concepts = [
    {
      title: '暴露',
      body: '人、建築、道路或學校是否位在高溫、淹水、空污會影響的地方。',
      example: '例：河岸住宅區遇到豪雨，比高地更容易被水影響。'
    },
    {
      title: '脆弱度',
      body: '同樣遇到災害，哪些族群或街區比較缺少資源保護自己。',
      example: '例：老人、兒童、戶外工作者，面對熱浪時健康風險更高。'
    },
    {
      title: '調適',
      body: '用工程、自然系統與社會服務降低災害造成的傷害。',
      example: '例：樹蔭、避難點、海綿鋪面和濕地都屬於調適策略。'
    },
    {
      title: '取捨',
      body: '預算和政策數量有限，不能第一年把全部政策都買完。',
      example: '例：先救熱風險最高街區，可能暫時犧牲能源或產業治理速度。'
    }
  ];

  return concepts
    .map(
      (concept) => `
        <article class="concept-card">
          <h3>${concept.title}</h3>
          <p>${concept.body}</p>
          <small>${concept.example}</small>
        </article>
      `
    )
    .join('');
}

export function studentQuestionRows(): string {
  const questions = [
    {
      title: '先判斷主要威脅',
      prompt: '熱、雨、空氣三種壓力中，哪一種最可能讓本關失敗？你用哪個數值判斷？'
    },
    {
      title: '再判斷脆弱街區',
      prompt: '同樣的氣候壓力落到不同街區，哪裡會被放大？是低海拔、少樹蔭、交通弱，還是產業負荷高？'
    },
    {
      title: '最後選政策證據',
      prompt: '如果只能確認 2 項政策，你要先投資哪兩項？請說出它們分別對準哪個風險與任務目標。'
    }
  ];

  return questions
    .map(
      (question, index) => `
        <article class="student-question-card">
          <span>${index + 1}</span>
          <h3>${question.title}</h3>
          <p>${question.prompt}</p>
        </article>
      `
    )
    .join('');
}

export function sourceQualitySummary(sourceStatuses: ClimateDataSourceStatus[]): string {
  const loaded = sourceStatuses.filter((source) => source.status === 'loaded').length;
  const limited = sourceStatuses.filter((source) => source.status === 'failed' || source.status === 'skipped').length;
  const fallback = sourceStatuses.filter((source) => source.status === 'fallback').length;

  return `本次整理到 ${loaded} 個即時來源，${limited} 個來源受網路、API key 或缺測限制影響，${fallback} 個基準補值來源用來補足欄位。這不是要學生相信每個數字都完美，而是練習判斷資料品質。`;
}

export function sourceStatusSummaryBadges(sourceStatuses: ClimateDataSourceStatus[]): string {
  const counts = sourceStatuses.reduce<Record<ClimateDataSourceStatus['status'], number>>(
    (accumulator, source) => ({
      ...accumulator,
      [source.status]: accumulator[source.status] + 1
    }),
    { loaded: 0, failed: 0, skipped: 0, fallback: 0 }
  );

  const labels: Array<[ClimateDataSourceStatus['status'], string]> = [
    ['loaded', '即時載入'],
    ['failed', '連線失敗'],
    ['skipped', '缺 key 或缺測'],
    ['fallback', '基準補值']
  ];

  return labels
    .map(([status, label]) => `<span class="source-status-badge ${status}">${label} ${counts[status]}</span>`)
    .join('');
}

export function dataSourceRows(sourceStatuses: ClimateDataSourceStatus[]): string {
  const statusByName = new Map(sourceStatuses.map((source) => [source.name, source]));
  const sourceRows = [
    ...API_RESOURCES.map((source) => {
      const teaching = dataSourceTeaching(source.name);
      const status = statusByName.get(source.name);
      return {
        name: source.name,
        url: source.url,
        status,
        pulledData: teaching.pulledData,
        studentNote: teaching.studentNote
      };
    }),
    {
      name: '台北本地基準補值',
      url: `${import.meta.env.BASE_URL}data/taipei-climate-baseline.json`,
      status: statusByName.get('台北本地基準補值'),
      pulledData: '作為教室離線或 API 缺項時的台北基準補值，避免單一資料源失效讓課程中斷。',
      studentNote: '不是玩家可切換的假資料；它用來補足缺漏欄位，讓同一套任務仍能討論資料不確定性。'
    }
  ];

  return sourceRows
    .map(
      (source) => `
        <div class="data-source-row">
          <div>
            <a href="${source.url}" target="_blank" rel="noreferrer">${source.name}</a>
            ${source.status ? sourceStatusBadge(source.status) : ''}
          </div>
          <p>${source.pulledData}</p>
          <p>
            ${source.studentNote}
            ${source.status ? `<small class="source-status-note">目前狀態：${escapeHtml(source.status.note)}</small>` : ''}
          </p>
        </div>
      `
    )
    .join('');
}

export function sourceStatusBadge(source: ClimateDataSourceStatus): string {
  const labels: Record<ClimateDataSourceStatus['status'], string> = {
    loaded: '已載入',
    failed: '失敗',
    skipped: '略過',
    fallback: '補值'
  };

  return `<span class="source-status-badge ${source.status}">${labels[source.status]}</span>`;
}

export function dataSourceTeaching(name: string): { pulledData: string; studentNote: string } {
  const teaching: Record<string, { pulledData: string; studentNote: string }> = {
    'Open-Meteo': {
      pulledData: '近 5 個完整暖季的每日最高溫、最低溫、平均溫與日雨量，轉成熱浪日、熱夜、強降雨日與暖季月雨量。',
      studentNote: '用來回答「近年暑季與雨季風險是否常態化」，會直接推動熱風險與洪水風險分數。'
    },
    'NASA POWER': {
      pulledData: '同一段近 5 個完整暖季的每日太陽輻射，補強能源與太陽能潛力判讀。',
      studentNote: '用來討論為什麼屋頂太陽能、能源韌性與極端高溫會被放進同一個城市決策。'
    },
    '內政部戶政司人口統計（靜態內建）': {
      pulledData: '臺北市 2024 年底人口統計快照，作為城市暴露人口的背景尺度。',
      studentNote: '這不是街區人口普查；畫面會清楚標示年份，避免把靜態快照誤認成即時人口。'
    },
    'Open-Meteo 空氣品質（CAMS）': {
      pulledData: '近 7 天的逐時 PM2.5（哥白尼大氣監測 CAMS 全球/歐洲再分析），平均後作為當前空污輸入。',
      studentNote: '免金鑰即可取得真實 PM2.5，會換算成 US EPA AQI 後推動空氣風險與公共健康分數。'
    },
    'OpenAQ（選用，需 API key）': {
      pulledData: '地面測站的 PM2.5 觀測；提供 API key 時，會以更在地的測站值覆蓋 CAMS 再分析值。',
      studentNote: '比較 CAMS 再分析與地面測站，可討論「模式 vs 實測」以及資料尺度與代表性的差異。'
    }
  };

  return (
    teaching[name] ?? {
      pulledData: '公開資料源。',
      studentNote: '請在課堂上檢查資料來源、尺度、時間與可能限制。'
    }
  );
}

export function climateSignalRows(state: CityState): Array<{
  key: ClimateSignalKey;
  label: string;
  value: string;
  meaning: string;
  gameLink: string;
}> {
  const signals = state.climateSignals;

  return [
    {
      key: 'meanTemperatureC',
      label: '暖季平均氣溫',
      value: `${formatDecimal(signals.meanTemperatureC)} °C`,
      meaning: '近 5 個完整暖季的近地面平均溫度，用來描述城市暑季背景，而不是今天氣溫。',
      gameLink: '進入熱風險換算；與熱浪日、熱夜一起形成城市熱壓力。'
    },
    {
      key: 'temperatureAnomalyC',
      label: '暖季溫度異常',
      value: `${formatSignedDecimal(signals.temperatureAnomalyC)} °C`,
      meaning: '代表暖季平均氣溫相對 27 °C 教學基準偏高或偏低多少。',
      gameLink: '正值越大，熱風險分數越高；樹冠與降溫避難設施會降低影響。'
    },
    {
      key: 'heatwaveDaysPerSeason',
      label: '熱浪日',
      value: `${formatDecimal(signals.heatwaveDaysPerSeason)} 日/暖季`,
      meaning: '近 5 個完整暖季中，每年平均最高溫達熱浪門檻的天數。',
      gameLink: '直接轉入熱風險分數，讓關卡主題不受今天剛好熱不熱影響。'
    },
    {
      key: 'tropicalNightsPerSeason',
      label: '熱夜',
      value: `${formatDecimal(signals.tropicalNightsPerSeason)} 日/暖季`,
      meaning: '近 5 個完整暖季中，每年平均夜間最低溫仍偏高的天數。',
      gameLink: '熱夜會加重健康壓力，特別影響老舊住宅與弱勢族群。'
    },
    {
      key: 'monthlyPrecipitationMm',
      label: '暖季月雨量',
      value: `${formatDecimal(signals.monthlyPrecipitationMm, 0)} mm`,
      meaning: '近 5 個完整暖季的平均每月雨量，協助學生感覺雨季累積壓力。',
      gameLink: '會推動洪水暴露；低海拔、河岸、海港與不透水鋪面多的街區更容易被放大。'
    },
    {
      key: 'precipitationAnomalyRatio',
      label: '降雨異常倍率',
      value: `${formatDecimal(signals.precipitationAnomalyRatio, 2)} 倍`,
      meaning: '把暖季月雨量與強降雨日合併成雨季壓力倍率。1 倍附近代表接近教學基準，高於 1 代表偏濕或強降雨偏多。',
      gameLink: '倍率越高，下一年遇到豪雨或排水不足事件時，洪水風險會更難壓低。'
    },
    {
      key: 'heavyRainDaysPerSeason',
      label: '強降雨日',
      value: `${formatDecimal(signals.heavyRainDaysPerSeason)} 日/暖季`,
      meaning: '近 5 個完整暖季中，每年平均單日雨量達強降雨門檻的天數。',
      gameLink: '直接轉入洪水風險分數，尤其會放大河岸、海港與低窪街區風險。'
    },
    {
      key: 'pm25UgM3',
      label: 'PM2.5',
      value: `${formatDecimal(signals.pm25UgM3)} µg/m³`,
      meaning: '細懸浮微粒會進入呼吸系統，對老人、兒童、氣喘族群與戶外工作者影響較大。',
      gameLink: '進入空氣風險與公共健康計算；產業空污治理、電動公車與監測網會降低暴露。'
    },
    {
      key: 'solarKwhM2Day',
      label: '太陽輻射',
      value: `${formatDecimal(signals.solarKwhM2Day, 2)} kWh/m²/day`,
      meaning: '表示每天每平方公尺大約可接收多少太陽能，是估計屋頂太陽能潛力的線索。',
      gameLink: '支援屋頂太陽能與能源韌性政策；日照條件越好，低碳能源投資越容易被解釋。'
    },
    {
      key: 'population',
      label: '人口背景',
      value: `${formatLargeNumber(signals.population)} 人`,
      meaning: '代表暴露人口的背景尺度。人口越集中，政策失誤或災害影響的人數可能越多。',
      gameLink: '用來提醒玩家：公共健康與公平性不是抽象分數，而是關係到很多人的日常風險。'
    },
    {
      key: 'urbanPopulationRatio',
      label: '都市人口比',
      value: `${formatPercent(signals.urbanPopulationRatio)}`,
      meaning: '表示人口集中在都市地區的比例。都市化越高，熱島、交通與排水壓力越需要治理。',
      gameLink: '連到 SDG 11 永續城市；政策要同時考慮基礎設施、交通、綠地與弱勢可近性。'
    }
  ];
}

export function dataBridgeRows(state: CityState): string {
  const bridges = [
    {
      title: '熱風險',
      score: `目前 HUD：${Math.round(state.heatRisk)}`,
      formula: '暖季溫度異常 + 熱浪日 + 熱夜 + 不透水鋪面 - 樹冠覆蓋 - 降溫可近性',
      explanation: '遊戲會先把近 5 個暖季的熱浪資料換成熱壓力，再依街區柏油、樹蔭與避難點調整。',
      policies: '都市樹冠降溫、降溫避難網、公民科學監測網'
    },
    {
      title: '洪水風險',
      score: `目前 HUD：${Math.round(state.floodRisk)}`,
      formula: '暖季月雨量 + 強降雨日 + 降雨異常倍率 + 低海拔/河岸/海港 - 防洪能力',
      explanation: '遊戲會先把多年雨季強降雨換成水壓力，再依地形高度、排水、濕地與不透水面調整。',
      policies: '海綿街廓改造、濕地緩衝帶、河岸街區治理'
    },
    {
      title: '空氣風險',
      score: `目前 HUD：${Math.round(state.airQualityRisk)}`,
      formula: 'PM2.5 + 產業負荷 - 大眾運輸可近性 - 樹冠覆蓋',
      explanation: 'PM2.5 先換成空污壓力，再依產業區、交通可近性與樹冠覆蓋調整街區暴露。',
      policies: '產業空污治理、電動公車與低碳路網、公民科學監測網'
    },
    {
      title: '公共健康與公平性',
      score: `健康 ${Math.round(state.publicHealth)} / SDGs ${Math.round(state.sdgScore)}`,
      formula: '熱、洪水、空污風險 + 服務可近性 + 弱勢街區差異',
      explanation: '公共健康會由三種暴露分數扣分，再由降溫可近性與公平性補回；SDG 分數也會跟著變動。',
      policies: '降溫避難網、街區監測、公平導向的政策排序'
    }
  ];

  return bridges
    .map(
      (bridge) => `
        <article class="data-bridge-card">
          <h3>${bridge.title}</h3>
          <em>${bridge.score}</em>
          <b>${bridge.formula}</b>
          <p>${bridge.explanation}</p>
          <small>政策連結：${bridge.policies}</small>
        </article>
      `
    )
    .join('');
}
