export interface LocationDetails {
  village?: string;
  town?: string;
  mandi?: string;
  subdistrict?: string;
  district?: string;
  state?: string;
  country?: string;
  accuracyMeters?: number;
  latitude: number;
  longitude: number;
  source: 'gps' | 'manual' | 'default';
  resolvedName: string;
}

export interface WeatherData {
  area: string;
  latitude: number;
  longitude: number;
  temperature: number; // °C
  humidity: number; // %
  windSpeed: number; // km/h
  weatherCode: number;
  condition: string;
  lastUpdated: string;
  locationDetails?: LocationDetails;
  hourly: {
    time: string[]; // ISO or formatted HH:mm
    temperature: number[]; // °C
    rainProbability: number[]; // %
  };
}

export type GeographicLevel = 'Village' | 'Taluk' | 'District' | 'State' | 'National';

export interface LgdVillage {
  code: number;
  name: string;
  subdistrictCode: number;
  districtCode: number;
}

export interface YieldRecord {
  crop: string;
  region: string; // District, Taluk or Village name
  year: number;
  yieldTonnesPerHa: number;
  areaHa?: number;
  productionTonnes?: number;
  season?: string; // Kharif, Rabi, Summer, Whole Year
  state?: string;
  stateLgdCode?: number;
  district?: string;
  districtLgdCode?: number;
  subdistrict?: string; // Taluk in Karnataka, Tehsil/Mandal elsewhere
  subdistrictLgdCode?: number;
  village?: string;
  villageLgdCode?: number;
  yieldKgPerHa?: number;
  source?: string;
  sourceUrl?: string;
  geographicLevel?: GeographicLevel;
  reportingPeriod?: string; // e.g. "2023-24"
  lastUpdated?: string;
  isTalukSpecific?: boolean;
  isDistrictAverage?: boolean;
  datasetProvenance?: 'Official Government Record' | 'Sample / Baseline Record';
  coverageGapNotes?: string;
}

export interface LgdSubdistrict {
  code: number;
  name: string;
  districtCode: number;
  type: 'Taluk' | 'Tehsil' | 'Subdivision' | 'Mandal' | 'Block';
  villages?: LgdVillage[];
}

export interface LgdDistrict {
  code: number;
  name: string;
  stateCode: number;
  subdistricts: LgdSubdistrict[];
}

export interface LgdState {
  code: number;
  name: string;
  isState: boolean; // true for State, false for UT
  districts: LgdDistrict[];
}

export interface LgdHierarchySelection {
  stateCode: number | null;
  stateName: string | null;
  districtCode: number | null;
  districtName: string | null;
  subdistrictCode: number | null;
  subdistrictName: string | null;
  subdistrictType: 'Taluk' | 'Tehsil' | 'Mandal' | 'Subdistrict / Tehsil';
  villageCode?: number | null;
  villageName?: string | null;
  isDistrictAverageFallback?: boolean;
}

export interface SoilData {
  pH: number;
  nitrogen: number; // kg/ha
  phosphorus: number; // kg/ha
  potassium: number; // kg/ha
  organicCarbon?: number; // %
}

export interface SoilAssessment {
  pHStatus: 'Very Acidic' | 'Moderately Acidic' | 'Neutral (Optimal)' | 'Moderately Alkaline' | 'Strongly Alkaline';
  pHRating: 'low' | 'optimal' | 'high';
  nitrogenStatus: 'Low' | 'Medium' | 'High';
  phosphorusStatus: 'Low' | 'Medium' | 'High';
  potassiumStatus: 'Low' | 'Medium' | 'High';
  overallHealthScore: number; // 0 - 100
  summary: string;
  deficits: {
    nDeficit: number; // kg/ha to reach optimal
    pDeficit: number; // kg/ha to reach optimal
    kDeficit: number; // kg/ha to reach optimal
  };
}

export interface CropRecommendation {
  crop: string;
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'Whole Year';
  matchScore: number; // 0 - 100%
  expectedYieldRange: string; // e.g. "3.5 - 4.5 t/ha"
  explanation: string;
  soilSuitability: string;
  weatherSuitability: string;
}

export interface FertilizerRecommendation {
  name: string;
  dosage: string; // e.g. "120 kg/ha Urea"
  applicationTiming: string;
  purpose: string;
  explanation: string;
  source?: string;
  region?: string;
}

export interface FeatureModelStatus {
  isConnected: boolean;
  sourceEndpoint?: string;
  modelName?: string;
  lastSuccessTimestamp?: string;
  lastTestedInput?: string;
  lastPredictionSummary?: string;
  lastError?: string;
}

export interface ModelEndpointConfig {
  yieldEndpointUrl: string;
  diseaseEndpointUrl: string;
  apiKey?: string;
  status: {
    yield: 'disconnected' | 'connected' | 'error';
    disease: 'disconnected' | 'connected' | 'error';
  };
  verifiedConnections: {
    yield: FeatureModelStatus;
    disease: FeatureModelStatus;
  };
}

export interface FeatureSelectionResult {
  allFeaturesCount: number;
  extractedFeatures: string[];
  selectedFeatures: string[];
  psoIterations: number;
  paretoFrontSize?: number;
  redundancyReductionRate: number; // percentage
}

export interface YieldPredictionResult {
  predictedYieldTonnesPerHa: number;
  confidenceInterval: [number, number];
  crop: string;
  region: string;
  season: string;
  selectedFeatures: string[];
  cnnBigruLatentDim: number;
  psoOptimalFitness: number;
  timestamp: string;
  farmAreaAcres?: number;
  totalProductionTonnes?: number;
  totalProductionConfidenceInterval?: [number, number];
  yieldKgPerHa?: number;
  acreageValidationNote?: string;
  modelMetadata?: {
    modelName: string;
    framework: string;
    maeTonnesPerHa: number;
    r2Score: number;
    featuresRetained: number;
    totalFeatures: number;
  };
}

export interface DiseaseDetectionResult {
  diseaseName: string;
  cropName: string;
  confidenceScore: number; // 0 - 1.0 (or %)
  severity: 'Low' | 'Moderate' | 'Severe' | 'Healthy' | 'Uncertain';
  psoSelectedFeatures: string[];
  recommendedAction: string;
  timestamp: string;
  isFoliarLeaf?: boolean;
  isUncertain?: boolean;
  verifiedPilot?: boolean;
  pixelAnalysisSummary?: {
    vegetativeRatioPct: number;
    chlorophyllLevel: string;
    necrosisAreaPct: number;
    chlorosisAreaPct: number;
    lesionShape: string;
    textureContrast: number;
  };
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type NavigationSection =
  | 'overview'
  | 'weather'
  | 'yield-history'
  | 'yield-predict'
  | 'disease'
  | 'soil'
  | 'recommendations'
  | 'optimization'
  | 'pipeline'
  | 'settings';

export type LanguageCode =
  | 'en' // English (Default)
  | 'as' // Assamese (অসমীয়া)
  | 'bn' // Bengali (বাংলা)
  | 'brx' // Bodo (बड़ो)
  | 'doi' // Dogri (डोगरी)
  | 'gu' // Gujarati (ગુજરાતી)
  | 'hi' // Hindi (हिन्दी)
  | 'kn' // Kannada (ಕನ್ನಡ)
  | 'ks' // Kashmiri (कॉशुर / کٲشُر)
  | 'kok' // Konkani (कोंकणी)
  | 'mai' // Maithili (मैथिली)
  | 'ml' // Malayalam (മലയാളം)
  | 'mni' // Manipuri (মৈতৈলোন্)
  | 'mr' // Marathi (मराठी)
  | 'ne' // Nepali (नेपाली)
  | 'or' // Odia (ଓଡ଼ିଆ)
  | 'pa' // Punjabi (ਪੰਜਾਬੀ)
  | 'sa' // Sanskrit (संस्कृतम्)
  | 'sat' // Santali (ᱥᱟᱱᱛᱟᱲᱤ)
  | 'sd' // Sindhi (سنڌي / सिंधी)
  | 'ta' // Tamil (தமிழ்)
  | 'te' // Telugu (తెలుగు)
  | 'ur'; // Urdu (اردو)

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

