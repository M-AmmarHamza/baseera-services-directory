import React from 'react';
import {
  Zap,
  BatteryCharging,
  Sun,
  Power,
  Wrench,
  Gauge,
  ArrowDownToLine,
  Droplets,
  Wind,
  Snowflake,
  RotateCw,
  Flame,
  Hammer,
  Paintbrush,
  PanelRight,
  Sparkles,
  BrickWall,
  Bug,
  Brush,
  Cctv,
  Key,
  ChefHat,
  PenTool,
  Truck,
  LayoutGrid,
  Shirt,
  Columns,
  Blocks,
  LayoutDashboard,
} from 'lucide-react';

export type LucideIconComponent = React.ComponentType<{ className?: string; size?: number | string }>;

/**
 * Explicit dictionary matching category slugs, names, and icon keys to Lucide icons.
 */
export const CATEGORY_ICON_MAP: Record<string, LucideIconComponent> = {
  // 1. Electrician -> Zap
  electrician: Zap,
  electricians: Zap,
  'electrician-services': Zap,
  zap: Zap,

  // 2. UPS & Inverter Technician -> BatteryCharging
  'ups-inverter-technician': BatteryCharging,
  'ups-repair': BatteryCharging,
  'inverter-technician': BatteryCharging,
  ups: BatteryCharging,
  batterycharging: BatteryCharging,

  // 3. Solar Panel Installer -> Sun
  'solar-installer': Sun,
  'solar-panel-installer': Sun,
  'solar-energy': Sun,
  solar: Sun,
  sun: Sun,

  // 4. Generator Mechanic -> Power
  'generator-repair': Power,
  'generator-mechanic': Power,
  generator: Power,
  generators: Power,
  power: Power,

  // 5. Plumber -> Wrench
  plumber: Wrench,
  plumbers: Wrench,
  plumbing: Wrench,
  'plumbing-services': Wrench,
  wrench: Wrench,

  // 6. Water Pump Mechanic -> Gauge
  'water-pump-repair': Gauge,
  'water-pump-mechanic': Gauge,
  'water-pump': Gauge,
  'pump-mechanic': Gauge,
  gauge: Gauge,

  // 7. Water Boring Specialist -> ArrowDownToLine
  'water-boring': ArrowDownToLine,
  'water-boring-specialist': ArrowDownToLine,
  boring: ArrowDownToLine,
  arrowdowntoline: ArrowDownToLine,
  layers: ArrowDownToLine,

  // 8. Water Tank Cleaner -> Droplets
  'water-tank-cleaning': Droplets,
  'water-tank-cleaner': Droplets,
  'tank-cleaning': Droplets,
  droplets: Droplets,
  waves: Droplets,

  // 9. AC Technician -> Wind
  'ac-technician': Wind,
  'ac-repair': Wind,
  ac: Wind,
  hvac: Wind,
  wind: Wind,

  // 10. Fridge & Freezer Mechanic -> Snowflake
  'fridge-repair': Snowflake,
  'fridge-freezer-mechanic': Snowflake,
  'fridge-mechanic': Snowflake,
  'refrigerator-repair': Snowflake,
  'freezer-repair': Snowflake,
  snowflake: Snowflake,

  // 11. Washing Machine Repair -> RotateCw
  'washing-machine-repair': RotateCw,
  'washing-machine': RotateCw,
  'dryer-repair': RotateCw,
  rotatecw: RotateCw,

  // 12. Geyser Technician -> Flame
  'geyser-repair': Flame,
  'geyser-technician': Flame,
  geyser: Flame,
  'water-heater': Flame,
  flame: Flame,

  // 13. Carpenter -> Hammer
  carpenter: Hammer,
  carpentry: Hammer,
  'carpenter-services': Hammer,
  hammer: Hammer,

  // 14. Painter -> Paintbrush
  painter: Paintbrush,
  painting: Paintbrush,
  'painting-services': Paintbrush,
  paintbrush: Paintbrush,

  // 15. Aluminium & Glass Worker -> PanelRight
  'aluminium-glass-worker': PanelRight,
  'aluminium-glass': PanelRight,
  'glass-worker': PanelRight,
  aluminium: PanelRight,
  panelright: PanelRight,
  frame: PanelRight,

  // 16. Welder -> Sparkles
  welder: Sparkles,
  welding: Sparkles,
  'iron-works': Sparkles,
  sparkles: Sparkles,

  // 17. Mason -> BrickWall
  mason: BrickWall,
  masonry: BrickWall,
  mistri: BrickWall,
  brickwall: BrickWall,
  boxes: BrickWall,

  // 18. Pest Control -> Bug
  'pest-control': Bug,
  'pest-control-fumigation': Bug,
  fumigation: Bug,
  'termite-control': Bug,
  bug: Bug,

  // 19. Sofa & Carpet Cleaning -> Brush
  'sofa-carpet-cleaning': Brush,
  'carpet-cleaning': Brush,
  'sofa-cleaning': Brush,
  brush: Brush,
  armchair: Brush,

  // 20. CCTV Installer -> Cctv
  'cctv-installer': Cctv,
  'cctv-technician': Cctv,
  'cctv-security': Cctv,
  cctv: Cctv,
  'security-cameras': Cctv,
  camera: Cctv,

  // 21. Locksmith -> Key
  locksmith: Key,
  'locks-keys': Key,
  'lock-repair': Key,
  key: Key,

  // 22. Home Chef -> ChefHat
  'home-chef': ChefHat,
  food: ChefHat,
  'home-chefs': ChefHat,
  catering: ChefHat,
  chefhat: ChefHat,
  utensils: ChefHat,

  // 23. Interior Designer -> PenTool
  'interior-designer': PenTool,
  'interior-design': PenTool,
  'interior-decorator': PenTool,
  'home-designer': PenTool,
  pentool: PenTool,
  paintroller: PenTool,

  // 24. Movers & Packers -> Truck
  'movers-packers': Truck,
  movers: Truck,
  'packers-and-movers': Truck,
  truck: Truck,

  // Alternate & Default Fallbacks
  shirt: Shirt,
  columns: Columns,
  blocks: Blocks,
  layoutdashboard: LayoutDashboard,
  layoutgrid: LayoutGrid,
};

/**
 * Looks up a category Lucide icon component without fallback.
 */
export function findCategoryIcon(identifier?: string): LucideIconComponent | null {
  if (!identifier) return null;
  const norm = identifier.toLowerCase().trim().replace(/[\s_]+/g, '-');
  const stripped = norm.replace(/-/g, '');
  return CATEGORY_ICON_MAP[norm] || CATEGORY_ICON_MAP[stripped] || CATEGORY_ICON_MAP[identifier] || null;
}

/**
 * Resolves a category slug, name, or identifier to its corresponding Lucide icon component.
 * Falls back cleanly to LayoutGrid if not found.
 */
export function getCategoryIcon(identifier?: string): LucideIconComponent {
  return findCategoryIcon(identifier) || LayoutGrid;
}

export interface CategoryIconProps {
  id?: string;
  name?: string;
  slug?: string;
  icon?: string;
  className?: string;
}

/**
 * Reusable CategoryIcon component: looks up the correct Lucide icon
 * from the mapping dictionary with a clean LayoutGrid fallback.
 */
export default function CategoryIcon({ id, name, slug, icon, className = 'w-6 h-6' }: CategoryIconProps) {
  const IconComponent =
    findCategoryIcon(slug) ||
    findCategoryIcon(id) ||
    findCategoryIcon(icon) ||
    findCategoryIcon(name) ||
    LayoutGrid;

  return <IconComponent className={className} />;
}
