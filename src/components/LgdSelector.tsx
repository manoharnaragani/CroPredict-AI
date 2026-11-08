import React, { useMemo } from 'react';
import { MapPin, Building2, Landmark, Compass, ChevronDown, Home, Info } from 'lucide-react';
import {
  getAllStates,
  getDistrictsByState,
  getSubdistrictsByDistrict,
  getVillagesBySubdistrict,
  getSubdistrictLabel,
  isKarnataka,
  KARNATAKA_STATE_LGD_CODE,
} from '../data/lgdData.ts';
import { LgdHierarchySelection } from '../types/index.ts';

interface LgdSelectorProps {
  selection: LgdHierarchySelection;
  onChange: (updated: LgdHierarchySelection) => void;
  className?: string;
  showBeltShortcuts?: boolean;
}

export const LgdSelector: React.FC<LgdSelectorProps> = ({
  selection,
  onChange,
  className = '',
  showBeltShortcuts = true,
}) => {
  const allStates = useMemo(() => getAllStates(), []);

  const availableDistricts = useMemo(() => {
    if (selection.stateCode === null) return [];
    return getDistrictsByState(selection.stateCode);
  }, [selection.stateCode]);

  const availableSubdistricts = useMemo(() => {
    if (selection.stateCode === null || selection.districtCode === null) return [];
    return getSubdistrictsByDistrict(selection.stateCode, selection.districtCode);
  }, [selection.stateCode, selection.districtCode]);

  const availableVillages = useMemo(() => {
    if (selection.stateCode === null || selection.districtCode === null || selection.subdistrictCode === null) {
      return [];
    }
    return getVillagesBySubdistrict(selection.stateCode, selection.districtCode, selection.subdistrictCode);
  }, [selection.stateCode, selection.districtCode, selection.subdistrictCode]);

  const subdistrictLabel = getSubdistrictLabel(selection.stateCode);
  const isKarnatakaActive = isKarnataka(selection.stateCode);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value ? parseInt(e.target.value, 10) : null;
    if (code === null) {
      onChange({
        stateCode: null,
        stateName: null,
        districtCode: null,
        districtName: null,
        subdistrictCode: null,
        subdistrictName: null,
        subdistrictType: 'Subdistrict / Tehsil',
        villageCode: null,
        villageName: null,
        isDistrictAverageFallback: false,
      });
      return;
    }
    const stateObj = allStates.find(s => s.code === code);
    const label = getSubdistrictLabel(code);
    onChange({
      stateCode: code,
      stateName: stateObj?.name || null,
      districtCode: null,
      districtName: null,
      subdistrictCode: null,
      subdistrictName: null,
      subdistrictType: label,
      villageCode: null,
      villageName: null,
      isDistrictAverageFallback: false,
    });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value ? parseInt(e.target.value, 10) : null;
    if (code === null) {
      onChange({
        ...selection,
        districtCode: null,
        districtName: null,
        subdistrictCode: null,
        subdistrictName: null,
        villageCode: null,
        villageName: null,
        isDistrictAverageFallback: false,
      });
      return;
    }
    const distObj = availableDistricts.find(d => d.code === code);
    onChange({
      ...selection,
      districtCode: code,
      districtName: distObj?.name || null,
      subdistrictCode: null,
      subdistrictName: null,
      villageCode: null,
      villageName: null,
      isDistrictAverageFallback: false,
    });
  };

  const handleSubdistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value ? parseInt(e.target.value, 10) : null;
    if (code === null) {
      onChange({
        ...selection,
        subdistrictCode: null,
        subdistrictName: null,
        villageCode: null,
        villageName: null,
        isDistrictAverageFallback: false,
      });
      return;
    }
    const subObj = availableSubdistricts.find(s => s.code === code);
    onChange({
      ...selection,
      subdistrictCode: code,
      subdistrictName: subObj?.name || null,
      villageCode: null,
      villageName: null,
      isDistrictAverageFallback: false,
    });
  };

  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value ? parseInt(e.target.value, 10) : null;
    if (code === null) {
      onChange({
        ...selection,
        villageCode: null,
        villageName: null,
        isDistrictAverageFallback: false,
      });
      return;
    }
    const vilObj = availableVillages.find(v => v.code === code);
    onChange({
      ...selection,
      villageCode: code,
      villageName: vilObj?.name || null,
      // In official Indian APY records, village-level CCE yields are calibrated to the district average
      isDistrictAverageFallback: true,
    });
  };

  const setKarnatakaShortcut = (districtCode: number, talukCode?: number, villageCode?: number) => {
    const stateObj = allStates.find(s => s.code === KARNATAKA_STATE_LGD_CODE);
    const districts = getDistrictsByState(KARNATAKA_STATE_LGD_CODE);
    const distObj = districts.find(d => d.code === districtCode);
    let talukObj = undefined;
    if (talukCode) {
      const taluks = getSubdistrictsByDistrict(KARNATAKA_STATE_LGD_CODE, districtCode);
      talukObj = taluks.find(t => t.code === talukCode);
    }
    let villageObj = undefined;
    if (talukCode && villageCode) {
      const vils = getVillagesBySubdistrict(KARNATAKA_STATE_LGD_CODE, districtCode, talukCode);
      villageObj = vils.find(v => v.code === villageCode);
    }

    onChange({
      stateCode: KARNATAKA_STATE_LGD_CODE,
      stateName: stateObj?.name || 'Karnataka',
      districtCode,
      districtName: distObj?.name || null,
      subdistrictCode: talukObj?.code || null,
      subdistrictName: talukObj?.name || null,
      subdistrictType: 'Taluk',
      villageCode: villageObj?.code || null,
      villageName: villageObj?.name || null,
      isDistrictAverageFallback: !!villageObj,
    });
  };

  return (
    <div
      className={`bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-sm ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Official Local Government Directory (LGD) Hierarchy
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Ministry of Panchayati Raj codes • Verified Karnataka Taluk-Level Records
            </p>
          </div>
        </div>

        {selection.stateCode && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-md text-stone-600 dark:text-stone-300">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {selection.stateName} [LGD: {selection.stateCode}]
            </span>
            {selection.districtCode && (
              <>
                <span>›</span>
                <span>
                  {selection.districtName} [{selection.districtCode}]
                </span>
              </>
            )}
            {selection.subdistrictCode && (
              <>
                <span>›</span>
                <span>
                  {selection.subdistrictName} [{selection.subdistrictCode}]
                </span>
              </>
            )}
            {selection.villageCode && (
              <>
                <span>›</span>
                <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                  {selection.villageName} [{selection.villageCode}]
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* 4-Tier Hierarchy Selectors: State -> District -> Subdistrict/Taluk -> Village */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. State / UT Dropdown */}
        <div>
          <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
            <Landmark className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            1. State / UT (LGD)
          </label>
          <div className="relative">
            <select
              aria-label="State or Union Territory selector"
              value={selection.stateCode ?? ''}
              onChange={handleStateChange}
              className="w-full appearance-none bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Select State / UT --</option>
              {allStates.map(st => (
                <option key={st.code} value={st.code}>
                  {st.name} {st.code === KARNATAKA_STATE_LGD_CODE ? '★ [LGD: 29]' : `[LGD: ${st.code}]`}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* 2. District Dropdown */}
        <div>
          <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            2. District (LGD)
          </label>
          <div className="relative">
            <select
              aria-label="District selector"
              disabled={!selection.stateCode || availableDistricts.length === 0}
              value={selection.districtCode ?? ''}
              onChange={handleDistrictChange}
              className="w-full appearance-none bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {selection.stateCode ? '-- Select District --' : '-- First Select State --'}
              </option>
              {availableDistricts.map(dist => (
                <option key={dist.code} value={dist.code}>
                  {dist.name} [LGD: {dist.code}]
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* 3. Subdistrict / Taluk Dropdown */}
        <div>
          <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            3. {subdistrictLabel} (LGD)
          </label>
          <div className="relative">
            <select
              aria-label={`${subdistrictLabel} selector`}
              disabled={!selection.districtCode || availableSubdistricts.length === 0}
              value={selection.subdistrictCode ?? ''}
              onChange={handleSubdistrictChange}
              className="w-full appearance-none bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {selection.districtCode
                  ? `-- All ${subdistrictLabel}s (District Level) --`
                  : `-- First Select District --`}
              </option>
              {availableSubdistricts.map(sub => (
                <option key={sub.code} value={sub.code}>
                  {sub.name} [{sub.type}: {sub.code}]
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* 4. Village Dropdown */}
        <div>
          <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            4. Village (LGD)
          </label>
          <div className="relative">
            <select
              aria-label="Village selector"
              disabled={!selection.subdistrictCode || availableVillages.length === 0}
              value={selection.villageCode ?? ''}
              onChange={handleVillageChange}
              className="w-full appearance-none bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {selection.subdistrictCode
                  ? `-- Select Village (or Taluk Level) --`
                  : `-- First Select ${subdistrictLabel} --`}
              </option>
              {availableVillages.map(vil => (
                <option key={vil.code} value={vil.code}>
                  {vil.name} [LGD: {vil.code}]
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Official Government Data Notice: District Average Fallback */}
      {selection.villageCode && (
        <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200">
            <span className="inline-block bg-amber-200 dark:bg-amber-900/70 text-amber-900 dark:text-amber-100 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mr-1.5">
              District average
            </span>
            <span>
              Official Government Crop Cutting Experiments (CCE) and APY statistics for <strong>{selection.villageName}</strong> (LGD: {selection.villageCode}) are calibrated using the official <strong>{selection.districtName}</strong> district average baseline. Missing village micro-values are not invented.
            </span>
          </div>
        </div>
      )}

      {/* Karnataka Taluk Belt Quick Shortcuts */}
      {showBeltShortcuts && (
        <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
            Karnataka Agricultural Taluk Belts:
          </span>
          <button
            type="button"
            onClick={() => setKarnatakaShortcut(567, 5508)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              selection.stateCode === 29 && selection.districtCode === 567 && selection.subdistrictCode === 5508
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700'
            }`}
          >
            Mandya Taluk (Sugarcane/Rice)
          </button>
          <button
            type="button"
            onClick={() => setKarnatakaShortcut(556, 5440)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              selection.stateCode === 29 && selection.districtCode === 556 && selection.subdistrictCode === 5440
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700'
            }`}
          >
            Dharwad Taluk (Cotton/Soybean)
          </button>
          <button
            type="button"
            onClick={() => setKarnatakaShortcut(555, 5430)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              selection.stateCode === 29 && selection.districtCode === 555 && selection.subdistrictCode === 5430
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700'
            }`}
          >
            Chikkodi Taluk, Belagavi (Sugarcane/Maize)
          </button>
          <button
            type="button"
            onClick={() => setKarnatakaShortcut(565, 5500)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              selection.stateCode === 29 && selection.districtCode === 565 && selection.subdistrictCode === 5500
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700'
            }`}
          >
            Kalaburagi Taluk (Gulbarga Tur)
          </button>
          <button
            type="button"
            onClick={() => setKarnatakaShortcut(563, 5486)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              selection.stateCode === 29 && selection.districtCode === 563 && selection.subdistrictCode === 5486
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700'
            }`}
          >
            Byadgi Taluk, Haveri (Chilli)
          </button>
          <button
            type="button"
            onClick={() => setKarnatakaShortcut(554, 5421)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              selection.stateCode === 29 && selection.districtCode === 554 && selection.subdistrictCode === 5421
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700'
            }`}
          >
            Siruguppa Taluk, Ballari (Sona Masuri)
          </button>
        </div>
      )}
    </div>
  );
};
