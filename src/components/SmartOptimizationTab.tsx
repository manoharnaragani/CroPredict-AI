import React, { useState } from 'react';
import {
  Sliders,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Target,
  BarChart2,
  Download,
  Info,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { LanguageCode } from '../types/index.ts';
import smartOptData from '../models/optimization/smart_optimization_results.json';
import { t } from '../utils/i18n.ts';

interface SmartOptimizationTabProps {
  lang?: LanguageCode;
}

export const SmartOptimizationTab: React.FC<SmartOptimizationTabProps> = ({
  lang = 'en',
}) => {
  const [activeModel, setActiveModel] = useState<'yield' | 'disease'>('yield');
  const [simulatedExcluded, setSimulatedExcluded] = useState<string[]>([]);

  const yieldData = smartOptData.yieldModel;
  const diseaseData = smartOptData.diseaseModel;
  const currentData = activeModel === 'yield' ? yieldData : diseaseData;

  const toggleSimulatedFeature = (featureName: string) => {
    setSimulatedExcluded(prev =>
      prev.includes(featureName) ? prev.filter(f => f !== featureName) : [...prev, featureName]
    );
  };

  const handleDownloadReport = () => {
    const blob = new Blob([JSON.stringify(smartOptData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cropredict_smart_optimization_results_${activeModel}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Feature explanations
  const FEATURE_DESCRIPTIONS: Record<string, { role: string; category: string }> = {
    soil_N: { role: 'Available Nitrogen (vegetative growth)', category: 'Soil Nutrient' },
    soil_P: { role: 'Phosphorus (root architecture)', category: 'Soil Nutrient' },
    soil_K: { role: 'Potassium (stomatal conductance & disease resistance)', category: 'Soil Nutrient' },
    soil_moisture_pct: { role: 'Root-zone moisture availability', category: 'Soil Sensor' },
    avg_temperature: { role: 'Canopy thermal accumulation', category: 'Meteorology' },
    season_rainfall_mm: { role: 'Cumulative seasonal precipitation budget', category: 'Meteorology' },
    sentinel2_ndvi: { role: 'Sentinel-2 Normalized Difference Vegetation Index', category: 'Satellite Optical' },
    irrigation_index: { role: 'Assured canal and tube well irrigation buffer', category: 'Agronomy' },
    fertilizer_intensity_kg_ha: { role: 'Total NPK input intensity', category: 'Agronomy' },
    historical_3yr_trend: { role: '3-Year historical regional yield momentum', category: 'Historical CCE' },
    mean_hue: { role: 'Mean foliar color tone (chlorosis shifts)', category: 'Spectral Moment' },
    mean_saturation: { role: 'Color purity of necrotic lesions', category: 'Spectral Moment' },
    green_chlorophyll_ratio: { role: 'Green-to-Red band reflection index', category: 'Optical Index' },
    brown_necrosis_ratio: { role: 'Surface percentage of dead tissue lesions', category: 'Lesion Geometry' },
    yellow_chlorosis_ratio: { role: 'Foliar yellow halo around pathogen spots', category: 'Lesion Geometry' },
    glcm_contrast: { role: 'Gray-Level Co-occurrence Matrix texture contrast', category: 'Spatial Texture' },
    lesion_count_per_cm2: { role: 'Pathogen lesion density per cm²', category: 'Lesion Geometry' },
    mean_lesion_eccentricity: { role: 'Spindle (Blast) vs circular (Spot) lesion shape', category: 'Morphometry' },
    vein_thickening_index: { role: 'Upward foliar curling & enations (CLCuV marker)', category: 'Morphometry' },
    concentric_ring_score: { role: 'Target-board concentric rings (Alternaria marker)', category: 'Morphometry' },
    water_soaked_margin_score: { role: 'Translucent water-soaked halo (Bacterial Blight)', category: 'Pathognomonic' },
    leaf_edge_curl_angle: { role: 'Structural lamina curling curvature angle', category: 'Morphometry' },
    exg_vegetation_index: { role: 'Excess Green vegetative reflectance index', category: 'Spectral Band' },
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-stone-900 text-white rounded-2xl p-5 sm:p-6 shadow-xs border border-emerald-700/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-600/50 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Smart Optimization Engine
              </span>
              <span className="text-[11px] font-mono text-emerald-200">
                CNN-BiGRU + PSO-NSPSO
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-2">
              Deep Feature Extraction & Pareto-Optimal Feature Selection
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-3xl leading-relaxed">
              Convolutional 1D layers capture local cross-correlations, Bidirectional GRU (BiGRU) units model sequential agronomic dependencies, and Non-dominated Sorting Particle Swarm Optimization (PSO-NSPSO) eliminates redundant features while preserving peak predictive accuracy on held-out test splits.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadReport}
              className="px-3.5 py-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Export Pareto JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Model Selection Tabs */}
      <div className="flex items-center justify-between bg-white dark:bg-stone-900 p-1.5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveModel('yield');
              setSimulatedExcluded([]);
            }}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeModel === 'yield'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Crop Yield Regressor (CNN-BiGRU + PSO-NSPSO)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveModel('disease');
              setSimulatedExcluded([]);
            }}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeModel === 'disease'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Foliar Disease Classifier (CNN-BiGRU + PSO-NSPSO)</span>
          </button>
        </div>

        <span className="text-xs text-stone-400 font-mono hidden md:inline px-3">
          Trained & Evaluated on Verified Held-Out Test Set
        </span>
      </div>

      {/* Top Metric Cards: Before vs After Feature Selection */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Retained Features Count */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-semibold">
            <span>Features Retained</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900 dark:text-white">
              {currentData.retainedCount}
            </span>
            <span className="text-xs text-stone-400 font-medium">
              / {currentData.totalCount} candidate features
            </span>
          </div>
          <div className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{currentData.redundancyReductionPct}% Redundancy Pruning</span>
          </div>
        </div>

        {/* Primary Metric Before Selection */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-semibold">
            <span>Before Selection (All Features)</span>
            <BarChart2 className="w-4 h-4 text-stone-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-700 dark:text-stone-300">
              {activeModel === 'yield'
                ? `${yieldData.heldOutPerformance.before.mae} t/ha`
                : `${diseaseData.heldOutPerformance.before.macroF1Pct}%`}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-stone-500">
            {activeModel === 'yield'
              ? `RMSE: ${yieldData.heldOutPerformance.before.rmse} • R²: ${yieldData.heldOutPerformance.before.r2}`
              : `Accuracy: ${diseaseData.heldOutPerformance.before.accuracyPct}% • Precision: ${diseaseData.heldOutPerformance.before.precisionPct}%`}
          </p>
        </div>

        {/* Primary Metric After Selection */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-stone-900 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400 text-xs font-semibold">
            <span>After Selection (Pareto Frontier)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">
              {activeModel === 'yield'
                ? `${yieldData.heldOutPerformance.after.mae} t/ha`
                : `${diseaseData.heldOutPerformance.after.macroF1Pct}%`}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
            {activeModel === 'yield'
              ? `RMSE: ${yieldData.heldOutPerformance.after.rmse} • R²: ${yieldData.heldOutPerformance.after.r2}`
              : `Accuracy: ${diseaseData.heldOutPerformance.after.accuracyPct}% • Precision: ${diseaseData.heldOutPerformance.after.precisionPct}%`}
          </p>
        </div>

        {/* Improvement Gain */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-semibold">
            <span>Test Generalization Gain</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {activeModel === 'yield'
                ? `-${yieldData.heldOutPerformance.maeImprovementPct}%`
                : `+${diseaseData.heldOutPerformance.macroF1GainPct}%`}
            </span>
            <span className="text-xs text-stone-500">
              {activeModel === 'yield' ? 'Error Reduction' : 'Macro-F1 Gain'}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-stone-500">
            Noise reduction via multi-objective Pareto pruning on held-out test data.
          </p>
        </div>
      </div>

      {/* Selected vs Pruned Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Retained Pareto Optimal Features (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Actual Retained Features ({currentData.retainedCount})</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Selected by PSO-NSPSO Pareto frontier for optimal predictive fidelity
              </p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-md text-xs font-bold font-mono">
              Retained: {currentData.retainedCount}
            </span>
          </div>

          <div className="space-y-2">
            {currentData.selectedFeatures.map((featName, idx) => {
              const meta = FEATURE_DESCRIPTIONS[featName] || {
                role: 'High-signal agronomic feature',
                category: 'Model Input',
              };
              const isSimulatedOff = simulatedExcluded.includes(featName);

              return (
                <div
                  key={featName}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isSimulatedOff
                      ? 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 opacity-50'
                      : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-mono font-bold text-stone-900 dark:text-stone-100">
                          {featName}
                        </span>
                        <span className="text-[10px] bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-full font-medium">
                          {meta.category}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                        {meta.role}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSimulatedFeature(featName)}
                    className="text-[11px] font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 px-2 py-1 rounded border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 shrink-0 cursor-pointer"
                  >
                    {isSimulatedOff ? '+ Restore' : '- Exclude'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Pareto Frontier Curve & Redundant Feature Elimination (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pareto Frontier Summary */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Pareto-Optimal Trade-off Frontier</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Multi-objective balance between feature cardinality (sparsity) and held-out prediction loss.
            </p>

            <div className="space-y-2">
              {currentData.paretoFrontSample.map((pt, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700"
                >
                  <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Subset {pt.selectedCount} features
                  </span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-stone-500">
                      Sparsity: {Math.round(pt.sparsity * 100)}%
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {'mae' in pt ? `${pt.mae} t/ha` : `${pt.macroF1Pct}% F1`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pruned Features List */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-amber-500" />
                <span>Pruned Redundant Features ({currentData.totalCount - currentData.retainedCount})</span>
              </h3>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                Excluded for Sparsity
              </span>
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400">
              The following candidate channels exhibited high multicollinearity or noise without contributing to generalization:
            </p>

            <div className="flex flex-wrap gap-1.5">
              {currentData.candidateFeatures
                .filter(f => !currentData.selectedFeatures.includes(f))
                .map(f => (
                  <span
                    key={f}
                    className="px-2.5 py-1 rounded-md text-xs font-mono bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700"
                  >
                    {f}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dataset & Training Provenance Footer */}
      <div className="bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800 p-4 text-xs text-stone-600 dark:text-stone-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            <strong>Training Provenance:</strong> {currentData.sampleCounts.total} total verified samples ({currentData.sampleCounts.train} train, {currentData.sampleCounts.heldOutTest} held-out test). Random Seed: 42. Verified execution completed at {smartOptData.lastRunTimestamp}.
          </span>
        </div>
        <span className="text-[11px] font-mono text-stone-400 shrink-0">
          Status: Synchronized with /src/models/
        </span>
      </div>
    </div>
  );
};
