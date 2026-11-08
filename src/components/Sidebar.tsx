import React from 'react';
import {
  LayoutDashboard,
  CloudSun,
  BarChart3,
  TrendingUp,
  Bug,
  Droplets,
  Sparkles,
  Cpu,
  Settings,
  X,
  Sprout,
  Wifi,
  WifiOff,
  Sliders,
} from 'lucide-react';
import { NavigationSection, ModelEndpointConfig, LanguageCode } from '../types/index.ts';
import { t } from '../utils/i18n.ts';

interface SidebarProps {
  currentSection: NavigationSection;
  onSelectSection: (section: NavigationSection) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  endpointConfig: ModelEndpointConfig;
  lang: LanguageCode;
}

interface NavItem {
  id: NavigationSection;
  labelKey: Parameters<typeof t>[0];
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', labelKey: 'navOverview', icon: LayoutDashboard },
  { id: 'weather', labelKey: 'navWeather', icon: CloudSun },
  { id: 'yield-history', labelKey: 'navHistoricalYield', icon: BarChart3 },
  { id: 'yield-predict', labelKey: 'navYieldPrediction', icon: TrendingUp },
  { id: 'disease', labelKey: 'navDiseaseDetection', icon: Bug },
  { id: 'soil', labelKey: 'navSoilHealth', icon: Droplets },
  { id: 'recommendations', labelKey: 'navRecommendations', icon: Sparkles },
  { id: 'optimization', labelKey: 'navSmartOptimization', icon: Sliders },
  { id: 'pipeline', labelKey: 'navAiPipeline', icon: Cpu },
  { id: 'settings', labelKey: 'navSettings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  isOpenMobile,
  onCloseMobile,
  endpointConfig,
  lang,
}) => {
  const isYieldConnected = endpointConfig.verifiedConnections?.yield?.isConnected === true;
  const isDiseaseConnected = endpointConfig.verifiedConnections?.disease?.isConnected === true;

  const handleNavClick = (section: NavigationSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-stone-900 dark:bg-stone-950 text-stone-100 flex flex-col border-r border-stone-800 transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        aria-label="Sidebar Navigation"
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-inner text-white font-bold ring-2 ring-emerald-400/30">
              <Sprout className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white block">
                CroPredict AI
              </span>
              <span className="text-[10px] text-emerald-400 font-medium block">
                Agri Decision System
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 lg:hidden"
            aria-label="Close sidebar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            const label = t(item.labelKey, lang);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-emerald-400 group-hover:text-emerald-300'
                  }`}
                />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Connection Status & Pipeline Callout */}
        <div className="p-3 m-3 rounded-xl bg-stone-800/80 dark:bg-stone-900 border border-stone-700/60 text-xs shrink-0 space-y-2">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
              Model Connections
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">CNN-BiGRU + PSO</span>
          </div>

          {/* Yield Model Status */}
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-700/50">
            <span className="text-stone-300">Yield Model:</span>
            {isYieldConnected ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-600">
                <Wifi className="w-2.5 h-2.5 animate-pulse" />
                <span>Model connected</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800">
                <WifiOff className="w-2.5 h-2.5" />
                <span>Data required</span>
              </span>
            )}
          </div>

          {/* Disease Model Status */}
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-700/50">
            <span className="text-stone-300">Disease Model:</span>
            {isDiseaseConnected ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-600">
                <Wifi className="w-2.5 h-2.5 animate-pulse" />
                <span>Model connected</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800">
                <WifiOff className="w-2.5 h-2.5" />
                <span>Data required</span>
              </span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
