import React, { useState } from 'react';
import {
  Sparkles,
  Droplets,
  Sprout,
  ChevronRight,
  CloudRain,
  ShieldCheck,
  AlertTriangle,
  Info,
  RotateCcw,
} from 'lucide-react';
import { LanguageCode, SoilData, WeatherData } from '../types/index.ts';
import { getCropRecommendations, getFertilizerRecommendations } from '../utils/recommendations.ts';
import { t } from '../utils/i18n.ts';

const ALL_AVAILABLE_CROPS = [
  'Rice (Paddy)',
  'Bengal Gram (Chickpea)',
  'Wheat',
  'Cotton',
  'Maize (Corn)',
  'Sugarcane',
  'Groundnut (Peanut)',
  'Mustard',
  'Pearl Millet (Bajra)',
];

interface RecommendationsTabProps {
  soil: SoilData;
  weather: WeatherData | null;
  lang?: LanguageCode;
}

export const RecommendationsTab: React.FC<RecommendationsTabProps> = ({
  soil,
  weather,
  lang = 'en',
}) => {
  const [selectedCropForFertilizer, setSelectedCropForFertilizer] = useState<string>('Rice (Paddy)');
  const [activeSubView, setActiveSubView] = useState<'crops' | 'fertilizers'>('crops');
  const [simulatedN, setSimulatedN] = useState<number | null>(null);
  const [simulatedRain, setSimulatedRain] = useState<boolean | null>(null);

  // Compute effective soil and weather based on interactive simulation or real sensor/API
  const effectiveSoil: SoilData = {
    ...soil,
    nitrogen: simulatedN !== null ? simulatedN : soil.nitrogen,
  };

  const effectiveWeather: WeatherData | null = weather
    ? {
        ...weather,
        hourly: {
          ...weather.hourly,
          rainProbability:
            simulatedRain !== null
              ? [simulatedRain ? 75 : 10, ...(weather.hourly.rainProbability?.slice(1) || [])]
              : weather.hourly.rainProbability,
        },
      }
    : simulatedRain !== null
    ? {
        area: 'Active Agro Zone',
        latitude: 21.14,
        longitude: 79.08,
        temperature: 28,
        humidity: 60,
        windSpeed: 10,
        weatherCode: simulatedRain ? 61 : 1,
        condition: simulatedRain ? 'Rainy' : 'Clear',
        lastUpdated: 'Live',
        hourly: {
          time: ['12:00'],
          temperature: [28],
          rainProbability: [simulatedRain ? 75 : 10],
        },
      }
    : null;

  const cropRecs = getCropRecommendations(effectiveSoil, effectiveWeather);
  const fertilizerRecs = getFertilizerRecommendations(
    effectiveSoil,
    selectedCropForFertilizer,
    effectiveWeather
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Context Integration */}
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-stone-200 dark:border-stone-800 p-4 sm:p-5 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {t('recommendationsTitle', lang)}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Multi-factor agronomic advice combining live Open-Meteo weather and Soil Health Card readings
            </p>
          </div>

          {/* Sub-view toggle */}
          <div className="flex rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 p-0.5">
            <button
              type="button"
              onClick={() => setActiveSubView('crops')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
                activeSubView === 'crops'
                  ? 'bg-white dark:bg-stone-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>{t('recommendedCrops', lang)}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubView('fertilizers')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
                activeSubView === 'fertilizers'
                  ? 'bg-white dark:bg-stone-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>{t('fertilizerPlan', lang)}</span>
            </button>
          </div>
        </div>

        {/* Live Factor Indicators */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-stone-50 dark:bg-stone-800/60 p-2 rounded-lg border border-stone-100 dark:border-stone-800">
            <span className="text-[10px] text-stone-400 block font-medium">Active Soil pH</span>
            <span className="font-bold text-stone-800 dark:text-stone-200">{soil.pH} (Standard)</span>
          </div>
          <div className="bg-stone-50 dark:bg-stone-800/60 p-2 rounded-lg border border-stone-100 dark:border-stone-800">
            <span className="text-[10px] text-stone-400 block font-medium">Soil N-P-K (kg/ha)</span>
            <span className="font-bold text-stone-800 dark:text-stone-200">{soil.nitrogen} - {soil.phosphorus} - {soil.potassium}</span>
          </div>
          <div className="bg-stone-50 dark:bg-stone-800/60 p-2 rounded-lg border border-stone-100 dark:border-stone-800">
            <span className="text-[10px] text-stone-400 block font-medium">Local Temperature</span>
            <span className="font-bold text-stone-800 dark:text-stone-200">{weather ? `${weather.temperature}°C` : '28°C'}</span>
          </div>
          <div className="bg-stone-50 dark:bg-stone-800/60 p-2 rounded-lg border border-stone-100 dark:border-stone-800">
            <span className="text-[10px] text-stone-400 block font-medium">Rain Forecast</span>
            <span className="font-bold text-stone-800 dark:text-stone-200">
              {weather?.hourly?.rainProbability?.[0] !== undefined
                ? `${weather.hourly.rainProbability[0]}% rain prob`
                : '15% (Dry)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Views */}
      {activeSubView === 'crops' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
              Top Ranked Crops for Current Soil & Weather
            </h4>
            <span className="text-xs text-stone-500 dark:text-stone-400">Sorted by agronomic match score</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cropRecs.map((rec, idx) => (
              <div
                key={rec.crop}
                className="bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-stone-200 dark:border-stone-800 p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-400 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-400">#{idx + 1}</span>
                        <h5 className="text-base font-bold text-stone-900 dark:text-white">{rec.crop}</h5>
                      </div>
                      <span className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        Season: {rec.season}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                        {rec.matchScore}%
                      </div>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold">
                        {t('suitability', lang)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 bg-stone-50 dark:bg-stone-800/60 rounded-lg p-3 text-xs text-stone-700 dark:text-stone-300 leading-relaxed border border-stone-100 dark:border-stone-800">
                    <span className="font-semibold text-stone-900 dark:text-white block mb-0.5">{t('reason', lang)}:</span>
                    {rec.explanation}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                  <span>{t('expectedYield', lang)}: <b className="text-stone-800 dark:text-stone-200">{rec.expectedYieldRange}</b></span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCropForFertilizer(rec.crop);
                      setActiveSubView('fertilizers');
                    }}
                    className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-semibold flex items-center gap-1"
                  >
                    <span>View Fertilizer</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Interactive Agronomic Factor Controls */}
          <div className="bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-stone-200 dark:border-stone-700">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Agronomic Dynamic Response & Scenario Testing
              </span>
              {(simulatedN !== null || simulatedRain !== null) && (
                <button
                  type="button"
                  onClick={() => {
                    setSimulatedN(null);
                    setSimulatedRain(null);
                  }}
                  className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to Live Sensor/API</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Test 1: Rice vs Chickpea Comparison */}
              <div className="space-y-1.5">
                <span className="font-semibold text-stone-700 dark:text-stone-300 block text-[11px]">
                  1. Compare Crops (Identical Soil):
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCropForFertilizer('Rice (Paddy)')}
                    className={`flex-1 py-1.5 px-2 rounded-md font-semibold text-xs transition-colors cursor-pointer border ${
                      selectedCropForFertilizer === 'Rice (Paddy)'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    Rice (Paddy)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCropForFertilizer('Bengal Gram (Chickpea)')}
                    className={`flex-1 py-1.5 px-2 rounded-md font-semibold text-xs transition-colors cursor-pointer border ${
                      selectedCropForFertilizer === 'Bengal Gram (Chickpea)'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    Bengal Gram (Chickpea)
                  </button>
                </div>
              </div>

              {/* Test 2: Soil Nitrogen Simulation */}
              <div className="space-y-1.5">
                <span className="font-semibold text-stone-700 dark:text-stone-300 block text-[11px]">
                  2. Test Soil Nitrogen Level:
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setSimulatedN(200)}
                    className={`flex-1 py-1 px-1.5 rounded text-[11px] font-semibold border ${
                      effectiveSoil.nitrogen < 280
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-600'
                    }`}
                  >
                    Low N (200)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedN(340)}
                    className={`flex-1 py-1 px-1.5 rounded text-[11px] font-semibold border ${
                      effectiveSoil.nitrogen >= 280 && effectiveSoil.nitrogen <= 480
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-600'
                    }`}
                  >
                    Med N (340)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedN(520)}
                    className={`flex-1 py-1 px-1.5 rounded text-[11px] font-semibold border ${
                      effectiveSoil.nitrogen > 480
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-600'
                    }`}
                  >
                    High N (520)
                  </button>
                </div>
              </div>

              {/* Test 3: Rain Forecast Simulation */}
              <div className="space-y-1.5">
                <span className="font-semibold text-stone-700 dark:text-stone-300 block text-[11px]">
                  3. Test Weather Rain Alert:
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSimulatedRain(false)}
                    className={`flex-1 py-1 px-2 rounded text-[11px] font-semibold border ${
                      simulatedRain === false
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-600'
                    }`}
                  >
                    Dry Weather (10%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedRain(true)}
                    className={`flex-1 py-1 px-2 rounded text-[11px] font-semibold border flex items-center justify-center gap-1 ${
                      simulatedRain === true
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-600'
                    }`}
                  >
                    <CloudRain className="w-3 h-3" />
                    <span>Heavy Rain (75%)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Header & Crop Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-stone-900 dark:text-white">
                  Fertilizer Regimen for {selectedCropForFertilizer}
                </h4>
                {selectedCropForFertilizer.toLowerCase().includes('bajra') || selectedCropForFertilizer.toLowerCase().includes('millet') ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    Uncalibrated Package
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified STCR Package
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Targeting Soil N: {effectiveSoil.nitrogen} kg/ha • pH: {effectiveSoil.pH} • Weather: {effectiveWeather?.hourly?.rainProbability?.[0] || 15}% rain prob
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="fert-crop" className="text-xs font-semibold text-stone-700 dark:text-stone-300 whitespace-nowrap">
                Select Crop:
              </label>
              <select
                id="fert-crop"
                value={selectedCropForFertilizer}
                onChange={e => setSelectedCropForFertilizer(e.target.value)}
                className="px-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium text-stone-800 dark:text-stone-100"
              >
                {ALL_AVAILABLE_CROPS.map(crop => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {fertilizerRecs.map((fert, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-stone-200 dark:border-stone-800 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors"
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h5 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
                      {fert.name}
                    </h5>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed pl-8">
                    {fert.purpose}
                  </p>

                  <div className="pl-8 pt-1">
                    <span className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-100 dark:border-emerald-800 inline-block">
                      💡 {t('reason', lang)}: {fert.explanation}
                    </span>
                  </div>
                </div>

                <div className="bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-lg p-3 shrink-0 w-full md:w-64 text-xs space-y-1.5">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">
                      {t('dosage', lang)}
                    </span>
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                      {fert.dosage}
                    </span>
                  </div>
                  <div className="pt-1 border-t border-stone-200 dark:border-stone-700">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">
                      {t('timing', lang)}
                    </span>
                    <span className="text-stone-700 dark:text-stone-300 text-[11px] font-medium">
                      {fert.applicationTiming}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
