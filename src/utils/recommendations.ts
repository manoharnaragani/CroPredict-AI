import { CropRecommendation, FertilizerRecommendation, SoilData, WeatherData } from '../types/index.ts';
import { assessSoil } from './soil.ts';

interface CropProfile {
  name: string;
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'Whole Year';
  minTemp: number;
  maxTemp: number;
  optimalTempMin: number;
  optimalTempMax: number;
  minRainProb: number;
  phMin: number;
  phMax: number;
  idealN: number;
  idealP: number;
  idealK: number;
  yieldRange: string;
  benefits: string;
}

const CROP_PROFILES: CropProfile[] = [
  {
    name: 'Rice (Paddy)',
    season: 'Kharif',
    minTemp: 20,
    maxTemp: 38,
    optimalTempMin: 22,
    optimalTempMax: 32,
    minRainProb: 30,
    phMin: 5.5,
    phMax: 7.2,
    idealN: 400,
    idealP: 22,
    idealK: 200,
    yieldRange: '3.8 - 4.8 t/ha',
    benefits: 'High water requirement crop, thrives in heavy clay/loam soils with moderate acidity.',
  },
  {
    name: 'Wheat',
    season: 'Rabi',
    minTemp: 12,
    maxTemp: 28,
    optimalTempMin: 15,
    optimalTempMax: 24,
    minRainProb: 0,
    phMin: 6.0,
    phMax: 7.5,
    idealN: 420,
    idealP: 25,
    idealK: 180,
    yieldRange: '3.5 - 5.2 t/ha',
    benefits: 'Cool weather cereal staple; prefers neutral to mildly alkaline fertile loamy soil.',
  },
  {
    name: 'Cotton',
    season: 'Kharif',
    minTemp: 21,
    maxTemp: 36,
    optimalTempMin: 24,
    optimalTempMax: 32,
    minRainProb: 15,
    phMin: 6.0,
    phMax: 8.0,
    idealN: 380,
    idealP: 20,
    idealK: 240,
    yieldRange: '1.8 - 2.8 t/ha (seed cotton)',
    benefits: 'Deep-rooted cash crop; well-suited for black cotton soils with good drainage.',
  },
  {
    name: 'Maize (Corn)',
    season: 'Kharif',
    minTemp: 18,
    maxTemp: 35,
    optimalTempMin: 21,
    optimalTempMax: 30,
    minRainProb: 20,
    phMin: 5.8,
    phMax: 7.5,
    idealN: 440,
    idealP: 24,
    idealK: 210,
    yieldRange: '4.2 - 6.0 t/ha',
    benefits: 'Heavy feeder crop responding strongly to balanced nitrogen and organic carbon.',
  },
  {
    name: 'Sugarcane',
    season: 'Whole Year',
    minTemp: 20,
    maxTemp: 40,
    optimalTempMin: 25,
    optimalTempMax: 34,
    minRainProb: 20,
    phMin: 6.5,
    phMax: 8.0,
    idealN: 500,
    idealP: 30,
    idealK: 300,
    yieldRange: '70 - 95 t/ha',
    benefits: 'Long-duration cash crop requiring fertile soil and consistent moisture.',
  },
  {
    name: 'Chickpea (Gram)',
    season: 'Rabi',
    minTemp: 10,
    maxTemp: 26,
    optimalTempMin: 14,
    optimalTempMax: 22,
    minRainProb: 0,
    phMin: 6.0,
    phMax: 7.8,
    idealN: 250,
    idealP: 28,
    idealK: 160,
    yieldRange: '1.5 - 2.4 t/ha',
    benefits: 'Leguminous pulse that fixes atmospheric nitrogen, restoring degraded soils.',
  },
  {
    name: 'Groundnut (Peanut)',
    season: 'Kharif',
    minTemp: 20,
    maxTemp: 34,
    optimalTempMin: 23,
    optimalTempMax: 30,
    minRainProb: 20,
    phMin: 6.0,
    phMax: 7.0,
    idealN: 260,
    idealP: 25,
    idealK: 190,
    yieldRange: '2.0 - 3.2 t/ha',
    benefits: 'Oilseed crop requiring friable, sandy-loam soil with good phosphorus availability.',
  },
  {
    name: 'Mustard (Rapeseed)',
    season: 'Rabi',
    minTemp: 10,
    maxTemp: 25,
    optimalTempMin: 15,
    optimalTempMax: 22,
    minRainProb: 0,
    phMin: 6.0,
    phMax: 7.5,
    idealN: 340,
    idealP: 22,
    idealK: 150,
    yieldRange: '1.4 - 2.2 t/ha',
    benefits: 'Low water requirement oilseed crop ideal for North and Central Indian winter belts.',
  },
];

export function getCropRecommendations(
  soil: SoilData,
  weather?: WeatherData | null
): CropRecommendation[] {
  const currentTemp = weather ? weather.temperature : 26;
  const currentRainProb = weather ? (weather.hourly?.rainProbability?.[0] ?? 20) : 20;

  return CROP_PROFILES.map(crop => {
    let score = 100;

    // Soil pH fitness
    if (soil.pH < crop.phMin) {
      score -= Math.min(30, (crop.phMin - soil.pH) * 20);
    } else if (soil.pH > crop.phMax) {
      score -= Math.min(30, (soil.pH - crop.phMax) * 20);
    }

    // Temperature fitness
    if (currentTemp < crop.minTemp) {
      score -= Math.min(35, (crop.minTemp - currentTemp) * 4);
    } else if (currentTemp > crop.maxTemp) {
      score -= Math.min(35, (currentTemp - crop.maxTemp) * 4);
    } else if (currentTemp >= crop.optimalTempMin && currentTemp <= crop.optimalTempMax) {
      score += 5; // bonus for optimal temperature
    }

    // Nutrient compatibility
    const nRatio = soil.nitrogen / crop.idealN;
    if (nRatio < 0.6) score -= 15;
    const pRatio = soil.phosphorus / crop.idealP;
    if (pRatio < 0.6) score -= 10;
    const kRatio = soil.potassium / crop.idealK;
    if (kRatio < 0.6) score -= 10;

    const finalScore = Math.max(15, Math.min(98, Math.round(score)));

    // Generate brief explanation
    const phFit = soil.pH >= crop.phMin && soil.pH <= crop.phMax;
    const tempFit = currentTemp >= crop.optimalTempMin && currentTemp <= crop.optimalTempMax;

    const explanation = `${crop.name} suits ${crop.season} season. ${
      phFit ? `Soil pH ${soil.pH} is in the prime range (${crop.phMin}-${crop.phMax}).` : `Soil pH ${soil.pH} is ${soil.pH < crop.phMin ? 'below' : 'above'} ideal range.`
    } ${
      tempFit ? `Current temperature (${currentTemp}°C) is in optimal growth window.` : `Temperature (${currentTemp}°C) requires careful irrigation.`
    } ${crop.benefits}`;

    return {
      crop: crop.name,
      season: crop.season,
      matchScore: finalScore,
      expectedYieldRange: crop.yieldRange,
      explanation,
      soilSuitability: phFit ? 'High' : 'Moderate',
      weatherSuitability: tempFit ? 'High' : 'Moderate',
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

export function getFertilizerRecommendations(
  soil: SoilData,
  selectedCropName: string = 'Rice (Paddy)',
  weather?: WeatherData | null,
  region?: string
): FertilizerRecommendation[] {
  const assessment = assessSoil(soil);
  const recs: FertilizerRecommendation[] = [];

  const rainUpcoming =
    (weather?.hourly?.rainProbability?.slice(0, 12).some(p => p > 50) ?? false) ||
    (weather?.condition?.toLowerCase().includes('rain') ?? false);

  const lowerCrop = selectedCropName.toLowerCase();
  const normRegion = (region || '').toLowerCase();

  // 1. Identify regional university package and provenance
  let defaultSource = 'ICAR All India Coordinated Research Project (AICRP) Baseline';
  let isKnownRegion = false;
  let activeRegionName = region || 'All India';

  if (normRegion.includes('punjab') || normRegion.includes('ludhiana') || normRegion.includes('bathinda')) {
    defaultSource = 'Punjab Agricultural University (PAU) Ludhiana Package of Practices (2024)';
    isKnownRegion = true;
    activeRegionName = 'Punjab';
  } else if (
    normRegion.includes('karnataka') ||
    normRegion.includes('mandya') ||
    normRegion.includes('dharwad') ||
    normRegion.includes('belagavi') ||
    normRegion.includes('mysuru') ||
    normRegion.includes('bangalore')
  ) {
    defaultSource = 'University of Agricultural Sciences (UAS Bangalore) & UAS Dharwad / KSDA (2024)';
    isKnownRegion = true;
    activeRegionName = 'Karnataka';
  } else if (
    normRegion.includes('maharashtra') ||
    normRegion.includes('nagpur') ||
    normRegion.includes('nashik') ||
    normRegion.includes('pune') ||
    normRegion.includes('amravati')
  ) {
    defaultSource = 'Mahatma Phule Krishi Vidyapeeth (MPKV) Rahuri & Dr. PDKV Akola / GoM (2024)';
    isKnownRegion = true;
    activeRegionName = 'Maharashtra';
  } else if (
    normRegion.includes('andhra') ||
    normRegion.includes('guntur') ||
    normRegion.includes('krishna') ||
    normRegion.includes('telangana')
  ) {
    defaultSource = 'Acharya N.G. Ranga Agricultural University (ANGRAU) Package of Practices';
    isKnownRegion = true;
    activeRegionName = 'Andhra Pradesh';
  } else if (normRegion.includes('haryana') || normRegion.includes('karnal') || normRegion.includes('hisar')) {
    defaultSource = 'CCS Haryana Agricultural University (CCSHAU) Hisar Guidelines';
    isKnownRegion = true;
    activeRegionName = 'Haryana';
  } else if (normRegion.includes('gujarat') || normRegion.includes('rajkot') || normRegion.includes('surat')) {
    defaultSource = 'Junagadh Agricultural University (JAU) & Anand Agricultural University (AAU)';
    isKnownRegion = true;
    activeRegionName = 'Gujarat';
  } else if (normRegion.includes('tamil nadu') || normRegion.includes('coimbatore') || normRegion.includes('thanjavur')) {
    defaultSource = 'Tamil Nadu Agricultural University (TNAU) Agritech Portal';
    isKnownRegion = true;
    activeRegionName = 'Tamil Nadu';
  } else if (!region || normRegion === 'all regions' || normRegion === 'national' || normRegion === 'all india') {
    defaultSource = 'ICAR All India Coordinated Research Project (AICRP) Baseline';
    isKnownRegion = true;
    activeRegionName = 'All India';
  } else {
    isKnownRegion = false;
    defaultSource = 'ICAR All-India Baseline (Regional university package uncalibrated)';
  }

  // Label unavailable local guidance if region was explicitly provided but uncalibrated
  if (region && !isKnownRegion) {
    recs.push({
      name: `Advisory: Official Local Guidance Unavailable for ${region}`,
      dosage: 'Standard ICAR National Baseline Package (100:50:50 kg/ha N:P2O5:K2O base)',
      applicationTiming: 'Split across basal, tillering, and panicle initiation',
      purpose: 'Notice that state agricultural university package is pending for this agro-climatic zone.',
      explanation: `Official State Agricultural University package of practices is currently unavailable for ${region}. Displaying general ICAR All-India national baseline. Please consult your district Krishi Vigyan Kendra (KVK) for soil-test-targeted fertilizer equations.`,
      source: 'ICAR All India Coordinated Research Project (AICRP)',
      region: region,
    });
  }

  const isPulse =
    lowerCrop.includes('chickpea') ||
    lowerCrop.includes('gram') ||
    lowerCrop.includes('tur') ||
    lowerCrop.includes('arhar') ||
    lowerCrop.includes('pigeon pea');

  const isRice = lowerCrop.includes('rice') || lowerCrop.includes('paddy');
  const isWheat = lowerCrop.includes('wheat');
  const isCotton = lowerCrop.includes('cotton');
  const isSugarcane = lowerCrop.includes('sugarcane');
  const isMaize = lowerCrop.includes('maize') || lowerCrop.includes('corn');
  const isGroundnut = lowerCrop.includes('groundnut') || lowerCrop.includes('peanut');
  const isMustard = lowerCrop.includes('mustard') || lowerCrop.includes('rapeseed');

  // Verified regional agronomic package status
  const verifiedCrops = [
    'Rice (Paddy)',
    'Rice',
    'Paddy',
    'Wheat',
    'Cotton',
    'Bengal Gram (Chickpea)',
    'Chickpea (Gram)',
    'Chickpea',
    'Sugarcane',
    'Maize (Corn)',
    'Maize',
    'Groundnut',
    'Mustard',
  ];
  const isVerifiedDoseAvailable = verifiedCrops.some(c => lowerCrop.includes(c.toLowerCase()));

  if (!isVerifiedDoseAvailable) {
    recs.push({
      name: `Advisory: Verified Regional Dosage Unavailable for ${selectedCropName}`,
      dosage: 'General ICAR Baseline Package (Uncalibrated for micro-region)',
      applicationTiming: 'Sowing & vegetative stages',
      purpose: 'Notice that verified crop- and region-specific STCR equations are pending.',
      explanation: `Verified regional dosage package unavailable for ${selectedCropName}. Recommending general ICAR maintenance guidelines until local Soil Testing Laboratory (STL) calibration is finalized.`,
      source: 'ICAR-AICRP Baseline',
      region: activeRegionName,
    });
  }

  // 1. NITROGEN RECOMMENDATION (Distinct for Legumes/Pulses vs Cereals vs Heavy Feeders)
  if (isPulse) {
    // Chickpea / Leguminous pulse: Starter N only + Rhizobium warning
    if (assessment.nitrogenStatus === 'Low' || soil.nitrogen < 280) {
      recs.push({
        name: 'Starter Urea (46% N) & Rhizobium Culture',
        dosage: '45 - 50 kg/ha Starter Dose (20 - 25 kg N/ha) only at sowing',
        applicationTiming: 'Basal placement at sowing time (no top-dressing)',
        purpose: 'Provides starter nitrogen until symbiotic Rhizobium root nodules establish atmospheric N fixation.',
        explanation: rainUpcoming
          ? 'Chickpea is a leguminous pulse. Rain is forecast within 24h: ensure well-drained seedbed. Apply starter dose only; do NOT apply nitrogen top-dressing as excess nitrogen suppresses Rhizobium nodulation.'
          : 'Chickpea pulse fixes atmospheric nitrogen through symbiotic Rhizobium root nodules. Apply starter dose only; avoid nitrogen top-dressing to prevent excessive vegetative lodging and poor pod setting.',
        source: defaultSource,
        region: activeRegionName,
      });
    } else {
      recs.push({
        name: 'Withhold Nitrogen Top-Dressing (Rhizobium Active)',
        dosage: '0 kg/ha Top-Dressing Urea (Starter N already sufficient)',
        applicationTiming: 'Vegetative to pod formation',
        purpose: 'Protects active symbiotic Rhizobium root nodulation and encourages maximum pod set.',
        explanation: `Soil nitrogen is adequate (${soil.nitrogen} kg/ha). Top-dressing nitrogen in chickpea inhibits bacterial nitrogenase enzymes and causes flower abortion.`,
        source: defaultSource,
        region: activeRegionName,
      });
    }
  } else if (isRice) {
    // Rice (Paddy): High nitrogen cereal feeder with region-specific calibration
    const isPunjabRice = normRegion.includes('punjab') || normRegion.includes('ludhiana');
    const isKarnatakaRice = normRegion.includes('karnataka') || normRegion.includes('mandya');

    if (soil.nitrogen < 280) {
      const punjabDose = '140 - 160 kg/ha Neem-Coated Urea in 3 equal splits (1/3 basal, 1/3 at 21 DAT, 1/3 at 42 DAT)';
      const karnatakaDose = '120 - 140 kg/ha Neem-Coated Urea in 3 splits (50% basal, 25% active tillering, 25% panicle initiation)';
      const standardDose = '140 - 160 kg/ha in 3 split doses (50% basal, 25% active tillering, 25% panicle initiation)';

      recs.push({
        name: isPunjabRice
          ? 'Neem-Coated Urea (46% N) - PAU High Input Regimen'
          : isKarnatakaRice
          ? 'Neem-Coated Urea (46% N) - UAS Bangalore Delta Regimen'
          : 'Neem-Coated Urea (46% N) - High Deficit Regimen',
        dosage: isPunjabRice ? punjabDose : isKarnatakaRice ? karnatakaDose : standardDose,
        applicationTiming: isPunjabRice
          ? 'Basal transplanting, 21 days after transplanting (DAT), and 42 DAT'
          : 'Basal transplanting, 20-25 DAT (Tillering), 45-50 DAT (Panicle Initiation)',
        purpose: 'Replenishes severe soil nitrogen deficit for vigorous tillering and photosynthetic grain capacity.',
        explanation: rainUpcoming
          ? 'Soil Nitrogen is low. CAUTION: Heavy rain forecast within 24 hours: delay top-dressing urea by 24-48h to prevent nitrogen leaching and surface runoff losses.'
          : isPunjabRice
          ? 'PAU Ludhiana calibration for Punjab Indo-Gangetic alluvium: apply 3 equal splits with irrigation to maximize nitrogen use efficiency (NUE) and minimize ammonia volatilization in alkaline soil.'
          : isKarnatakaRice
          ? 'UAS Bangalore calibration for Karnataka canal commands: apply 50% basal, 25% at tillering, and 25% at panicle initiation with alternate wetting and drying (AWD).'
          : 'Soil Nitrogen is low. Apply neem-coated urea in 3 equal splits to maximize nitrogen use efficiency (NUE) and prevent volatilization.',
        source: defaultSource,
        region: activeRegionName,
      });
    } else if (soil.nitrogen <= 480) {
      recs.push({
        name: 'Neem-Coated Urea (46% N) - Maintenance Regimen',
        dosage: isKarnatakaRice
          ? '100 - 120 kg/ha in 3 split doses (40% basal, 30% tillering, 30% panicle initiation)'
          : '110 - 130 kg/ha in 3 split doses (40% basal, 30% tillering, 30% panicle initiation)',
        applicationTiming: 'Basal, Active tillering stage, and Flag leaf / Panicle emergence',
        purpose: 'Maintains leaf greenness (SPAD/LCC index 4.0) and sustains high grain weight.',
        explanation: rainUpcoming
          ? 'Soil nitrogen is moderate. Rain is upcoming: broadcast urea only after rain clears to avoid runoff into field ditches.'
          : 'Soil nitrogen is in the medium range. Follow balanced 3-split schedule with intermittent field wetting and drying (AWD).',
        source: defaultSource,
        region: activeRegionName,
      });
    } else {
      recs.push({
        name: 'Withhold / Skip Nitrogen Fertilizers',
        dosage: '0 kg/ha (Skip Urea for current stage)',
        applicationTiming: 'Current vegetative growth stage',
        purpose: 'Prevents succulent vegetative overgrowth, crop lodging, and blast disease outbreaks.',
        explanation: `Soil nitrogen is very high (${soil.nitrogen} kg/ha > 480 kg/ha threshold). Excess urea in rice causes soft succulent tissue susceptible to Rice Blast (Magnaporthe oryzae) and bacterial blight.`,
        source: defaultSource,
        region: activeRegionName,
      });
    }
  } else if (isWheat) {
    // Wheat: 2 splits (CRI stage + Jointing/Booting)
    if (assessment.nitrogenStatus === 'Low' || soil.nitrogen < 280) {
      recs.push({
        name: 'Urea (46% N) - Wheat High Input',
        dosage: '130 - 150 kg/ha in 2 splits (50% at sowing, 50% at Crown Root Initiation)',
        applicationTiming: 'At sowing and 21 days after sowing (CRI stage first irrigation)',
        purpose: 'Fuels productive tillering and spikelet fertility in cool weather conditions.',
        explanation: rainUpcoming
          ? 'Rain forecast: Delay top-dressing urea until crown root irrigation water settles.'
          : 'Apply half at sowing and remainder with first CRI irrigation at 21 days.',
        source: defaultSource,
        region: activeRegionName,
      });
    } else {
      recs.push({
        name: 'Urea (46% N) - Wheat Maintenance',
        dosage: '90 - 110 kg/ha in 2 splits',
        applicationTiming: 'Sowing and first CRI irrigation',
        purpose: 'Maintains balanced canopy and optimal grain protein content.',
        explanation: 'Adequate soil baseline; split dose ensures sustained grain filling without lodging.',
        source: defaultSource,
        region: activeRegionName,
      });
    }
  } else if (isCotton) {
    recs.push({
      name: 'Urea (46% N) - Cotton Split Schedule',
      dosage: '120 - 140 kg/ha in 3 splits (Squaring, Flowering, Boll formation)',
      applicationTiming: 'At thinning, squaring (45 DAS), and peak boll development (75 DAS)',
      purpose: 'Sustains indeterminate sympodial branch development and boll retention.',
      explanation: rainUpcoming
        ? 'Rain forecast: withhold urea top-dressing to prevent shedding of young squares.'
        : 'Apply in soil band 10-15 cm from stem to avoid root burn.',
      source: defaultSource,
      region: activeRegionName,
    });
  } else if (isSugarcane) {
    recs.push({
      name: 'Urea (46% N) - Sugarcane Heavy Feeder Regimen',
      dosage: '250 - 300 kg/ha in 4 splits (Sowing, 45, 90, 120 days)',
      applicationTiming: 'At planting, tillering, formative phase, and grand growth',
      purpose: 'Supports massive biomass accumulation and thick millable cane stalk synthesis.',
      explanation: 'Heavy feeder crop: split applications match peak vegetative sucrose demand.',
      source: defaultSource,
      region: activeRegionName,
    });
  } else {
    // Generic baseline
    recs.push({
      name: 'Urea (46% N) - General Agronomic Baseline',
      dosage: '80 - 100 kg/ha split dose',
      applicationTiming: 'Vegetative growth phase',
      purpose: 'General nitrogen replenishment.',
      explanation: isVerifiedDoseAvailable
        ? 'Follow standard regional agricultural university package of practices.'
        : 'Verified regional dosage package unavailable for this specific crop-zone combination; consult your local Krishi Vigyan Kendra (KVK).',
      source: defaultSource,
      region: activeRegionName,
    });
  }

  // 2. PHOSPHORUS RECOMMENDATION (High in Pulses, Basal Placement)
  if (isPulse) {
    recs.push({
      name: 'DAP (Di-ammonium Phosphate 18:46) or Single Super Phosphate (SSP)',
      dosage: assessment.phosphorusStatus === 'Low' ? '125 - 150 kg/ha SSP or 75 kg/ha DAP' : '100 kg/ha SSP basal',
      applicationTiming: '100% Basal placement 5 cm below seed depth at sowing',
      purpose: 'Crucial for robust primary taproot penetration, nodule ATP energy, and pod development.',
      explanation: `Chickpea requires high available phosphorus (${soil.phosphorus} kg/ha detected). Phosphorus powers the nitrogenase enzyme complex in Rhizobium bacteroids.`,
      source: defaultSource,
      region: activeRegionName,
    });
  } else if (assessment.phosphorusStatus === 'Low') {
    recs.push({
      name: 'DAP (18-46-0) or Single Super Phosphate (SSP 16% P2O5)',
      dosage: '100 - 125 kg/ha SSP or 60 kg/ha DAP',
      applicationTiming: '100% Basal dose (at or just before sowing/transplanting)',
      purpose: 'Stimulates early seedling root network and anchorage.',
      explanation: `Soil available phosphorus is low (${soil.phosphorus} kg/ha vs target 22 kg/ha). Apply deep in the furrow, as phosphorus is immobile in soil.`,
      source: defaultSource,
      region: activeRegionName,
    });
  } else if (assessment.phosphorusStatus === 'Medium') {
    recs.push({
      name: 'Single Super Phosphate (SSP - 16% P2O5 + 11% Sulphur)',
      dosage: '50 - 65 kg/ha basal',
      applicationTiming: 'At sowing / land preparation',
      purpose: 'Supplies essential maintenance phosphorus along with sulfur and calcium.',
      explanation: 'Maintains optimal root density and grain filling during reproductive stages.',
      source: defaultSource,
      region: activeRegionName,
    });
  }

  // 3. POTASSIUM (MOP - Muriate of Potash 60% K2O) - Region specialized
  const isKarnatakaSandy = normRegion.includes('karnataka') || normRegion.includes('mandya');

  if (assessment.potassiumStatus === 'Low') {
    recs.push({
      name: isKarnatakaSandy
        ? 'MOP (Muriate of Potash - 60% K2O) - UAS Bangalore Split Regimen'
        : 'MOP (Muriate of Potash - 60% K2O)',
      dosage: isRice
        ? '60 - 75 kg/ha (50% basal + 50% panicle initiation)'
        : '50 - 60 kg/ha basal',
      applicationTiming: isRice
        ? '50% basal at transplanting + 50% at panicle emergence'
        : 'At sowing / land preparation',
      purpose: 'Strengthens stem wall lignification, enhances drought resistance, and prevents pest lodging.',
      explanation: isKarnatakaSandy
        ? `Available potassium is low (${soil.potassium} kg/ha). UAS Bangalore specifies split potash in Karnataka red sandy loams because high soil permeability leads to severe leaching losses if applied all at once.`
        : `Available potassium is low (${soil.potassium} kg/ha). Potash regulates stomatal water retention and induces systemic disease resistance.`,
      source: defaultSource,
      region: activeRegionName,
    });
  } else if (assessment.potassiumStatus === 'Medium') {
    recs.push({
      name: isKarnatakaSandy
        ? 'MOP (Muriate of Potash - 60% K2O) - UAS Bangalore Split Regimen'
        : 'MOP (Muriate of Potash - 60% K2O) Maintenance',
      dosage: isKarnatakaSandy ? '35 - 50 kg/ha in 2 splits' : '30 - 45 kg/ha',
      applicationTiming: isRice ? 'Panicle initiation' : 'Basal / active vegetative',
      purpose: 'Improves grain test weight, starch translocation, and prevents premature flag leaf drying.',
      explanation: isKarnatakaSandy
        ? 'UAS Bangalore recommends splitting maintenance potash in Karnataka red soils to sustain flag leaf grain filling.'
        : 'Sustains optimal enzyme activation and enhances drought buffering during dry spells.',
      source: defaultSource,
      region: activeRegionName,
    });
  }

  // 4. SOIL pH AMENDING (Lime for Acidic, Gypsum for Alkaline)
  if (soil.pH < 6.0) {
    recs.push({
      name: 'Agricultural Lime (CaCO3) / Dolomite',
      dosage: '300 - 450 kg/ha broadcast during ploughing',
      applicationTiming: '2-3 weeks before sowing during primary tillage',
      purpose: 'Neutralizes soil acidity, reduces aluminum/iron toxicity, and unlocks fixed phosphorus.',
      explanation: `Soil pH (${soil.pH}) is acidic (< 6.0). Liming restores neutral root environment and stimulates beneficial microbial activity.`,
      source: defaultSource,
      region: activeRegionName,
    });
  } else if (soil.pH > 8.0) {
    recs.push({
      name: 'Agricultural Gypsum (CaSO4·2H2O)',
      dosage: '500 - 800 kg/ha incorporated with light irrigation',
      applicationTiming: 'During final land preparation before sowing',
      purpose: 'Displaces exchangeable sodium ions and improves soil flocculation and water infiltration.',
      explanation: `Soil pH (${soil.pH}) is alkaline (> 8.0). Gypsum supplies soluble calcium to neutralize sodicity and prevent crusting.`,
      source: defaultSource,
      region: activeRegionName,
    });
  }

  // 5. REGIONAL & CROP-SPECIFIC MICRONUTRIENT SPECIALIZATION
  const isPunjab = normRegion.includes('punjab') || normRegion.includes('ludhiana');
  const isMaharashtra = normRegion.includes('maharashtra') || normRegion.includes('nagpur');

  if (isPulse) {
    recs.push({
      name: 'Rhizobium Leguminosarum & PSB Biofertilizer Seed Inoculant',
      dosage: '250 g Rhizobium + 250 g PSB culture per 10 kg seed',
      applicationTiming: 'Seed treatment 30 minutes before sowing under shade',
      purpose: 'Establishes millions of symbiotic nitrogen-fixing colonies on root nodules.',
      explanation: 'Enhances biological nitrogen fixation by up to 25-35 kg N/ha and solubilizes native soil phosphorus.',
      source: defaultSource,
      region: activeRegionName,
    });
  } else if (isRice) {
    recs.push({
      name: isPunjab
        ? 'Zinc Sulphate Heptahydrate (ZnSO4·7H2O - 21% Zn) - PAU Malwa/Doaba Regimen'
        : 'Zinc Sulphate Heptahydrate (ZnSO4·7H2O - 21% Zn)',
      dosage: '25 kg/ha basal or 0.5% foliar spray at tillering',
      applicationTiming: 'Basal application at puddling / transplanting or 25-30 DAT',
      purpose: isPunjab
        ? 'PAU Ludhiana official mandate to prevent Khaira disease in alkaline calcareous soils of Punjab.'
        : 'Prevents Khaira disease (zinc chlorosis) and boosts tryptophan auxin synthesis.',
      explanation: isPunjab
        ? 'PAU Ludhiana mandates 25 kg/ha ZnSO4 in Punjab soils due to high pH and calcium-induced zinc fixation in Indo-Gangetic alluvium.'
        : 'Submerged paddy soils frequently exhibit zinc deficiency; ZnSO4 ensures uniform tillering and panicle development.',
      source: defaultSource,
      region: activeRegionName,
    });
  } else if (isCotton && isMaharashtra) {
    recs.push({
      name: 'Magnesium Sulphate (MgSO4·7H2O) - MPKV Vertisol Regimen',
      dosage: '25 kg/ha basal or 1% foliar spray at flowering stage',
      applicationTiming: 'Basal placement or 60 days after sowing',
      purpose: 'Prevents red leaf disease (Lalya) common in Vidarbha/Marathwada black cotton soils.',
      explanation: 'MPKV Rahuri specifies MgSO4 in Maharashtra vertisols to prevent magnesium chlorosis and sustain boll development.',
      source: 'Mahatma Phule Krishi Vidyapeeth (MPKV) Rahuri / Dr. PDKV Akola',
      region: 'Maharashtra',
    });
  } else if (isGroundnut) {
    recs.push({
      name: 'Agricultural Gypsum at Pegging Stage',
      dosage: '400 - 500 kg/ha side-dressed along rows',
      applicationTiming: 'At pegging stage (35 - 40 days after sowing)',
      purpose: 'Supplies concentrated calcium for healthy pod filling and prevents hollow kernel (pops).',
      explanation: 'Groundnut pegs absorb calcium directly from soil; gypsum is essential for high shelling percentage.',
      source: defaultSource,
      region: activeRegionName,
    });
  } else {
    recs.push({
      name: 'Enriched Farm Yard Manure (FYM) & Biofertilizers',
      dosage: '5 tonnes/ha FYM + 2 kg/ha Azotobacter / Azospirillum culture',
      applicationTiming: 'During final land preparation',
      purpose: 'Boosts organic carbon, cation exchange capacity, and fertilizer use efficiency.',
      explanation: 'Organic amendments improve water holding capacity and feed soil microbiome.',
      source: defaultSource,
      region: activeRegionName,
    });
  }

  return recs;
}

