import { Category, ImageItem } from '../types/annotation';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_car', name: 'Car', color: '#3b82f6', shortcutKey: '1' },
  { id: 'cat_pedestrian', name: 'Pedestrian', color: '#10b981', shortcutKey: '2' },
  { id: 'cat_cyclist', name: 'Cyclist', color: '#f59e0b', shortcutKey: '3' },
  { id: 'cat_traffic_light', name: 'Traffic Light', color: '#ef4444', shortcutKey: '4' },
  { id: 'cat_truck', name: 'Truck', color: '#8b5cf6', shortcutKey: '5' },
  { id: 'cat_building', name: 'Building', color: '#06b6d4', shortcutKey: '6' },
  { id: 'cat_lane', name: 'Lane Line', color: '#f97316', shortcutKey: '7' },
];

/**
 * High-definition synthetic SVG images rendered as data URLs
 * Provides immediate out-of-the-box experience for web demo & testing
 */
function createSyntheticSvgDataUrl(
  title: string,
  bgGradient: [string, string],
  elementsSvg: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${bgGradient[0]}" />
        <stop offset="100%" stop-color="${bgGradient[1]}" />
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="960" height="600" fill="url(#bg)"/>
    <rect width="960" height="600" fill="url(#grid)"/>
    ${elementsSvg}
    <text x="30" y="45" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" fill="rgba(255,255,255,0.6)">[SAMPLE] ${title}</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// 1. Urban Autonomous Driving Scene
const drivingSvg = `
  <!-- Road -->
  <polygon points="120,600 400,320 560,320 840,600" fill="#1e293b"/>
  <!-- Road Markings -->
  <line x1="480" y1="330" x2="480" y2="600" stroke="#fbbf24" stroke-width="4" stroke-dasharray="25,20"/>
  <!-- Horizon Sky buildings -->
  <rect x="80" y="240" width="120" height="180" fill="#334155" rx="4"/>
  <rect x="220" y="200" width="140" height="220" fill="#1e293b" rx="4"/>
  <rect x="620" y="190" width="160" height="230" fill="#334155" rx="4"/>
  <rect x="800" y="250" width="110" height="170" fill="#1e293b" rx="4"/>
  <!-- Car 1 (Sedan) -->
  <rect x="420" y="410" width="140" height="90" fill="#2563eb" rx="10"/>
  <rect x="440" y="380" width="100" height="40" fill="#38bdf8" rx="8"/>
  <circle cx="445" cy="500" r="16" fill="#0f172a"/>
  <circle cx="535" cy="500" r="16" fill="#0f172a"/>
  <!-- Car 2 (Left oncoming/parked) -->
  <rect x="180" y="450" width="110" height="80" fill="#dc2626" rx="8"/>
  <rect x="195" y="425" width="80" height="35" fill="#f87171" rx="6"/>
  <circle cx="205" cy="530" r="14" fill="#0f172a"/>
  <circle cx="265" cy="530" r="14" fill="#0f172a"/>
  <!-- Pedestrian -->
  <circle cx="730" cy="420" r="12" fill="#fde047"/>
  <line x1="730" y1="432" x2="730" y2="475" stroke="#fde047" stroke-width="6"/>
  <line x1="730" y1="475" x2="720" y2="520" stroke="#fde047" stroke-width="5"/>
  <line x1="730" y1="475" x2="740" y2="520" stroke="#fde047" stroke-width="5"/>
  <!-- Traffic Light -->
  <rect x="650" y="260" width="22" height="60" fill="#0f172a" rx="4"/>
  <circle cx="661" cy="272" r="6" fill="#ef4444"/>
  <circle cx="661" cy="290" r="6" fill="#713f12"/>
  <circle cx="661" cy="308" r="6" fill="#14532d"/>
  <line x1="661" y1="320" x2="661" y2="400" stroke="#475569" stroke-width="4"/>
`;

// 2. Drone Aerial Surveillance Scene
const aerialSvg = `
  <!-- Field ground -->
  <rect x="0" y="0" width="960" height="600" fill="#14532d"/>
  <!-- Runway / tarmac -->
  <polygon points="60,100 860,250 820,450 20,300" fill="#334155"/>
  <!-- Aerial Hangar Building -->
  <rect x="160" y="110" width="180" height="120" fill="#64748b" rx="6"/>
  <!-- Oriented Plane / Vehicle 1 -->
  <g transform="translate(540, 310) rotate(28)">
    <rect x="-60" y="-25" width="120" height="50" fill="#f8fafc" rx="8"/>
    <rect x="-15" y="-70" width="30" height="140" fill="#e2e8f0" rx="4"/>
    <circle cx="0" cy="0" r="10" fill="#3b82f6"/>
  </g>
  <!-- Oriented Vehicle 2 -->
  <g transform="translate(380, 260) rotate(-15)">
    <rect x="-30" y="-18" width="60" height="36" fill="#eab308" rx="4"/>
  </g>
  <!-- Small storage pods -->
  <circle cx="680" cy="180" r="28" fill="#94a3b8"/>
  <circle cx="750" cy="200" r="28" fill="#94a3b8"/>
`;

// 3. Retail Shelf Object Detection
const retailSvg = `
  <!-- Shelves -->
  <line x1="60" y1="200" x2="900" y2="200" stroke="#475569" stroke-width="8"/>
  <line x1="60" y1="380" x2="900" y2="380" stroke="#475569" stroke-width="8"/>
  <line x1="60" y1="540" x2="900" y2="540" stroke="#475569" stroke-width="8"/>
  <!-- Shelf Top Products (Beverage Cans) -->
  <rect x="120" y="100" width="55" height="95" fill="#ef4444" rx="6"/>
  <rect x="195" y="100" width="55" height="95" fill="#ef4444" rx="6"/>
  <rect x="270" y="100" width="55" height="95" fill="#3b82f6" rx="6"/>
  <rect x="345" y="100" width="55" height="95" fill="#3b82f6" rx="6"/>
  <rect x="430" y="80" width="80" height="115" fill="#10b981" rx="4"/>
  <rect x="530" y="80" width="80" height="115" fill="#10b981" rx="4"/>
  <!-- Middle Shelf (Cereal Boxes) -->
  <rect x="120" y="240" width="110" height="135" fill="#f59e0b" rx="4"/>
  <rect x="250" y="240" width="110" height="135" fill="#ec4899" rx="4"/>
  <rect x="380" y="240" width="110" height="135" fill="#8b5cf6" rx="4"/>
  <rect x="510" y="240" width="110" height="135" fill="#06b6d4" rx="4"/>
`;

export const SAMPLE_IMAGES: ImageItem[] = [
  {
    id: 'sample_driving_01',
    name: 'urban_traffic_01.png',
    src: createSyntheticSvgDataUrl('Urban Autonomous Driving Scenario', ['#0f172a', '#1e293b'], drivingSvg),
    width: 960,
    height: 600,
    status: 'labeled',
    split: 'train',
    tags: ['urban', 'daylight', 'autonomous_driving'],
    annotations: [
      {
        id: 'ann_car_1',
        type: 'rect',
        classId: 'cat_car',
        x: 418,
        y: 380,
        width: 145,
        height: 140,
        label: 'Lead Vehicle',
      },
      {
        id: 'ann_car_2',
        type: 'rect',
        classId: 'cat_car',
        x: 175,
        y: 425,
        width: 120,
        height: 120,
        label: 'Parked Vehicle',
      },
      {
        id: 'ann_pedestrian_1',
        type: 'rect',
        classId: 'cat_pedestrian',
        x: 710,
        y: 405,
        width: 45,
        height: 120,
        label: 'Crossing',
      },
      {
        id: 'ann_traffic_light_1',
        type: 'rect',
        classId: 'cat_traffic_light',
        x: 645,
        y: 255,
        width: 32,
        height: 150,
      },
      {
        id: 'ann_lane_1',
        type: 'polyline',
        classId: 'cat_lane',
        points: [
          { x: 480, y: 330 },
          { x: 480, y: 440 },
          { x: 480, y: 600 },
        ],
      },
    ],
  },
  {
    id: 'sample_aerial_02',
    name: 'aerial_recon_02.png',
    src: createSyntheticSvgDataUrl('Drone Aerial Reconnaissance', ['#064e3b', '#022c22'], aerialSvg),
    width: 960,
    height: 600,
    status: 'in_progress',
    split: 'val',
    tags: ['aerial', 'drone', 'surveillance'],
    annotations: [
      {
        id: 'ann_obb_plane',
        type: 'obb',
        classId: 'cat_truck',
        cx: 540,
        cy: 310,
        width: 130,
        height: 60,
        angle: 28,
        label: 'Aircraft',
      },
      {
        id: 'ann_building_1',
        type: 'polygon',
        classId: 'cat_building',
        closed: true,
        points: [
          { x: 160, y: 110 },
          { x: 340, y: 110 },
          { x: 340, y: 230 },
          { x: 160, y: 230 },
        ],
      },
      {
        id: 'ann_obb_car',
        type: 'obb',
        classId: 'cat_car',
        cx: 380,
        cy: 260,
        width: 65,
        height: 40,
        angle: 345,
      },
    ],
  },
  {
    id: 'sample_retail_03',
    name: 'retail_shelf_03.png',
    src: createSyntheticSvgDataUrl('Supermarket Inventory & SKU Detection', ['#18181b', '#09090b'], retailSvg),
    width: 960,
    height: 600,
    status: 'unlabeled',
    split: 'test',
    tags: ['retail', 'cereal_boxes', 'inventory'],
    annotations: [
      {
        id: 'ann_box_cereal_1',
        type: 'rect',
        classId: 'cat_building',
        x: 118,
        y: 238,
        width: 114,
        height: 140,
      },
    ],
  },
];
