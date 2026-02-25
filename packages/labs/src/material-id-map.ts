/**
 * Material ID Mapping System
 * 
 * Maps all Sandboxels materials to unique IDs (0-366)
 * Preserves current core material IDs (0-11) for compatibility
 */

import { ALL_SANDBOXELS_MATERIALS } from './sandboxels-all-materials';
import { BEHAVIOR_TYPES, CORE_MATERIALS, EXTENDED_MATERIALS } from './sandboxels-material-definitions';

// Core materials (preserve existing IDs 0-11)
export const CORE_MATERIAL_IDS = {
  AIR: 0,
  SMOKE: 1,
  WATER: 2,
  LAVA: 3,
  SAND: 4,
  PLANT: 5,
  STONE: 6,
  WALL: 7,
  ICE: 8,
  FIRE: 9,
  STEAM: 10,
  MOSS: 11,
} as const;

// Core material name to ID mapping
export const CORE_MATERIAL_NAMES = {
  air: CORE_MATERIAL_IDS.AIR,
  smoke: CORE_MATERIAL_IDS.SMOKE,
  water: CORE_MATERIAL_IDS.WATER,
  lava: CORE_MATERIAL_IDS.LAVA,
  sand: CORE_MATERIAL_IDS.SAND,
  plant: CORE_MATERIAL_IDS.PLANT,
  stone: CORE_MATERIAL_IDS.STONE,
  wall: CORE_MATERIAL_IDS.WALL,
  ice: CORE_MATERIAL_IDS.ICE,
  fire: CORE_MATERIAL_IDS.FIRE,
  steam: CORE_MATERIAL_IDS.STEAM,
  moss: CORE_MATERIAL_IDS.MOSS,
} as const;

export interface MaterialIDMapping {
  id: number;
  name: string;
  glslConstant: string;
  behavior: string;
  category: string;
  state?: 'solid' | 'liquid' | 'gas';
  density?: number;
  temp?: number;
  tempHigh?: number;
  tempLow?: number;
  stateHigh?: string | string[];
  stateLow?: string | string[];
  viscosity?: number;
  color: string | string[];
  hasCustomBehavior?: boolean;
  customBehaviorCode?: string;
  hasCustomVisualization?: boolean;
  customVisualizationCode?: string;
}

/**
 * Generate material ID mappings for all Sandboxels materials
 */
export function generateMaterialIDMap(): Map<string, MaterialIDMapping> {
  const materialMap = new Map<string, MaterialIDMapping>();
  
  // First, add core materials (0-11)
  const coreMaterials = [
    { name: 'air', id: CORE_MATERIAL_IDS.AIR, behavior: BEHAVIOR_TYPES.GAS, category: 'gases', state: 'gas' as const, color: '#1f2224' },
    { name: 'smoke', id: CORE_MATERIAL_IDS.SMOKE, behavior: BEHAVIOR_TYPES.DGAS, category: 'gases', state: 'gas' as const, color: '#383838' },
    { name: 'water', id: CORE_MATERIAL_IDS.WATER, behavior: BEHAVIOR_TYPES.LIQUID, category: 'liquids', state: 'liquid' as const, color: '#2167ff' },
    { name: 'lava', id: CORE_MATERIAL_IDS.LAVA, behavior: BEHAVIOR_TYPES.MOLTEN, category: 'liquids', state: 'liquid' as const, color: '#ff6f00' },
    { name: 'sand', id: CORE_MATERIAL_IDS.SAND, behavior: BEHAVIOR_TYPES.POWDER, category: 'land', state: 'solid' as const, color: '#e6d577' },
    { name: 'plant', id: CORE_MATERIAL_IDS.PLANT, behavior: BEHAVIOR_TYPES.WALL, category: 'life', state: 'solid' as const, color: '#228b22' },
    { name: 'stone', id: CORE_MATERIAL_IDS.STONE, behavior: BEHAVIOR_TYPES.POWDER, category: 'land', state: 'solid' as const, color: '#808080' },
    { name: 'wall', id: CORE_MATERIAL_IDS.WALL, behavior: BEHAVIOR_TYPES.WALL, category: 'solids', state: 'solid' as const, color: '#1a1a1a' },
    { name: 'ice', id: CORE_MATERIAL_IDS.ICE, behavior: BEHAVIOR_TYPES.POWDER, category: 'land', state: 'solid' as const, color: '#b0e0e6' },
    { name: 'fire', id: CORE_MATERIAL_IDS.FIRE, behavior: BEHAVIOR_TYPES.GAS, category: 'energy', state: 'gas' as const, color: '#ff4400' },
    { name: 'steam', id: CORE_MATERIAL_IDS.STEAM, behavior: BEHAVIOR_TYPES.GAS, category: 'gases', state: 'gas' as const, color: '#c8c8c8' },
    { name: 'moss', id: CORE_MATERIAL_IDS.MOSS, behavior: BEHAVIOR_TYPES.POWDER, category: 'life', state: 'solid' as const, color: '#228b22' },
  ];
  
  coreMaterials.forEach(mat => {
    const glslName = mat.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    materialMap.set(mat.name, {
      id: mat.id,
      name: mat.name,
      glslConstant: glslName,
      behavior: mat.behavior,
      category: mat.category,
      state: mat.state,
      color: mat.color,
    });
  });
  
  // Then add all other Sandboxels materials (starting at ID 12)
  let nextID = 12;
  const allMaterials = Object.entries(ALL_SANDBOXELS_MATERIALS);
  
  // Sort materials to ensure consistent ordering
  allMaterials.sort(([a], [b]) => a.localeCompare(b));
  
  for (const [name, def] of allMaterials) {
    // Skip if already added as core material
    if (materialMap.has(name)) {
      continue;
    }
    
    const glslName = name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    // Handle BEHAVIOR_TYPES constants - extract the actual behavior string
    let behavior = typeof def.behavior === 'string' ? def.behavior : 'CUSTOM';
    // If it's a BEHAVIOR_TYPES constant like "powder", use it directly
    // If it's something else, try to extract the behavior name
    if (behavior !== 'CUSTOM' && behavior.includes('.')) {
      // Extract from "behaviors.POWDER" format
      const parts = behavior.split('.');
      behavior = parts[parts.length - 1].toLowerCase();
    } else if (behavior !== 'CUSTOM') {
      behavior = behavior.toLowerCase();
    }
    // Preserve color as array or string - texture generator will handle it
    const color = def.color || '#888888';
    
    // Check if this is a complex material that needs custom behavior
    const hasCustomBehavior = name === 'uranium' || 
                             (typeof def.behavior === 'object' && Array.isArray(def.behavior));
    
    materialMap.set(name, {
      id: nextID++,
      name,
      glslConstant: glslName,
      behavior,
      category: def.category || 'special',
      state: def.state,
      density: def.density,
      temp: def.temp,
      tempHigh: def.tempHigh,
      tempLow: def.tempLow,
      stateHigh: def.stateHigh,
      stateLow: def.stateLow,
      viscosity: def.viscosity,
      color,
      hasCustomBehavior,
    });
  }
  
  return materialMap;
}

/**
 * Get material ID by name
 */
export function getMaterialID(name: string, materialMap: Map<string, MaterialIDMapping>): number | undefined {
  return materialMap.get(name)?.id;
}

/**
 * Get material mapping by ID
 */
export function getMaterialByID(id: number, materialMap: Map<string, MaterialIDMapping>): MaterialIDMapping | undefined {
  for (const mapping of materialMap.values()) {
    if (mapping.id === id) {
      return mapping;
    }
  }
  return undefined;
}

/**
 * Generate GLSL constants for all materials
 */
export function generateGLSLConstants(materialMap: Map<string, MaterialIDMapping>): string {
  const constants: string[] = [];
  
  // Skip core materials (0-11) as they're already defined in CONSTANTS
  // Only add extended materials (12+)
  constants.push('// Extended materials (12+)');
  const sortedMaterials = Array.from(materialMap.values()).sort((a, b) => a.id - b.id);
  for (const mapping of sortedMaterials) {
    if (mapping.id > 11) {
      constants.push(`#define ${mapping.glslConstant} ${mapping.id}.0`);
    }
  }
  
  return constants.join('\n');
}

