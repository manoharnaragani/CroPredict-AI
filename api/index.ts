import type { ApiRequest, ApiResponse } from './_types.ts';
import {
  handlePredictYield,
  handleDetectDisease,
  handleModelStatus,
  handleSmartOptimization,
} from '../src/server/predictionHandlers.ts';

export default function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';

  if (url.includes('/predict/yield')) {
    const payload = req.method === 'GET' ? req.query : req.body;
    return res.status(200).json(handlePredictYield(payload || {}));
  }

  if (url.includes('/detect/disease')) {
    const payload = req.method === 'GET' ? req.query : req.body;
    return res.status(200).json(handleDetectDisease(payload || {}));
  }

  if (url.includes('/models/status')) {
    return res.status(200).json(handleModelStatus());
  }

  if (url.includes('/smart-optimization')) {
    return res.status(200).json(handleSmartOptimization());
  }

  return res.status(200).json({
    status: 'online',
    pipeline: 'CNN-BiGRU + PSO-NSPSO',
    endpoints: {
      yield: '/api/predict/yield',
      disease: '/api/detect/disease',
      status: '/api/models/status',
      smartOptimization: '/api/smart-optimization',
    },
  });
}
