import { GeographicLevel, YieldRecord } from '../types/index.ts';

/**
 * Robust CSV parser that handles quotes, trims whitespace,
 * normalizes headers, and converts official crop yield records.
 * Supports both official government format (State, District, Subdistrict, etc.)
 * and simple user-uploaded CSVs (Crop, Region, Year, Yield).
 */
export function parseCSV(csvText: string): YieldRecord[] {
  if (!csvText || typeof csvText !== 'string') {
    return [];
  }

  const lines = csvText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length < 2) {
    return [];
  }

  // Parse header
  const headerTokens = parseCSVLine(lines[0]).map(h =>
    h.toLowerCase().replace(/[^a-z0-9]/g, '')
  );

  // Find column indices
  const cropIdx = headerTokens.findIndex(h => h.includes('crop') || h.includes('commodity'));
  const stateIdx = headerTokens.findIndex(h => h === 'state' || h.includes('statename'));
  const districtIdx = headerTokens.findIndex(h => h === 'district' || h.includes('districtname'));
  const subdistrictIdx = headerTokens.findIndex(
    h =>
      h === 'subdistrict' ||
      h.includes('taluk') ||
      h.includes('tehsil') ||
      h.includes('mandal') ||
      h.includes('subdivision')
  );
  const regionIdx = headerTokens.findIndex(
    h => h.includes('region') || h.includes('location')
  );
  const seasonIdx = headerTokens.findIndex(h => h.includes('season'));
  const yearIdx = headerTokens.findIndex(h => h.includes('year') || h.includes('period'));
  const yieldIdx = headerTokens.findIndex(
    h => (h.includes('yield') && !h.includes('kg')) || h.includes('tonnesha') || h.includes('tha')
  );
  const yieldKgIdx = headerTokens.findIndex(h => h.includes('yieldkgha') || h.includes('kgha') || h.includes('kgperha'));
  const areaIdx = headerTokens.findIndex(h => h.includes('area'));
  const prodIdx = headerTokens.findIndex(h => h.includes('production') || h.includes('prod'));
  const geoLevelIdx = headerTokens.findIndex(h => h.includes('geographiclevel') || h.includes('geolevel') || h === 'level');
  const sourceIdx = headerTokens.findIndex(h => h === 'source' || h.includes('datasource') || h.includes('agency'));
  const sourceUrlIdx = headerTokens.findIndex(h => h.includes('sourceurl') || h.includes('url') || h.includes('link'));
  const reportingPeriodIdx = headerTokens.findIndex(h => h.includes('reportingperiod') || h.includes('financialyear'));
  const lastUpdatedIdx = headerTokens.findIndex(h => h.includes('lastupdated') || h.includes('updated'));
  const villageIdx = headerTokens.findIndex(h => h === 'village' || h.includes('villagename') || h.includes('grampanchayat'));
  const isDistrictAvgIdx = headerTokens.findIndex(h => h.includes('isdistrictaverage') || h.includes('districtaverage') || h.includes('isdistrictavg'));
  const provenanceIdx = headerTokens.findIndex(h => h.includes('datasetprovenance') || h.includes('provenance') || h.includes('recordtype'));
  const gapNotesIdx = headerTokens.findIndex(h => h.includes('coveragegap') || h.includes('gapnotes') || h.includes('notes'));

  // Ensure minimum essential columns exist
  if (cropIdx === -1 || yearIdx === -1 || (yieldIdx === -1 && yieldKgIdx === -1)) {
    return [];
  }

  const records: YieldRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const tokens = parseCSVLine(lines[i]);
    if (tokens.length <= Math.max(cropIdx, yearIdx)) {
      continue;
    }

    const crop = tokens[cropIdx]?.trim() || '';
    const rawState = stateIdx !== -1 ? tokens[stateIdx]?.trim() : '';
    const rawDistrict = districtIdx !== -1 ? tokens[districtIdx]?.trim() : '';
    const rawSubdistrict = subdistrictIdx !== -1 ? tokens[subdistrictIdx]?.trim() : '';
    const rawRegion = regionIdx !== -1 ? tokens[regionIdx]?.trim() : '';

    // Region resolution
    let region = rawSubdistrict || rawDistrict || rawRegion || rawState || 'All India';
    if (rawDistrict && rawSubdistrict && rawDistrict !== rawSubdistrict) {
      region = `${rawDistrict} (${rawSubdistrict})`;
    } else if (rawDistrict && !rawSubdistrict) {
      region = rawDistrict;
    }

    const rawYear = tokens[yearIdx]?.trim() || '';
    const rawYield = yieldIdx !== -1 ? tokens[yieldIdx]?.trim() || '' : '';
    const rawYieldKg = yieldKgIdx !== -1 ? tokens[yieldKgIdx]?.trim() || '' : '';

    // Handle financial years like "2023-24" or standard years "2023"
    const parsedYear = parseInt(rawYear.split('-')[0].replace(/[^0-9]/g, ''), 10);
    
    let parsedYieldTonnes = parseFloat(rawYield.replace(/[^0-9.]/g, ''));
    let parsedYieldKg = parseFloat(rawYieldKg.replace(/[^0-9.]/g, ''));

    if (isNaN(parsedYieldTonnes) && !isNaN(parsedYieldKg)) {
      parsedYieldTonnes = parsedYieldKg / 1000;
    } else if (!isNaN(parsedYieldTonnes) && isNaN(parsedYieldKg)) {
      parsedYieldKg = parsedYieldTonnes * 1000;
    }

    if (crop && !isNaN(parsedYear) && !isNaN(parsedYieldTonnes) && parsedYieldTonnes >= 0) {
      const rawVillage = villageIdx !== -1 ? tokens[villageIdx]?.trim() : '';
      let geoLevel: GeographicLevel = 'District';
      if (rawVillage && rawVillage.trim().length > 0) {
        geoLevel = 'Village';
      } else if (rawSubdistrict && rawSubdistrict.trim().length > 0) {
        geoLevel = 'Taluk';
      } else if (geoLevelIdx !== -1 && tokens[geoLevelIdx]) {
        const tokenGeo = tokens[geoLevelIdx].trim().toLowerCase();
        if (tokenGeo.includes('village')) {
          geoLevel = 'Village';
        } else if (tokenGeo.includes('taluk') || tokenGeo.includes('subdistrict') || tokenGeo.includes('tehsil')) {
          geoLevel = 'Taluk';
        } else if (tokenGeo.includes('state')) {
          geoLevel = 'State';
        } else if (tokenGeo.includes('national')) {
          geoLevel = 'National';
        }
      }

      const isDistrictAvgVal =
        isDistrictAvgIdx !== -1
          ? tokens[isDistrictAvgIdx]?.trim().toLowerCase() === 'true' || tokens[isDistrictAvgIdx]?.trim() === '1'
          : false;

      const provenanceVal =
        provenanceIdx !== -1 && tokens[provenanceIdx]?.trim()
          ? (tokens[provenanceIdx].trim() as 'Official Government Record' | 'Sample / Baseline Record')
          : 'Official Government Record';

      const gapNotesVal = gapNotesIdx !== -1 ? tokens[gapNotesIdx]?.trim() : undefined;

      const record: YieldRecord = {
        crop,
        region,
        year: parsedYear,
        yieldTonnesPerHa: Math.round(parsedYieldTonnes * 100) / 100,
        yieldKgPerHa: Math.round(parsedYieldKg),
        state: rawState || undefined,
        district: rawDistrict || undefined,
        subdistrict: rawSubdistrict || undefined,
        village: rawVillage || undefined,
        season: seasonIdx !== -1 ? tokens[seasonIdx]?.trim() : undefined,
        geographicLevel: geoLevel,
        source: sourceIdx !== -1 ? tokens[sourceIdx]?.trim() : 'Ministry of Agriculture & Farmers Welfare, GoI',
        sourceUrl: sourceUrlIdx !== -1 ? tokens[sourceUrlIdx]?.trim() : 'https://aps.dac.gov.in/APY/',
        reportingPeriod: reportingPeriodIdx !== -1 ? tokens[reportingPeriodIdx]?.trim() : `${parsedYear}-${(parsedYear + 1).toString().slice(2)}`,
        lastUpdated: lastUpdatedIdx !== -1 ? tokens[lastUpdatedIdx]?.trim() : 'Oct 2024',
        isTalukSpecific: geoLevel === 'Taluk',
        isDistrictAverage: isDistrictAvgVal,
        datasetProvenance: provenanceVal,
        coverageGapNotes: gapNotesVal,
      };

      if (areaIdx !== -1 && tokens[areaIdx]) {
        const area = parseFloat(tokens[areaIdx].replace(/[^0-9.]/g, ''));
        if (!isNaN(area)) record.areaHa = area;
      }
      if (prodIdx !== -1 && tokens[prodIdx]) {
        const prod = parseFloat(tokens[prodIdx].replace(/[^0-9.]/g, ''));
        if (!isNaN(prod)) record.productionTonnes = prod;
      }

      records.push(record);
    }
  }

  return records;
}

/**
 * Parses a single CSV line with quoted string handling
 */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"' || char === "'") {
      if (inQuotes && line[i + 1] === char) {
        current += char;
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Aggregates yield records by year for a given crop and region
 */
export function aggregateYieldByYear(
  records: YieldRecord[],
  selectedCrop?: string,
  selectedRegion?: string
): { year: number; avgYield: number; recordCount: number; maxYield: number; minYield: number }[] {
  const filtered = records.filter(r => {
    if (selectedCrop && selectedCrop !== 'All Crops' && r.crop.toLowerCase() !== selectedCrop.toLowerCase()) {
      return false;
    }
    if (selectedRegion && selectedRegion !== 'All Regions' && r.region.toLowerCase() !== selectedRegion.toLowerCase()) {
      return false;
    }
    return true;
  });

  const yearMap = new Map<number, { sum: number; count: number; max: number; min: number }>();

  for (const r of filtered) {
    const existing = yearMap.get(r.year);
    if (!existing) {
      yearMap.set(r.year, {
        sum: r.yieldTonnesPerHa,
        count: 1,
        max: r.yieldTonnesPerHa,
        min: r.yieldTonnesPerHa,
      });
    } else {
      existing.sum += r.yieldTonnesPerHa;
      existing.count += 1;
      if (r.yieldTonnesPerHa > existing.max) existing.max = r.yieldTonnesPerHa;
      if (r.yieldTonnesPerHa < existing.min) existing.min = r.yieldTonnesPerHa;
    }
  }

  const sortedYears = Array.from(yearMap.keys()).sort((a, b) => a - b);

  return sortedYears.map(year => {
    const data = yearMap.get(year)!;
    return {
      year,
      avgYield: Math.round((data.sum / data.count) * 100) / 100,
      recordCount: data.count,
      maxYield: data.max,
      minYield: data.min,
    };
  });
}

export interface TalukDistrictComparisonResult {
  hasTalukData: boolean;
  status: 'taluk_available' | 'taluk_unavailable';
  talukRecord?: YieldRecord;
  districtAverage?: {
    avgYieldTonnesPerHa: number;
    avgYieldKgPerHa: number;
    district: string;
    state: string;
    crop: string;
    year: number;
    source: string;
    sourceUrl: string;
    reportingPeriod: string;
    lastUpdated: string;
    recordCount: number;
  };
}

/**
 * Computes taluk-specific yield and district average comparison.
 * If a selected taluk has no published yield figure, returns status 'taluk_unavailable'
 * and displays any available district figure separately as 'District average'.
 */
export function getTalukYieldAndDistrictComparison(
  records: YieldRecord[],
  crop: string,
  stateName?: string | null,
  districtName?: string | null,
  talukName?: string | null
): TalukDistrictComparisonResult {
  if (!districtName) {
    return { hasTalukData: false, status: 'taluk_unavailable' };
  }

  const cleanDistrict = districtName.toLowerCase().replace(/[^a-z]/g, '');
  const cleanCrop = crop.toLowerCase().trim();
  const cleanTaluk = talukName?.toLowerCase().replace(/[^a-z]/g, '');

  // 1. Look for taluk-level record
  let matchedTalukRecord: YieldRecord | undefined;
  if (cleanTaluk) {
    matchedTalukRecord = records.find(r => {
      const rSub = r.subdistrict?.toLowerCase().replace(/[^a-z]/g, '') || '';
      const rDist = r.district?.toLowerCase().replace(/[^a-z]/g, '') || '';
      const rCrop = r.crop.toLowerCase().trim();
      const cropMatches = cleanCrop === 'all crops' || rCrop.includes(cleanCrop) || cleanCrop.includes(rCrop);
      return cropMatches && (rDist.includes(cleanDistrict) || cleanDistrict.includes(rDist)) && (rSub.includes(cleanTaluk) || cleanTaluk.includes(rSub));
    });
  }

  // 2. Look for district-level figures or calculate district average
  const districtCropRecords = records.filter(r => {
    const rDist = (r.district || r.region).toLowerCase().replace(/[^a-z]/g, '');
    const rCrop = r.crop.toLowerCase().trim();
    const cropMatches = cleanCrop === 'all crops' || rCrop.includes(cleanCrop) || cleanCrop.includes(rCrop);
    return cropMatches && (rDist.includes(cleanDistrict) || cleanDistrict.includes(rDist));
  });

  let districtAverage: TalukDistrictComparisonResult['districtAverage'];
  if (districtCropRecords.length > 0) {
    // Check if there is an explicit district record (subdistrict is empty or geographicLevel is District)
    const explicitDistrict = districtCropRecords.find(r => r.geographicLevel === 'District' || !r.subdistrict);

    if (explicitDistrict) {
      districtAverage = {
        avgYieldTonnesPerHa: explicitDistrict.yieldTonnesPerHa,
        avgYieldKgPerHa: explicitDistrict.yieldKgPerHa || Math.round(explicitDistrict.yieldTonnesPerHa * 1000),
        district: explicitDistrict.district || districtName,
        state: explicitDistrict.state || stateName || 'Karnataka',
        crop: explicitDistrict.crop,
        year: explicitDistrict.year,
        source: explicitDistrict.source || 'Ministry of Agriculture & Farmers Welfare (APY) / DES Karnataka',
        sourceUrl: explicitDistrict.sourceUrl || 'https://aps.dac.gov.in/APY/',
        reportingPeriod: explicitDistrict.reportingPeriod || '2023-24',
        lastUpdated: explicitDistrict.lastUpdated || 'Oct 2024',
        recordCount: districtCropRecords.length,
      };
    } else {
      // Calculate arithmetic average across taluk records of that district
      const sum = districtCropRecords.reduce((acc, r) => acc + r.yieldTonnesPerHa, 0);
      const avg = Math.round((sum / districtCropRecords.length) * 100) / 100;
      const ref = districtCropRecords[0];
      districtAverage = {
        avgYieldTonnesPerHa: avg,
        avgYieldKgPerHa: Math.round(avg * 1000),
        district: ref.district || districtName,
        state: ref.state || stateName || 'Karnataka',
        crop: ref.crop,
        year: ref.year,
        source: ref.source || 'Directorate of Economics & Statistics (DES) Karnataka',
        sourceUrl: ref.sourceUrl || 'https://des.karnataka.gov.in',
        reportingPeriod: ref.reportingPeriod || '2023-24',
        lastUpdated: ref.lastUpdated || 'Oct 2024',
        recordCount: districtCropRecords.length,
      };
    }
  }

  const hasTalukData = Boolean(matchedTalukRecord);
  return {
    hasTalukData,
    status: hasTalukData ? 'taluk_available' : 'taluk_unavailable',
    talukRecord: matchedTalukRecord,
    districtAverage,
  };
}
