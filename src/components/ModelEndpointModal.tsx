import React, { useState } from 'react';
import {
  X,
  Settings,
  Server,
  Key,
  RefreshCw,
  Cpu,
  CheckCircle2,
  AlertOctagon,
  FileCode,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { LanguageCode, ModelEndpointConfig } from '../types/index.ts';
import {
  testConnectionWithInput,
  YIELD_MODEL_REQUIREMENTS,
  DISEASE_MODEL_REQUIREMENTS,
} from '../utils/pipeline.ts';
import { t } from '../utils/i18n.ts';

interface ModelEndpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ModelEndpointConfig;
  onSaveConfig: (updated: ModelEndpointConfig) => void;
  lang?: LanguageCode;
}

export const ModelEndpointModal: React.FC<ModelEndpointModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  lang = 'en',
}) => {
  const [yieldUrl, setYieldUrl] = useState(config.yieldEndpointUrl || '');
  const [diseaseUrl, setDiseaseUrl] = useState(config.diseaseEndpointUrl || '');
  const [apiKey, setApiKey] = useState(config.apiKey || '');

  // Track testing state
  const [testingYield, setTestingYield] = useState(false);
  const [testingDisease, setTestingDisease] = useState(false);
  const [yieldTestResult, setYieldTestResult] = useState<{
    success: boolean;
    message: string;
    endpoint: string;
    details: string;
  } | null>(null);
  const [diseaseTestResult, setDiseaseTestResult] = useState<{
    success: boolean;
    message: string;
    endpoint: string;
    details: string;
  } | null>(null);

  // Accordion state for specifications
  const [showSpecs, setShowSpecs] = useState(true);

  if (!isOpen) return null;

  const currentVerified = config.verifiedConnections || {
    yield: { isConnected: false },
    disease: { isConnected: false },
  };

  const handleSave = () => {
    const updated: ModelEndpointConfig = {
      ...config,
      yieldEndpointUrl: yieldUrl.trim(),
      diseaseEndpointUrl: diseaseUrl.trim(),
      apiKey: apiKey.trim(),
      // Status is 'connected' only if verified connection exists and URL matches
      status: {
        yield:
          currentVerified.yield?.isConnected && currentVerified.yield.sourceEndpoint === yieldUrl.trim()
            ? 'connected'
            : 'disconnected',
        disease:
          currentVerified.disease?.isConnected && currentVerified.disease.sourceEndpoint === diseaseUrl.trim()
            ? 'connected'
            : 'disconnected',
      },
    };
    onSaveConfig(updated);
    onClose();
  };

  const handleTestYield = async () => {
    setTestingYield(true);
    setYieldTestResult(null);

    const tempConfig: ModelEndpointConfig = {
      ...config,
      yieldEndpointUrl: yieldUrl.trim(),
      apiKey: apiKey.trim(),
    };

    const res = await testConnectionWithInput('yield', tempConfig);
    setTestingYield(false);

    setYieldTestResult({
      success: res.success,
      message: res.message,
      endpoint: res.endpointTested,
      details: res.details,
    });

    if (res.success) {
      onSaveConfig({
        ...tempConfig,
        status: { ...tempConfig.status, yield: 'connected' },
        verifiedConnections: {
          ...tempConfig.verifiedConnections,
          yield: {
            isConnected: true,
            sourceEndpoint: yieldUrl.trim(),
            modelName: 'CNN-BiGRU + PSO-NSPSO Yield Regressor',
            lastSuccessTimestamp: new Date().toLocaleTimeString(),
            lastPredictionSummary: res.resultSummary,
          },
        },
      });
    }
  };

  const handleTestDisease = async () => {
    setTestingDisease(true);
    setDiseaseTestResult(null);

    const tempConfig: ModelEndpointConfig = {
      ...config,
      diseaseEndpointUrl: diseaseUrl.trim(),
      apiKey: apiKey.trim(),
    };

    const res = await testConnectionWithInput('disease', tempConfig);
    setTestingDisease(false);

    setDiseaseTestResult({
      success: res.success,
      message: res.message,
      endpoint: res.endpointTested,
      details: res.details,
    });

    if (res.success) {
      onSaveConfig({
        ...tempConfig,
        status: { ...tempConfig.status, disease: 'connected' },
        verifiedConnections: {
          ...tempConfig.verifiedConnections,
          disease: {
            isConnected: true,
            sourceEndpoint: diseaseUrl.trim(),
            modelName: 'CNN-BiGRU + PSO-NSPSO Disease Classifier',
            lastSuccessTimestamp: new Date().toLocaleTimeString(),
            lastPredictionSummary: res.resultSummary,
          },
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 max-w-xl w-full max-h-[90vh] overflow-y-auto transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-800/60 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base sm:text-lg text-stone-900 dark:text-white">
              Model Endpoints & Integration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-700 transition-colors cursor-pointer"
            aria-label="Close settings modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-5 text-xs sm:text-sm">
          {/* Strict Verification Contract Notice */}
          <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3.5 space-y-1 text-emerald-950 dark:text-emerald-200">
            <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300">
              <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Real Model Verification Contract
            </span>
            <p className="text-[11px] leading-relaxed text-emerald-900/90 dark:text-emerald-300/90">
              <b>“Model connected”</b> is displayed only after a real prediction succeeds from the model endpoint. If an endpoint or dataset is missing, tabs strictly display <b>“Model or data required.”</b> Demo results are kept out of live mode.
            </p>
          </div>

          {/* Section 1: Yield Endpoint URL */}
          <div className="space-y-2 border border-stone-200 dark:border-stone-800 rounded-xl p-3.5 bg-stone-50/50 dark:bg-stone-800/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-600" /> 1. Crop Yield Model Endpoint URL
              </label>
              {currentVerified.yield?.isConnected ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Model connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                  <AlertOctagon className="w-3 h-3 text-amber-600" /> Model or data required
                </span>
              )}
            </div>

            <input
              type="url"
              placeholder="e.g. http://localhost:8000/api/predict/yield"
              value={yieldUrl}
              onChange={e => setYieldUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100 font-mono"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-stone-400">
                POST JSON: inputs → CNN-BiGRU → PSO-NSPSO → yield (t/ha)
              </span>
              <button
                type="button"
                onClick={handleTestYield}
                disabled={testingYield}
                className="px-2.5 py-1 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${testingYield ? 'animate-spin' : ''}`} />
                <span>Test Yield Endpoint (1 Input)</span>
              </button>
            </div>

            {yieldTestResult && (
              <div
                className={`p-2.5 rounded-lg text-xs border ${
                  yieldTestResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-900 dark:text-amber-200'
                }`}
              >
                <span className="font-bold block">
                  {yieldTestResult.success ? '✓ Real Prediction Succeeded' : '✗ Model or data required'}
                </span>
                <p className="text-[11px] mt-0.5 font-mono">{yieldTestResult.details}</p>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-1">
                  Tested endpoint: {yieldTestResult.endpoint}
                </span>
              </div>
            )}
          </div>

          {/* Section 2: Disease Endpoint URL */}
          <div className="space-y-2 border border-stone-200 dark:border-stone-800 rounded-xl p-3.5 bg-stone-50/50 dark:bg-stone-800/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-600" /> 2. Leaf Disease Model Endpoint URL
              </label>
              {currentVerified.disease?.isConnected ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Model connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                  <AlertOctagon className="w-3 h-3 text-amber-600" /> Model or data required
                </span>
              )}
            </div>

            <input
              type="url"
              placeholder="e.g. http://localhost:8000/api/detect/disease"
              value={diseaseUrl}
              onChange={e => setDiseaseUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100 font-mono"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-stone-400">
                POST multipart/form-data: leaf image → CNN-BiGRU → PSO-NSPSO → label + confidence
              </span>
              <button
                type="button"
                onClick={handleTestDisease}
                disabled={testingDisease}
                className="px-2.5 py-1 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${testingDisease ? 'animate-spin' : ''}`} />
                <span>Test Disease Endpoint (1 Input)</span>
              </button>
            </div>

            {diseaseTestResult && (
              <div
                className={`p-2.5 rounded-lg text-xs border ${
                  diseaseTestResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-900 dark:text-amber-200'
                }`}
              >
                <span className="font-bold block">
                  {diseaseTestResult.success ? '✓ Real Classification Succeeded' : '✗ Model or data required'}
                </span>
                <p className="text-[11px] mt-0.5 font-mono">{diseaseTestResult.details}</p>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-1">
                  Tested endpoint: {diseaseTestResult.endpoint}
                </span>
              </div>
            )}
          </div>

          {/* Section 3: Optional Bearer Auth Token */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-stone-500" /> Optional API Bearer Token
            </label>
            <input
              type="password"
              placeholder="Bearer token (if model server requires authentication)"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100 font-mono"
            />
          </div>

          {/* Section 4: Exact Technical Specs Collapsible */}
          <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSpecs(!showSpecs)}
              className="w-full px-3.5 py-2.5 bg-stone-100 dark:bg-stone-800/80 flex items-center justify-between text-xs font-bold text-stone-800 dark:text-stone-200 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-emerald-600" /> Required Model Files & Endpoint Schemas
              </span>
              {showSpecs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showSpecs && (
              <div className="p-3.5 space-y-3 bg-stone-50/50 dark:bg-stone-900/50 text-[11px] text-stone-700 dark:text-stone-300">
                <div className="space-y-1">
                  <span className="font-bold text-emerald-800 dark:text-emerald-400 block">
                    {YIELD_MODEL_REQUIREMENTS.featureName} Integration:
                  </span>
                  <p>• <b>Pipeline:</b> {YIELD_MODEL_REQUIREMENTS.pipelineStage}</p>
                  <p>• <b>Local Files:</b> <code>/src/models/yield/cnn_bigru_yield.onnx</code>, <code>pso_yield_features.json</code>, <code>yield_regressor.onnx</code>, <code>scaler_params.json</code></p>
                </div>

                <div className="space-y-1 pt-2 border-t border-stone-200 dark:border-stone-800">
                  <span className="font-bold text-teal-800 dark:text-teal-400 block">
                    {DISEASE_MODEL_REQUIREMENTS.featureName} Integration:
                  </span>
                  <p>• <b>Pipeline:</b> {DISEASE_MODEL_REQUIREMENTS.pipelineStage}</p>
                  <p>• <b>Local Files:</b> <code>/src/models/disease/cnn_bigru_disease.onnx</code>, <code>pso_disease_features.json</code>, <code>disease_classifier.onnx</code>, <code>disease_labels.json</code></p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
            >
              {t('close', lang)}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {t('save', lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
