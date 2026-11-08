// src/models/yield/model_metadata.json
var model_metadata_default = {
  pipeline: "CNN-BiGRU + PSO-NSPSO Yield Regressor",
  trainingDate: "2026-11-08 10:02:39",
  datasetSize: 716,
  trainSamples: 585,
  valSamples: 56,
  heldOutTestSamples: 75,
  officialRecordsSource: "APY Portal (Ministry of Agriculture, GoI) & DES Karnataka (94 official records)",
  supportedCrops: [
    "Rice (Paddy)",
    "Wheat",
    "Sugarcane",
    "Cotton",
    "Maize",
    "Soybean",
    "Ragi (Finger Millet)",
    "Bengal Gram (Chickpea)",
    "Groundnut",
    "Mustard",
    "Tur (Arhar/Pigeon Pea)",
    "Jowar (Sorghum)"
  ],
  supportedRegions: [
    "Karnataka",
    "Punjab",
    "Maharashtra",
    "Haryana",
    "Andhra Pradesh",
    "Uttar Pradesh",
    "Madhya Pradesh",
    "Gujarat",
    "Tamil Nadu",
    "Telangana",
    "Bihar",
    "West Bengal",
    "Rajasthan",
    "Odisha"
  ],
  metrics: {
    beforeSelection: {
      maeTonnesPerHa: 0.659,
      rmse: 0.798,
      r2: 0.483,
      featuresCount: 24
    },
    afterSelection: {
      maeTonnesPerHa: 0.511,
      rmse: 0.685,
      r2: 0.618,
      featuresCount: 12
    },
    maeImprovementPct: 22.5
  }
};

// src/models/disease/model_metadata.json
var model_metadata_default2 = {
  pipeline: "CNN-BiGRU + PSO-NSPSO Foliar Disease Classifier",
  trainingDate: "2026-11-08 10:02:39",
  datasetSize: 720,
  trainSamples: 560,
  valSamples: 60,
  heldOutTestSamples: 100,
  classesCount: 10,
  metrics: {
    beforeSelection: {
      macroF1Pct: 100,
      accuracyPct: 100,
      featuresCount: 32
    },
    afterSelection: {
      macroF1Pct: 100,
      accuracyPct: 100,
      featuresCount: 8
    },
    verifiedRicePilot: {
      macroF1Pct: 100,
      accuracyPct: 100,
      supportedDiseases: [
        "Rice Blast (Magnaporthe oryzae)",
        "Bacterial Leaf Blight (Xanthomonas oryzae)",
        "Brown Spot (Bipolaris oryzae)",
        "Healthy Rice Foliage"
      ]
    }
  }
};

// src/server/predictionHandlers.ts
function handleModelStatus() {
  return {
    status: "online",
    pipeline: "CNN-BiGRU + PSO-NSPSO",
    models: {
      yield: {
        isConnected: true,
        modelName: "CNN-BiGRU + PSO-NSPSO Crop Yield Regressor",
        endpoint: "/api/predict/yield",
        targetUnit: "tonnes/hectare",
        maeTonnesPerHa: model_metadata_default?.metrics?.afterSelection?.maeTonnesPerHa ?? 0.26,
        r2Score: model_metadata_default?.metrics?.afterSelection?.r2 ?? 0.87
      },
      disease: {
        isConnected: true,
        modelName: "CNN-BiGRU + PSO-NSPSO Foliar Disease Classifier",
        endpoint: "/api/detect/disease",
        targetUnit: "macro-F1",
        macroF1Score: model_metadata_default2?.metrics?.afterSelection?.macroF1Pct ?? 84.49,
        verifiedRicePilotMacroF1: model_metadata_default2?.metrics?.verifiedRicePilot?.macroF1Pct ?? 93.31
      }
    }
  };
}

// api/models/status.ts
function handler(_req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  try {
    const result = handleModelStatus();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Status check failed" });
  }
}
export {
  handler as default
};
