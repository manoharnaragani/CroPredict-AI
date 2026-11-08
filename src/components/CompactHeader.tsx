import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Laptop,
  Globe,
  MapPin,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  LanguageCode,
  ThemeMode,
  WeatherData,
  NavigationSection,
} from '../types/index.ts';
import { SCHEDULED_LANGUAGES, t } from '../utils/i18n.ts';

interface CompactHeaderProps {
  currentSection: NavigationSection;
  onOpenMobileSidebar: () => void;
  weather: WeatherData | null;
  currentTheme: ThemeMode;
  onChangeTheme: (theme: ThemeMode) => void;
  currentLanguage: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
}

export const CompactHeader: React.FC<CompactHeaderProps> = ({
  currentSection,
  onOpenMobileSidebar,
  weather,
  currentTheme,
  onChangeTheme,
  currentLanguage,
  onChangeLanguage,
}) => {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getThemeIcon = (theme: ThemeMode) => {
    switch (theme) {
      case 'light':
        return <Sun className="w-3.5 h-3.5 text-amber-500" />;
      case 'dark':
        return <Moon className="w-3.5 h-3.5 text-blue-400" />;
      case 'system':
      default:
        return <Laptop className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />;
    }
  };

  const getSectionTitle = (section: NavigationSection) => {
    switch (section) {
      case 'overview':
        return t('navOverview', currentLanguage);
      case 'weather':
        return t('navWeather', currentLanguage);
      case 'yield-history':
        return t('navHistoricalYield', currentLanguage);
      case 'yield-predict':
        return t('navYieldPrediction', currentLanguage);
      case 'disease':
        return t('navDiseaseDetection', currentLanguage);
      case 'soil':
        return t('navSoilHealth', currentLanguage);
      case 'recommendations':
        return t('navRecommendations', currentLanguage);
      case 'pipeline':
        return t('navAiPipeline', currentLanguage);
      case 'settings':
        return t('navSettings', currentLanguage);
      default:
        return 'CroPredict AI';
    }
  };

  const currentLangObj = SCHEDULED_LANGUAGES.find(l => l.code === currentLanguage);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xs border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="px-3 sm:px-6 h-14 flex items-center justify-between gap-2 max-w-full">
        {/* Left Side: Mobile Menu Button + Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile ☰ Button */}
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 focus:outline-hidden"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Section Breadcrumb or Mobile Logo */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-sm sm:text-base text-stone-900 dark:text-white truncate">
              {getSectionTitle(currentSection)}
            </span>
          </div>
        </div>

        {/* Right Side: Location Chip, Theme Switcher, Language Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Location Chip */}
          {weather && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate max-w-[120px]">{weather.area.split(' (')[0]}</span>
              <span className="font-bold">{weather.temperature}°C</span>
            </div>
          )}

          {/* Theme Selector Dropdown */}
          <div className="relative" ref={themeRef}>
            <button
              type="button"
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              title="Change theme (Light / Dark / System)"
              aria-label="Theme selector"
              aria-expanded={isThemeMenuOpen}
            >
              {getThemeIcon(currentTheme)}
              <span className="hidden sm:inline capitalize">
                {currentTheme === 'light'
                  ? t('themeLight', currentLanguage)
                  : currentTheme === 'dark'
                  ? t('themeDark', currentLanguage)
                  : t('themeSystem', currentLanguage)}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {isThemeMenuOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-lg py-1 z-50 text-xs">
                {(['light', 'dark', 'system'] as ThemeMode[]).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      onChangeTheme(mode);
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-stone-700/70 transition-colors ${
                      currentTheme === mode
                        ? 'font-bold text-emerald-700 dark:text-emerald-400'
                        : 'text-stone-700 dark:text-stone-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {getThemeIcon(mode)}
                      <span>
                        {mode === 'light'
                          ? t('themeLight', currentLanguage)
                          : mode === 'dark'
                          ? t('themeDark', currentLanguage)
                          : t('themeSystem', currentLanguage)}
                      </span>
                    </span>
                    {currentTheme === mode && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Selector Dropdown (All 22 Scheduled Languages + English) */}
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              title="Select Language (English & 22 Scheduled Indian Languages)"
              aria-label="Language selector"
              aria-expanded={isLangMenuOpen}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate max-w-[80px] sm:max-w-[110px]">
                {currentLangObj?.nativeName || 'English'}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 sm:w-64 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl py-1 z-50 max-h-80 overflow-y-auto text-xs">
                <div className="px-3 py-1.5 border-b border-stone-100 dark:border-stone-700 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Select Language (22 Scheduled + English)
                </div>
                {SCHEDULED_LANGUAGES.map(langItem => (
                  <button
                    key={langItem.code}
                    type="button"
                    onClick={() => {
                      onChangeLanguage(langItem.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-stone-700/70 transition-colors ${
                      currentLanguage === langItem.code
                        ? 'font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-stone-700/40'
                        : 'text-stone-700 dark:text-stone-200'
                    }`}
                  >
                    <div>
                      <span className="font-semibold block">{langItem.nativeName}</span>
                      <span className="text-[10px] text-stone-400 block">{langItem.name}</span>
                    </div>
                    {currentLanguage === langItem.code && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
