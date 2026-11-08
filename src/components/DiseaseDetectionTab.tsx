import React, { useState } from 'react';
import {
  Bug,
  Upload,
  AlertOctagon,
  CheckCircle,
  ShieldAlert,
  Sparkles,
  Settings,
  Image as ImageIcon,
  Cpu,
  Layers,
  Clock,
  Server,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { DiseaseDetectionResult, LanguageCode, ModelEndpointConfig } from '../types/index.ts';
import { executeDiseasePipeline } from '../utils/pipeline.ts';
import { t } from '../utils/i18n.ts';
import { PRESET_SAMPLE_LEAVES, PresetSampleLeaf } from '../utils/sampleLeafImages.ts';

interface DiseaseDetectionTabProps {
  endpointConfig: ModelEndpointConfig;
  onUpdateConfig?: (updated: ModelEndpointConfig) => void;
  onOpenSettings: () => void;
  onOpenPipelineInfo: () => void;
  lang?: LanguageCode;
}



export const DiseaseDetectionTab: React.FC<DiseaseDetectionTabProps> = ({
  endpointConfig,
  onUpdateConfig,
  onOpenSettings,
  onOpenPipelineInfo,
  lang = 'en',
}) => {
  const [selectedCrop, setSelectedCrop] = useState<string>('Rice (Paddy)');
  const [leafFile, setLeafFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DiseaseDetectionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<{ text: string; details?: string } | null>(null);

  // Strictly check if a real prediction has succeeded from this model/endpoint
  const isDiseaseConnected = endpointConfig.verifiedConnections?.disease?.isConnected === true;
  const verifiedInfo = endpointConfig.verifiedConnections?.disease;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLeafFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setErrorMessage(null);
    }
  };

  const handleSelectSample = (sample: PresetSampleLeaf) => {
    setSelectedCrop(sample.crop);
    setPreviewUrl(sample.dataUrl);
    setLeafFile(new File(['sample-bytes'], sample.fileName, { type: 'image/jpeg' }));
    setResult(null);
    setErrorMessage(null);
  };

  const handleAnalyze = async () => {
    if (!leafFile && !previewUrl) {
      setErrorMessage({
        text: 'Model or data required.',
        details: 'No leaf photo provided. Upload or pick a leaf photo to diagnose.',
      });
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await executeDiseasePipeline(
      endpointConfig,
      leafFile,
      previewUrl,
      selectedCrop,
      updated => {
        onUpdateConfig?.(updated);
      }
    );

    setLoading(false);

    if (res.requiresModelOrData) {
      setResult(null);
      setErrorMessage({
        text: 'Model or data required.',
        details: res.missingDetails,
      });
      return;
    }

    if (res.success && res.data) {
      setResult(res.data);
    } else {
      setResult(null);
      setErrorMessage({
        text: 'Model or data required.',
        details: res.missingDetails,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Deep Learning Architecture Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 dark:from-emerald-950 dark:to-stone-900 text-white rounded-xl p-4 sm:p-5 shadow-xs border border-emerald-800 dark:border-stone-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-emerald-800/80 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-sm border border-emerald-700/60">
                Foliar Pathogen Diagnosis
              </span>
              <span className="text-xs text-emerald-300">• Computer Vision Pipeline</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1">
              CNN-BiGRU Spectral Extraction & PSO-NSPSO Feature Selection
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Real Connection Status Badge */}
            {isDiseaseConnected ? (
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
              <span>Pipeline Architecture</span>
            </button>
          </div>
        </div>

        <p className="mt-2 text-xs text-emerald-200/90 leading-relaxed">
          The convolutional layers isolate localized foliar spot textures, the BiGRU captures spatial scanning context across leaf blade axes, and PSO-NSPSO selects the non-dominated spectral features to diagnose crop diseases accurately.
        </p>
      </div>

      {/* Model Connection Status Indicator Card */}
      {isDiseaseConnected && verifiedInfo ? (
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
                Active: {verifiedInfo.modelName} • Last verified diagnosis: {verifiedInfo.lastSuccessTimestamp} ({verifiedInfo.lastPredictionSummary})
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
        /* Missing Model Alert with Exact Required Details */
        <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertOctagon className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm sm:text-base text-amber-900 dark:text-amber-200">
                  {t('modelOrDataRequired', lang)}
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 max-w-2xl">
                  {errorMessage?.details || 'A trained disease classifier endpoint or model files must be provided to classify foliar pathogens and calculate model confidence without fabricated data.'}
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
              Exact specifications required to connect the Disease Detection model:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-amber-900 dark:text-amber-200">
              <div className="bg-white/80 dark:bg-stone-900/80 p-2.5 rounded border border-amber-200 dark:border-stone-800 space-y-1">
                <span className="font-bold flex items-center gap-1 text-emerald-800 dark:text-emerald-400">
                  <Server className="w-3.5 h-3.5" /> Option A: Inference Endpoint (REST API)
                </span>
                <p>• <b>Method:</b> POST multipart/form-data to configured URL</p>
                <p>• <b>Form Fields:</b> <code>image</code> (binary photo file), <code>crop</code> (string), <code>pipeline</code> ("CNN-BiGRU-PSO-NSPSO")</p>
                <p>• <b>Expected Response:</b> <code>&#123; diseaseName: string, confidenceScore: number, severity: string, psoSelectedFeatures: string[], recommendedAction: string &#125;</code></p>
              </div>

              <div className="bg-white/80 dark:bg-stone-900/80 p-2.5 rounded border border-amber-200 dark:border-stone-800 space-y-1">
                <span className="font-bold flex items-center gap-1 text-teal-800 dark:text-teal-400">
                  <FileCode className="w-3.5 h-3.5" /> Option B: Local Trained Model Artifacts
                </span>
                <p>• <b>Feature Extractor:</b> <code>/src/models/disease/cnn_bigru_disease.onnx</code></p>
                <p>• <b>PSO-NSPSO Selection:</b> <code>/src/models/disease/pso_disease_features.json</code></p>
                <p>• <b>Trained Classifier:</b> <code>/src/models/disease/disease_classifier.onnx</code></p>
                <p>• <b>Class Dictionary:</b> <code>/src/models/disease/disease_labels.json</code></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supported Crops & Verified Diseases Specification Card */}
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-stone-200 dark:border-stone-800 p-4 sm:p-5 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              Diagnostic Scope & Supported Foliar Pathogens
            </h4>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Field-Tested Pilot
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Verified Pilot */}
          <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Verified Pilot: Rice (Paddy) — 3 Pathogens + Healthy</span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
              Rigorous field-calibrated coverage with pixel-level foliar biomarkers:
            </p>
            <ul className="space-y-1 text-[11px] text-stone-700 dark:text-stone-300 pl-4 list-disc">
              <li><b>Rice Blast</b> (<i>Magnaporthe / Pyricularia oryzae</i>) — Spindle/diamond lesions</li>
              <li><b>Bacterial Leaf Blight</b> (<i>Xanthomonas oryzae</i>) — Marginal wavy chlorosis</li>
              <li><b>Brown Spot</b> (<i>Bipolaris oryzae</i>) — Scattered circular necrotic spots</li>
              <li><b>Healthy Rice Foliage</b> — Vibrant chlorophyll lamina without spots</li>
            </ul>
          </div>

          {/* Preliminary Research & Uncertain Handling */}
          <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Preliminary Research & Handling of Uncertain Diseases</span>
            </div>
            <p className="text-[11px] text-amber-900 dark:text-amber-300">
              <b>Preliminary Pilot:</b> Cotton (Leaf Curl Virus, Bacterial Blight) & Tomato (Early/Late Blight). Broader coverage reported nationwide only after training and testing on real labeled photos.
            </p>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              <b>Uncertainty Policy:</b> If the crop is recognizable but the disease pattern does not match verified pathogen prototypes with high confidence, the system explicitly reports <i>"Crop Recognizable — Disease Pattern Uncertain"</i> and advises physical KVK tissue testing.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Leaf Image Input (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-stone-200 dark:border-stone-800 p-4 sm:p-5 space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h4 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Bug className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {t('diseaseTitle', lang)}
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Take a close-up photo of the affected leaf showing visible spots or lesions
              </p>
            </div>
          </div>

          {/* Crop Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Select Host Crop
            </label>
            <select
              value={selectedCrop}
              onChange={e => setSelectedCrop(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-800 dark:text-stone-100"
            >
              <option value="Rice (Paddy)">Rice (Paddy)</option>
              <option value="Cotton">Cotton</option>
              <option value="Tomato">Tomato</option>
              <option value="Wheat">Wheat</option>
              <option value="Maize (Corn)">Maize (Corn)</option>
            </select>
          </div>

          {/* Photo Dropzone / Upload Box */}
          <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-4 sm:p-6 text-center hover:border-emerald-500 transition-colors bg-stone-50/50 dark:bg-stone-800/40">
            {previewUrl ? (
              <div className="space-y-3">
                <div className="relative inline-block max-h-64 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 shadow-xs">
                  <img
                    src={previewUrl}
                    alt="Uploaded leaf preview"
                    className="max-h-56 max-w-full object-contain mx-auto"
                  />
                </div>
                <div className="flex items-center justify-center gap-3">
                  <label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 cursor-pointer">
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-stone-300 dark:text-stone-600">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLeafFile(null);
                      setPreviewUrl(null);
                      setResult(null);
                    }}
                    className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>{t('uploadLeaf', lang)}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2">
                    JPG, PNG or WebP up to 10MB • Clear focus on leaf symptoms
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sample Preset Leaf Images for Quick Testing */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Or pick a verified test sample (pixel-level inference):
              </span>
              <span className="text-[10px] text-stone-400">
                Tests pixel features directly
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_SAMPLE_LEAVES.map(sample => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={`p-2 border rounded-lg text-left transition-colors group cursor-pointer ${
                    sample.isTestNonLeaf
                      ? 'border-red-300 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20 hover:border-red-500'
                      : sample.isRenamedTest
                      ? 'border-purple-300 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20 hover:border-purple-500'
                      : 'border-stone-200 dark:border-stone-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="h-20 rounded-md overflow-hidden bg-stone-100 dark:bg-stone-800 mb-1.5 flex items-center justify-center border border-stone-200/60 dark:border-stone-700">
                    <img
                      src={sample.dataUrl}
                      alt={sample.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {sample.isTestNonLeaf ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300">
                        Non-Leaf Test
                      </span>
                    ) : sample.isRenamedTest ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                        Renamed Test
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        Verified Pilot
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200 block truncate">
                    {sample.name}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">
                    {sample.fileName}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Analyze Button */}
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <Cpu className="w-4 h-4 animate-spin" />
                <span>Running CNN-BiGRU Feature Extraction & PSO-NSPSO Selection...</span>
              </>
            ) : (
              <>
                <Bug className="w-4 h-4" />
                <span>{t('analyzeLeaf', lang)}</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Diagnosis Result Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-900 rounded-xl p-5 text-red-900 dark:text-red-200 shadow-xs mb-4">
              <div className="flex items-center gap-2 font-bold text-base text-red-700 dark:text-red-400">
                <AlertOctagon className="w-5 h-5" />
                <span>{t('modelOrDataRequired', lang)}</span>
              </div>
              <p className="text-xs text-red-800 dark:text-red-300 mt-2 leading-relaxed">
                {errorMessage.details || 'A connected model endpoint and a valid leaf photo are required to classify diseases without fabricating confidence values.'}
              </p>
              <div className="mt-4 pt-3 border-t border-red-200 dark:border-red-800 flex items-center justify-between">
                <span className="text-[11px] text-red-700 dark:text-red-300">Open Settings to connect model</span>
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-md hover:bg-red-700 cursor-pointer"
                >
                  Configure Endpoint
                </button>
              </div>
            </div>
          )}

          {result ? (
            <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-emerald-300 dark:border-emerald-800 p-5 space-y-4 transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                    Diagnostic Output Verified
                  </span>
                </div>
                <span className="text-[11px] text-stone-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {result.timestamp}
                </span>
              </div>

              {/* Non-Leaf Image Detected Alert Banner */}
              {result.isFoliarLeaf === false && (
                <div className="bg-red-50 dark:bg-red-950/50 border-2 border-red-400 dark:border-red-800 rounded-xl p-4 text-red-900 dark:text-red-200 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-sm text-red-800 dark:text-red-300">
                    <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                    <span>Non-Leaf Image Detected</span>
                  </div>
                  <p className="text-xs leading-relaxed text-red-700 dark:text-red-300">
                    The uploaded photo contains less than 12% plant chlorophyll/vegetative pixels. The CNN-BiGRU vision pipeline requires a clear foliar leaf blade photo to diagnose crop diseases accurately.
                  </p>
                </div>
              )}

              {/* Crop Recognizable but Disease Pattern Uncertain Banner */}
              {result.isFoliarLeaf !== false && result.isUncertain && (
                <div className="bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-400 dark:border-amber-700 rounded-xl p-4 text-amber-900 dark:text-amber-200 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Crop Recognizable — Disease Pattern Uncertain</span>
                  </div>
                  <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                    Foliar crop canopy is recognized, but symptoms are outside verified pilot or lesions do not match trained pathogen prototypes with high confidence. Recommend physical agronomic tissue test at local Krishi Vigyan Kendra (KVK).
                  </p>
                </div>
              )}

              {/* Disease Name & Confidence Score */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-100/60 dark:from-emerald-950/60 dark:to-stone-900 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                      {t('diagnosedPathogen', lang)}
                    </span>
                    {result.verifiedPilot ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                        Verified Pilot
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                        Preliminary Research
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      result.severity === 'Severe'
                        ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                        : result.severity === 'Healthy'
                        ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
                        : result.severity === 'Uncertain'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {result.severity}
                  </span>
                </div>
                <h5 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white mt-1">
                  {result.diseaseName}
                </h5>

                {/* Confidence Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-stone-600 dark:text-stone-300">{t('modelConfidence', lang)}:</span>
                    <span className="text-emerald-800 dark:text-emerald-400 font-bold">
                      {(result.confidenceScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, result.confidenceScore * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Pixel Biomarker Analysis Breakdown Card */}
              {result.pixelAnalysisSummary && (
                <div className="bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Extracted Foliar Pixel Biomarkers
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      Canvas 128x128 RGBA
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="bg-white dark:bg-stone-900 p-2 rounded border border-stone-100 dark:border-stone-800">
                      <span className="text-stone-400 block text-[10px]">Vegetative Foliage</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">
                        {result.pixelAnalysisSummary.vegetativeRatioPct}%
                      </span>
                    </div>
                    <div className="bg-white dark:bg-stone-900 p-2 rounded border border-stone-100 dark:border-stone-800">
                      <span className="text-stone-400 block text-[10px]">Chlorophyll Level</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">
                        {result.pixelAnalysisSummary.chlorophyllLevel}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-stone-900 p-2 rounded border border-stone-100 dark:border-stone-800">
                      <span className="text-stone-400 block text-[10px]">Necrosis Area</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">
                        {result.pixelAnalysisSummary.necrosisAreaPct}%
                      </span>
                    </div>
                    <div className="bg-white dark:bg-stone-900 p-2 rounded border border-stone-100 dark:border-stone-800">
                      <span className="text-stone-400 block text-[10px]">Chlorosis Margin</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">
                        {result.pixelAnalysisSummary.chlorosisAreaPct}%
                      </span>
                    </div>
                    <div className="bg-white dark:bg-stone-900 p-2 rounded border border-stone-100 dark:border-stone-800">
                      <span className="text-stone-400 block text-[10px]">Lesion Shape</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200 truncate block">
                        {result.pixelAnalysisSummary.lesionShape}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-stone-900 p-2 rounded border border-stone-100 dark:border-stone-800">
                      <span className="text-stone-400 block text-[10px]">GLCM Contrast</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200 font-mono">
                        {result.pixelAnalysisSummary.textureContrast}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* PSO-NSPSO Selected Visual Features */}
              <div>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  PSO-NSPSO Extracted Leaf Features:
                </span>
                <ul className="space-y-1.5">
                  {result.psoSelectedFeatures.map((feat, idx) => (
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

              {/* Recommended Field Management Action */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs text-amber-900 dark:text-amber-200">
                <span className="font-bold flex items-center gap-1.5 text-amber-950 dark:text-amber-100 mb-1">
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" /> {t('treatment', lang)}:
                </span>
                <p className="leading-relaxed">{result.recommendedAction}</p>
              </div>
            </div>
          ) : !errorMessage ? (
            <div className="bg-stone-50 dark:bg-stone-900 border border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[320px]">
              <Bug className="w-10 h-10 text-stone-400 mb-3" />
              <h5 className="font-bold text-stone-700 dark:text-stone-300 text-sm">
                Awaiting Leaf Photo
              </h5>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs">
                Upload or select a leaf photo on the left to inspect visual symptoms using the CNN-BiGRU and PSO-NSPSO models.
              </p>
              {!isDiseaseConnected && (
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
