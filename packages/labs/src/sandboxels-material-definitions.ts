/**
 * Sandboxels Material Definitions
 * 
 * This file contains material definitions that can be compiled to GLSL shader code.
 * Based on the Sandboxels project structure.
 */

export interface MaterialReaction {
  elem1?: string | string[];
  elem2?: string | string[];
  chance?: number;
  tempMin?: number;
  tempMax?: number;
  oneway?: boolean;
  charged?: boolean;
  color2?: string;
  attr1?: Record<string, any>;
  attr2?: Record<string, any>;
}

export interface MaterialDefinition {
  name: string;
  color: string | string[];
  behavior: string | string[] | Function;
  category: string;
  state?: "solid" | "liquid" | "gas";
  density?: number;
  temp?: number;
  tempHigh?: number;
  tempLow?: number;
  stateHigh?: string | string[];
  stateLow?: string | string[];
  reactions?: Record<string, MaterialReaction>;
  viscosity?: number;
  hardness?: number;
  burn?: number;
  burnTime?: number;
  burnInto?: string | string[];
  breakInto?: string | string[];
  conduct?: number;
  insulate?: boolean;
  heatCapacity?: number;
  hidden?: boolean;
  alias?: string;
}

// Core material categories
export const MATERIAL_CATEGORIES = {
  tools: "tools",
  land: "land",
  liquids: "liquids",
  gases: "gases",
  solids: "solids",
  life: "life",
  special: "special",
  machines: "machines",
  powders: "powders",
} as const;

// Behavior types mapping
export const BEHAVIOR_TYPES = {
  POWDER: "powder",      // Falls down like sand
  LIQUID: "liquid",       // Flows like water
  GAS: "gas",            // Rises up
  DGAS: "dgas",          // Dense gas (disappears)
  WALL: "wall",          // Static wall
  MOLTEN: "molten",      // Molten material (like lava)
  SUPPORT: "support",    // Supports other materials
  SUPPORTPOWDER: "supportpowder", // Powder that supports
  STURDYPOWDER: "sturdypowder",   // Sturdier powder
} as const;

// Core materials to start with (matching our current GLSL implementation)
export const CORE_MATERIALS: Record<string, MaterialDefinition> = {
  air: {
    name: "Air",
    color: "#1f2224",
    behavior: BEHAVIOR_TYPES.GAS,
    category: MATERIAL_CATEGORIES.gases,
    state: "gas",
    density: 0.001,
  },
  smoke: {
    name: "Smoke",
    color: "#383838",
    behavior: BEHAVIOR_TYPES.DGAS,
    category: MATERIAL_CATEGORIES.gases,
    state: "gas",
    density: 0.1,
    temp: 114,
    tempHigh: 1000,
    stateHigh: "fire",
  },
  steam: {
    name: "Steam",
    color: "#c8c8c8",
    behavior: BEHAVIOR_TYPES.GAS,
    category: MATERIAL_CATEGORIES.gases,
    state: "gas",
    density: 0.6,
    temp: 100,
  },
  water: {
    name: "Water",
    color: "#2167ff",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: MATERIAL_CATEGORIES.liquids,
    state: "liquid",
    density: 1000,
    tempHigh: 100,
    stateHigh: "steam",
    tempLow: 0,
    stateLow: "ice",
    heatCapacity: 4.184,
    reactions: {
      salt: { elem1: "salt_water", elem2: undefined },
      sugar: { elem1: "sugar_water", elem2: undefined },
    },
  },
  lava: {
    name: "Lava",
    color: "#ff6f00",
    behavior: BEHAVIOR_TYPES.MOLTEN,
    category: MATERIAL_CATEGORIES.liquids,
    state: "liquid",
    density: 2725,
    temp: 1200,
    tempLow: 800,
    stateLow: ["basalt", "basalt", "basalt", "rock"],
    viscosity: 10000,
    reactions: {
      ice: { elem1: "basalt" },
      water: { elem1: "stone", elem2: "smoke" },
    },
  },
  sand: {
    name: "Sand",
    color: "#e6d577",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: MATERIAL_CATEGORIES.land,
    state: "solid",
    density: 1602,
    tempHigh: 1700,
    stateHigh: "molten_glass",
    reactions: {
      water: { elem1: "wet_sand", elem2: undefined },
    },
  },
  plant: {
    name: "Plant",
    color: "#228b22",
    behavior: BEHAVIOR_TYPES.SUPPORT,
    category: MATERIAL_CATEGORIES.life,
    state: "solid",
    density: 500,
    burn: 5,
    burnTime: 300,
    burnInto: ["ember", "charcoal", "fire"],
  },
  stone: {
    name: "Stone",
    color: "#555555",
    behavior: BEHAVIOR_TYPES.WALL,
    category: MATERIAL_CATEGORIES.solids,
    state: "solid",
    density: 2600,
    hardness: 0.8,
  },
  wall: {
    name: "Wall",
    color: "#7a7769",
    behavior: BEHAVIOR_TYPES.WALL,
    category: MATERIAL_CATEGORIES.solids,
    state: "solid",
    density: 2500,
    hardness: 1,
  },
  ice: {
    name: "Ice",
    color: "#87ceeb",
    behavior: BEHAVIOR_TYPES.WALL,
    category: MATERIAL_CATEGORIES.solids,
    state: "solid",
    density: 917,
    temp: 0,
    tempHigh: 0,
    stateHigh: "water",
    reactions: {
      lava: { elem1: "steam" },
    },
  },
  fire: {
    name: "Fire",
    color: "#ff6347",
    behavior: BEHAVIOR_TYPES.GAS,
    category: MATERIAL_CATEGORIES.gases,
    state: "gas",
    density: 0.1,
    temp: 600,
    reactions: {
      water: { elem1: "smoke" },
      plant: { elem1: "fire", chance: 0.8 },
    },
  },
  moss: {
    name: "Moss",
    color: "#228b22",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: MATERIAL_CATEGORIES.life,
    state: "solid",
    density: 400,
    reactions: {
      water: { elem1: "moss", chance: 0.1 }, // Growth
    },
  },
};

// Extended materials from Sandboxels (sample - we'll expand this)
export const EXTENDED_MATERIALS: Record<string, MaterialDefinition> = {
  wet_sand: {
    name: "Wet Sand",
    color: "#d4a574",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: MATERIAL_CATEGORIES.land,
    state: "solid",
    density: 1800,
    tempHigh: 100,
    stateHigh: "sand",
  },
  salt_water: {
    name: "Salt Water",
    color: "#4a90e2",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: MATERIAL_CATEGORIES.liquids,
    state: "liquid",
    density: 1025,
    tempHigh: 100,
    stateHigh: "steam",
    tempLow: -2,
    stateLow: "ice",
  },
  basalt: {
    name: "Basalt",
    color: "#2a2a2a",
    behavior: BEHAVIOR_TYPES.WALL,
    category: MATERIAL_CATEGORIES.solids,
    state: "solid",
    density: 3000,
    tempHigh: 1200,
    stateHigh: "lava",
  },
  molten_glass: {
    name: "Molten Glass",
    color: "#ffd700",
    behavior: BEHAVIOR_TYPES.MOLTEN,
    category: MATERIAL_CATEGORIES.liquids,
    state: "liquid",
    density: 2500,
    temp: 1700,
    tempLow: 600,
    stateLow: "glass",
    viscosity: 10000,
  },
  glass: {
    name: "Glass",
    color: "#e0e0e0",
    behavior: BEHAVIOR_TYPES.WALL,
    category: MATERIAL_CATEGORIES.solids,
    state: "solid",
    density: 2500,
    hardness: 0.5,
    breakInto: "glass_shard",
  },
};

// Note: ALL_SANDBOXELS_MATERIALS is imported separately to avoid circular dependency
// If you need all materials combined, import both CORE_MATERIALS/EXTENDED_MATERIALS 
// and ALL_SANDBOXELS_MATERIALS in the consuming module

// Material ID mapping (for GLSL constants)
// Note: This function is deprecated - use generateMaterialIDMap from material-id-map.ts instead
export function getMaterialIdMap(): Record<string, number> {
  // Return empty map - this function is no longer used
  // Use generateMaterialIDMap() from material-id-map.ts instead
  return {};
}

