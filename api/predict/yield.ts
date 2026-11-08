import type { ApiRequest, ApiResponse } from '../_types.ts';
import { handlePredictYield } from '../../src/server/predictionHandlers.ts';

export default function handler(req: ApiRequest, res: ApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const payload = req.method === 'GET' ? req.query : req.body;
    const result = handlePredictYield(payload || {});
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Yield prediction failed' });
  }
}
