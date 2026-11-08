import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { CompactHeader } from './components/CompactHeader.tsx';
import { OverviewSection } from './components/OverviewSection.tsx';
import { WeatherTab } from './components/WeatherTab.tsx';
import { HistoricalYieldTab } from './components/HistoricalYieldTab.tsx';
import { CropYieldPredictionTab } from './components/CropYieldPredictionTab.tsx';
import { DiseaseDetectionTab } from './components/DiseaseDetectionTab.tsx';
import { SoilHealthTab } from './components/SoilHealthTab.tsx';
import { RecommendationsTab } from './components/RecommendationsTab.tsx';
import { SmartOptimizationTab } from './components/SmartOptimizationTab.tsx';
import { ModelEndpointModal } from './components/ModelEndpointModal.tsx';
import { PipelineArchitectureModal } from './components/PipelineArchitectureModal.tsx';
import {
  LanguageCode,
  ModelEndpointConfig,
  NavigationSection,
  SoilData,
  ThemeMode,
  WeatherData,
  YieldRecord,
} from './types/index.ts';
import { fetchLiveWeather, reverseGeocodeLocation } from './utils/weather.ts';
import { loadEndpointConfig, saveEndpointConfig } from './utils/pipeline.ts';
import { parseCSV } from './utils/csv.ts';
import { DEFAULT_HISTORICAL_YIELD_CSV } from './data/sampleYieldData.ts';
import { getStoredLanguage, saveStoredLanguage, t } from './utils/i18n.ts';
import {
  applyThemeToDocument,
  getStoredTheme,
  saveStoredTheme,
} from './utils/theme.ts';

const VALID_SECTIONS: NavigationSection[] = [
  'overview',
  'weather',
  'yield-history',
  'yield-predict',
  'disease',
  'soil',
  'recommendations',
  'optimization',
  'pipeline',
  'settings',
];

function getInitialSection(): NavigationSection {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace(/^#/, '') as NavigationSection;
    if (VALID_SECTIONS.includes(hash)) return hash;
    const path = window.location.pathname.replace(/^\//, '').split('/')[0] as NavigationSection;
    if (VALID_SECTIONS.includes(path)) return path;
    const stored = localStorage.getItem('cropredict_current_section') as NavigationSection;
    if (stored && VALID_SECTIONS.includes(stored)) return stored;
  }
  return 'overview';
}

export default function App() {
  // Navigation: initialized from URL hash/path/storage to ensure refreshing works
  const [currentSection, setCurrentSection] = useState<NavigationSection>(() => getInitialSection());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Language: defaults to English on first visit, remembers after refresh
  const [language, setLanguage] = useState<LanguageCode>(() => getStoredLanguage());

  // Theme: Light, Dark, System, remembers after refresh
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());

  // Weather state (shared across Overview, Weather page, and recommendation modules)
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lon: number; name?: string }>({
    lat: 21.1458,
    lon: 79.0882,
    name: 'Nagpur (Vidarbha Belt)',
  });

  // Historical yield dataset
  const [yieldRecords, setYieldRecords] = useState<YieldRecord[]>(() =>
    parseCSV(DEFAULT_HISTORICAL_YIELD_CSV)
  );

  // Shared Soil Data
  const [soil, setSoil] = useState<SoilData>({
    pH: 6.8,
    nitrogen: 340, // kg/ha
    phosphorus: 18, // kg/ha
    potassium: 210, // kg/ha
  });

  // Model Endpoints Config
  const [endpointConfig, setEndpointConfig] = useState<ModelEndpointConfig>(() =>
    loadEndpointConfig()
  );

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState<boolean>(false);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyThemeToDocument(theme);
    saveStoredTheme(theme);

    // Listen for system theme changes if in 'system' mode
    if (theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        applyThemeToDocument('system');
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Sync navigation section to URL hash and localStorage so refresh retains active view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.hash = `#${currentSection}`;
      try {
        localStorage.setItem('cropredict_current_section', currentSection);
      } catch {
        // ignore storage errors
      }
    }
  }, [currentSection]);

  // Handle browser back/forward and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '') as NavigationSection;
      if (VALID_SECTIONS.includes(hash) && hash !== currentSection) {
        if (hash === 'settings') setIsSettingsOpen(true);
        else if (hash === 'pipeline') setIsPipelineModalOpen(true);
        else setCurrentSection(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentSection]);

  // Handle language change
  const handleChangeLanguage = (newLang: LanguageCode) => {
    setLanguage(newLang);
    saveStoredLanguage(newLang);
  };

  // Handle weather loading (shared across Overview and Weather views)
  const loadWeather = useCallback(async (lat: number, lon: number, customName?: string) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const data = await fetchLiveWeather(lat, lon, customName);
      setWeather(data);
    } catch (err: any) {
      setWeatherError(
        err?.message ||
          'Could not fetch live weather from Open-Meteo. Please check connection and retry.'
      );
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  // High-accuracy browser geolocation state
  const [geoLocating, setGeoLocating] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Request location on opening (with user permission, resolves village or town name)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setCurrentCoords(prev => ({ ...prev, lat: latitude, lon: longitude, name: undefined }));
          loadWeather(latitude, longitude);
        },
        _err => {
          loadWeather(currentCoords.lat, currentCoords.lon, currentCoords.name);
        },
        { timeout: 7000, enableHighAccuracy: false }
      );
    } else {
      loadWeather(currentCoords.lat, currentCoords.lon, currentCoords.name);
    }
  }, [loadWeather]);

  // High-Accuracy GPS Geolocation handler: requests browser GPS and updates Weather & Overview together
  const handleUseCurrentLocation = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setGeoError('Geolocation is not supported by your browser environment.');
      return;
    }

    setGeoLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude, accuracy } = position.coords;
        try {
          const geo = await reverseGeocodeLocation(latitude, longitude);
          const name = geo ? geo.formattedName : `Field Location (${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°)`;
          setCurrentCoords({ lat: latitude, lon: longitude, name });

          const data = await fetchLiveWeather(latitude, longitude, name, {
            village: geo?.village,
            town: geo?.town,
            subdistrict: geo?.subdistrict,
            district: geo?.district,
            state: geo?.state,
            country: geo?.country,
            accuracyMeters: accuracy,
            latitude,
            longitude,
            source: 'gps',
            resolvedName: name,
          });
          setWeather(data);
          setWeatherError(null);
        } catch (err: any) {
          setGeoError(err?.message || 'Failed to fetch weather for GPS coordinates.');
        } finally {
          setGeoLocating(false);
          setWeatherLoading(false);
        }
      },
      error => {
        setGeoLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('Location permission denied. Please allow location access in your browser or search manually.');
        } else if (error.code === error.TIMEOUT) {
          setGeoError('Location request timed out. Please retry or search your village manually.');
        } else {
          setGeoError('Unable to retrieve location. Please check GPS settings or search manually.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const handleSelectLocation = (lat: number, lon: number, name: string) => {
    setCurrentCoords({ lat, lon, name });
    loadWeather(lat, lon, name);
  };

  const handleSaveEndpoints = (updated: ModelEndpointConfig) => {
    setEndpointConfig(updated);
    saveEndpointConfig(updated);
  };

  const handleNavigation = (section: NavigationSection) => {
    if (section === 'settings') {
      setIsSettingsOpen(true);
    } else if (section === 'pipeline') {
      setIsPipelineModalOpen(true);
    } else {
      setCurrentSection(section);
    }
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white transition-colors">
      {/* Left Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={handleNavigation}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        endpointConfig={endpointConfig}
        lang={language}
      />

      {/* Main Content Area (Offset for desktop sidebar) */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Compact Header */}
        <CompactHeader
          currentSection={currentSection}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          weather={weather}
          currentTheme={theme}
          onChangeTheme={setTheme}
          currentLanguage={language}
          onChangeLanguage={handleChangeLanguage}
        />

        {/* Dynamic Section Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 overflow-x-hidden">
          {currentSection === 'overview' && (
            <OverviewSection
              weather={weather}
              weatherLoading={weatherLoading}
              weatherError={weatherError}
              onRefreshWeather={() =>
                loadWeather(currentCoords.lat, currentCoords.lon, currentCoords.name)
              }
              onSelectLocation={handleSelectLocation}
              onUseCurrentLocation={handleUseCurrentLocation}
              geoLocating={geoLocating}
              geoError={geoError}
              yieldRecords={yieldRecords}
              onNavigate={handleNavigation}
              lang={language}
            />
          )}

          {currentSection === 'weather' && (
            <WeatherTab
              weather={weather}
              loading={weatherLoading}
              error={weatherError}
              onRefresh={() =>
                loadWeather(currentCoords.lat, currentCoords.lon, currentCoords.name)
              }
              onSelectLocation={handleSelectLocation}
              onUseCurrentLocation={handleUseCurrentLocation}
              geoLocating={geoLocating}
              geoError={geoError}
              lang={language}
            />
          )}

          {currentSection === 'yield-history' && (
            <HistoricalYieldTab
              initialRecords={yieldRecords}
              onRecordsChanged={setYieldRecords}
              lang={language}
            />
          )}

          {currentSection === 'yield-predict' && (
            <CropYieldPredictionTab
              endpointConfig={endpointConfig}
              onUpdateConfig={handleSaveEndpoints}
              currentSoil={soil}
              currentWeather={weather}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenPipelineInfo={() => setIsPipelineModalOpen(true)}
              lang={language}
            />
          )}

          {currentSection === 'disease' && (
            <DiseaseDetectionTab
              endpointConfig={endpointConfig}
              onUpdateConfig={handleSaveEndpoints}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenPipelineInfo={() => setIsPipelineModalOpen(true)}
              lang={language}
            />
          )}

          {currentSection === 'soil' && (
            <SoilHealthTab soil={soil} onChangeSoil={setSoil} lang={language} />
          )}

          {currentSection === 'recommendations' && (
            <RecommendationsTab soil={soil} weather={weather} lang={language} />
          )}

          {currentSection === 'optimization' && (
            <SmartOptimizationTab lang={language} />
          )}
        </main>

        {/* Compact Footer */}
        <footer className="bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 text-xs py-4 px-4 sm:px-6 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <p>
              <b>CroPredict AI</b> • Smart Agriculture Decision System
            </p>
            <div className="flex items-center gap-3">
              <span>Open-Meteo & ICAR Standards</span>
              <span>•</span>
              <button
                onClick={() => setIsPipelineModalOpen(true)}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              >
                CNN-BiGRU + PSO-NSPSO
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Settings Modal */}
      <ModelEndpointModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={endpointConfig}
        onSaveConfig={handleSaveEndpoints}
        lang={language}
      />

      {/* Pipeline Architecture Modal */}
      <PipelineArchitectureModal
        isOpen={isPipelineModalOpen}
        onClose={() => setIsPipelineModalOpen(false)}
        lang={language}
      />
    </div>
  );
}
