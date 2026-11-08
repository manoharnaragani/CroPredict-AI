import type { ApiRequest, ApiResponse } from '../_types.ts';
import { handleModelStatus } from '../../src/server/predictionHandlers.ts';

export default function handler(_req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  try {
    const result = handleModelStatus();
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Status check failed' });
  }
}
