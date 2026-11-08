import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  RefreshCw,
  Search,
  MapPin,
  AlertCircle,
  Thermometer,
  CloudRain,
  Navigation,
  Crosshair,
  Compass,
  CheckCircle,
} from 'lucide-react';
import { LanguageCode, WeatherData } from '../types/index.ts';
import {
  POPULAR_INDIAN_FARM_HUBS,
  searchVillagesAndTowns,
} from '../utils/weather.ts';
import { t } from '../utils/i18n.ts';

interface WeatherTabProps {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onSelectLocation: (lat: number, lon: number, name: string) => void;
  onUseCurrentLocation?: () => void;
  geoLocating?: boolean;
  geoError?: string | null;
  lang?: LanguageCode;
}

export const WeatherTab: React.FC<WeatherTabProps> = ({
  weather,
  loading,
  error,
  onRefresh,
  onSelectLocation,
  onUseCurrentLocation,
  geoLocating = false,
  geoError = null,
  lang = 'en',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    { name: string; admin1?: string; country?: string; latitude: number; longitude: number }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hoveredHourIndex, setHoveredHourIndex] = useState<number | null>(null);

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

  // SVG Chart Dimensions
  const svgWidth = 800;
  const svgHeight = 240;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Chart data points
  const hourlyTemps = weather?.hourly?.temperature || [];
  const hourlyRain = weather?.hourly?.rainProbability || [];
  const hourlyTimes = weather?.hourly?.time || [];
  const count = Math.min(24, hourlyTemps.length);

  const minTemp = Math.floor(Math.min(...hourlyTemps, 15) - 2);
  const maxTemp = Math.ceil(Math.max(...hourlyTemps, 35) + 2);
  const tempRange = Math.max(1, maxTemp - minTemp);

  const getX = (index: number) => paddingLeft + (index / Math.max(1, count - 1)) * chartWidth;
  const getYTemp = (temp: number) => paddingTop + chartHeight * (1 - (temp - minTemp) / tempRange);
  const getBarHeight = (prob: number) => (prob / 100) * (chartHeight * 0.45);

  // Temperature line path
  const tempPath =
    count > 0
      ? hourlyTemps
          .slice(0, count)
          .map((t, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getYTemp(t).toFixed(1)}`)
          .join(' ')
      : '';

  // Temperature area under line
  const areaPath =
    count > 0
      ? `${tempPath} L ${getX(count - 1)} ${paddingTop + chartHeight} L ${getX(0)} ${
          paddingTop + chartHeight
        } Z`
      : '';

  return (
    <div className="space-y-6">
      {/* Search & Location Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-stone-200 dark:border-stone-800 p-4 transition-colors">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="flex-1">
            <label htmlFor="village-search" className="sr-only">
              {t('searchPlaceholder', lang)}
            </label>
            {/* Search Input Wrapper */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="village-search"
                type="text"
                placeholder={t('searchPlaceholder', lang)}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                </div>
              )}

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-700">
                  {searchResults.map((res, i) => (
                    <li key={`${res.latitude}-${res.longitude}-${i}`}>
                      <button
                        type="button"
                        onClick={() => handleSelectSearchResult(res)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-medium">{res.name}</span>
                          {res.admin1 && (
                            <span className="text-xs text-stone-500 dark:text-stone-400">({res.admin1})</span>
                          )}
                        </span>
                        <span className="text-[11px] text-stone-400">
                          {res.latitude.toFixed(2)}°, {res.longitude.toFixed(2)}°
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* "Use current location" button directly below Weather search */}
            <div className="mt-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={onUseCurrentLocation}
                disabled={geoLocating}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-60"
              >
                <Crosshair className={`w-3.5 h-3.5 ${geoLocating ? 'animate-spin' : ''}`} />
                <span>
                  {geoLocating ? 'Detecting high-accuracy browser GPS...' : 'Use current location'}
                </span>
              </button>

              {weather?.locationDetails?.accuracyMeters !== undefined && (
                <div className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-[11px] font-mono flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Accuracy: ±{Math.round(weather.locationDetails.accuracyMeters)}m</span>
                </div>
              )}
            </div>
          </div>

          {/* Retry Button */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer border border-stone-200 dark:border-stone-700"
              title="Refresh live weather"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{t('retry', lang)}</span>
            </button>
          </div>
        </div>

        {/* GPS Error Alert */}
        {geoError && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-lg flex items-start justify-between gap-3 text-amber-900 dark:text-amber-200 text-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Location Access Issue</p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">{geoError}</p>
              </div>
            </div>
            {onUseCurrentLocation && (
              <button
                type="button"
                onClick={onUseCurrentLocation}
                className="px-2 py-1 bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded text-[11px] font-semibold hover:bg-amber-300 cursor-pointer shrink-0"
              >
                Retry GPS
              </button>
            )}
          </div>
        )}

        {/* Available Village/Town, District, State and Accuracy Display */}
        {weather && (
          <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-stone-700 dark:text-stone-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-stone-900 dark:text-white">
                {weather.locationDetails?.village ? (
                  <>Village: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{weather.locationDetails.village}</span></>
                ) : weather.locationDetails?.town ? (
                  <>Town: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{weather.locationDetails.town}</span></>
                ) : (
                  <span>{weather.area.split(',')[0]}</span>
                )}
              </span>
              {weather.locationDetails?.district && (
                <>
                  <span className="text-stone-400">•</span>
                  <span>District: <strong>{weather.locationDetails.district}</strong></span>
                </>
              )}
              {weather.locationDetails?.state && (
                <>
                  <span className="text-stone-400">•</span>
                  <span>State: <strong>{weather.locationDetails.state}</strong></span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-stone-500 font-mono">
              <span>{weather.latitude.toFixed(3)}°N, {weather.longitude.toFixed(3)}°E</span>
              {weather.locationDetails?.accuracyMeters !== undefined && (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  (±{Math.round(weather.locationDetails.accuracyMeters)}m precision)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Popular Agricultural Belts Quick Buttons */}
        <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-stone-400 font-medium whitespace-nowrap text-[11px] flex items-center gap-1">
            <Navigation className="w-3 h-3 text-stone-400" /> Farm Belts:
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
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl p-4 flex items-start gap-3 text-red-800 dark:text-red-300">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Weather Data Unavailable</h4>
            <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">{error}</p>
            <button
              onClick={onRefresh}
              className="mt-2 text-xs font-medium text-red-700 dark:text-red-300 underline hover:text-red-900"
            >
              {t('retry', lang)}
            </button>
          </div>
        </div>
      )}

      {/* Live Conditions Cards */}
      {weather && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Temperature */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 dark:from-stone-900 dark:to-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-400">
              <span className="text-xs font-medium uppercase tracking-wider">{t('temperature', lang)}</span>
              <Thermometer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white">
                {weather.temperature}
              </span>
              <span className="text-lg font-semibold text-stone-600 dark:text-stone-400">°C</span>
            </div>
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-300 font-medium truncate" title={weather.condition}>
              {weather.condition}
            </p>
          </div>

          {/* Humidity */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50/60 dark:from-stone-900 dark:to-stone-900 border border-blue-200/80 dark:border-stone-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-blue-800 dark:text-blue-400">
              <span className="text-xs font-medium uppercase tracking-wider">{t('humidity', lang)}</span>
              <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white">
                {weather.humidity}
              </span>
              <span className="text-lg font-semibold text-stone-600 dark:text-stone-400">%</span>
            </div>
            <p className="mt-1 text-xs text-blue-700 dark:text-blue-300 font-medium">
              {weather.humidity > 75 ? 'High humidity (Fungal alert)' : weather.humidity < 35 ? 'Dry atmosphere' : 'Optimal transpiration'}
            </p>
          </div>

          {/* Wind Speed */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50/60 dark:from-stone-900 dark:to-stone-900 border border-teal-200/80 dark:border-stone-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-teal-800 dark:text-teal-400">
              <span className="text-xs font-medium uppercase tracking-wider">{t('wind', lang)}</span>
              <Wind className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white">
                {weather.windSpeed}
              </span>
              <span className="text-lg font-semibold text-stone-600 dark:text-stone-400">km/h</span>
            </div>
            <p className="mt-1 text-xs text-teal-700 dark:text-teal-300 font-medium">
              {weather.windSpeed > 20 ? 'Strong wind (Avoid spray)' : 'Calm breeze (Good for spraying)'}
            </p>
          </div>

          {/* Location & Last Updated */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50/60 dark:from-stone-900 dark:to-stone-900 border border-emerald-200/80 dark:border-stone-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400">
              <span className="text-xs font-medium uppercase tracking-wider">{t('farmArea', lang)}</span>
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="mt-2">
              <span className="text-base sm:text-lg font-bold text-stone-900 dark:text-white block truncate" title={weather.area}>
                {weather.area}
              </span>
              <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-400">
                <span>{t('updated', lang)}:</span>
                <span className="font-semibold text-stone-700 dark:text-stone-300">{weather.lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hourly Temperature and Rain Probability Graph (Next 24h) */}
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-stone-200 dark:border-stone-800 p-4 sm:p-5 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {t('hourlyForecast', lang)}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Temperature trend (°C) with rain probability (%) in local farm time
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <span className="w-3 h-1 bg-amber-500 rounded-full" /> {t('temperature', lang)} (°C)
            </span>
            <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
              <span className="w-3 h-2.5 bg-blue-500/70 rounded-xs" /> {t('rainProbability', lang)} (%)
            </span>
          </div>
        </div>

        {/* SVG Responsive Graph */}
        <div className="mt-4 overflow-x-auto no-scrollbar">
          <div className="min-w-[650px]">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto select-none font-sans"
              role="img"
              aria-label="24-Hour hourly forecast chart for temperature and rain probability"
            >
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const y = paddingTop + chartHeight * pct;
                const tempVal = Math.round(maxTemp - pct * tempRange);
                return (
                  <g key={idx}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke="currentColor"
                      className="text-stone-100 dark:text-stone-800"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#94a3b8"
                    >
                      {tempVal}°C
                    </text>
                  </g>
                );
              })}

              {/* Rain Probability Bars in Background */}
              {hourlyRain.slice(0, count).map((prob, i) => {
                const x = getX(i) - 9;
                const barH = getBarHeight(prob);
                const y = paddingTop + chartHeight - barH;
                return (
                  <g key={`rain-${i}`}>
                    <rect
                      x={x}
                      y={y}
                      width={18}
                      height={barH}
                      rx={3}
                      fill="url(#rainGradient)"
                      opacity={prob > 0 ? 0.9 : 0.15}
                    />
                    {prob >= 25 && (
                      <text
                        x={x + 9}
                        y={Math.max(paddingTop + chartHeight - barH - 4, paddingTop + 12)}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="600"
                        fill="#3b82f6"
                      >
                        {prob}%
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Area Under Temperature Curve */}
              {areaPath && <path d={areaPath} fill="url(#tempGradient)" />}

              {/* Temperature Line */}
              {tempPath && (
                <path
                  d={tempPath}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Dots & Time Labels */}
              {hourlyTemps.slice(0, count).map((tVal, i) => {
                const x = getX(i);
                const y = getYTemp(tVal);
                const isHovered = hoveredHourIndex === i;
                const timeLabel = hourlyTimes[i] || '';

                return (
                  <g
                    key={`point-${i}`}
                    onMouseEnter={() => setHoveredHourIndex(i)}
                    onMouseLeave={() => setHoveredHourIndex(null)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={x - 14}
                      y={paddingTop}
                      width={28}
                      height={chartHeight + paddingBottom}
                      fill="transparent"
                    />

                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 5 : 3.5}
                      fill="#ffffff"
                      stroke="#d97706"
                      strokeWidth={isHovered ? 3 : 2}
                    />

                    {(isHovered || i % 2 === 0) && (
                      <text
                        x={x}
                        y={y - 8}
                        textAnchor="middle"
                        fontSize={isHovered ? '11' : '10'}
                        fontWeight={isHovered ? '700' : '500'}
                        fill="#d97706"
                      >
                        {Math.round(tVal)}°
                      </text>
                    )}

                    {i % 2 === 0 && (
                      <text
                        x={x}
                        y={paddingTop + chartHeight + 20}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#94a3b8"
                      >
                        {timeLabel.replace(':00 ', ' ')}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Hover Tooltip Box */}
              {hoveredHourIndex !== null && hourlyTemps[hoveredHourIndex] !== undefined && (
                <g
                  transform={`translate(${Math.min(
                    svgWidth - 140,
                    Math.max(paddingLeft, getX(hoveredHourIndex) - 60)
                  )}, 8)`}
                >
                  <rect
                    width="120"
                    height="32"
                    rx="6"
                    fill="#0f172a"
                    fillOpacity="0.94"
                    stroke="#334155"
                  />
                  <text x="60" y="15" textAnchor="middle" fontSize="10" fill="#cbd5e1">
                    {hourlyTimes[hoveredHourIndex]}
                  </text>
                  <text
                    x="60"
                    y="27"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="#38bdf8"
                  >
                    {hourlyTemps[hoveredHourIndex]}°C • {hourlyRain[hoveredHourIndex] ?? 0}% Rain
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Agronomic advisory */}
        {weather && (
          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-lg p-3 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
            <CloudRain className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-emerald-950 dark:text-emerald-100">{t('fieldAdvisory', lang)}: </span>
              {weather.hourly?.rainProbability?.slice(0, 12).some(p => p > 50) ? (
                <span>
                  High rain probability predicted in next 12 hours. Postpone open-field urea top dressing and pesticide sprays to prevent fertilizer runoff.
                </span>
              ) : weather.temperature > 35 ? (
                <span>
                  High ambient heat ({weather.temperature}°C). Schedule light early morning or evening irrigation to alleviate crop canopy heat stress.
                </span>
              ) : (
                <span>
                  Favorable weather conditions for field operations, basal fertilizer application, and crop scouting.
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
