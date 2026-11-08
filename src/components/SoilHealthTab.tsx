import React from 'react';
import {
  Droplets,
  Activity,
  Flame,
  Leaf,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { LanguageCode, SoilAssessment, SoilData } from '../types/index.ts';
import { assessSoil } from '../utils/soil.ts';
import { t } from '../utils/i18n.ts';

interface SoilHealthTabProps {
  soil: SoilData;
  onChangeSoil: (updated: SoilData) => void;
  lang?: LanguageCode;
}

export const SoilHealthTab: React.FC<SoilHealthTabProps> = ({
  soil,
  onChangeSoil,
  lang = 'en',
}) => {
  const assessment: SoilAssessment = assessSoil(soil);

  const handleUpdate = (field: keyof SoilData, value: number) => {
    onChangeSoil({
      ...soil,
      [field]: value,
    });
  };

  const applyPreset = (preset: {
    name: string;
    pH: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  }) => {
    onChangeSoil({
      pH: preset.pH,
      nitrogen: preset.nitrogen,
      phosphorus: preset.phosphorus,
      potassium: preset.potassium,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-stone-200 dark:border-stone-800 p-4 sm:p-5 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Droplets className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {t('soilHealthTitle', lang)}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Evaluated against Government of India Soil Health Card (SHC) & ICAR agronomic standards
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {t('score', lang)}: {assessment.overallHealthScore}/100
            </span>
          </div>
        </div>

        {/* Quick Regional Presets */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-stone-400 font-medium whitespace-nowrap text-[11px] flex items-center gap-1">
            <Layers className="w-3 h-3" /> Quick Soil Presets:
          </span>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                name: 'Alluvial Loam',
                pH: 7.2,
                nitrogen: 380,
                phosphorus: 22,
                potassium: 230,
              })
            }
            className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-stone-700 hover:text-emerald-700 dark:hover:text-emerald-400 text-stone-700 dark:text-stone-300 rounded-md whitespace-nowrap border border-stone-200 dark:border-stone-700 text-xs transition-colors"
          >
            Alluvial Loam (Indo-Gangetic)
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                name: 'Black Cotton',
                pH: 7.8,
                nitrogen: 240,
                phosphorus: 12,
                potassium: 310,
              })
            }
            className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-stone-700 hover:text-emerald-700 dark:hover:text-emerald-400 text-stone-700 dark:text-stone-300 rounded-md whitespace-nowrap border border-stone-200 dark:border-stone-700 text-xs transition-colors"
          >
            Black Cotton (Deccan Regur)
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                name: 'Red Sandy Loam',
                pH: 6.2,
                nitrogen: 210,
                phosphorus: 9,
                potassium: 160,
              })
            }
            className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-stone-700 hover:text-emerald-700 dark:hover:text-emerald-400 text-stone-700 dark:text-stone-300 rounded-md whitespace-nowrap border border-stone-200 dark:border-stone-700 text-xs transition-colors"
          >
            Red Sandy Loam (Southern Plateau)
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                name: 'Acidic Laterite',
                pH: 5.3,
                nitrogen: 190,
                phosphorus: 7,
                potassium: 140,
              })
            }
            className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-stone-700 hover:text-emerald-700 dark:hover:text-emerald-400 text-stone-700 dark:text-stone-300 rounded-md whitespace-nowrap border border-stone-200 dark:border-stone-700 text-xs transition-colors"
          >
            Acidic Laterite (Coastal / High Rainfall)
          </button>
        </div>
      </div>

      {/* Main 4 Parameter Input Meters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* pH Card */}
        <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-stone-200 dark:border-stone-800 p-4 space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              {t('soilReaction', lang)}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                assessment.pHRating === 'optimal'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
              }`}
            >
              {assessment.pHStatus}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <input
              type="number"
              step="0.1"
              min="3.5"
              max="10.0"
              value={soil.pH}
              onChange={e => handleUpdate('pH', parseFloat(e.target.value) || 7.0)}
              className="text-3xl font-extrabold text-stone-900 dark:text-white w-24 px-2 py-0.5 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-left bg-stone-50 dark:bg-stone-800"
            />
            <span className="text-xs font-semibold text-stone-500">pH scale</span>
          </div>

          <input
            type="range"
            min="4.5"
            max="9.5"
            step="0.1"
            value={soil.pH}
            onChange={e => handleUpdate('pH', parseFloat(e.target.value) || 7.0)}
            className="w-full accent-emerald-600 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-stone-400 font-medium">
            <span>Acidic (&lt;6.5)</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Optimal (6.5-7.5)</span>
            <span>Alkaline (&gt;7.5)</span>
          </div>
        </div>

        {/* Nitrogen (N) Card */}
        <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-stone-200 dark:border-stone-800 p-4 space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" /> {t('nitrogen', lang)}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                assessment.nitrogenStatus === 'Low'
                  ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                  : assessment.nitrogenStatus === 'Medium'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
              }`}
            >
              {assessment.nitrogenStatus}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <input
              type="number"
              min="50"
              max="900"
              value={soil.nitrogen}
              onChange={e => handleUpdate('nitrogen', parseFloat(e.target.value) || 0)}
              className="text-3xl font-extrabold text-stone-900 dark:text-white w-28 px-2 py-0.5 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-left bg-stone-50 dark:bg-stone-800"
            />
            <span className="text-xs font-semibold text-stone-500">kg / ha</span>
          </div>

          <input
            type="range"
            min="100"
            max="800"
            step="10"
            value={soil.nitrogen}
            onChange={e => handleUpdate('nitrogen', parseFloat(e.target.value) || 0)}
            className="w-full accent-emerald-600 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-stone-400 font-medium">
            <span>Low (&lt;280)</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Medium (280-560)</span>
            <span>High (&gt;560)</span>
          </div>
        </div>

        {/* Phosphorus (P) Card */}
        <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-stone-200 dark:border-stone-800 p-4 space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-600" /> {t('phosphorus', lang)}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                assessment.phosphorusStatus === 'Low'
                  ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                  : assessment.phosphorusStatus === 'Medium'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
              }`}
            >
              {assessment.phosphorusStatus}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <input
              type="number"
              min="2"
              max="80"
              value={soil.phosphorus}
              onChange={e => handleUpdate('phosphorus', parseFloat(e.target.value) || 0)}
              className="text-3xl font-extrabold text-stone-900 dark:text-white w-24 px-2 py-0.5 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-left bg-stone-50 dark:bg-stone-800"
            />
            <span className="text-xs font-semibold text-stone-500">kg / ha</span>
          </div>

          <input
            type="range"
            min="5"
            max="60"
            step="1"
            value={soil.phosphorus}
            onChange={e => handleUpdate('phosphorus', parseFloat(e.target.value) || 0)}
            className="w-full accent-emerald-600 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-stone-400 font-medium">
            <span>Low (&lt;10)</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Medium (10-25)</span>
            <span>High (&gt;25)</span>
          </div>
        </div>

        {/* Potassium (K) Card */}
        <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-stone-200 dark:border-stone-800 p-4 space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" /> {t('potassium', lang)}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                assessment.potassiumStatus === 'Low'
                  ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                  : assessment.potassiumStatus === 'Medium'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
              }`}
            >
              {assessment.potassiumStatus}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <input
              type="number"
              min="30"
              max="600"
              value={soil.potassium}
              onChange={e => handleUpdate('potassium', parseFloat(e.target.value) || 0)}
              className="text-3xl font-extrabold text-stone-900 dark:text-white w-28 px-2 py-0.5 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-left bg-stone-50 dark:bg-stone-800"
            />
            <span className="text-xs font-semibold text-stone-500">kg / ha</span>
          </div>

          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={soil.potassium}
            onChange={e => handleUpdate('potassium', parseFloat(e.target.value) || 0)}
            className="w-full accent-emerald-600 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-stone-400 font-medium">
            <span>Low (&lt;110)</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Medium (110-280)</span>
            <span>High (&gt;280)</span>
          </div>
        </div>
      </div>

      {/* Diagnostic Assessment Card & Nutrient Deficit Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Diagnosis text (2 cols) */}
        <div className="md:col-span-2 bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-stone-200 dark:border-stone-800 p-5 space-y-3 transition-colors">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h4 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white">
              Agronomic Diagnosis & Fertility Status
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            {assessment.summary}
          </p>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 grid grid-cols-3 gap-2 text-xs">
            <div className="bg-stone-50 dark:bg-stone-800/60 p-2.5 rounded-lg border border-stone-100 dark:border-stone-800">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block">{t('targetDeficit', lang)} (N)</span>
              <span className="font-bold text-stone-800 dark:text-stone-100 text-sm">
                {assessment.deficits.nDeficit > 0 ? `${assessment.deficits.nDeficit} kg/ha` : 'None (Balanced)'}
              </span>
            </div>
            <div className="bg-stone-50 dark:bg-stone-800/60 p-2.5 rounded-lg border border-stone-100 dark:border-stone-800">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block">{t('targetDeficit', lang)} (P)</span>
              <span className="font-bold text-stone-800 dark:text-stone-100 text-sm">
                {assessment.deficits.pDeficit > 0 ? `${assessment.deficits.pDeficit} kg/ha` : 'None (Balanced)'}
              </span>
            </div>
            <div className="bg-stone-50 dark:bg-stone-800/60 p-2.5 rounded-lg border border-stone-100 dark:border-stone-800">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block">{t('targetDeficit', lang)} (K)</span>
              <span className="font-bold text-stone-800 dark:text-stone-100 text-sm">
                {assessment.deficits.kDeficit > 0 ? `${assessment.deficits.kDeficit} kg/ha` : 'None (Balanced)'}
              </span>
            </div>
          </div>
        </div>

        {/* Indian Soil Health Card Reference Norms (1 col) */}
        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl p-5 space-y-2.5 text-xs text-emerald-950 dark:text-emerald-200">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-100">
            <Info className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Govt. of India SHC Standards</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-emerald-900/90 dark:text-emerald-300 leading-tight">
            <li>• <b>pH:</b> 6.5 – 7.5 (Optimal nutrient availability)</li>
            <li>• <b>Nitrogen:</b> &gt;280 kg/ha needed for normal vegetative canopy</li>
            <li>• <b>Phosphorus:</b> 10 – 25 kg/ha critical for root elongation</li>
            <li>• <b>Potassium:</b> 110 – 280 kg/ha drives drought and pest resilience</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
