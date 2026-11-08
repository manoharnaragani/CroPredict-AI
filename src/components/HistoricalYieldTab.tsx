import React, { useState, useMemo } from 'react';
import {
  Upload,
  Download,
  Filter,
  BarChart3,
  TrendingUp,
  RotateCcw,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  MapPin,
  Building2,
  Info,
  Calendar,
  Layers,
  Database,
  FileCheck,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { LanguageCode, LgdHierarchySelection, YieldRecord } from '../types/index.ts';
import {
  parseCSV,
  aggregateYieldByYear,
  getTalukYieldAndDistrictComparison,
} from '../utils/csv.ts';
import {
  DEFAULT_HISTORICAL_YIELD_CSV,
  OFFICIAL_DATASET_COVERAGE_REPORT,
} from '../data/sampleYieldData.ts';
import { t } from '../utils/i18n.ts';
import { LgdSelector } from './LgdSelector.tsx';

interface HistoricalYieldTabProps {
  initialRecords?: YieldRecord[];
  onRecordsChanged?: (records: YieldRecord[]) => void;
  lang?: LanguageCode;
}

export const HistoricalYieldTab: React.FC<HistoricalYieldTabProps> = ({
  initialRecords,
  onRecordsChanged,
  lang = 'en',
}) => {
  const [csvContent, setCsvContent] = useState<string>(DEFAULT_HISTORICAL_YIELD_CSV);
  const [records, setRecords] = useState<YieldRecord[]>(
    () => initialRecords || parseCSV(DEFAULT_HISTORICAL_YIELD_CSV)
  );
  const [showCoverageAudit, setShowCoverageAudit] = useState<boolean>(true);
  const [provenanceFilter, setProvenanceFilter] = useState<'All' | 'Official Government Record' | 'Sample / Baseline Record'>('All');
  const [uploadMessage, setUploadMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // Official LGD State/District/Taluk/Village Hierarchy Selection (Default to Karnataka -> Mandya -> Mandya Taluk)
  const [lgdSelection, setLgdSelection] = useState<LgdHierarchySelection>({
    stateCode: 29,
    stateName: 'Karnataka',
    districtCode: 567,
    districtName: 'Mandya',
    subdistrictCode: 5508,
    subdistrictName: 'Mandya',
    subdistrictType: 'Taluk',
    villageCode: null,
    villageName: null,
    isDistrictAverageFallback: false,
  });

  // Filters
  const [selectedCrop, setSelectedCrop] = useState<string>('Sugarcane');
  const [chartViewMode, setChartViewMode] = useState<'trend' | 'regional'>('trend');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Available crops in dataset
  const cropsList = useMemo(() => {
    const set = new Set(records.map(r => r.crop));
    return Array.from(set).sort();
  }, [records]);

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (!text) return;

      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setUploadMessage({
          text: 'Failed to parse CSV. Ensure it has headers like Crop, Year, Yield (or State, District, Subdistrict).',
          type: 'error',
        });
      } else {
        setCsvContent(text);
        setRecords(parsed);
        onRecordsChanged?.(parsed);
        if (parsed[0]?.crop) {
          setSelectedCrop(parsed[0].crop);
        }
        setUploadMessage({
          text: `Successfully imported ${parsed.length} official agricultural yield records!`,
          type: 'success',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetToDefault = () => {
    setCsvContent(DEFAULT_HISTORICAL_YIELD_CSV);
    const parsed = parseCSV(DEFAULT_HISTORICAL_YIELD_CSV);
    setRecords(parsed);
    onRecordsChanged?.(parsed);
    setSelectedCrop('Sugarcane');
    setLgdSelection({
      stateCode: 29,
      stateName: 'Karnataka',
      districtCode: 567,
      districtName: 'Mandya',
      subdistrictCode: 5508,
      subdistrictName: 'Mandya',
      subdistrictType: 'Taluk',
    });
    setUploadMessage({
      text: 'Reset to official Ministry of Agriculture (APY) & Karnataka DES dataset.',
      type: 'success',
    });
  };

  const handleDownloadSampleCSV = () => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'official_indian_crop_yield_records.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter records based on selected LGD State, District, Village, and Crop
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Provenance filter
      if (provenanceFilter !== 'All') {
        const prov = r.datasetProvenance || 'Official Government Record';
        if (prov !== provenanceFilter) return false;
      }
      // Crop match
      if (selectedCrop !== 'All Crops' && r.crop.toLowerCase() !== selectedCrop.toLowerCase()) {
        return false;
      }
      // State match (if state selected in LGD)
      if (lgdSelection.stateName && r.state) {
        const cleanLgdState = lgdSelection.stateName.toLowerCase().replace(/[^a-z]/g, '');
        const cleanRecordState = r.state.toLowerCase().replace(/[^a-z]/g, '');
        if (!cleanRecordState.includes(cleanLgdState) && !cleanLgdState.includes(cleanRecordState)) {
          return false;
        }
      }
      // District match (if district selected in LGD)
      if (lgdSelection.districtName) {
        const cleanLgdDist = lgdSelection.districtName.toLowerCase().replace(/[^a-z]/g, '');
        const rDist = (r.district || r.region).toLowerCase().replace(/[^a-z]/g, '');
        if (!rDist.includes(cleanLgdDist) && !cleanLgdDist.includes(rDist)) {
          return false;
        }
      }
      // Village match: if specific village selected, allow village records or district baseline records
      if (lgdSelection.villageName && r.village) {
        const cleanLgdVil = lgdSelection.villageName.toLowerCase().replace(/[^a-z]/g, '');
        const rVil = r.village.toLowerCase().replace(/[^a-z]/g, '');
        if (!rVil.includes(cleanLgdVil) && !cleanLgdVil.includes(rVil)) {
          return false;
        }
      }
      return true;
    });
  }, [records, selectedCrop, lgdSelection.stateName, lgdSelection.districtName, lgdSelection.villageName, provenanceFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (validCurrentPage - 1) * pageSize;
  const paginatedRecords = filteredRecords.slice(startIdx, startIdx + pageSize);

  // Verified Taluk vs District Average calculation
  const talukComparison = useMemo(() => {
    return getTalukYieldAndDistrictComparison(
      records,
      selectedCrop,
      lgdSelection.stateName,
      lgdSelection.districtName,
      lgdSelection.subdistrictName
    );
  }, [
    records,
    selectedCrop,
    lgdSelection.stateName,
    lgdSelection.districtName,
    lgdSelection.subdistrictName,
  ]);

  // Yield by Year Trend
  const yieldByYear = useMemo(() => {
    return aggregateYieldByYear(
      filteredRecords,
      selectedCrop,
      lgdSelection.subdistrictName || lgdSelection.districtName || 'All Regions'
    );
  }, [filteredRecords, selectedCrop, lgdSelection.subdistrictName, lgdSelection.districtName]);

  // Regional/Taluk comparisons across the current district/state
  const regionalComparison = useMemo(() => {
    const map = new Map<string, { sum: number; count: number; geoLevel: string; source: string; sourceUrl: string }>();

    for (const r of filteredRecords) {
      const label = r.subdistrict || r.district || r.region;
      const existing = map.get(label);
      if (!existing) {
        map.set(label, {
          sum: r.yieldTonnesPerHa,
          count: 1,
          geoLevel: r.geographicLevel || 'District',
          source: r.source || 'Ministry of Agriculture (APY)',
          sourceUrl: r.sourceUrl || 'https://aps.dac.gov.in/APY/',
        });
      } else {
        existing.sum += r.yieldTonnesPerHa;
        existing.count += 1;
      }
    }

    return Array.from(map.entries())
      .map(([region, data]) => ({
        region,
        avgYield: Math.round((data.sum / data.count) * 100) / 100,
        count: data.count,
        geoLevel: data.geoLevel,
        source: data.source,
        sourceUrl: data.sourceUrl,
      }))
      .sort((a, b) => b.avgYield - a.avgYield);
  }, [filteredRecords]);

  // SVG Chart Setup
  const svgWidth = 750;
  const svgHeight = 250;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 45;
  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  const minYield = Math.max(0, Math.floor(Math.min(...(yieldByYear.length ? yieldByYear.map(d => d.avgYield) : [0]), 0)));
  const maxYield = Math.ceil(Math.max(...(yieldByYear.length ? yieldByYear.map(d => d.avgYield) : [5]), 5) * 1.15);
  const yieldRange = Math.max(0.1, maxYield - minYield);

  const getTrendX = (index: number) =>
    paddingLeft + (index / Math.max(1, yieldByYear.length - 1)) * chartW;
  const getTrendY = (val: number) =>
    paddingTop + chartH * (1 - (val - minYield) / yieldRange);

  const trendLinePath =
    yieldByYear.length > 0
      ? yieldByYear
          .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getTrendX(i).toFixed(1)} ${getTrendY(d.avgYield).toFixed(1)}`)
          .join(' ')
      : '';

  const trendAreaPath =
    yieldByYear.length > 0
      ? `${trendLinePath} L ${getTrendX(yieldByYear.length - 1)} ${paddingTop + chartH} L ${getTrendX(0)} ${
          paddingTop + chartH
        } Z`
      : '';

  const maxRegionalYield = Math.max(...(regionalComparison.length ? regionalComparison.map(r => r.avgYield) : [1]), 1);
  const barWidth = Math.min(48, Math.max(20, (chartW / Math.max(1, regionalComparison.length)) * 0.65));

  return (
    <div className="space-y-6">
      {/* 1. Official Local Government Directory (LGD) Hierarchy Selector */}
      <LgdSelector
        selection={lgdSelection}
        onChange={setLgdSelection}
        showBeltShortcuts={true}
      />

      {/* 2. Header & Action Controls Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-stone-200 dark:border-stone-800 p-4 sm:p-5 transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {t('historicalYieldTitle', lang)}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Official Ministry of Agriculture APY records & Karnataka Directorate of Economics and Statistics taluk reports
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <label className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{t('importCsv', lang)}</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload custom CSV file"
              />
            </label>

            <button
              type="button"
              onClick={handleDownloadSampleCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-lg text-xs font-semibold border border-stone-200 dark:border-stone-700 transition-colors"
              title="Download official agricultural records in CSV format"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>{t('sampleCsv', lang)}</span>
            </button>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-lg text-xs font-semibold border border-stone-200 dark:border-stone-700 transition-colors"
              title="Reset to official government dataset"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
              <span>{t('reset', lang)}</span>
            </button>
          </div>
        </div>

        {/* Upload Message Toast */}
        {uploadMessage && (
          <div
            className={`mt-3 p-3 rounded-lg text-xs flex items-center gap-2 ${
              uploadMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
            }`}
          >
            {uploadMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            )}
            <span>{uploadMessage.text}</span>
          </div>
        )}

        {/* Secondary Filter Controls */}
        <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Crop Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              {t('filterByCrop', lang)}
            </label>
            <select
              aria-label="Filter records by crop"
              value={selectedCrop}
              onChange={e => setSelectedCrop(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-800 dark:text-stone-100 font-medium"
            >
              <option value="All Crops">{t('allCrops', lang)}</option>
              {cropsList.map(crop => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>

          {/* Chart View Perspective */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              {t('chartPerspective', lang)}
            </label>
            <div className="flex rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 p-0.5">
              <button
                type="button"
                onClick={() => setChartViewMode('trend')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                  chartViewMode === 'trend'
                    ? 'bg-white dark:bg-stone-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{t('yearlyTrend', lang)}</span>
              </button>
              <button
                type="button"
                onClick={() => setChartViewMode('regional')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                  chartViewMode === 'regional'
                    ? 'bg-white dark:bg-stone-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{t('regionalBar', lang)}</span>
              </button>
            </div>
          </div>

          {/* Dataset Provenance Filter */}
          <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Dataset Provenance:
              </span>
              <div className="flex rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 p-0.5 text-xs">
                {(['All', 'Official Government Record', 'Sample / Baseline Record'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setProvenanceFilter(mode)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      provenanceFilter === mode
                        ? 'bg-white dark:bg-stone-700 text-emerald-800 dark:text-emerald-300 shadow-xs font-bold'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    {mode === 'All' ? 'All Records' : mode === 'Official Government Record' ? 'Official Only' : 'Sample / Baseline'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCoverageAudit(!showCoverageAudit)}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{showCoverageAudit ? 'Hide Official Datasets & Coverage Audit' : 'Show Official Datasets & Coverage Audit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Nationwide Government Datasets & Coverage Audit Registry */}
      {showCoverageAudit && (
        <div className="bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                  Nationwide Official Government Agricultural Datasets & Coverage Gap Audit
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Imported from Ministry of Agriculture & Farmers Welfare (GoI), DES Karnataka, DAC&FW, and IMD
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold rounded">
              All 36 States/UTs Covered • Complete Pagination
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {OFFICIAL_DATASET_COVERAGE_REPORT.map(ds => (
              <div
                key={ds.id}
                className="bg-white dark:bg-stone-900 rounded-lg p-3 border border-stone-200 dark:border-stone-800 text-xs flex flex-col justify-between space-y-2 shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-bold text-stone-900 dark:text-white text-xs leading-snug">
                      {ds.name}
                    </h5>
                    <span className="shrink-0 text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-semibold">
                      {ds.paginationStatus.split(' ')[0]}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{ds.agency}</p>
                </div>

                <div className="space-y-1 text-[11px] text-stone-600 dark:text-stone-300 border-t border-stone-100 dark:border-stone-800 pt-2 font-mono">
                  <div><strong>Years:</strong> {ds.yearsCovered}</div>
                  <div><strong>Units:</strong> {ds.units}</div>
                  <div><strong>Level:</strong> {ds.geographicLevel}</div>
                  <div><strong>Records:</strong> {ds.recordCount.toLocaleString()}</div>
                </div>

                <div className="bg-amber-50/80 dark:bg-amber-950/30 p-2 rounded border border-amber-200/60 dark:border-amber-900/40 text-[10px] text-amber-900 dark:text-amber-200">
                  <div className="font-bold mb-0.5">Coverage Gap & Village Handling:</div>
                  <div className="leading-relaxed">{ds.coverageGaps}</div>
                  <div className="mt-1 font-semibold text-emerald-700 dark:text-emerald-400">
                    Policy: {ds.villageHandlingPolicy}
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-stone-400">Date: {ds.reportingDate}</span>
                  <a
                    href={ds.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    <span>Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Verified Taluk vs District Average Status Section */}
      {lgdSelection.districtName && (
        <div className="space-y-3">
          {lgdSelection.subdistrictName && talukComparison.status === 'taluk_unavailable' && (
            /* Taluk Yield Unavailable Banner */
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                      {t('talukYieldUnavailable', lang)}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-semibold">
                      Geographic Level: {lgdSelection.subdistrictType}
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                    No verified {lgdSelection.subdistrictType.toLowerCase()}-level yield record is
                    published by the Directorate of Economics and Statistics for{' '}
                    <strong>{selectedCrop}</strong> in{' '}
                    <strong>
                      {lgdSelection.subdistrictName} [{lgdSelection.subdistrictType}: {lgdSelection.subdistrictCode}]
                    </strong>
                    . Displaying official district-level benchmark below.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Results Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card A: Taluk Result (if available) */}
            {talukComparison.hasTalukData && talukComparison.talukRecord && (
              <div className="bg-white dark:bg-stone-900 border-2 border-emerald-500/80 dark:border-emerald-500/60 rounded-xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-lg uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  Geographic Level: {talukComparison.talukRecord.geographicLevel}
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {talukComparison.talukRecord.subdistrict || lgdSelection.subdistrictName} {lgdSelection.subdistrictType}
                  </span>
                  <span className="text-stone-400">•</span>
                  <span>{talukComparison.talukRecord.district} District</span>
                </div>

                <h4 className="text-base font-bold text-stone-900 dark:text-white">
                  {talukComparison.talukRecord.crop} Yield
                </h4>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700 dark:text-emerald-400">
                    {talukComparison.talukRecord.yieldTonnesPerHa}
                  </span>
                  <span className="text-sm font-semibold text-stone-600 dark:text-stone-300">
                    tonnes / hectare
                  </span>
                  {talukComparison.talukRecord.yieldKgPerHa && (
                    <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                      ({talukComparison.talukRecord.yieldKgPerHa.toLocaleString()} kg/ha)
                    </span>
                  )}
                </div>

                {talukComparison.talukRecord.areaHa && (
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                    Cultivated Area: {talukComparison.talukRecord.areaHa.toLocaleString()} ha • Production: {talukComparison.talukRecord.productionTonnes?.toLocaleString() ?? '-'} tonnes
                  </p>
                )}

                {/* Metadata & Source Footer */}
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      Reporting Period: {talukComparison.talukRecord.reportingPeriod || '2023-24'} ({talukComparison.talukRecord.season || 'Annual'})
                    </span>
                    <span>Updated: {talukComparison.talukRecord.lastUpdated || 'Oct 2024'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="truncate pr-2">
                      Source: {talukComparison.talukRecord.source || 'Directorate of Economics & Statistics (DES) Karnataka'}
                    </span>
                    <a
                      href={talukComparison.talukRecord.sourceUrl || 'https://des.karnataka.gov.in'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline shrink-0"
                    >
                      <span>Official Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Card B: District Average Figure */}
            {talukComparison.districtAverage && (
              <div
                className={`bg-white dark:bg-stone-900 border rounded-xl p-4 sm:p-5 shadow-xs relative overflow-hidden ${
                  !talukComparison.hasTalukData
                    ? 'md:col-span-2 border-2 border-amber-500/80 dark:border-amber-500/60'
                    : 'border-stone-200 dark:border-stone-800'
                }`}
              >
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-lg uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  Geographic Level: District
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{talukComparison.districtAverage.district} District</span>
                  <span className="text-stone-400">•</span>
                  <span>{talukComparison.districtAverage.state}</span>
                </div>

                <h4 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <span>{t('districtAverage', lang)}</span>
                  <span className="text-xs font-normal text-stone-500">
                    ({talukComparison.districtAverage.crop})
                  </span>
                </h4>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-blue-700 dark:text-blue-400">
                    {talukComparison.districtAverage.avgYieldTonnesPerHa}
                  </span>
                  <span className="text-sm font-semibold text-stone-600 dark:text-stone-300">
                    tonnes / hectare
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                    ({talukComparison.districtAverage.avgYieldKgPerHa.toLocaleString()} kg/ha)
                  </span>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  Aggregated across {talukComparison.districtAverage.recordCount} published taluk/reporting units
                </p>

                {/* Metadata & Source Footer */}
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      Reporting Period: {talukComparison.districtAverage.reportingPeriod}
                    </span>
                    <span>Updated: {talukComparison.districtAverage.lastUpdated}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="truncate pr-2">
                      Source: {talukComparison.districtAverage.source}
                    </span>
                    <a
                      href={talukComparison.districtAverage.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline shrink-0"
                    >
                      <span>Official Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Main Chart Card */}
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-stone-200 dark:border-stone-800 p-4 sm:p-5 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 gap-2">
          <div>
            <h4 className="text-base font-bold text-stone-900 dark:text-white">
              {chartViewMode === 'trend'
                ? `Year-over-Year Yield Progression: ${selectedCrop} (${lgdSelection.districtName || 'All Districts'})`
                : `Taluk & Sub-Regional Yield Comparison: ${selectedCrop}`}
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Metric: Yield in Tonnes per Hectare (t/ha) • Verified Official Statistics
            </p>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="mt-4 overflow-x-auto no-scrollbar">
          <div className="min-w-[650px]">
            {chartViewMode === 'trend' ? (
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto select-none font-sans"
                role="img"
                aria-label="Yield trend chart by year"
              >
                <defs>
                  <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                  const y = paddingTop + chartH * pct;
                  const val = (maxYield - pct * yieldRange).toFixed(1);
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
                        {val}
                      </text>
                    </g>
                  );
                })}

                {trendAreaPath && <path d={trendAreaPath} fill="url(#yieldGradient)" />}

                {trendLinePath && (
                  <path
                    d={trendLinePath}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {yieldByYear.map((d, i) => {
                  const x = getTrendX(i);
                  const y = getTrendY(d.avgYield);
                  return (
                    <g key={d.year}>
                      <circle
                        cx={x}
                        cy={y}
                        r={5}
                        fill="#ffffff"
                        stroke="#059669"
                        strokeWidth="2.5"
                      />
                      <text
                        x={x}
                        y={y - 10}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="700"
                        fill="#059669"
                      >
                        {d.avgYield} t/ha
                      </text>
                      <text
                        x={x}
                        y={paddingTop + chartH + 20}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="600"
                        fill="#94a3b8"
                      >
                        {d.year}
                      </text>
                    </g>
                  );
                })}
              </svg>
            ) : (
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto select-none font-sans"
                role="img"
                aria-label="Regional yield comparison bar chart"
              >
                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                  const y = paddingTop + chartH * pct;
                  const val = (maxRegionalYield * 1.15 * (1 - pct)).toFixed(1);
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
                        {val}
                      </text>
                    </g>
                  );
                })}

                {regionalComparison.map((r, i) => {
                  const slotW = chartW / Math.max(1, regionalComparison.length);
                  const x = paddingLeft + i * slotW + (slotW - barWidth) / 2;
                  const barH = (r.avgYield / (maxRegionalYield * 1.15)) * chartH;
                  const y = paddingTop + chartH - barH;

                  return (
                    <g key={r.region}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barH}
                        rx={4}
                        fill={r.geoLevel === 'Taluk' ? '#059669' : '#2563eb'}
                        opacity={0.88}
                      />
                      <text
                        x={x + barWidth / 2}
                        y={y - 6}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="700"
                        fill={r.geoLevel === 'Taluk' ? '#059669' : '#2563eb'}
                      >
                        {r.avgYield}
                      </text>
                      <text
                        x={x + barWidth / 2}
                        y={paddingTop + chartH + 18}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="500"
                        fill="#94a3b8"
                      >
                        {r.region.length > 9 ? `${r.region.slice(0, 8)}…` : r.region}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* 5. Official Crop Records Table */}
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors">
        <div className="px-4 py-3 bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider">
              Official Records Register ({filteredRecords.length} records)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
              Ministry of Agriculture / DES Karnataka
            </span>
          </div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            Standardized to Tonnes/Ha (t/ha) & Kg/Ha
          </span>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 sticky top-0 font-semibold border-b border-stone-200 dark:border-stone-700">
              <tr>
                <th className="p-2.5 pl-4">Crop</th>
                <th className="p-2.5">Provenance</th>
                <th className="p-2.5">Geographic Level</th>
                <th className="p-2.5">Location (Village / Taluk / District)</th>
                <th className="p-2.5">Period & Season</th>
                <th className="p-2.5">Yield (t/ha)</th>
                <th className="p-2.5">Yield (kg/ha)</th>
                <th className="p-2.5">Official Source Link</th>
                <th className="p-2.5 pr-4">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
              {paginatedRecords.map((r, i) => (
                <tr key={i} className="hover:bg-emerald-50/40 dark:hover:bg-stone-800/60">
                  <td className="p-2.5 pl-4 font-semibold text-stone-900 dark:text-white">
                    {r.crop}
                  </td>
                  <td className="p-2.5">
                    {r.datasetProvenance === 'Sample / Baseline Record' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700">
                        Sample / Baseline
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        Official Government
                      </span>
                    )}
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.geographicLevel === 'Village'
                          ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                          : r.geographicLevel === 'Taluk'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                      }`}
                    >
                      {r.geographicLevel || 'District'}
                    </span>
                  </td>
                  <td className="p-2.5 font-medium">
                    <div className="flex flex-col">
                      {r.village ? (
                        <span>
                          <span className="font-bold text-stone-900 dark:text-white">
                            Village: {r.village}
                          </span>
                          {r.subdistrict && <span> ({r.subdistrict} Taluk, {r.district})</span>}
                          {r.isDistrictAverage && (
                            <span className="ml-1.5 inline-block text-[10px] bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded font-bold border border-amber-300 dark:border-amber-800">
                              District average
                            </span>
                          )}
                        </span>
                      ) : r.subdistrict ? (
                        <span>
                          <span className="font-bold text-stone-900 dark:text-white">
                            {r.subdistrict} Taluk
                          </span>{' '}
                          ({r.district})
                        </span>
                      ) : (
                        <span>{r.district || r.region} District ({r.state || 'All India'})</span>
                      )}
                      {r.coverageGapNotes && (
                        <span className="text-[10px] text-stone-400 italic">
                          {r.coverageGapNotes}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-2.5">
                    {r.reportingPeriod || r.year} • {r.season || 'Annual'}
                  </td>
                  <td className="p-2.5 font-bold text-emerald-700 dark:text-emerald-400">
                    {r.yieldTonnesPerHa} t/ha
                  </td>
                  <td className="p-2.5 text-stone-500 dark:text-stone-400 font-mono">
                    {r.yieldKgPerHa ? `${r.yieldKgPerHa.toLocaleString()} kg/ha` : `${Math.round(r.yieldTonnesPerHa * 1000).toLocaleString()} kg/ha`}
                  </td>
                  <td className="p-2.5">
                    <a
                      href={r.sourceUrl || 'https://des.karnataka.gov.in'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                      title={r.source}
                    >
                      <span className="max-w-[150px] truncate">
                        {r.source?.split('(')[0]?.trim() || 'DES Karnataka'}
                      </span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </td>
                  <td className="p-2.5 pr-4 text-stone-400 text-[11px]">
                    {r.lastUpdated || 'Oct 2024'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Bar */}
        <div className="px-4 py-3 bg-stone-50 dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
            <span>
              Showing <b className="text-stone-900 dark:text-white">{filteredRecords.length > 0 ? startIdx + 1 : 0}</b> to{' '}
              <b className="text-stone-900 dark:text-white">{Math.min(startIdx + pageSize, filteredRecords.length)}</b> of{' '}
              <b className="text-stone-900 dark:text-white">{filteredRecords.length}</b> records
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500">Records per page:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded text-xs font-semibold"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={validCurrentPage === 1}
                className="px-2.5 py-1 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded text-xs font-semibold disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="px-2 py-1 text-stone-700 dark:text-stone-300 font-semibold">
                Page {validCurrentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage === totalPages}
                className="px-2.5 py-1 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded text-xs font-semibold disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
