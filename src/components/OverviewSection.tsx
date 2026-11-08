import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  BarChart3,
  TrendingUp,
  Bug,
  Droplets,
  Cpu,
  ArrowRight,
  MapPin,
  RefreshCw,
  Search,
  Thermometer,
  Wind,
  CloudRain,
  ExternalLink,
  Navigation,
  Clock,
} from 'lucide-react';
import {
  LanguageCode,
  NavigationSection,
  WeatherData,
  YieldRecord,
} from '../types/index.ts';
import { t } from '../utils/i18n.ts';
import { aggregateYieldByYear } from '../utils/csv.ts';
import { POPULAR_INDIAN_FARM_HUBS, searchVillagesAndTowns } from '../utils/weather.ts';
import { Crosshair, AlertCircle } from 'lucide-react';

interface OverviewSectionProps {
  weather: WeatherData | null;
  weatherLoading: boolean;
  weatherError: string | null;
  onRefreshWeather: () => void;
  onSelectLocation: (lat: number, lon: number, name: string) => void;
  onUseCurrentLocation?: () => void;
  geoLocating?: boolean;
  geoError?: string | null;
  yieldRecords: YieldRecord[];
  onNavigate: (section: NavigationSection) => void;
  lang: LanguageCode;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  weather,
  weatherLoading,
  weatherError,
  onRefreshWeather,
  onSelectLocation,
  onUseCurrentLocation,
  geoLocating = false,
  geoError = null,
  yieldRecords,
  onNavigate,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    { name: string; admin1?: string; country?: string; latitude: number; longitude: number }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search debouncing
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchVillagesAndTowns(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (item: {
    name: string;
    admin1?: string;
    latitude: number;
    longitude: number;
  }) => {
    const fullName = item.admin1 ? `${item.name}, ${item.admin1}` : item.name;
    onSelectLocation(item.latitude, item.longitude, fullName);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Aggregate multi-year yield data for summary
  const yieldSummary = React.useMemo(() => {
    if (yieldRecords.length === 0) return { avg: 0, peak: 0, topRegion: '-', count: 0 };
    const sum = yieldRecords.reduce((acc, r) => acc + r.yieldTonnesPerHa, 0);
    const avg = Math.round((sum / yieldRecords.length) * 100) / 100;
    let peak = yieldRecords[0].yieldTonnesPerHa;
    let peakCrop = yieldRecords[0].crop;
    let peakYear = yieldRecords[0].year;

    const regionMap = new Map<string, { sum: number; count: number }>();
    for (const r of yieldRecords) {
      if (r.yieldTonnesPerHa > peak) {
        peak = r.yieldTonnesPerHa;
        peakCrop = r.crop;
        peakYear = r.year;
      }
      const existing = regionMap.get(r.region);
      if (!existing) regionMap.set(r.region, { sum: r.yieldTonnesPerHa, count: 1 });
      else {
        existing.sum += r.yieldTonnesPerHa;
        existing.count += 1;
      }
    }

    let topRegion = '-';
    let topAvg = 0;
    for (const [reg, d] of regionMap.entries()) {
      const regAvg = d.sum / d.count;
      if (regAvg > topAvg) {
        topAvg = regAvg;
        topRegion = reg;
      }
    }

    return {
      avg,
      peak,
      peakCrop,
      peakYear,
      topRegion,
      topAvg: Math.round(topAvg * 10) / 10,
      count: yieldRecords.length,
    };
  }, [yieldRecords]);

  // Aggregate trend over years
  const yearAgg = React.useMemo(() => {
    return aggregateYieldByYear(yieldRecords);
  }, [yieldRecords]);

  return (
    <div className="space-y-6">
      {/* Welcome & AI Architecture Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 dark:from-emerald-950 dark:to-stone-900 text-white rounded-2xl p-5 sm:p-6 shadow-xs border border-emerald-700/60 dark:border-stone-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-600/50">
              {t('appName', lang)} • Agricultural Intelligence
            </span>
            <h2 className="text-xl sm:text-2xl font-black mt-2">
              Empowering Indian Agriculture with Deep Learning
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
              Real-time Open-Meteo weather forecasting, multi-year historical yield trends, and the CNN-BiGRU feature extraction + PSO-NSPSO Pareto feature selection pipeline.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('weather')}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CloudSun className="w-4 h-4 text-emerald-200" />
              <span>{t('navWeather', lang)}</span>
            </button>
            <button
              onClick={() => onNavigate('yield-predict')}
              className="px-3.5 py-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>{t('predictYield', lang)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Live Weather Summary & Historical Yield Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Weather Summary (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('weatherSummary', lang)}</span>
            </h3>
            {/* View Full Forecast Button */}
            <button
              onClick={() => onNavigate('weather')}
              className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition-colors cursor-pointer group"
            >
              <span>{t('viewFullForecast', lang)}</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Weather Summary Card */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-stone-200 dark:border-stone-800 p-4 sm:p-5 space-y-4 transition-colors">
            {/* Search & Location Bar */}
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder', lang)}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                  </div>
                )}

                {/* Dropdown Results */}
                {searchResults.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-20 max-h-56 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-700">
                    {searchResults.map((res, i) => (
                      <li key={`${res.latitude}-${res.longitude}-${i}`}>
                        <button
                          type="button"
                          onClick={() => handleSelectSearchResult(res)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 flex items-center justify-between gap-2"
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="font-semibold">{res.name}</span>
                            {res.admin1 && (
                              <span className="text-stone-400 truncate">({res.admin1})</span>
                            )}
                          </span>
                          <span className="text-[10px] text-stone-400 shrink-0">
                            {res.latitude.toFixed(2)}°, {res.longitude.toFixed(2)}°
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {/* "Use current location" button directly below Weather search */}
                <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={onUseCurrentLocation}
                    disabled={geoLocating}
                    className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-60"
                  >
                    <Crosshair className={`w-3.5 h-3.5 ${geoLocating ? 'animate-spin' : ''}`} />
                    <span>
                      {geoLocating ? 'Detecting high-accuracy browser GPS...' : 'Use current location'}
                    </span>
                  </button>

                  {weather?.locationDetails?.accuracyMeters !== undefined && (
                    <div className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-md text-[10px] font-mono flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>±{Math.round(weather.locationDetails.accuracyMeters)}m precision</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onRefreshWeather}
                disabled={weatherLoading}
                className="px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50 border border-stone-200 dark:border-stone-700 self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${weatherLoading ? 'animate-spin' : ''}`} />
                <span>{t('retry', lang)}</span>
              </button>
            </div>

            {/* GPS Error Alert */}
            {geoError && (
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-lg flex items-start justify-between gap-2 text-amber-900 dark:text-amber-200 text-xs">
                <div className="flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">GPS Warning: </span>
                    <span className="text-[11px] text-amber-800 dark:text-amber-300">{geoError}</span>
                  </div>
                </div>
                {onUseCurrentLocation && (
                  <button
                    type="button"
                    onClick={onUseCurrentLocation}
                    className="px-2 py-0.5 bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded text-[10px] font-bold shrink-0"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            {/* Farm Belts Shortcuts */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs pb-1">
              <span className="text-[11px] text-stone-400 font-medium whitespace-nowrap flex items-center gap-1">
                <Navigation className="w-3 h-3 text-stone-400" /> Belts:
              </span>
              {POPULAR_INDIAN_FARM_HUBS.slice(0, 5).map(hub => (
                <button
                  key={hub.name}
                  type="button"
                  onClick={() => onSelectLocation(hub.lat, hub.lon, hub.name)}
                  className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-stone-700 hover:text-emerald-700 dark:hover:text-emerald-400 text-stone-700 dark:text-stone-300 rounded-md whitespace-nowrap border border-stone-200 dark:border-stone-700 text-xs transition-colors"
                >
                  {hub.name.split(' (')[0]}
                </button>
              ))}
            </div>

            {/* Weather Error State */}
            {weatherError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-800 dark:text-red-300">
                <p className="font-semibold">{weatherError}</p>
                <button
                  onClick={onRefreshWeather}
                  className="mt-1 font-bold underline text-red-700 dark:text-red-400"
                >
                  {t('retry', lang)}
                </button>
              </div>
            )}

            {/* Live Conditions Snapshot */}
            {weather && (
              <div className="space-y-3">
                {/* Location Title Banner */}
                <div className="flex flex-wrap items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800 text-xs gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-bold text-stone-900 dark:text-white truncate">
                      {weather.locationDetails?.village ? (
                        <span>Village {weather.locationDetails.village}, {weather.locationDetails.district || ''}</span>
                      ) : (
                        weather.area
                      )}
                    </span>
                    {weather.locationDetails?.state && (
                      <span className="text-[11px] text-stone-500 font-medium">({weather.locationDetails.state})</span>
                    )}
                    <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">
                      ({weather.latitude.toFixed(2)}°N, {weather.longitude.toFixed(2)}°E)
                    </span>
                    {weather.locationDetails?.accuracyMeters !== undefined && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hidden md:inline">
                        ±{Math.round(weather.locationDetails.accuracyMeters)}m accuracy
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-stone-400 shrink-0">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>{weather.lastUpdated}</span>
                  </div>
                </div>

                {/* 4 Metric Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Temperature */}
                  <div className="bg-amber-50/80 dark:bg-stone-800/80 border border-amber-200 dark:border-stone-700 rounded-xl p-3">
                    <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 text-xs">
                      <span className="font-semibold">{t('temperature', lang)}</span>
                      <Thermometer className="w-3.5 h-3.5" />
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
                        {weather.temperature}
                      </span>
                      <span className="text-xs font-bold text-stone-500">°C</span>
                    </div>
                    <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300 block truncate mt-0.5">
                      {weather.condition}
                    </span>
                  </div>

                  {/* Humidity */}
                  <div className="bg-blue-50/80 dark:bg-stone-800/80 border border-blue-200 dark:border-stone-700 rounded-xl p-3">
                    <div className="flex items-center justify-between text-blue-800 dark:text-blue-400 text-xs">
                      <span className="font-semibold">{t('humidity', lang)}</span>
                      <Droplets className="w-3.5 h-3.5" />
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
                        {weather.humidity}
                      </span>
                      <span className="text-xs font-bold text-stone-500">%</span>
                    </div>
                    <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 block truncate mt-0.5">
                      {weather.humidity > 70 ? 'High moisture' : 'Optimal'}
                    </span>
                  </div>

                  {/* Wind */}
                  <div className="bg-teal-50/80 dark:bg-stone-800/80 border border-teal-200 dark:border-stone-700 rounded-xl p-3 col-span-2 sm:col-span-1">
                    <div className="flex items-center justify-between text-teal-800 dark:text-teal-400 text-xs">
                      <span className="font-semibold">{t('wind', lang)}</span>
                      <Wind className="w-3.5 h-3.5" />
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
                        {weather.windSpeed}
                      </span>
                      <span className="text-xs font-bold text-stone-500">km/h</span>
                    </div>
                    <span className="text-[11px] font-medium text-teal-700 dark:text-teal-300 block truncate mt-0.5">
                      {weather.windSpeed > 20 ? 'Strong wind' : 'Calm breeze'}
                    </span>
                  </div>
                </div>

                {/* 24-Hour Preview Sparkline / CTA Bar */}
                <div className="p-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-stone-700 dark:text-stone-300">
                      24-hour hourly temperatures & rain probabilities available.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('weather')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{t('viewFullForecast', lang)}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Historical Yield Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('historicalYieldTitle', lang)}</span>
              </h3>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                Official APY & Karnataka Taluk Data
              </span>
            </div>
            <button
              onClick={() => onNavigate('yield-history')}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* KPI Cards */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-stone-50 dark:bg-stone-800/60 p-3 rounded-lg border border-stone-100 dark:border-stone-800">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  {t('averageYield', lang)}
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    {yieldSummary.avg}
                  </span>
                  <span className="text-xs text-stone-500">{t('tonnesPerHa', lang)}</span>
                </div>
              </div>

              <div className="bg-stone-50 dark:bg-stone-800/60 p-3 rounded-lg border border-stone-100 dark:border-stone-800">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  {t('peakYield', lang)}
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {yieldSummary.peak}
                  </span>
                  <span className="text-xs text-stone-500">t/ha</span>
                </div>
                <span className="text-[10px] text-stone-400 block truncate">
                  {yieldSummary.peakCrop} ({yieldSummary.peakYear})
                </span>
              </div>
            </div>

            {/* Top Producer & Records count */}
            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900 rounded-lg text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
                  {t('topProducer', lang)}
                </span>
                <span className="font-extrabold text-stone-900 dark:text-white text-sm">
                  {yieldSummary.topRegion} ({yieldSummary.topAvg} t/ha avg)
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('yield-history')}
                className="px-2.5 py-1 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
              >
                View
              </button>
            </div>

            {/* Quick SVG Trend Sparkline */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  Yearly Production Trend
                </span>
                <span className="text-stone-400 text-[11px]">2018 - 2024</span>
              </div>
              <div className="h-28 w-full bg-stone-50 dark:bg-stone-800/50 rounded-lg p-2 border border-stone-100 dark:border-stone-800">
                <svg viewBox="0 0 320 80" className="w-full h-full">
                  {yearAgg.length > 1 && (
                    <>
                      <path
                        d={yearAgg
                          .map((d, i) => {
                            const x = 20 + (i / (yearAgg.length - 1)) * 280;
                            const y = 65 - ((d.avgYield - 15) / 10) * 50;
                            return `${i === 0 ? 'M' : 'L'} ${x} ${Math.max(10, Math.min(65, y))}`;
                          })
                          .join(' ')}
                        fill="none"
                        stroke="#059669"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      {yearAgg.map((d, i) => {
                        const x = 20 + (i / (yearAgg.length - 1)) * 280;
                        const y = 65 - ((d.avgYield - 15) / 10) * 50;
                        return (
                          <circle
                            key={d.year}
                            cx={x}
                            cy={Math.max(10, Math.min(65, y))}
                            r="3"
                            fill="#ffffff"
                            stroke="#059669"
                            strokeWidth="2"
                          />
                        );
                      })}
                    </>
                  )}
                </svg>
              </div>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('disease')}
              className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-left hover:border-emerald-400 transition-colors shadow-xs group cursor-pointer"
            >
              <Bug className="w-5 h-5 text-amber-500 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-stone-800 dark:text-stone-100 block">
                {t('navDiseaseDetection', lang)}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                Upload leaf photo for diagnosis
              </span>
            </button>

            <button
              onClick={() => onNavigate('soil')}
              className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-left hover:border-emerald-400 transition-colors shadow-xs group cursor-pointer"
            >
              <Droplets className="w-5 h-5 text-teal-500 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-stone-800 dark:text-stone-100 block">
                {t('navSoilHealth', lang)}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                Check SHC pH & NPK benchmarks
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
