import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  handlePredictYield,
  handleDetectDisease,
  handleModelStatus,
  handleSmartOptimization,
} from './src/server/predictionHandlers.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS & Preflight handling for all /api routes
app.use('/api', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// --- API Endpoints ---

// 1. Model Status & Diagnostics
app.get('/api/models/status', (_req, res) => {
  try {
    const status = handleModelStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to retrieve model status' });
  }
});

// 2. Smart Optimization Results (Pareto frontier & feature selection)
app.get('/api/smart-optimization', (_req, res) => {
  try {
    const data = handleSmartOptimization();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to retrieve optimization data' });
  }
});

// 3. Crop Yield Prediction Endpoint (CNN-BiGRU + PSO-NSPSO)
// Supports both POST (full inputs) and GET (quick test / schema)
app.post('/api/predict/yield', (req, res) => {
  try {
    const result = handlePredictYield(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Yield prediction failed' });
  }
});

app.get('/api/predict/yield', (req, res) => {
  try {
    // Allows query params or returns calibrated reference test prediction
    const queryInputs = Object.keys(req.query).length > 0 ? req.query : undefined;
    const result = handlePredictYield(queryInputs || {
      crop: 'Rice (Paddy)',
      region: 'Punjab',
      season: 'Kharif',
      soil_N: 380,
      soil_P: 22,
      soil_K: 210,
      soil_pH: 7.2,
      avg_temperature: 28.5,
      rainfall_mm: 650,
      ndvi: 0.72,
      farm_area_acres: 2.5,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Yield prediction failed' });
  }
});

// 4. Foliar Disease Detection Endpoint (CNN-BiGRU + PSO-NSPSO)
// Supports both POST (image/pixels) and GET (quick test / schema)
app.post('/api/detect/disease', (req, res) => {
  try {
    const result = handleDetectDisease(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Disease detection failed' });
  }
});

app.get('/api/detect/disease', (req, res) => {
  try {
    const query = req.query || {};
    const crop = typeof query.crop === 'string' ? query.crop : 'Rice (Paddy)';
    const sampleId = typeof query.sampleId === 'string' ? query.sampleId : 'rice-blast';
    const result = handleDetectDisease({ crop, sampleId });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Disease detection failed' });
  }
});

// Mount Vite middleware for dev or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CroPredict AI server running at http://0.0.0.0:${PORT}`);
  });
}

// Only auto-listen if run as main script (allows serverless import)
if (process.env.VERCEL !== '1') {
  startServer();
}

export default app;
