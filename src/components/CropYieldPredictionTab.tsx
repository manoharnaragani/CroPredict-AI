import React, { useState } from 'react';
import {
  TrendingUp,
  Cpu,
  Layers,
  Settings,
  AlertOctagon,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sliders,
  Server,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import { LanguageCode, ModelEndpointConfig, SoilData, WeatherData, YieldPredictionResult } from '../types/index.ts';
import { executeYieldPipeline, YIELD_MODEL_REQUIREMENTS } from '../utils/pipeline.ts';
import { t } from '../utils/i18n.ts';

interface CropYieldPredictionTabProps {
  endpointConfig: ModelEndpointConfig;
  onUpdateConfig?: (updated: ModelEndpointConfig) => void;
  currentSoil: SoilData;
  currentWeather: WeatherData | null;
  onOpenSettings: () => void;
  onOpenPipelineInfo: () => void;
  lang?: LanguageCode;
}

export const CropYieldPredictionTab: React.FC<CropYieldPredictionTabProps> = ({
  endpointConfig,
  onUpdateConfig,
  currentSoil,
  currentWeather,
  onOpenSettings,
  onOpenPipelineInfo,
  lang = 'en',
}) => {
  // Input fields
  const [crop, setCrop] = useState<string>('Rice (Paddy)');
  const [region, setRegion] = useState<string>('Punjab');
  const [season, setSeason] = useState<string>('Kharif');
  const [farmAreaAcres, setFarmAreaAcres] = useState<number>(2.5);
  const [soilPH, setSoilPH] = useState<number>(currentSoil.pH || 6.8);
  const [soilN, setSoilN] = useState<number>(currentSoil.nitrogen || 380);
  const [soilP, setSoilP] = useState<number>(currentSoil.phosphorus || 18);
  const [soilK, setSoilK] = useState<number>(currentSoil.potassium || 210);
  const [temperature, setTemperature] = useState<number>(currentWeather?.temperature || 28.5);
  const [rainfallMm, setRainfallMm] = useState<number>(180);
  const [ndvi, setNdvi] = useState<number>(0.68);

  // Execution state
  const [loading, setLoading] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<YieldPredictionResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; details?: string; isError: boolean } | null>(null);

  // Strictly check if a real prediction has succeeded from this model/endpoint
  const isYieldConnected = endpointConfig.verifiedConnections?.yield?.isConnected === true;
  const verifiedInfo = endpointConfig.verifiedConnections?.yield;

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    const result = await executeYieldPipeline(
      endpointConfig,
      {
        crop,
        region,
        season,
        soil_pH: soilPH,
        soil_N: soilN,
        soil_P: soilP,
        soil_K: soilK,
        avg_temperature: temperature,
        rainfall_mm: rainfallMm,
        ndvi,
        farmAreaAcres,
      },
      updated => {
        onUpdateConfig?.(updated);
      }
    );

    setLoading(false);

    if (result.requiresModelOrData) {
      setExecutionResult(null);
      setStatusMessage({
        text: 'Model or data required.',
        details: result.missingDetails,
        isError: true,
      });
      return;
    }

    if (result.success && result.data) {
      setExecutionResult(result.data);
      setStatusMessage({
        text: result.message,
        isError: false,
      });
    } else {
      setExecutionResult(null);
      setStatusMessage({
        text: 'Model or data required.',
        details: result.missingDetails,
        isError: true,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Scientific Pipeline Flowchart Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 dark:from-emerald-950 dark:to-stone-900 text-white rounded-xl p-4 sm:p-5 shadow-xs border border-emerald-800 dark:border-stone-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-emerald-800/80 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-sm border border-emerald-700/60">
                Core Deep Learning Pipeline
              </span>
              <span className="text-xs text-emerald-300">• {t('navYieldPrediction', lang)}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1">
              CNN-BiGRU Feature Extraction + PSO-NSPSO Feature Selection
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Real Connection Status Badge */}
            {isYieldConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900/90 text-emerald-300 border border-emerald-600 rounded-lg text-xs font-bold shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Model connected</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/80 text-amber-300 border border-amber-700 rounded-lg text-xs font-bold shadow-xs">
                <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('modelOrDataRequired', lang)}</span>
              </span>
            )}

            <button
              onClick={onOpenPipelineInfo}
              className="text-xs font-semibold px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 rounded-lg text-emerald-200 border border-emerald-700 flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-300" />
              <span>Architecture Breakdown</span>
            </button>
          </div>
        </div>

        {/* Pipeline steps */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800/60">
            <span className="font-bold text-emerald-400 block">1. Input Data</span>
            <span className="text-emerald-200 text-[11px]">Soil NPK, pH, weather, crop, season & NDVI</span>
          </div>
          <div className="bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800/60">
            <span className="font-bold text-teal-400 block">2. CNN-BiGRU</span>
            <span className="text-teal-200 text-[11px]">Spatial & bidirectional temporal latent features</span>
          </div>
          <div className="bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800/60">
            <span className="font-bold text-amber-400 block">3. PSO-NSPSO</span>
            <span className="text-amber-200 text-[11px]">Pareto-optimal feature selection</span>
          </div>
          <div className="bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800/60">
            <span className="font-bold text-emerald-300 block">4. Predictor</span>
            <span className="text-emerald-200 text-[11px]">Regressor outputs yield in tonnes/ha</span>
          </div>
        </div>
      </div>

      {/* Model Connection Status Indicator Card */}
      {isYieldConnected && verifiedInfo ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
                  Model connected
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-mono">
                  via {verifiedInfo.sourceEndpoint}
                </span>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                Active: {verifiedInfo.modelName} • Last verified prediction: {verifiedInfo.lastSuccessTimestamp} ({verifiedInfo.lastTestedInput} → {verifiedInfo.lastPredictionSummary})
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
          >
            Manage Endpoint
          </button>
        </div>
      ) : (
        /* Missing Model or Data Alert with Exact Required Details */
        <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertOctagon className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm sm:text-base text-amber-900 dark:text-amber-200">
                  {t('modelOrDataRequired', lang)}
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 max-w-2xl">
                  {statusMessage?.details || 'Trained CNN-BiGRU feature extractor, PSO-NSPSO feature selection, and regressor model are required to generate live predictions in tonnes/hectare without fabricating numbers.'}
                </p>
              </div>
            </div>
            <button
              onClick={onOpenSettings}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Configure Endpoint</span>
            </button>
          </div>

          {/* Exact Required File / Endpoint Specification Box */}
          <div className="bg-amber-100/70 dark:bg-amber-900/30 rounded-lg p-3 text-xs border border-amber-200 dark:border-amber-800/60">
            <span className="font-bold text-amber-900 dark:text-amber-200 block mb-1.5">
              Exact specifications required to connect the Yield Prediction model:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-amber-900 dark:text-amber-200">
              <div className="bg-white/80 dark:bg-stone-900/80 p-2.5 rounded border border-amber-200 dark:border-stone-800 space-y-1">
                <span className="font-bold flex items-center gap-1 text-emerald-800 dark:text-emerald-400">
                  <Server className="w-3.5 h-3.5" /> Option A: Inference Endpoint (REST API)
                </span>
                <p>• <b>Method:</b> POST to configured URL in Settings</p>
                <p>• <b>Request Body:</b> JSON with <code>crop</code>, <code>region</code>, <code>season</code>, <code>soil_pH</code>, <code>soil_N</code>, <code>soil_P</code>, <code>soil_K</code>, <code>avg_temperature</code>, <code>rainfall_mm</code>, <code>ndvi</code></p>
                <p>• <b>Expected Response:</b> <code>&#123; predictedYieldTonnesPerHa: number, selectedFeatures: string[], cnnBigruLatentDim: number, psoOptimalFitness: number &#125;</code></p>
              </div>

              <div className="bg-white/80 dark:bg-stone-900/80 p-2.5 rounded border border-amber-200 dark:border-stone-800 space-y-1">
                <span className="font-bold flex items-center gap-1 text-teal-800 dark:text-teal-400">
                  <FileCode className="w-3.5 h-3.5" /> Option B: Local Trained Model Artifacts
                </span>
                <p>• <b>Feature Extractor:</b> <code>/src/models/yield/cnn_bigru_yield.onnx</code></p>
                <p>• <b>PSO-NSPSO Selection:</b> <code>/src/models/yield/pso_yield_features.json</code></p>
                <p>• <b>Trained Regressor:</b> <code>/src/models/yield/yield_regressor.onnx</code></p>
                <p>• <b>Normalization Params:</b> <code>/src/models/yield/scaler_params.json</code></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Form Inputs and Prediction Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Parameters (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-stone-200 dark:border-stone-800 p-4 sm:p-5 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h4 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Agronomic & Meteorological Input Data
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Inputs fed into the CNN-BiGRU feature extractor
              </p>
            </div>
          </div>

          <form onSubmit={handlePredict} className="mt-4 space-y-4">
            {/* Crop & Region */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Target Crop
                </label>
                <select
                  value={crop}
                  onChange={e => setCrop(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-800 dark:text-stone-100"
                >
                  <option value="Rice (Paddy)">Rice (Paddy)</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Maize (Corn)">Maize (Corn)</option>
                  <option value="Sugarcane">Sugarcane</option>
                  <option value="Chickpea (Gram)">Chickpea (Gram)</option>
                  <option value="Groundnut (Peanut)">Groundnut (Peanut)</option>
                  <option value="Mustard (Rapeseed)">Mustard (Rapeseed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Region / State
                </label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-800 dark:text-stone-100"
                >
                  <optgroup label="Karnataka (Taluk-Level Coverage)">
                    <option value="Karnataka - Mandya Taluk">Mandya Taluk, Mandya [LGD: 5508]</option>
                    <option value="Karnataka - Maddur Taluk">Maddur Taluk, Mandya [LGD: 5509]</option>
                    <option value="Karnataka - Dharwad Taluk">Dharwad Taluk, Dharwad [LGD: 5440]</option>
                    <option value="Karnataka - Chikkodi Taluk">Chikkodi Taluk, Belagavi [LGD: 5430]</option>
                    <option value="Karnataka - Kalaburagi Taluk">Kalaburagi Taluk, Kalaburagi [LGD: 5500]</option>
                    <option value="Karnataka - Byadgi Taluk">Byadgi Taluk, Haveri [LGD: 5486]</option>
                    <option value="Karnataka - Siruguppa Taluk">Siruguppa Taluk, Ballari [LGD: 5421]</option>
                    <option value="Karnataka">Karnataka (State Average) [LGD: 29]</option>
                  </optgroup>
                  <optgroup label="Other States (District-Level)">
                    <option value="Punjab">Punjab (Ludhiana / Bathinda) [LGD: 03]</option>
                    <option value="Haryana">Haryana (Karnal / Hisar) [LGD: 06]</option>
                    <option value="Maharashtra">Maharashtra (Nagpur / Nashik) [LGD: 27]</option>
                    <option value="Gujarat">Gujarat (Rajkot / Surat) [LGD: 24]</option>
                    <option value="Uttar Pradesh">Uttar Pradesh (Varanasi) [LGD: 09]</option>
                    <option value="Andhra Pradesh">Andhra Pradesh (Guntur) [LGD: 28]</option>
                    <option value="Madhya Pradesh">Madhya Pradesh (Indore) [LGD: 23]</option>
                    <option value="West Bengal">West Bengal (Purba Bardhaman) [LGD: 19]</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Season & Soil pH */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Cropping Season
                </label>
                <select
                  value={season}
                  onChange={e => setSeason(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-800 dark:text-stone-100"
                >
                  <option value="Kharif">Kharif (Monsoon: Jun - Oct)</option>
                  <option value="Rabi">Rabi (Winter: Nov - Apr)</option>
                  <option value="Zaid">Zaid (Summer: Mar - Jun)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Soil pH: <span className="font-bold text-emerald-700 dark:text-emerald-400">{soilPH}</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="4.0"
                  max="9.5"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-800 dark:text-stone-100"
                />
              </div>
            </div>

            {/* Farm Operational Area (Acres) & Validation */}
            <div className="bg-stone-50 dark:bg-stone-800/60 p-3 rounded-lg border border-stone-200 dark:border-stone-700/80 space-y-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Farm Operational Area (Acres)
                  </label>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    Total harvest calculated as: <code className="font-mono text-emerald-700 dark:text-emerald-400">t/ha × acres × 0.404686</code>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-28 sm:w-32">
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      max="5000"
                      value={farmAreaAcres}
                      onChange={e => setFarmAreaAcres(Math.max(0.1, parseFloat(e.target.value) || 1.0))}
                      className="w-full px-2.5 py-1.5 text-xs sm:text-sm font-bold bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-white"
                    />
                    <span className="absolute right-2 top-2 text-[10px] font-semibold text-stone-400">
                      Acres
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 whitespace-nowrap">
                    ≈ {(farmAreaAcres * 0.404686).toFixed(2)} Ha
                  </span>
                </div>
              </div>

              {/* Data-supported Statutory Limit Notice (Agricultural Census / Land Ceiling Act 54 Acres) */}
              {farmAreaAcres > 54 && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-md text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Agricultural Land Ceiling Notice (&gt; 54 Acres):</span>{' '}
                    This operational holding exceeds the statutory 54-acre limit defined under Indian Land Ceiling Acts and the Agricultural Census for single-ownership non-irrigated dry holdings. Production estimates are calculated proportionally for commercial or collective holdings.
                  </div>
                </div>
              )}
            </div>

            {/* Soil N-P-K */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Nitrogen (N)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    max="900"
                    value={soilN}
                    onChange={e => setSoilN(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-md focus:ring-2 focus:ring-emerald-500 text-stone-800 dark:text-stone-100"
                  />
                  <span className="absolute right-2 top-1.5 text-[10px] text-stone-400">kg/ha</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Phosphorus (P)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="2"
                    max="100"
                    value={soilP}
                    onChange={e => setSoilP(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-md focus:ring-2 focus:ring-emerald-500 text-stone-800 dark:text-stone-100"
                  />
                  <span className="absolute right-2 top-1.5 text-[10px] text-stone-400">kg/ha</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Potassium (K)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="30"
                    max="600"
                    value={soilK}
                    onChange={e => setSoilK(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-md focus:ring-2 focus:ring-emerald-500 text-stone-800 dark:text-stone-100"
                  />
                  <span className="absolute right-2 top-1.5 text-[10px] text-stone-400">kg/ha</span>
                </div>
              </div>
            </div>

            {/* Weather & Satellite NDVI inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Avg Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={temperature}
                  onChange={e => setTemperature(parseFloat(e.target.value) || 25)}
                  className="w-full px-2.5 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-md focus:ring-2 focus:ring-emerald-500 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Season Rainfall (mm)
                </label>
                <input
                  type="number"
                  value={rainfallMm}
                  onChange={e => setRainfallMm(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-md focus:ring-2 focus:ring-emerald-500 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Sentinel NDVI Index
                </label>
                <input
                  type="number"
                  step="0.02"
                  min="0.1"
                  max="0.95"
                  value={ndvi}
                  onChange={e => setNdvi(parseFloat(e.target.value) || 0.5)}
                  className="w-full px-2.5 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-md focus:ring-2 focus:ring-emerald-500 text-stone-800 dark:text-stone-100"
                />
              </div>
            </div>

            {/* Run Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {loading ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    <span>Extracting Features via CNN-BiGRU & Selecting via PSO-NSPSO...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span>{t('executePipeline', lang)}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Prediction Output / Result Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          {statusMessage?.isError && (
            <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-900 rounded-xl p-5 text-red-900 dark:text-red-200 shadow-xs mb-4">
              <div className="flex items-center gap-2 font-bold text-base text-red-700 dark:text-red-400">
                <AlertOctagon className="w-5 h-5" />
                <span>{t('modelOrDataRequired', lang)}</span>
              </div>
              <p className="text-xs text-red-800 dark:text-red-300 mt-2 leading-relaxed">
                {statusMessage.details || 'A trained model endpoint or model files must be provided before generating predictions.'}
              </p>
              <div className="mt-4 pt-3 border-t border-red-200 dark:border-red-800 flex items-center justify-between">
                <span className="text-[11px] text-red-700 dark:text-red-300">Configure endpoint in Settings</span>
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-md hover:bg-red-700 cursor-pointer"
                >
                  Open Settings
                </button>
              </div>
            </div>
          )}

          {executionResult ? (
            <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-emerald-300 dark:border-emerald-800 p-5 space-y-4 transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                    Model Output Verified (Tonnes/Hectare)
                  </span>
                </div>
                <span className="text-[11px] text-stone-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {executionResult.timestamp}
                </span>
              </div>

              {/* Dual Metrics: Yield per Hectare & Total Farm Production in Tonnes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Unit Yield (Tonnes/Ha & Kg/Ha) */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-100/70 dark:from-emerald-950/60 dark:to-stone-900 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-center flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                      {t('predictedYield', lang)}
                    </span>
                    <div className="mt-1 flex items-baseline justify-center gap-1.5">
                      <span className="text-3xl sm:text-4xl font-black text-emerald-900 dark:text-white">
                        {executionResult.predictedYieldTonnesPerHa}
                      </span>
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        {t('tonnesPerHa', lang)}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-emerald-700 dark:text-emerald-300">
                      ≈ {executionResult.yieldKgPerHa ?? Math.round(executionResult.predictedYieldTonnesPerHa * 1000)} kg/ha
                    </span>
                  </div>
                  {executionResult.confidenceInterval && (
                    <div className="mt-2 inline-flex items-center justify-center gap-1 px-2 py-0.5 bg-white/80 dark:bg-stone-800 rounded-full text-[11px] font-medium text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                      <span>CI:</span>
                      <span className="font-bold">
                        {executionResult.confidenceInterval[0]} - {executionResult.confidenceInterval[1]} t/ha
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Total Farm Production (Tonnes) */}
                <div className="bg-gradient-to-br from-teal-50 to-emerald-100/70 dark:from-teal-950/60 dark:to-stone-900 border border-teal-200 dark:border-teal-800 rounded-xl p-4 text-center flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-teal-800 dark:text-teal-400 uppercase tracking-wider block">
                      Total Farm Harvest
                    </span>
                    <div className="mt-1 flex items-baseline justify-center gap-1.5">
                      <span className="text-3xl sm:text-4xl font-black text-teal-900 dark:text-white">
                        {executionResult.totalProductionTonnes ??
                          Math.round(executionResult.predictedYieldTonnesPerHa * farmAreaAcres * 0.404686 * 100) / 100}
                      </span>
                      <span className="text-sm font-bold text-teal-700 dark:text-teal-400">
                        Tonnes
                      </span>
                    </div>
                    <span className="text-xs text-teal-700 dark:text-teal-300">
                      Across {farmAreaAcres} Acres ({(farmAreaAcres * 0.404686).toFixed(2)} Ha)
                    </span>
                  </div>
                  <div className="mt-2 inline-flex items-center justify-center gap-1 px-2 py-0.5 bg-white/80 dark:bg-stone-800 rounded-full text-[11px] font-medium text-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-800">
                    <span>CI:</span>
                    <span className="font-bold">
                      {executionResult.totalProductionConfidenceInterval
                        ? `${executionResult.totalProductionConfidenceInterval[0]} - ${executionResult.totalProductionConfidenceInterval[1]} T`
                        : `${Math.round(executionResult.confidenceInterval[0] * farmAreaAcres * 0.404686 * 100) / 100} - ${Math.round(executionResult.confidenceInterval[1] * farmAreaAcres * 0.404686 * 100) / 100} T`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Exact Formula Banner */}
              <div className="bg-stone-50 dark:bg-stone-800/80 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs flex items-center justify-between text-stone-600 dark:text-stone-300">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Production Formula:
                </span>
                <code className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                  {executionResult.predictedYieldTonnesPerHa} t/ha × {farmAreaAcres} ac × 0.404686 = {executionResult.totalProductionTonnes ?? Math.round(executionResult.predictedYieldTonnesPerHa * farmAreaAcres * 0.404686 * 100) / 100} Tonnes
                </code>
              </div>

              {/* Statutory Acreage Warning if > 54 Acres */}
              {(executionResult.acreageValidationNote || farmAreaAcres > 54) && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-lg text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Agricultural Land Ceiling Notice:</span>{' '}
                    {executionResult.acreageValidationNote ||
                      'Holding exceeds the statutory 54-acre limit defined under Indian Land Ceiling Acts and the Agricultural Census for single dryland holdings. Production estimates are calculated proportionally for commercial/collective holdings.'}
                  </div>
                </div>
              )}

              {/* PSO-NSPSO Selected Features */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    {t('selectedFeatures', lang)}:
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                    PSO-NSPSO Selection
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-2">
                  Features selected by PSO-NSPSO from the CNN-BiGRU latent representations:
                </p>
                <ul className="space-y-1.5">
                  {executionResult.selectedFeatures.map((feat, idx) => (
                    <li
                      key={idx}
                      className="text-xs font-mono bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-2.5 py-1.5 text-stone-800 dark:text-stone-200 flex items-center gap-2"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Metadata */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between">
                <span>Multi-Objective Fitness: <b>{executionResult.psoOptimalFitness ?? 'N/A'}</b></span>
                <span>Crop: <b>{executionResult.crop}</b></span>
              </div>
            </div>
          ) : !statusMessage?.isError ? (
            <div className="bg-stone-50 dark:bg-stone-900 border border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[320px]">
              <Cpu className="w-10 h-10 text-stone-400 mb-3" />
              <h5 className="font-bold text-stone-700 dark:text-stone-300 text-sm">
                Ready for Model Inference
              </h5>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs">
                Fill agronomic parameters and click Execute Pipeline to run the CNN-BiGRU and PSO-NSPSO models.
              </p>
              {!isYieldConnected && (
                <span className="mt-3 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                  {t('modelOrDataRequired', lang)}
                </span>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
