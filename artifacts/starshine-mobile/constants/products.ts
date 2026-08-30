export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  series: string;
  category: string;
  shortDesc: string;
  description: string;
  specs: ProductSpec[];
  features: string[];
  applications: string[];
  iconName: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  count: number;
}

export const PRODUCTS: Product[] = [
  {
    id: 'helical',
    name: 'Helical Gear Reducer',
    series: 'R / F Series',
    category: 'Gear Reducers',
    shortDesc: 'High-efficiency inline reduction for continuous duty applications',
    description:
      'The Helical Gear Reducer features precision-ground helical gearing for maximum efficiency and quiet operation. Designed for continuous-duty industrial applications with high torque output requirements.',
    specs: [
      { label: 'Torque Range', value: '1.4 – 18,000 Nm' },
      { label: 'Gear Ratio', value: '1.25 – 289.74' },
      { label: 'Efficiency', value: '≥ 96%' },
      { label: 'Output Type', value: 'Solid / Hollow Shaft' },
      { label: 'Mounting', value: 'Foot / Flange / B5 / B14' },
      { label: 'IP Rating', value: 'IP55 / IP65' },
      { label: 'Thermal Class', value: 'F' },
    ],
    features: [
      'Helical tooth geometry for smooth, quiet operation',
      'Case-hardened and ground gears',
      'High efficiency ≥ 96% per stage',
      'Universal mounting positions',
      'Low backlash design',
    ],
    applications: ['Conveyor systems', 'Mixers and agitators', 'Pumps and compressors', 'Material handling equipment'],
    iconName: 'cog-outline',
  },
  {
    id: 'worm',
    name: 'Worm Gear Reducer',
    series: 'RV / NMRV Series',
    category: 'Gear Reducers',
    shortDesc: 'Compact right-angle drive with self-locking capability',
    description:
      'Compact worm gear reducers delivering right-angle power transmission with inherent self-locking characteristics. Ideal for space-constrained installations requiring reliable, low-maintenance operation.',
    specs: [
      { label: 'Torque Range', value: '2.6 – 4,776 Nm' },
      { label: 'Gear Ratio', value: '5 – 100' },
      { label: 'Efficiency', value: '70 – 92%' },
      { label: 'Output Type', value: 'Solid / Hollow Shaft' },
      { label: 'Mounting', value: '4-face universal' },
      { label: 'IP Rating', value: 'IP54 / IP65' },
      { label: 'Housing', value: 'Aluminium / Cast Iron' },
    ],
    features: [
      'Right-angle compact design',
      'Self-locking at higher ratios',
      '4-face universal mounting',
      'Aluminum or cast-iron housing options',
      'Bi-directional operation',
    ],
    applications: ['Packaging machinery', 'Gate and valve actuators', 'Food processing', 'Stage and lift equipment'],
    iconName: 'cog',
  },
  {
    id: 'planetary',
    name: 'Planetary Gearbox',
    series: 'P Series',
    category: 'Planetary',
    shortDesc: 'High torque density with low backlash for precision applications',
    description:
      'Planetary gearboxes offer the highest torque density in the smallest envelope. Multiple planetary stages provide precise ratios with extremely low backlash, making them ideal for automation and robotics.',
    specs: [
      { label: 'Torque Range', value: '15 – 2,500 Nm' },
      { label: 'Gear Ratio', value: '3 – 512' },
      { label: 'Backlash (Std)', value: '≤ 3 arcmin' },
      { label: 'Backlash (Prec)', value: '≤ 1 arcmin' },
      { label: 'Efficiency', value: '≥ 97% per stage' },
      { label: 'Max Input Speed', value: '5,000 rpm' },
      { label: 'IP Rating', value: 'IP65' },
    ],
    features: [
      'Coaxial in/out for compact integration',
      'Multiple stages for wide ratio range',
      'Full needle bearing planet carriers',
      'Low backlash ≤ 3 arcmin standard',
      'Precision variant ≤ 1 arcmin available',
    ],
    applications: ['Industrial robots', 'CNC machines', 'Automated assembly', 'Solar tracking systems'],
    iconName: 'atom',
  },
  {
    id: 'helical-worm',
    name: 'Helical-Worm Gearbox',
    series: 'S Series',
    category: 'Gear Reducers',
    shortDesc: 'Combined helical-worm for higher efficiency at right-angle',
    description:
      'The S Series combines a helical input stage with a worm output stage for significantly improved efficiency over pure worm designs while maintaining the compact right-angle form factor.',
    specs: [
      { label: 'Torque Range', value: '100 – 4,200 Nm' },
      { label: 'Gear Ratio', value: '9.96 – 4,195' },
      { label: 'Efficiency', value: '≥ 81%' },
      { label: 'Output Type', value: 'Hollow / Solid Shaft' },
      { label: 'Mounting', value: 'Foot / Flange / B5 / B14' },
      { label: 'IP Rating', value: 'IP55' },
      { label: 'Input', value: 'IEC B5 / Direct motor mount' },
    ],
    features: [
      'Helical pre-stage improves efficiency',
      'Wide ratio range in single unit',
      'Compact right-angle design',
      'Multiple output configurations',
      'IEC motor adapter compatibility',
    ],
    applications: ['Conveyor drives', 'Agitator drives', 'Elevator mechanisms', 'Packaging lines'],
    iconName: 'refresh',
  },
  {
    id: 'helical-bevel',
    name: 'Helical-Bevel Gearbox',
    series: 'K Series',
    category: 'Gear Reducers',
    shortDesc: 'High-efficiency right-angle drive for heavy-duty applications',
    description:
      'K Series Helical-Bevel Gearboxes combine a bevel first stage with helical reduction for superior efficiency at right-angle drives. Engineered for the most demanding heavy-duty industrial environments.',
    specs: [
      { label: 'Torque Range', value: '200 – 50,000 Nm' },
      { label: 'Gear Ratio', value: '5.36 – 197.37' },
      { label: 'Efficiency', value: '≥ 96%' },
      { label: 'Output Type', value: 'Hollow / Solid / Shrink Disc' },
      { label: 'Mounting', value: 'Foot / Flange / Torque Arm' },
      { label: 'IP Rating', value: 'IP55 / IP65' },
      { label: 'Thermal Class', value: 'F' },
    ],
    features: [
      'Bevel + helical for high efficiency right-angle drive',
      'Case-hardened spiral bevel gears',
      'Heavy-duty sealed bearings',
      'Multiple output shaft options',
      'High radial and axial load capacity',
    ],
    applications: ['Mining conveyors', 'Crane drives', 'Heavy mixers', 'Extruders'],
    iconName: 'vector-triangle',
  },
  {
    id: 'servo',
    name: 'Servo Gearbox',
    series: 'SG Series',
    category: 'Servo & Precision',
    shortDesc: 'Ultra-low backlash precision gearbox for servo drives',
    description:
      'High precision servo gearboxes designed to match the dynamic performance of modern servo motors. Minimal torsional backlash, high stiffness, and accurate repeatability for demanding motion control.',
    specs: [
      { label: 'Torque Range', value: '15 – 1,800 Nm' },
      { label: 'Gear Ratio', value: '3 – 100' },
      { label: 'Backlash', value: '≤ 1 arcmin' },
      { label: 'Torsional Rigidity', value: 'Up to 75 Nm/arcmin' },
      { label: 'Max Input Speed', value: '6,000 rpm' },
      { label: 'IP Rating', value: 'IP65' },
      { label: 'Noise Level', value: '< 65 dB' },
    ],
    features: [
      'Ultra-low backlash ≤ 1 arcmin',
      'High torsional stiffness',
      'Servo motor direct mount',
      'Lifetime lubrication — zero maintenance',
      'Full IP65 protection standard',
    ],
    applications: ['CNC machine tools', 'Industrial robots', 'Laser cutting systems', 'Medical devices'],
    iconName: 'target',
  },
  {
    id: 'inline-motor',
    name: 'Inline Geared Motor',
    series: 'ILM Series',
    category: 'Geared Motors',
    shortDesc: 'Compact coaxial geared motor for space-efficient integration',
    description:
      'ILM Series inline geared motors integrate a high-efficiency helical gearbox with an IE2/IE3 electric motor in a compact coaxial design, reducing installation complexity and footprint.',
    specs: [
      { label: 'Power Range', value: '0.12 – 22 kW' },
      { label: 'Output Torque', value: 'Up to 3,200 Nm' },
      { label: 'Output Speed', value: '0.6 – 405 rpm' },
      { label: 'Motor Class', value: 'IE2 / IE3' },
      { label: 'Mounting', value: 'Foot / Flange / Torque Arm' },
      { label: 'Voltage', value: '230 / 400 V · 50–60 Hz' },
      { label: 'IP Rating', value: 'IP55' },
    ],
    features: [
      'IE3 high efficiency motor standard',
      'Compact coaxial footprint',
      'Integrated thermal protection',
      'Multiple voltage options',
      'Factory-tested as complete unit',
    ],
    applications: ['Packaging lines', 'Conveyor belts', 'Fan drives', 'Pump drives'],
    iconName: 'lightning-bolt',
  },
  {
    id: 'right-angle-motor',
    name: 'Right-Angle Geared Motor',
    series: 'RAM Series',
    category: 'Geared Motors',
    shortDesc: 'Right-angle geared motor for tight-layout drive requirements',
    description:
      'RAM Series right-angle geared motors combine helical-bevel or helical-worm gearing with an IE2/IE3 motor into a ready-to-mount unit, ideal where inline configuration is not possible.',
    specs: [
      { label: 'Power Range', value: '0.12 – 22 kW' },
      { label: 'Output Torque', value: 'Up to 18,000 Nm' },
      { label: 'Output Speed', value: '0.4 – 285 rpm' },
      { label: 'Motor Class', value: 'IE2 / IE3' },
      { label: 'Mounting', value: 'Foot / Flange / Torque Arm / Wall' },
      { label: 'Voltage', value: '230 / 400 V · 50–60 Hz' },
      { label: 'IP Rating', value: 'IP55 / IP65' },
    ],
    features: [
      'Right-angle layout for tight installations',
      'Helical-bevel or helical-worm options',
      'IE3 motor efficiency class',
      'Wide mounting configuration range',
      'Integrated cooling fan',
    ],
    applications: ['Stacker cranes', 'Material handling', 'Industrial doors', 'Winches'],
    iconName: 'lightning-bolt-outline',
  },
];

export const CATEGORIES: Category[] = [
  {
    id: 'gear-reducers',
    name: 'Gear Reducers',
    iconName: 'cog-outline',
    count: PRODUCTS.filter((p) => p.category === 'Gear Reducers').length,
  },
  {
    id: 'planetary',
    name: 'Planetary',
    iconName: 'atom',
    count: PRODUCTS.filter((p) => p.category === 'Planetary').length,
  },
  {
    id: 'servo',
    name: 'Servo & Precision',
    iconName: 'target',
    count: PRODUCTS.filter((p) => p.category === 'Servo & Precision').length,
  },
  {
    id: 'geared-motors',
    name: 'Geared Motors',
    iconName: 'lightning-bolt',
    count: PRODUCTS.filter((p) => p.category === 'Geared Motors').length,
  },
];

export const PRODUCT_INTEREST_OPTIONS = [
  'R Series Helical Gear Reducer',
  'F Series Parallel Shaft Helical Gear Reducer',
  'K Series Helical-Bevel Gear Reducer',
  'S Series Helical-Worm Gear Reducer',
  'RV Series Worm Gear Reducer',
  'NMRV / NRV Worm Gear Reducer',
  'Compact Geared Motors',
  'Helical-Hypoid Gear Units',
  'Planetary Gearbox',
  'Cycloidal Gear Reducer',
];
