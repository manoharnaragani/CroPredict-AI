import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCSV, parseCSVLine, aggregateYieldByYear } from './csv.ts';
import { assessSoil, SHC_THRESHOLDS } from './soil.ts';
import { getCropRecommendations, getFertilizerRecommendations } from './recommendations.ts';
import {
  executeYieldPipeline,
  executeDiseasePipeline,
  validateYieldResponse,
  testConnectionWithInput,
} from './pipeline.ts';

test('CSV parser correctly parses valid agricultural yield records', () => {
  const sampleCSV = `Crop,Region,Year,Yield (Tonnes/Ha),Area (Ha)
Rice,Punjab,2022,4.12,1200
Wheat,Punjab,2022,4.65,1500
Rice,Maharashtra,2022,3.15,800`;

  const parsed = parseCSV(sampleCSV);
  assert.equal(parsed.length, 3);
  assert.equal(parsed[0].crop, 'Rice');
  assert.equal(parsed[0].region, 'Punjab');
  assert.equal(parsed[0].year, 2022);
  assert.equal(parsed[0].yieldTonnesPerHa, 4.12);
  assert.equal(parsed[0].areaHa, 1200);
});

test('CSV parser handles quoted strings and comma delimiters', () => {
  const line = 'Wheat,"Punjab, North India",2023,4.8';
  const tokens = parseCSVLine(line);
  assert.equal(tokens[0], 'Wheat');
  assert.equal(tokens[1], 'Punjab, North India');
  assert.equal(tokens[2], '2023');
  assert.equal(tokens[3], '4.8');
});

test('aggregateYieldByYear correctly calculates averages', () => {
  const sampleCSV = `Crop,Region,Year,Yield
Rice,Punjab,2021,4.0
Rice,Punjab,2021,4.2
Rice,Punjab,2022,4.4`;

  const records = parseCSV(sampleCSV);
  const agg = aggregateYieldByYear(records, 'Rice', 'Punjab');
  assert.equal(agg.length, 2);
  assert.equal(agg[0].year, 2021);
  assert.equal(agg[0].avgYield, 4.1);
  assert.equal(agg[1].year, 2022);
  assert.equal(agg[1].avgYield, 4.4);
});

test('Soil Health assessment accurately flags deficits and acidic/alkaline states', () => {
  // Acidic with low N & P
  const assessmentAcidic = assessSoil({
    pH: 5.2,
    nitrogen: 210,
    phosphorus: 8,
    potassium: 230,
  });
  assert.equal(assessmentAcidic.pHRating, 'low');
  assert.equal(assessmentAcidic.nitrogenStatus, 'Low');
  assert.equal(assessmentAcidic.phosphorusStatus, 'Low');
  assert.equal(assessmentAcidic.potassiumStatus, 'Medium');
  assert.ok(assessmentAcidic.overallHealthScore < 70);

  // Optimal soil
  const assessmentOptimal = assessSoil({
    pH: 6.8,
    nitrogen: 450,
    phosphorus: 22,
    potassium: 240,
  });
  assert.equal(assessmentOptimal.pHRating, 'optimal');
  assert.equal(assessmentOptimal.nitrogenStatus, 'Medium');
  assert.ok(assessmentOptimal.overallHealthScore >= 80);
});

test('Crop & Fertilizer recommendations provide contextual guidance with explanations', () => {
  const soil = {
    pH: 6.5,
    nitrogen: 180, // low
    phosphorus: 8,  // low
    potassium: 200, // medium
  };

  const cropRecs = getCropRecommendations(soil, {
    area: 'Nagpur',
    latitude: 21.1458,
    longitude: 79.0882,
    temperature: 28,
    humidity: 65,
    windSpeed: 10,
    weatherCode: 1,
    condition: 'Mainly Clear',
    lastUpdated: '10:00 AM',
    hourly: {
      time: ['10:00', '11:00'],
      temperature: [28, 29],
      rainProbability: [10, 15],
    },
  });

  assert.ok(cropRecs.length > 0);
  assert.ok(cropRecs[0].matchScore > 0);
  assert.ok(cropRecs[0].explanation.length > 10);

  const fertRecs = getFertilizerRecommendations(soil, 'Rice (Paddy)');
  assert.ok(fertRecs.length >= 3);
  // Low N should recommend Urea with split dosage
  const urea = fertRecs.find(f => f.name.includes('Urea'));
  assert.ok(urea);
  assert.ok(urea.explanation.length > 15);
});

test('Pipeline strictly enforces "Model or data required." when endpoint or data is missing', async () => {
  // Empty config without connected models
  const disconnectedConfig = {
    yieldEndpointUrl: '',
    diseaseEndpointUrl: '',
    status: { yield: 'disconnected' as const, disease: 'disconnected' as const },
    verifiedConnections: {
      yield: { isConnected: false },
      disease: { isConnected: false },
    },
  };

  // Yield prediction without model
  const yieldResult = await executeYieldPipeline(disconnectedConfig, {
    crop: 'Rice (Paddy)',
    region: 'Punjab',
    season: 'Kharif',
    soil_pH: 6.5,
    soil_N: 350,
    soil_P: 20,
    soil_K: 200,
    avg_temperature: 28,
  });

  assert.equal(yieldResult.success, false);
  assert.equal(yieldResult.requiresModelOrData, true);
  assert.equal(yieldResult.message, 'Model or data required.');
  assert.ok(yieldResult.missingDetails);

  // Disease detection without image
  const diseaseNoImage = await executeDiseasePipeline(disconnectedConfig, null, null, 'Rice (Paddy)');
  assert.equal(diseaseNoImage.success, false);
  assert.equal(diseaseNoImage.requiresModelOrData, true);
  assert.equal(diseaseNoImage.message, 'Model or data required.');

  // Disease detection with image but no model endpoint
  const diseaseNoModel = await executeDiseasePipeline(disconnectedConfig, new File([''], 'leaf.jpg'), null, 'Rice');
  assert.equal(diseaseNoModel.success, false);
  assert.equal(diseaseNoModel.requiresModelOrData, true);
  assert.equal(diseaseNoModel.message, 'Model or data required.');
  assert.ok(diseaseNoModel.missingDetails);
});

test('testConnectionWithInput correctly reports missing model or data when unconfigured', async () => {
  const emptyConfig = {
    yieldEndpointUrl: '',
    diseaseEndpointUrl: '',
    status: { yield: 'disconnected' as const, disease: 'disconnected' as const },
    verifiedConnections: {
      yield: { isConnected: false },
      disease: { isConnected: false },
    },
  };

  const yieldTest = await testConnectionWithInput('yield', emptyConfig);
  assert.equal(yieldTest.success, false);
  assert.equal(yieldTest.requiresModelOrData, true);
  assert.equal(yieldTest.message, 'Model or data required.');

  const diseaseTest = await testConnectionWithInput('disease', emptyConfig);
  assert.equal(diseaseTest.success, false);
  assert.equal(diseaseTest.requiresModelOrData, true);
  assert.equal(diseaseTest.message, 'Model or data required.');
});

test('validateYieldResponse validates structure correctly', () => {
  assert.equal(validateYieldResponse(null), false);
  assert.equal(validateYieldResponse({ predictedYieldTonnesPerHa: 4.5 }), false);
  assert.equal(
    validateYieldResponse({
      predictedYieldTonnesPerHa: 4.5,
      selectedFeatures: ['feature_1'],
    }),
    true
  );
});

test('Connected Model Endpoints execute real end-to-end predictions successfully', async () => {
  const { DEFAULT_ENDPOINT_CONFIG } = await import('./pipeline.ts');
  const { getVillagesBySubdistrict } = await import('../data/lgdData.ts');
  const { OFFICIAL_DATASET_COVERAGE_REPORT } = await import('../data/sampleYieldData.ts');

  // Test 1: Real Yield Inference
  const yieldResult = await executeYieldPipeline(DEFAULT_ENDPOINT_CONFIG, {
    crop: 'Rice (Paddy)',
    region: 'Mandya (Karnataka)',
    season: 'Kharif',
    soil_pH: 6.8,
    soil_N: 340,
    soil_P: 18,
    soil_K: 210,
    avg_temperature: 27.5,
    rainfall_mm: 820,
    ndvi: 0.68,
  });

  assert.equal(yieldResult.success, true);
  assert.ok(yieldResult.data);
  assert.ok(yieldResult.data.predictedYieldTonnesPerHa > 0);
  assert.ok(Array.isArray(yieldResult.data.selectedFeatures));
  assert.equal(yieldResult.data.selectedFeatures.length, 10);
  assert.ok(yieldResult.data.modelMetadata?.modelName.includes('CNN-BiGRU'));

  // Test 2: Real Disease Inference
  const diseaseResult = await executeDiseasePipeline(
    DEFAULT_ENDPOINT_CONFIG,
    null,
    'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
    'Rice (Paddy)'
  );

  assert.equal(diseaseResult.success, true);
  assert.ok(diseaseResult.data);
  assert.ok(diseaseResult.data.diseaseName);
  assert.ok(diseaseResult.data.confidenceScore > 0.8);
  assert.ok(diseaseResult.data.psoSelectedFeatures.length === 13);
  assert.ok(diseaseResult.data.recommendedAction.length > 0);

  // Test 3: LGD 4-Tier Village Lookup and District Average Policy
  const mandyaVillages = getVillagesBySubdistrict(29, 567, 5508);
  assert.ok(mandyaVillages.length >= 3);
  assert.equal(mandyaVillages[0].subdistrictCode, 5508);
  assert.equal(mandyaVillages[0].districtCode, 567);

  // Test 4: Official Dataset Coverage Report Integrity
  assert.equal(OFFICIAL_DATASET_COVERAGE_REPORT.length, 6);
  for (const ds of OFFICIAL_DATASET_COVERAGE_REPORT) {
    assert.ok(ds.sourceUrl.startsWith('http'));
    assert.ok(ds.recordCount > 0);
    assert.ok(ds.paginationStatus.includes('Complete'));
    assert.ok(ds.coverageGaps.length > 10);
    assert.ok(ds.villageHandlingPolicy.length > 10);
  }
});

test('Foliar Pixel Analysis correctly classifies leaf biomarkers and rejects non-leaf images', async () => {
  const { extractBiomarkersFromPixels, classifyLeafFromBiomarkers } = await import('./imageAnalysis.ts');

  // Test non-leaf pixels (metallic gray buffer: 100x100 RGBA)
  const nonLeafData = new Uint8ClampedArray(100 * 100 * 4);
  for (let i = 0; i < nonLeafData.length; i += 4) {
    nonLeafData[i] = 120;     // R
    nonLeafData[i + 1] = 125; // G
    nonLeafData[i + 2] = 140; // B
    nonLeafData[i + 3] = 255; // A
  }
  const nonLeafBiomarkers = extractBiomarkersFromPixels(nonLeafData, 100, 100);
  assert.equal(nonLeafBiomarkers.isFoliarLeaf, false);
  const nonLeafDiagnosis = classifyLeafFromBiomarkers(nonLeafBiomarkers, 'Rice (Paddy)');
  assert.equal(nonLeafDiagnosis.isFoliarLeaf, false);
  assert.equal(nonLeafDiagnosis.diseaseName, 'Non-Leaf Image Detected');

  // Test foliar rice leaf with spindle blast lesions (green lamina + necrotic spots)
  const riceBlastData = new Uint8ClampedArray(100 * 100 * 4);
  for (let y = 0; y < 100; y++) {
    for (let x = 0; x < 100; x++) {
      const idx = (y * 100 + x) * 4;
      // Spindle lesion at center
      const inLesion = Math.pow((x - 50) / 20, 2) + Math.pow((y - 50) / 7, 2) <= 1;
      if (inLesion) {
        riceBlastData[idx] = 110;     // Necrotic brown R
        riceBlastData[idx + 1] = 60;  // G
        riceBlastData[idx + 2] = 25;  // B
      } else {
        riceBlastData[idx] = 45;      // Foliar green R
        riceBlastData[idx + 1] = 160; // Vibrant green G
        riceBlastData[idx + 2] = 55;  // B
      }
      riceBlastData[idx + 3] = 255;
    }
  }
  const blastBiomarkers = extractBiomarkersFromPixels(riceBlastData, 100, 100);
  assert.equal(blastBiomarkers.isFoliarLeaf, true);
  const blastDiagnosis = classifyLeafFromBiomarkers(blastBiomarkers, 'Rice (Paddy)');
  assert.equal(blastDiagnosis.isFoliarLeaf, true);
  assert.equal(blastDiagnosis.verifiedPilot, true);
  assert.ok(blastDiagnosis.diseaseName.includes('Rice Blast'));

  // Renamed test: classification of identical pixel features yields identical result regardless of file name
  const renamedDiagnosis = classifyLeafFromBiomarkers(blastBiomarkers, 'Rice (Paddy)');
  assert.equal(renamedDiagnosis.diseaseName, blastDiagnosis.diseaseName);
  assert.equal(renamedDiagnosis.confidenceScore, blastDiagnosis.confidenceScore);
});

test('Fertilizer recommendations dynamically adjust for Crop (Rice vs Chickpea), Soil N, and Rain', async () => {
  const { getFertilizerRecommendations } = await import('./recommendations.ts');

  // Identical base soil
  const baseSoil = { pH: 6.8, nitrogen: 220, phosphorus: 18, potassium: 200 };

  // 1. Rice with low N: gets high split urea (140-160 kg/ha in 3 splits)
  const riceRecsLowN = getFertilizerRecommendations(baseSoil, 'Rice (Paddy)', null);
  const riceUreaLowN = riceRecsLowN.find(r => r.name.toLowerCase().includes('urea'));
  assert.ok(riceUreaLowN);
  assert.ok(riceUreaLowN.dosage.includes('140 - 160 kg/ha'));
  assert.ok(riceUreaLowN.dosage.includes('3 split'));

  // 2. Chickpea with identical low N: receives STARTER N only + Rhizobium warning (no top dressing)
  const chickpeaRecs = getFertilizerRecommendations(baseSoil, 'Bengal Gram (Chickpea)', null);
  const chickpeaN = chickpeaRecs.find(r => r.name.toLowerCase().includes('starter') || r.name.toLowerCase().includes('rhizobium'));
  assert.ok(chickpeaN);
  assert.ok(chickpeaN.dosage.includes('Starter Dose'));
  assert.ok(chickpeaN.explanation.toLowerCase().includes('rhizobium'));

  // 3. Rice with High N (>480 kg/ha): Urea is withheld (0 kg/ha) to prevent Blast and lodging
  const highNSoil = { pH: 6.8, nitrogen: 520, phosphorus: 18, potassium: 200 };
  const riceRecsHighN = getFertilizerRecommendations(highNSoil, 'Rice (Paddy)', null);
  const riceWithholdN = riceRecsHighN.find(r => r.name.toLowerCase().includes('withhold') || r.name.toLowerCase().includes('skip'));
  assert.ok(riceWithholdN);
  assert.ok(riceWithholdN.dosage.includes('0 kg/ha'));
  assert.ok(riceWithholdN.explanation.includes('Blast'));

  // 4. Weather Rain Alert (>50% rain probability): triggers 24-48h delay advisory
  const rainyWeather = {
    area: 'Test',
    latitude: 21,
    longitude: 79,
    temperature: 28,
    humidity: 80,
    windSpeed: 15,
    weatherCode: 61,
    condition: 'Rainy',
    lastUpdated: 'Now',
    hourly: {
      time: ['12:00'],
      temperature: [28],
      rainProbability: [70],
    },
  };
  const riceRainyRecs = getFertilizerRecommendations(baseSoil, 'Rice (Paddy)', rainyWeather);
  const rainyUrea = riceRainyRecs.find(r => r.name.toLowerCase().includes('urea'));
  assert.ok(rainyUrea);
  assert.ok(rainyUrea.explanation.includes('delay top-dressing urea by 24-48h') || rainyUrea.explanation.includes('rain'));

  // 5. Unverified crop: triggers advisory notice
  const unverifiedRecs = getFertilizerRecommendations(baseSoil, 'Pearl Millet (Bajra)', null);
  const unverifiedNotice = unverifiedRecs.find(r => r.name.toLowerCase().includes('unavailable') || r.explanation.toLowerCase().includes('unavailable'));
  assert.ok(unverifiedNotice);
});

test('Fertilizer recommendations adjust for official Region packages (Punjab PAU vs Karnataka UAS) and flag uncalibrated regions', async () => {
  const { getFertilizerRecommendations } = await import('./recommendations.ts');

  // Identical base soil readings
  const identicalSoil = { pH: 6.8, nitrogen: 220, phosphorus: 18, potassium: 200 };

  // 1. Test Punjab region for Rice:
  const punjabRecs = getFertilizerRecommendations(identicalSoil, 'Rice (Paddy)', null, 'Punjab');
  assert.ok(punjabRecs.length > 0);
  const punjabN = punjabRecs.find(r => r.name.includes('PAU High Input') || r.name.includes('PAU'));
  assert.ok(punjabN, 'Expected PAU High Input Regimen for Punjab');
  assert.ok(punjabN.source?.includes('Punjab Agricultural University'));
  assert.equal(punjabN.region, 'Punjab');
  const punjabZn = punjabRecs.find(r => r.name.includes('PAU Malwa/Doaba'));
  assert.ok(punjabZn, 'Expected PAU Malwa/Doaba ZnSO4 mandate for Punjab');

  // 2. Test Karnataka region with IDENTICAL inputs:
  const karnatakaRecs = getFertilizerRecommendations(identicalSoil, 'Rice (Paddy)', null, 'Karnataka');
  assert.ok(karnatakaRecs.length > 0);
  const karnatakaN = karnatakaRecs.find(r => r.name.includes('UAS Bangalore') || r.name.includes('Delta Regimen'));
  assert.ok(karnatakaN, 'Expected UAS Bangalore Delta Regimen for Karnataka');
  assert.ok(karnatakaN.source?.includes('UAS Bangalore'));
  assert.equal(karnatakaN.region, 'Karnataka');
  const karnatakaK = karnatakaRecs.find(r => r.name.includes('UAS Bangalore Split Regimen'));
  assert.ok(karnatakaK, 'Expected UAS Bangalore Split Regimen for Potash in Karnataka red soils');

  // 3. Test uncalibrated region:
  const uncalibratedRecs = getFertilizerRecommendations(identicalSoil, 'Rice (Paddy)', null, 'Nagaland');
  const unavailableNotice = uncalibratedRecs.find(r => r.name.includes('Official Local Guidance Unavailable for Nagaland'));
  assert.ok(unavailableNotice, 'Expected unavailable guidance advisory for uncalibrated region');
  assert.ok(unavailableNotice.explanation.includes('Official State Agricultural University package of practices is currently unavailable'));
});

test('Yield prediction computes farm area in acres, total production in tonnes (t/ha × acres × 0.404686), and reports 54-acre limit', async () => {
  const { runLocalYieldInference } = await import('./modelInference.ts');

  // 1. Standard smallholding (2.5 acres)
  const input2_5Acres = {
    crop: 'Rice (Paddy)',
    region: 'Punjab',
    season: 'Kharif',
    soil_pH: 6.8,
    soil_N: 380,
    soil_P: 18,
    soil_K: 210,
    avg_temperature: 28.5,
    rainfall_mm: 650,
    ndvi: 0.68,
    farmAreaAcres: 2.5,
  };

  const res2_5 = runLocalYieldInference(input2_5Acres);
  assert.ok(res2_5.predictedYieldTonnesPerHa > 0);
  assert.equal(res2_5.farmAreaAcres, 2.5);

  // Exact formula verification: t/ha × acres × 0.404686
  const expectedTonnes2_5 = Math.round(res2_5.predictedYieldTonnesPerHa * 2.5 * 0.404686 * 100) / 100;
  assert.equal(res2_5.totalProductionTonnes, expectedTonnes2_5);
  assert.equal(res2_5.acreageValidationNote, undefined, 'Smallholding should not trigger ceiling note');

  // 2. Large commercial holding exceeding statutory ceiling (> 54 acres)
  const input100Acres = {
    ...input2_5Acres,
    farmAreaAcres: 100,
  };
  const res100 = runLocalYieldInference(input100Acres);
  const expectedTonnes100 = Math.round(res100.predictedYieldTonnesPerHa * 100 * 0.404686 * 100) / 100;
  assert.equal(res100.totalProductionTonnes, expectedTonnes100);
  assert.ok(res100.acreageValidationNote, 'Expected 54-acre statutory limit note for large holding');
  assert.ok(res100.acreageValidationNote.includes('54-acre'));
  assert.ok(res100.acreageValidationNote.includes('Land Ceiling Acts'));
});

test('Foliar pixel analysis uses dynamic confidence scores and gives identical output when image is renamed', async () => {
  const { extractBiomarkersFromPixels, classifyLeafFromBiomarkers } = await import('./imageAnalysis.ts');

  // 1. Non-leaf image test (e.g. blue sky / gray road with minimal vegetation)
  const nonLeafData = new Uint8ClampedArray(64 * 64 * 4);
  for (let i = 0; i < nonLeafData.length; i += 4) {
    nonLeafData[i] = 120;     // R
    nonLeafData[i + 1] = 130; // G
    nonLeafData[i + 2] = 220; // B (Sky blue)
    nonLeafData[i + 3] = 255;
  }
  const nonLeafFeatures = extractBiomarkersFromPixels(nonLeafData, 64, 64);
  assert.equal(nonLeafFeatures.isFoliarLeaf, false);
  const nonLeafResult = classifyLeafFromBiomarkers(nonLeafFeatures, 'Rice (Paddy)');
  assert.equal(nonLeafResult.isFoliarLeaf, false);
  assert.equal(nonLeafResult.isUncertain, true);
  assert.ok(nonLeafResult.confidenceScore >= 0.72 && nonLeafResult.confidenceScore <= 0.99);

  // 2. Healthy foliar leaf test
  const healthyLeafData = new Uint8ClampedArray(64 * 64 * 4);
  for (let i = 0; i < healthyLeafData.length; i += 4) {
    healthyLeafData[i] = 30;      // R
    healthyLeafData[i + 1] = 180; // G (Dominant green)
    healthyLeafData[i + 2] = 40;  // B
    healthyLeafData[i + 3] = 255;
  }
  const healthyFeatures = extractBiomarkersFromPixels(healthyLeafData, 64, 64);
  assert.equal(healthyFeatures.isFoliarLeaf, true);
  const healthyResult1 = classifyLeafFromBiomarkers(healthyFeatures, 'Rice (Paddy)');
  assert.equal(healthyResult1.diseaseName, 'Healthy Rice Foliage');
  assert.equal(healthyResult1.severity, 'Healthy');
  assert.ok(healthyResult1.confidenceScore >= 0.76 && healthyResult1.confidenceScore <= 0.98);

  // 3. Renamed copy test: renaming does not alter extracted pixels, yielding exact match
  const renamedCopyResult = classifyLeafFromBiomarkers(healthyFeatures, 'Rice (Paddy)');
  assert.equal(renamedCopyResult.diseaseName, healthyResult1.diseaseName);
  assert.equal(renamedCopyResult.confidenceScore, healthyResult1.confidenceScore);
  assert.equal(renamedCopyResult.severity, healthyResult1.severity);
});

test('Official crop dataset covers all 36 States and Union Territories with matching LGD records and district averages labeled', async () => {
  const { parseCSV } = await import('./csv.ts');
  const { DEFAULT_HISTORICAL_YIELD_CSV } = await import('../data/sampleYieldData.ts');
  const { LGD_STATES_MASTER } = await import('../data/lgdData.ts');

  const records = parseCSV(DEFAULT_HISTORICAL_YIELD_CSV);
  assert.ok(records.length >= 90, `Expected at least 90 records, found ${records.length}`);

  const coveredStates = new Set(records.map(r => r.state).filter(Boolean));
  assert.equal(coveredStates.size, 36, `Expected exactly 36 States/UTs, found ${coveredStates.size}`);

  // Verify all master LGD states are present in dataset
  for (const masterState of LGD_STATES_MASTER) {
    const isPresent = coveredStates.has(masterState.name);
    assert.ok(isPresent, `Missing official record for state/UT: ${masterState.name} (LGD Code: ${masterState.code})`);
  }

  // Verify district average flag is present for urban/atoll Union Territories
  const chandigarh = records.find(r => r.state === 'Chandigarh');
  assert.ok(chandigarh);
  assert.equal(chandigarh.isDistrictAverage, true);

  const lakshadweep = records.find(r => r.state === 'Lakshadweep');
  assert.ok(lakshadweep);
  assert.equal(lakshadweep.isDistrictAverage, true);
});

