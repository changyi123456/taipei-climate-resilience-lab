export interface ExternalResource {
  name: string;
  role: string;
  url: string;
  licenseOrAccess: string;
  productionUse: string;
}

export const GITHUB_RESOURCES: ExternalResource[] = [
  {
    name: 'Three.js',
    role: 'Primary 2.5D/3D WebGL renderer and GLB runtime.',
    url: 'https://github.com/mrdoob/three.js/',
    licenseOrAccess: 'MIT',
    productionUse: 'Use for camera, lighting, PBR materials, post-processing, GLTFLoader, and KTX2 texture support.'
  },
  {
    name: 'MapLibre GL JS',
    role: 'Future geospatial district-selection layer.',
    url: 'https://github.com/maplibre/maplibre-gl-js',
    licenseOrAccess: 'BSD-3-Clause',
    productionUse: 'Use when real city maps and vector tiles become part of the pre-game setup.'
  },
  {
    name: 'Mesa',
    role: 'Optional agent-based model backend.',
    url: 'https://github.com/mesa/mesa',
    licenseOrAccess: 'Apache-2.0',
    productionUse: 'Use for resident, commute, heat exposure, and policy adoption simulations.'
  },
  {
    name: 'A-Frame',
    role: 'Optional WebXR classroom mode.',
    url: 'https://github.com/aframevr/aframe',
    licenseOrAccess: 'MIT',
    productionUse: 'Use if the project later needs browser-based VR learning stations.'
  }
];

export const API_RESOURCES: ExternalResource[] = [
  {
    name: 'Open-Meteo',
    role: 'Weather and climate stressors.',
    url: 'https://open-meteo.com/en/docs',
    licenseOrAccess: 'Free public API, no key for normal use.',
    productionUse: 'Temperature, precipitation, wind, flood expansion, and classroom-friendly live data.'
  },
  {
    name: 'NASA POWER',
    role: 'Solar radiation and climate-energy signals.',
    url: 'https://power.larc.nasa.gov/docs/services/api/',
    licenseOrAccess: 'Free public API.',
    productionUse: 'Solar potential, precipitation, temperature, and renewable energy missions.'
  },
  {
    name: 'World Bank Indicators API',
    role: 'Population and development indicators.',
    url: 'https://datahelpdesk.worldbank.org/knowledgebase/articles/889392',
    licenseOrAccess: 'Free public API, no key.',
    productionUse: 'Population, urbanization, energy access, GDP, education, and health context.'
  },
  {
    name: 'UNSD SDG API',
    role: 'Official SDG metadata.',
    url: 'https://unstats.un.org/SDGAPI/swagger/',
    licenseOrAccess: 'Free public API.',
    productionUse: 'SDG indicator labels, official framing, and report outputs.'
  },
  {
    name: 'Open-Meteo Air Quality (CAMS)',
    role: 'Air quality (PM2.5) without an API key.',
    url: 'https://open-meteo.com/en/docs/air-quality-api',
    licenseOrAccess: 'Free public API, no key. Data from Copernicus CAMS.',
    productionUse: 'Default real-time PM2.5 source feeding the US EPA AQI and air-risk model.'
  },
  {
    name: 'OpenAQ (optional)',
    role: 'Ground-station air quality observations.',
    url: 'https://docs.openaq.org/about/about',
    licenseOrAccess: 'Free account, API key required.',
    productionUse: 'Optional: when a key is supplied, station PM2.5 overrides the CAMS reanalysis. Keep key out of client code for production.'
  }
];

