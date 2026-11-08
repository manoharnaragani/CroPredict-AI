
# CroPredict AI

CroPredict AI helps farmers in India answer three questions in one dashboard: **What weather is coming to my field? How has my crop performed in this region? What does my soil test suggest?** Open the Overview for local weather and a yield summary, then use the sidebar to explore the underlying forecast, records, or recommendations.

## Explore the dashboard

| Open | What you can do |
| --- | --- |
| **Weather** | Allow location access or search for the farm’s village or town. Check temperature, humidity, wind, and the next 24 hours of temperature and rain probability from Open-Meteo. |
| **Historical Yield** | Explore the bundled sample or import a CSV. Filter by crop and region to compare annual trends and regional yields in tonnes per hectare. |
| **Soil Health** | Enter pH and available nitrogen, phosphorus, and potassium to review nutrient levels and deficits. |
| **Recommendations** | Explore crop suitability and fertilizer suggestions using soil readings and local weather. |
| **Yield Prediction** | Submit crop, location, season, and field measurements to a configured yield model. |
| **Disease Detection** | Upload a leaf photograph and select its host crop to request a classification from a configured disease model. |

English is the default. The header offers the 22 Scheduled Indian languages with English fallback, plus Light, Dark, and System themes. On a phone, open the sidebar with the menu button at the top left.

## How model predictions work

The React dashboard handles input and displays results. The configured prediction services are responsible for running the trained models. The project’s intended architecture uses **CNN-BiGRU for feature extraction** and **PSO-NSPSO for feature selection**. During inference, each service applies the feature selection saved during training.

| Task | Request | Model output |
| --- | --- | --- |
| Crop yield | JSON containing crop and field measurements | A regression estimate in tonnes per hectare |
| Leaf disease | Multipart form containing a leaf image and crop name | A disease class and classifier score |

**Connection status:** Both endpoint URLs are empty by default. Open **Settings**, enter the endpoint for each available service, save, and submit a sample. Each task records its own successful connection. With an endpoint or required input missing, the dashboard displays **Model or data required**. The request fields and response validation live in [the prediction client](src/utils/pipeline.ts).

## Run locally

Use Node.js 24 and npm. The current manifest declares an esbuild version outside Vite’s optional peer range, so the install command below uses npm’s compatibility flag.

```sh
git clone https://github.com/manoharnaragani/croPredict-AI.git
cd croPredict-AI
npm install --legacy-peer-deps
npm run dev
```

Open **http://localhost:3000**. To explore the app before configuring a model, open Weather, search for your farm’s town, then open Historical Yield and filter the sample data by crop.

## Check and build

```sh
npm run lint
node --import tsx --test src/utils/*.test.ts
npm run build
npm run preview
```

The lint script checks TypeScript types. Vite writes the production site to `dist/`.

## Deploy to Vercel

Import this GitHub repository into Vercel and select the **Vite** preset. Use the repository root, Node.js **24.x**, install command `npm install --legacy-peer-deps`, build command `npm run build`, and output directory `dist`. Set `main` as the production branch.

After deployment, open the HTTPS site and test both location permission and manual weather search. To enable predictions for that browser, configure reachable HTTPS model endpoints in Settings and allow requests from the deployed site’s origin.

## Code guide

- [Dashboard and shared state](src/App.tsx)
- [Screens and navigation](src/components/)
- [Weather requests and location search](src/utils/weather.ts)
- [Prediction API integration](src/utils/pipeline.ts)
- [Language selection and translations](src/utils/i18n.ts)
