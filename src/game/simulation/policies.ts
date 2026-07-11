import type { PolicyAction } from './types';

export const POLICIES: PolicyAction[] = [
  {
    id: 'urban-tree-canopy',
    name: '都市樹冠降溫',
    category: 'cooling',
    target: 'district',
    cost: 12,
    sdgs: ['SDG 3', 'SDG 11', 'SDG 13', 'SDG 15'],
    summary: '在街道、校園與熱點周邊增加樹蔭，降低行人熱暴露並改善棲地連通。',
    evidencePrompt: '樹冠會提高遮蔭與蒸散作用，城市熱島壓力下降，健康與韌性分數同步改善。',
    learningFocus: '城市熱島、蒸散作用、自然為本解方',
    scienceNote:
      '深色鋪面會吸收並儲存太陽輻射，樹蔭能減少地表吸熱，葉片蒸散也會帶走熱量，所以同一個城市裡不同街區會有明顯溫差。',
    classroomPrompt: '如果學校附近只能種 50 棵樹，你會優先放在人最多、最熱，還是最弱勢的區域？為什麼？',
    effectExplanation: [
      '樹冠覆蓋率上升，模型會降低該區熱暴露。',
      '降溫通道與可步行陰影增加，健康指標與韌性指標上升。',
      '連續綠地可支持鳥類、昆蟲與土壤生態，因此生物多樣性提高。'
    ],
    tradeoffs: ['樹木需要長期灌溉與養護；若只改善高房價區，可能加劇綠色仕紳化。'],
    cityEffects: { biodiversity: 4, publicTrust: 1 },
    districtEffects: {
      canopyCover: 0.09,
      coolingAccess: 0.04,
      healthIndex: 3,
      resilienceIndex: 4
    }
  },
  {
    id: 'cooling-shelters',
    name: '降溫避難網絡',
    category: 'health',
    target: 'district',
    cost: 8,
    sdgs: ['SDG 3', 'SDG 10', 'SDG 11', 'SDG 13'],
    summary: '把圖書館、活動中心、捷運站與校園納入熱浪避難點，照顧長者與戶外工作者。',
    evidencePrompt: '可抵達的冷房、飲水與照護能降低熱傷害，公平性與公共健康直接受益。',
    learningFocus: '熱傷害、脆弱族群、調適公平',
    scienceNote:
      '熱浪不是只看氣溫，還要看人能不能避開高溫。高齡者、慢性病患者、無空調住戶與戶外工作者暴露時間較長，所以降溫服務會明顯影響健康風險。',
    classroomPrompt: '如果避難中心只能開 12 小時，應該開白天、夜晚，還是分散到不同時段？你會用什麼資料判斷？',
    effectExplanation: [
      '冷房與飲水點提高降溫可近性，該區冷卻可及性大幅上升。',
      '弱勢族群有更容易抵達的避難點，公平指標上升。',
      '熱衰竭與熱中暑風險下降，公共健康改善。'
    ],
    tradeoffs: ['熱浪期間會增加尖峰用電，必須搭配能源管理與弱勢戶補助。'],
    cityEffects: { publicHealth: 2, equity: 3, energySecurity: -2, emissions: 1 },
    districtEffects: {
      coolingAccess: 0.14,
      equityIndex: 4,
      healthIndex: 5,
      resilienceIndex: 3
    }
  },
  {
    id: 'permeable-streets',
    name: '海綿街廓改造',
    category: 'flood',
    target: 'district',
    cost: 14,
    sdgs: ['SDG 6', 'SDG 9', 'SDG 11', 'SDG 13'],
    summary: '把停車格、人行道與廣場改成透水鋪面、雨水花園與滯洪設施。',
    evidencePrompt: '不透水面下降，短延時強降雨時的逕流會變少，淹水暴露降低。',
    learningFocus: '逕流、透水鋪面、都市洪水',
    scienceNote:
      '水落在水泥或柏油上會快速流向低處，排水系統來不及處理就可能積淹水。透水鋪面與雨水花園能讓部分雨水滲入或暫時停留。',
    classroomPrompt: '同樣是花 14 百萬預算，你會先改造商圈、河岸住宅，還是工業區？請用淹水暴露與人口解釋。',
    effectExplanation: [
      '不透水率下降，降雨形成的地表逕流減少。',
      '排水與滯洪能力提高，洪水防護上升。',
      '淹水壓力較低時，街區韌性指標提升。'
    ],
    tradeoffs: ['施工期會影響交通與商家出入，且透水鋪面需要定期清淤。'],
    cityEffects: { publicTrust: 1 },
    districtEffects: {
      imperviousness: -0.08,
      floodDefense: 0.12,
      resilienceIndex: 5
    }
  },
  {
    id: 'wetland-buffer',
    name: '濕地緩衝帶',
    category: 'biodiversity',
    target: 'district',
    cost: 20,
    sdgs: ['SDG 6', 'SDG 11', 'SDG 13', 'SDG 15'],
    summary: '在河岸、海岸與低窪地恢復濕地，吸收洪峰並增加自然棲地。',
    evidencePrompt: '濕地像城市的海綿，可以延緩洪峰、降低水患，同時提高生物多樣性。',
    learningFocus: '自然為本解方、洪峰削減、濕地生態',
    scienceNote:
      '濕地能暫存大量雨水，讓洪峰比較慢到達市區；濕地植物與土壤也能提供棲地、過濾污染物，是兼具防災與生態的調適策略。',
    classroomPrompt: '濕地需要土地，可能會與開發需求衝突。你會如何向居民說明它的防災價值？',
    effectExplanation: [
      '洪水防護顯著提高，城市總洪水風險下降。',
      '硬鋪面轉為自然地表，不透水率下降。',
      '棲地面積與水陸交界增加，生物多樣性大幅提升。'
    ],
    tradeoffs: ['需要保留土地並處理搬遷補償；若缺乏共識，短期可能降低公眾信任。'],
    cityEffects: { biodiversity: 8, floodRisk: -3, publicTrust: -1 },
    districtEffects: {
      floodDefense: 0.16,
      canopyCover: 0.05,
      imperviousness: -0.04,
      resilienceIndex: 7
    }
  },
  {
    id: 'solar-rooftops',
    name: '屋頂太陽能聚落',
    category: 'energy',
    target: 'district',
    cost: 16,
    sdgs: ['SDG 7', 'SDG 9', 'SDG 11', 'SDG 13'],
    summary: '在學校、公宅與工廠屋頂建置太陽能，搭配社區儲能與能源教育。',
    evidencePrompt: '太陽能覆蓋率提升會降低外部電力依賴，排放下降，能源安全提高。',
    learningFocus: '再生能源、尖峰用電、能源安全',
    scienceNote:
      '熱浪時空調需求會上升，電網容易吃緊。分散式太陽能能在白天提供本地電力，若搭配儲能，停電或尖峰時更有韌性。',
    classroomPrompt: '太陽能不一定在晚上發電。你會怎麼設計儲能或用電管理，讓它真正幫助熱浪期間的城市？',
    effectExplanation: [
      '太陽能覆蓋率上升，能源安全指標提高。',
      '使用化石燃料發電的需求降低，城市排放下降。',
      '學校與公共屋頂示範可連結能源教育，教育分數上升。'
    ],
    tradeoffs: ['夜間與陰雨時仍需儲能或其他電源；設備回收也必須納入全生命週期。'],
    cityEffects: { emissions: -5, energySecurity: 6, educationScore: 2 },
    districtEffects: {
      solarCoverage: 0.13,
      resilienceIndex: 2
    }
  },
  {
    id: 'electric-bus-grid',
    name: '電動公車與低碳路網',
    category: 'mobility',
    target: 'district',
    cost: 18,
    sdgs: ['SDG 3', 'SDG 7', 'SDG 11', 'SDG 13'],
    summary: '提升電動公車班距、轉乘節點與安全步行路線，降低私人汽機車依賴。',
    evidencePrompt: '公共運輸可近性提高時，交通排放與空污下降，健康與信任分數改善。',
    learningFocus: '低碳交通、空氣污染、可近性',
    scienceNote:
      '交通排放包含溫室氣體與空氣污染物。當公共運輸更方便，部分旅次會從私人車輛轉移，城市排放與 PM2.5 來源都會降低。',
    classroomPrompt: '如果同學覺得公車變多仍不想搭，你還需要哪些配套政策讓交通轉型真的發生？',
    effectExplanation: [
      '大眾運輸可及性上升，私人車輛依賴下降。',
      '交通排放減少，城市排放與空氣品質風險降低。',
      '通勤選擇變多，公共信任與健康指標改善。'
    ],
    tradeoffs: ['車隊與充電設施會增加初期電力負載，路權重新分配可能引發反對。'],
    cityEffects: { emissions: -6, airQualityRisk: -3, publicTrust: 2, energySecurity: -1 },
    districtEffects: {
      transitAccess: 0.12,
      healthIndex: 3,
      resilienceIndex: 3
    }
  },
  {
    id: 'industrial-filter',
    name: '產業空污治理',
    category: 'industry',
    target: 'district',
    cost: 10,
    sdgs: ['SDG 3', 'SDG 9', 'SDG 11', 'SDG 12'],
    summary: '更新工廠排放控制、即時監測與稽核，降低鄰近社區污染暴露。',
    evidencePrompt: '產業負荷下降會降低街區空污，健康指標與城市空氣品質同步改善。',
    learningFocus: 'PM2.5、環境正義、污染管制',
    scienceNote:
      '細懸浮微粒會進入呼吸道並提高健康風險。工業區附近居民暴露較高，因此污染管制同時也是環境正義議題。',
    classroomPrompt: '如果企業擔心成本上升，你會用哪些健康或社會資料說服城市仍要做空污治理？',
    effectExplanation: [
      '產業負荷下降，該區空氣污染下降。',
      '污染暴露降低，健康指標提高。',
      '城市平均空氣品質風險降低。'
    ],
    tradeoffs: ['企業需要承擔設備與稽核成本；必須避免把污染產業直接外移到其他社區。'],
    cityEffects: { airQualityRisk: -4, publicHealth: 1 },
    districtEffects: {
      industryLoad: -0.1,
      healthIndex: 4,
      resilienceIndex: 2
    }
  },
  {
    id: 'citizen-science-network',
    name: '公民科學感測網',
    category: 'governance',
    target: 'city',
    cost: 7,
    sdgs: ['SDG 3', 'SDG 10', 'SDG 11', 'SDG 13'],
    summary: '讓學生、社區與市府共同佈設溫度、雨量與空氣品質感測點，公開資料儀表板。',
    evidencePrompt: '資料透明會提升公共信任與科學素養，讓資源分配更公平。',
    learningFocus: '資料素養、感測器、公民參與',
    scienceNote:
      '城市風險常常不是平均分布。感測網可以找出熱點、淹水點與空污熱區，讓政策從「感覺」變成可討論的證據。',
    classroomPrompt: '感測器可能有誤差。你會如何驗證資料，避免錯誤數據影響政策決策？',
    effectExplanation: [
      '公開資料讓學生與居民理解風險，教育分數提高。',
      '政策分配更有依據，公共信任提升。',
      '看見弱勢區域的暴露差異，公平指標上升。'
    ],
    tradeoffs: ['感測器有校正誤差與隱私議題，公開資料必須附上品質標記與限制。'],
    cityEffects: {
      educationScore: 8,
      publicTrust: 5,
      equity: 2
    }
  }
];

export function getPolicy(policyId: string): PolicyAction | undefined {
  return POLICIES.find((policy) => policy.id === policyId);
}
