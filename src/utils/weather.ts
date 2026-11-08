import { WeatherData } from '../types/index.ts';

export const POPULAR_INDIAN_FARM_HUBS = [
  { name: 'Nagpur (Maharashtra - Cotton/Orange belt)', lat: 21.1458, lon: 79.0882, state: 'Maharashtra' },
  { name: 'Ludhiana (Punjab - Wheat/Paddy granary)', lat: 30.901, lon: 75.8573, state: 'Punjab' },
  { name: 'Nashik (Maharashtra - Grape/Onion hub)', lat: 19.9975, lon: 73.7898, state: 'Maharashtra' },
  { name: 'Karnal (Haryana - Basmati/Wheat center)', lat: 29.6857, lon: 76.9905, state: 'Haryana' },
  { name: 'Mandya (Karnataka - Sugarcane/Paddy belt)', lat: 12.5223, lon: 76.8967, state: 'Karnataka' },
  { name: 'Guntur (Andhra Pradesh - Chilli/Tobacco/Cotton)', lat: 16.3067, lon: 80.4365, state: 'Andhra Pradesh' },
  { name: 'Varanasi (Uttar Pradesh - Gangetic Plains)', lat: 25.3176, lon: 82.9739, state: 'Uttar Pradesh' },
  { name: 'Indore (Madhya Pradesh - Soybean/Wheat)', lat: 22.7196, lon: 75.8577, state: 'Madhya Pradesh' },
  { name: 'Rajkot (Gujarat - Groundnut/Cotton)', lat: 22.3039, lon: 70.8022, state: 'Gujarat' },
  { name: 'Bathinda (Punjab - Malwa Cotton/Wheat belt)', lat: 30.211, lon: 74.9455, state: 'Punjab' },
];

export function decodeWMOWeatherCode(code: number): { condition: string; iconType: string } {
  switch (code) {
    case 0:
      return { condition: 'Clear Sky', iconType: 'sun' };
    case 1:
      return { condition: 'Mainly Clear', iconType: 'sun-cloud' };
    case 2:
      return { condition: 'Partly Cloudy', iconType: 'cloud-sun' };
    case 3:
      return { condition: 'Overcast', iconType: 'cloud' };
    case 45:
    case 48:
      return { condition: 'Fog / Mist', iconType: 'fog' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Drizzle', iconType: 'drizzle' };
    case 61:
      return { condition: 'Slight Rain', iconType: 'rain-light' };
    case 63:
      return { condition: 'Moderate Rain', iconType: 'rain' };
    case 65:
      return { condition: 'Heavy Rain', iconType: 'rain-heavy' };
    case 71:
    case 73:
    case 75:
      return { condition: 'Hail / Snow Flurries', iconType: 'snow' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Rain Showers', iconType: 'showers' };
    case 95:
    case 96:
    case 99:
      return { condition: 'Thunderstorm', iconType: 'thunderstorm' };
    default:
      return { condition: 'Fair Weather', iconType: 'sun' };
  }
}

export interface ReverseGeocodeResult {
  village?: string;
  town?: string;
  subdistrict?: string;
  district?: string;
  state?: string;
  country?: string;
  formattedName: string;
}

/**
 * Reverse geocode coordinates to find detailed village, town, district, and state
 */
export async function reverseGeocodeLocation(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=14&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
      },
      signal: AbortSignal.timeout(3800),
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address;
      if (addr) {
        const village = addr.village || addr.hamlet || addr.suburb;
        const town = addr.town || addr.city_district || addr.city;
        const subdistrict = addr.county || addr.subdistrict;
        const district = addr.state_district || addr.county || addr.city;
        const state = addr.state;
        const country = addr.country;

        const mainLoc = village || town || subdistrict || district || 'Field Location';
        const formattedName = [mainLoc, district, state].filter(Boolean).join(', ');

        return {
          village,
          town,
          subdistrict,
          district,
          state,
          country,
          formattedName,
        };
      }
    }
  } catch {
    // fallback gracefully
  }
  return null;
}

export async function reverseGeocodeVillage(latitude: number, longitude: number): Promise<string | null> {
  const result = await reverseGeocodeLocation(latitude, longitude);
  return result ? result.formattedName : null;
}

/**
 * Fetch live weather from Open-Meteo with optional location details
 */
export async function fetchLiveWeather(
  latitude: number,
  longitude: number,
  customAreaName?: string,
  explicitLocationDetails?: Partial<WeatherData['locationDetails']>
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability&timezone=auto&forecast_days=2`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo API returned status ${res.status}`);
  }

  const data = await res.json();
  const current = data.current;
  const hourly = data.hourly;

  const currentIsoTime = current.time;
  let startIndex = 0;
  if (hourly.time && hourly.time.length > 0) {
    const idx = hourly.time.findIndex((t: string) => t >= currentIsoTime);
    if (idx !== -1) startIndex = idx;
  }

  const next24Times = hourly.time.slice(startIndex, startIndex + 24).map((iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return iso.split('T')[1]?.slice(0, 5) || iso;
    }
  });

  const next24Temps = hourly.temperature_2m.slice(startIndex, startIndex + 24);
  const next24RainProbs = hourly.precipitation_probability.slice(startIndex, startIndex + 24);

  // If area name not passed, reverse lookup village/town or use closest known hub
  let areaName = customAreaName;
  let resolvedGeoDetails = explicitLocationDetails;

  if (!areaName) {
    try {
      const geo = await reverseGeocodeLocation(latitude, longitude);
      if (geo) {
        areaName = geo.formattedName;
        resolvedGeoDetails = {
          village: geo.village,
          town: geo.town,
          subdistrict: geo.subdistrict,
          district: geo.district,
          state: geo.state,
          country: geo.country,
          latitude,
          longitude,
          source: explicitLocationDetails?.source || 'manual',
          resolvedName: geo.formattedName,
          accuracyMeters: explicitLocationDetails?.accuracyMeters,
        };
      } else {
        let closestDist = Infinity;
        let closestName = `Farm (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`;
        for (const hub of POPULAR_INDIAN_FARM_HUBS) {
          const d = Math.hypot(hub.lat - latitude, hub.lon - longitude);
          if (d < closestDist && d < 0.6) {
            closestDist = d;
            closestName = hub.name;
          }
        }
        areaName = closestName;
      }
    } catch {
      areaName = `Farm (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`;
    }
  }

  const weatherCode = current.weather_code ?? 0;
  const decoded = decodeWMOWeatherCode(weatherCode);

  return {
    area: areaName,
    latitude,
    longitude,
    temperature: Math.round(current.temperature_2m * 10) / 10,
    humidity: Math.round(current.relative_humidity_2m),
    windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
    weatherCode,
    condition: decoded.condition,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
    locationDetails: resolvedGeoDetails ? {
      latitude,
      longitude,
      source: resolvedGeoDetails.source || 'default',
      resolvedName: areaName,
      village: resolvedGeoDetails.village,
      town: resolvedGeoDetails.town,
      mandi: resolvedGeoDetails.mandi,
      subdistrict: resolvedGeoDetails.subdistrict,
      district: resolvedGeoDetails.district,
      state: resolvedGeoDetails.state,
      country: resolvedGeoDetails.country,
      accuracyMeters: resolvedGeoDetails.accuracyMeters,
    } : undefined,
    hourly: {
      time: next24Times,
      temperature: next24Temps,
      rainProbability: next24RainProbs,
    },
  };
}

/**
 * Search village/town/mandi using Open-Meteo Geocoding
 */
export async function searchVillagesAndTowns(
  query: string
): Promise<{ name: string; admin1?: string; country?: string; latitude: number; longitude: number }[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query.trim()
    )}&count=8&language=en&format=json`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const json = await res.json();
    if (!json.results) return [];

    return json.results.map((r: any) => ({
      name: r.name,
      admin1: r.admin1 || r.country,
      country: r.country,
      latitude: r.latitude,
      longitude: r.longitude,
    }));
  } catch {
    return [];
  }
}
