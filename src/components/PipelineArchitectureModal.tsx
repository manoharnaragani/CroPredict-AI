import React from 'react';
import {
  X,
  Cpu,
  Layers,
  TrendingUp,
  Bug,
} from 'lucide-react';
import { LanguageCode } from '../types/index.ts';
import { t } from '../utils/i18n.ts';

interface PipelineArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: LanguageCode;
}

export const PipelineArchitectureModal: React.FC<PipelineArchitectureModalProps> = ({
  isOpen,
  onClose,
  lang = 'en',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-emerald-900 dark:bg-emerald-950 text-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                CroPredict AI • CNN-BiGRU & PSO-NSPSO Pipeline
              </h3>
              <p className="text-xs text-emerald-200">
                End-to-End Architectural Specification for Smart Agriculture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
            aria-label="Close architecture modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 text-xs sm:text-sm">
          {/* Key Change Callout */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 p-3.5 rounded-r-lg text-amber-900 dark:text-amber-200 text-xs">
            <span className="font-bold block mb-1">Architecture Shift:</span>
            In CroPredict AI, the pipeline explicitly replaces the earlier irrigation and fertilizer optimization idea with a dedicated <b>PSO-NSPSO Multi-Objective Feature Selection</b> stage. Feature optimization occurs before the predictor, drastically improving generalization across diverse Indian agro-climatic zones.
          </div>

          {/* Sequential Pipeline Flow Diagram */}
          <div className="bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 rounded-xl p-4 space-y-4">
            <h4 className="font-bold text-stone-800 dark:text-stone-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Complete Data Pipeline Flow
            </h4>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xs flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div>
                  <h5 className="font-bold text-stone-900 dark:text-white text-xs sm:text-sm">
                    Multi-Modal Input Data
                  </h5>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    Foliar imagery, Soil Health Card metrics (pH, Nitrogen, Phosphorus, Potassium in kg/ha), 24-hr Open-Meteo weather timeseries (hourly temp, humidity, wind, rainfall probability), and seasonal crop identifiers.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-xs flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div>
                  <h5 className="font-bold text-teal-950 dark:text-teal-200 text-xs sm:text-sm flex items-center gap-1.5">
                    CNN-BiGRU Feature Extraction
                  </h5>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    <b>Convolutional Neural Network (CNN):</b> 1D/2D convolution kernels extract spatial representations (foliar necrotic lesion margins, spectral color indices, soil-moisture gradients).
                  </p>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                    <b>Bidirectional GRU (BiGRU):</b> Processes the temporal sequence across both forward and backward time steps (capturing vegetative stage lag, heatwave shock, and pre-monsoon moisture buildup).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-amber-300 dark:border-amber-700 shadow-xs flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div>
                  <h5 className="font-bold text-amber-950 dark:text-amber-200 text-xs sm:text-sm flex items-center gap-1.5">
                    PSO-NSPSO Feature Selection (Replaces Optimization)
                  </h5>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    Particle Swarm Optimization combined with Non-Dominated Sorting PSO resolves the multi-objective Pareto trade-off:
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs text-stone-600 dark:text-stone-400">
                    <li><b>Objective 1:</b> Minimize feature subset dimensionality (eliminating noise & collinearity).</li>
                    <li><b>Objective 2:</b> Maximize mutual information & prediction accuracy.</li>
                  </ul>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xs flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  4
                </span>
                <div>
                  <h5 className="font-bold text-stone-900 dark:text-white text-xs sm:text-sm">
                    Task-Specific Predictor
                  </h5>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    The Pareto-optimal selected features are passed to dedicated heads:
                  </p>
                  <div className="mt-1.5 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-stone-50 dark:bg-stone-800/60 p-2 rounded-md border border-stone-100 dark:border-stone-800">
                      <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Yield Head:
                      </span>
                      <span className="text-stone-600 dark:text-stone-400">Regression output in <b>Tonnes / Hectare</b> with 95% confidence interval.</span>
                    </div>
                    <div className="bg-stone-50 dark:bg-stone-800/60 p-2 rounded-md border border-stone-100 dark:border-stone-800">
                      <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                        <Bug className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Disease Head:
                      </span>
                      <span className="text-stone-600 dark:text-stone-400">Softmax classification outputting <b>pathogen identity & confidence %</b>.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Strict Safety Contract */}
          <div className="p-3 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-600 dark:text-stone-400">
            <span className="font-bold text-stone-800 dark:text-stone-200 block mb-0.5">Verification & Safety Contract:</span>
            If a model endpoint is missing, disconnected, or dataset payload is empty, CroPredict AI guarantees zero hallucination by strictly rendering <b>“Model or data required.”</b>
          </div>
        </div>

        <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            {t('close', lang)}
          </button>
        </div>
      </div>
    </div>
  );
};
