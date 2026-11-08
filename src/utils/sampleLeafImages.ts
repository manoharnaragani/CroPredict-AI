/**
 * Verified Test Leaf Images as Embedded SVG Data URLs
 * Guarantees zero CORS taint when decoded into HTML5 Canvas for pixel biomarker analysis.
 */

// 1. Rice Blast Leaf: Foliar green blade with spindle-shaped brown necrotic lesions & chlorotic margins
export const RICE_BLAST_DATA_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#2d6a4f"/>
  <path d="M20,10 C80,30 120,80 180,190" stroke="#40916c" stroke-width="24" fill="none"/>
  <path d="M10,20 C70,40 130,100 190,180" stroke="#52b788" stroke-width="12" fill="none"/>
  <!-- Spindle / diamond-shaped necrotic blast lesions -->
  <ellipse cx="75" cy="65" rx="22" ry="7" transform="rotate(45 75 65)" fill="#6c3b1e" stroke="#d4a373" stroke-width="3"/>
  <ellipse cx="75" cy="65" rx="14" ry="4" transform="rotate(45 75 65)" fill="#3d1e10"/>
  <ellipse cx="125" cy="120" rx="26" ry="8" transform="rotate(40 125 120)" fill="#6c3b1e" stroke="#d4a373" stroke-width="3"/>
  <ellipse cx="125" cy="120" rx="16" ry="4" transform="rotate(40 125 120)" fill="#3d1e10"/>
  <ellipse cx="155" cy="160" rx="18" ry="6" transform="rotate(48 155 160)" fill="#6c3b1e" stroke="#d4a373" stroke-width="2.5"/>
</svg>`;

// 2. Bacterial Leaf Blight: Foliar green blade with wavy marginal chlorosis and yellow vein-parallel stripes
export const BACTERIAL_BLIGHT_DATA_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#2d6a4f"/>
  <path d="M40,0 C70,60 110,130 160,200" stroke="#52b788" stroke-width="30" fill="none"/>
  <!-- Marginal chlorosis / yellow wavy bleached lesion bands along leaf edges -->
  <path d="M0,0 Q35,70 10,140 Q40,170 50,200" stroke="#eedc5b" stroke-width="26" fill="none"/>
  <path d="M0,0 Q30,60 8,130 Q35,160 45,200" stroke="#cb9b28" stroke-width="12" fill="none"/>
  <path d="M150,0 Q170,70 180,130 Q195,170 200,200" stroke="#eedc5b" stroke-width="24" fill="none"/>
  <path d="M155,0 Q175,65 185,125 Q198,165 200,200" stroke="#b08920" stroke-width="10" fill="none"/>
</svg>`;

// 3. Brown Spot: Foliar green blade with scattered circular/oval necrotic spots
export const BROWN_SPOT_DATA_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#2d6a4f"/>
  <path d="M30,10 C80,40 120,90 170,190" stroke="#52b788" stroke-width="20" fill="none"/>
  <!-- Circular / oval necrotic spots with yellow halo -->
  <circle cx="60" cy="50" r="9" fill="#582f0e" stroke="#ddb892" stroke-width="3"/>
  <circle cx="110" cy="85" r="11" fill="#582f0e" stroke="#ddb892" stroke-width="3.5"/>
  <circle cx="85" cy="130" r="8" fill="#582f0e" stroke="#ddb892" stroke-width="2.5"/>
  <circle cx="145" cy="140" r="10" fill="#582f0e" stroke="#ddb892" stroke-width="3"/>
  <circle cx="130" cy="40" r="7" fill="#582f0e" stroke="#ddb892" stroke-width="2"/>
</svg>`;

// 4. Healthy Rice Leaf: Vibrant chlorophyll green foliar blade with 0 necrotic lesions
export const HEALTHY_RICE_DATA_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#1b4332"/>
  <path d="M20,10 C80,30 120,80 180,190" stroke="#2d6a4f" stroke-width="36" fill="none"/>
  <path d="M20,10 C80,30 120,80 180,190" stroke="#40916c" stroke-width="20" fill="none"/>
  <path d="M20,10 C80,30 120,80 180,190" stroke="#74c69d" stroke-width="6" fill="none"/>
</svg>`;

// 5. Non-Leaf Image: Metallic gray/blue geometric pattern with 0% foliar vegetation
export const NON_LEAF_DATA_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#334155"/>
  <rect x="25" y="25" width="70" height="70" fill="#64748b" stroke="#94a3b8" stroke-width="4"/>
  <rect x="105" y="25" width="70" height="70" fill="#475569" stroke="#94a3b8" stroke-width="4"/>
  <circle cx="100" cy="140" r="35" fill="#1e293b" stroke="#0ea5e9" stroke-width="6"/>
  <path d="M10,190 L190,10" stroke="#f43f5e" stroke-width="4"/>
</svg>`;

export interface PresetSampleLeaf {
  id: string;
  name: string;
  crop: string;
  description: string;
  fileName: string;
  dataUrl: string;
  isTestNonLeaf?: boolean;
  isRenamedTest?: boolean;
}

export const PRESET_SAMPLE_LEAVES: PresetSampleLeaf[] = [
  {
    id: 'rice-blast',
    name: 'Rice Blast (Magnaporthe oryzae)',
    crop: 'Rice (Paddy)',
    description: 'Spindle/diamond-shaped necrotic lesions with grey center & chlorotic halo',
    fileName: 'field_rice_blast_leaf.jpg',
    dataUrl: RICE_BLAST_DATA_URL,
  },
  {
    id: 'rice-blast-renamed',
    name: 'Same Photo Renamed (Test Filename Independence)',
    crop: 'Rice (Paddy)',
    description: 'Exact same blast photo renamed "my_random_photo_9921.jpg" to test pixel extraction',
    fileName: 'my_random_photo_9921.jpg',
    dataUrl: RICE_BLAST_DATA_URL,
    isRenamedTest: true,
  },
  {
    id: 'bacterial-blight',
    name: 'Bacterial Leaf Blight (Xanthomonas oryzae)',
    crop: 'Rice (Paddy)',
    description: 'Wavy marginal chlorosis and yellow bleaching streaks along leaf veins',
    fileName: 'rice_bacterial_leaf_blight.jpg',
    dataUrl: BACTERIAL_BLIGHT_DATA_URL,
  },
  {
    id: 'brown-spot',
    name: 'Brown Spot (Bipolaris oryzae)',
    crop: 'Rice (Paddy)',
    description: 'Scattered oval brown necrotic lesions with yellow halo',
    fileName: 'rice_brown_spot_foliar.jpg',
    dataUrl: BROWN_SPOT_DATA_URL,
  },
  {
    id: 'healthy-rice',
    name: 'Healthy Rice Foliage',
    crop: 'Rice (Paddy)',
    description: 'Vibrant green chlorophyll lamina with zero fungal or bacterial lesions',
    fileName: 'healthy_rice_foliage.jpg',
    dataUrl: HEALTHY_RICE_DATA_URL,
  },
  {
    id: 'non-leaf-sample',
    name: 'Non-Leaf Image (Geometric / Machine)',
    crop: 'Rice (Paddy)',
    description: 'Metallic geometric non-plant image to test rejection of non-foliar uploads',
    fileName: 'tractor_part_metallic.jpg',
    dataUrl: NON_LEAF_DATA_URL,
    isTestNonLeaf: true,
  },
];
