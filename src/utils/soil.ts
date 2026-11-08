import { SoilAssessment, SoilData } from '../types/index.ts';

// Standard Indian Soil Health Card (SHC) reference ranges:
export const SHC_THRESHOLDS = {
  pH: {
    stronglyAcidicMax: 5.5,
    moderatelyAcidicMax: 6.5,
    optimalMin: 6.5,
    optimalMax: 7.5,
    moderatelyAlkalineMax: 8.5,
  },
  nitrogen: {
    unit: 'kg/ha',
    lowMax: 280,
    mediumMax: 560,
    optimalTarget: 420,
  },
  phosphorus: {
    unit: 'kg/ha',
    lowMax: 10,
    mediumMax: 25,
    optimalTarget: 20,
  },
  potassium: {
    unit: 'kg/ha',
    lowMax: 110,
    mediumMax: 280,
    optimalTarget: 220,
  },
};

export function assessSoil(soil: SoilData): SoilAssessment {
  const { pH, nitrogen, phosphorus, potassium } = soil;

  // 1. pH evaluation
  let pHStatus: SoilAssessment['pHStatus'] = 'Neutral (Optimal)';
  let pHRating: SoilAssessment['pHRating'] = 'optimal';

  if (pH < SHC_THRESHOLDS.pH.stronglyAcidicMax) {
    pHStatus = 'Very Acidic';
    pHRating = 'low';
  } else if (pH < SHC_THRESHOLDS.pH.moderatelyAcidicMax) {
    pHStatus = 'Moderately Acidic';
    pHRating = 'low';
  } else if (pH <= SHC_THRESHOLDS.pH.optimalMax) {
    pHStatus = 'Neutral (Optimal)';
    pHRating = 'optimal';
  } else if (pH <= SHC_THRESHOLDS.pH.moderatelyAlkalineMax) {
    pHStatus = 'Moderately Alkaline';
    pHRating = 'high';
  } else {
    pHStatus = 'Strongly Alkaline';
    pHRating = 'high';
  }

  // 2. Nitrogen status
  let nitrogenStatus: 'Low' | 'Medium' | 'High' = 'Medium';
  if (nitrogen < SHC_THRESHOLDS.nitrogen.lowMax) {
    nitrogenStatus = 'Low';
  } else if (nitrogen > SHC_THRESHOLDS.nitrogen.mediumMax) {
    nitrogenStatus = 'High';
  }

  // 3. Phosphorus status
  let phosphorusStatus: 'Low' | 'Medium' | 'High' = 'Medium';
  if (phosphorus < SHC_THRESHOLDS.phosphorus.lowMax) {
    phosphorusStatus = 'Low';
  } else if (phosphorus > SHC_THRESHOLDS.phosphorus.mediumMax) {
    phosphorusStatus = 'High';
  }

  // 4. Potassium status
  let potassiumStatus: 'Low' | 'Medium' | 'High' = 'Medium';
  if (potassium < SHC_THRESHOLDS.potassium.lowMax) {
    potassiumStatus = 'Low';
  } else if (potassium > SHC_THRESHOLDS.potassium.mediumMax) {
    potassiumStatus = 'High';
  }

  // Deficits relative to optimal targets
  const nDeficit = Math.max(0, SHC_THRESHOLDS.nitrogen.optimalTarget - nitrogen);
  const pDeficit = Math.max(0, SHC_THRESHOLDS.phosphorus.optimalTarget - phosphorus);
  const kDeficit = Math.max(0, SHC_THRESHOLDS.potassium.optimalTarget - potassium);

  // Health score (0 - 100)
  let score = 100;
  if (pHRating !== 'optimal') {
    const diff = Math.abs(pH - 7.0);
    score -= Math.min(30, diff * 12);
  }
  if (nitrogenStatus === 'Low') score -= 20;
  else if (nitrogenStatus === 'High') score -= 8;

  if (phosphorusStatus === 'Low') score -= 18;
  else if (phosphorusStatus === 'High') score -= 6;

  if (potassiumStatus === 'Low') score -= 18;
  else if (potassiumStatus === 'High') score -= 6;

  score = Math.max(10, Math.min(100, Math.round(score)));

  // Diagnostic summary
  let summary = '';
  if (score >= 80) {
    summary = 'Soil fertility is well-balanced with optimal pH and adequate primary macronutrients.';
  } else if (score >= 60) {
    summary = `Soil is moderately fertile. Noticeable deficit in ${[
      nitrogenStatus === 'Low' ? 'Nitrogen (N)' : '',
      phosphorusStatus === 'Low' ? 'Phosphorus (P)' : '',
      potassiumStatus === 'Low' ? 'Potassium (K)' : '',
      pHRating !== 'optimal' ? 'pH balance' : '',
    ].filter(Boolean).join(', ')}.`;
  } else {
    summary = `Critical nutrient depletion detected. Soil needs corrective soil amendment and tailored N-P-K replenishment before next sowing.`;
  }

  return {
    pHStatus,
    pHRating,
    nitrogenStatus,
    phosphorusStatus,
    potassiumStatus,
    overallHealthScore: score,
    summary,
    deficits: {
      nDeficit,
      pDeficit,
      kDeficit,
    },
  };
}
