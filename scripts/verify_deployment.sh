#!/usr/bin/env bash
# Production & Local Deployment Verification Script
# Verifies GET /api/models/status, POST /api/predict/yield, and POST /api/detect/disease directly

set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
echo "=========================================================="
echo "CroPredict AI: Verifying API Endpoints on $BASE_URL"
echo "=========================================================="

FAILED=0

# 1. GET /api/models/status
echo "[1/3] Testing GET /api/models/status..."
STATUS_HTTP=$(curl -s -o /tmp/status_res.json -w "%{http_code}" "$BASE_URL/api/models/status")
echo "      HTTP Status: $STATUS_HTTP"
cat /tmp/status_res.json
echo ""

if [ "$STATUS_HTTP" -ne 200 ]; then
  echo "[-] FAILED: /api/models/status returned HTTP $STATUS_HTTP (expected 200)"
  FAILED=1
else
  # Verify both models are present
  YIELD_NAME=$(node -e "const d=require('/tmp/status_res.json'); console.log(d.models?.yield?.modelName || '')")
  DISEASE_NAME=$(node -e "const d=require('/tmp/status_res.json'); console.log(d.models?.disease?.modelName || '')")
  if [ -n "$YIELD_NAME" ] && [ -n "$DISEASE_NAME" ]; then
    echo "[+] SUCCESS: Both models reported ready:"
    echo "    - Yield Model: $YIELD_NAME"
    echo "    - Disease Model: $DISEASE_NAME"
  else
    echo "[-] FAILED: Missing model details in status response"
    FAILED=1
  fi
fi

# 2. POST /api/predict/yield
echo "[2/3] Testing POST /api/predict/yield..."
YIELD_PAYLOAD='{"crop":"Rice (Paddy)","region":"Punjab","season":"Kharif","soil_N":340,"soil_P":18,"soil_K":210,"rainfall_mm":650,"avg_temperature":28.0,"farm_area_acres":2.5}'
YIELD_HTTP=$(curl -s -o /tmp/yield_res.json -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "$YIELD_PAYLOAD" \
  "$BASE_URL/api/predict/yield")
echo "      HTTP Status: $YIELD_HTTP"
cat /tmp/yield_res.json
echo ""

if [ "$YIELD_HTTP" -ne 200 ]; then
  echo "[-] FAILED: /api/predict/yield returned HTTP $YIELD_HTTP (expected 200)"
  FAILED=1
else
  PRED_YIELD=$(node -e "const d=require('/tmp/yield_res.json'); console.log(d.predictedYieldTonnesPerHa ?? '')")
  if [ -n "$PRED_YIELD" ] && [ "$PRED_YIELD" != "undefined" ]; then
    echo "[+] SUCCESS: Predicted yield returned: $PRED_YIELD t/ha"
  else
    echo "[-] FAILED: /api/predict/yield did not return numeric predictedYieldTonnesPerHa"
    FAILED=1
  fi
fi

# 3. POST /api/detect/disease
echo "[3/3] Testing POST /api/detect/disease with real leaf photo biomarkers..."
DISEASE_PAYLOAD='{"crop":"Rice (Paddy)","sampleId":"rice-blast","pixelFeatures":{"isFoliarLeaf":true,"vegetativeRatio":0.62,"meanHue":0.24,"meanSaturation":0.65,"meanValue":0.58,"greenChlorophyllRatio":1.15,"brownNecrosisRatio":0.125,"yellowChlorosisRatio":0.055,"glcmContrast":0.48,"lesionCountPerCm2":7,"meanLesionEccentricity":0.82,"waterSoakedMarginScore":0.15,"exgVegetationIndex":0.28,"veinThickeningIndex":0.04,"leafEdgeCurlAngle":5.0,"concentricRingScore":0.08}}'
DISEASE_HTTP=$(curl -s -o /tmp/disease_res.json -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "$DISEASE_PAYLOAD" \
  "$BASE_URL/api/detect/disease")
echo "      HTTP Status: $DISEASE_HTTP"
cat /tmp/disease_res.json
echo ""

if [ "$DISEASE_HTTP" -ne 200 ]; then
  echo "[-] FAILED: /api/detect/disease returned HTTP $DISEASE_HTTP (expected 200)"
  FAILED=1
else
  DISEASE_NAME=$(node -e "const d=require('/tmp/disease_res.json'); console.log(d.diseaseName || '')")
  CONFIDENCE=$(node -e "const d=require('/tmp/disease_res.json'); console.log(d.confidenceScore ?? '')")
  if [ -n "$DISEASE_NAME" ]; then
    echo "[+] SUCCESS: Foliar disease diagnosed: $DISEASE_NAME (Confidence: $CONFIDENCE)"
  else
    echo "[-] FAILED: Missing diseaseName in disease detection response"
    FAILED=1
  fi
fi

echo "=========================================================="
if [ "$FAILED" -eq 0 ]; then
  echo "[+] ALL 3 API CHECKS PASSED WITH HTTP 200 OK!"
  exit 0
else
  echo "[-] ONE OR MORE CHECKS FAILED."
  exit 1
fi
