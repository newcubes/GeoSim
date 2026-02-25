/**
 * Material Texture Generator
 * 
 * Generates WebGL textures for material properties and colors
 * to enable fast lookups in shaders without if-else chains
 */

import type { MaterialIDMapping } from './material-id-map';

export interface MaterialProperties {
  behavior: number;      // Behavior type ID (0=GAS, 1=LIQUID, 2=POWDER, etc.)
  density: number;       // Normalized density (0-1)
  viscosity: number;    // Normalized viscosity (0-1)
  state: number;         // State: 0=solid, 1=liquid, 2=gas
}

export interface MaterialColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

// Behavior type to ID mapping
const BEHAVIOR_IDS: Record<string, number> = {
  'gas': 0,
  'dgas': 1,
  'liquid': 2,
  'molten': 3,
  'powder': 4,
  'sturdypowder': 5,
  'wall': 6,
  'support': 7,
  'supportpowder': 8,
};

// State to ID mapping
const STATE_IDS: Record<string, number> = {
  'solid': 0,
  'liquid': 1,
  'gas': 2,
};

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0.5, g: 0.5, b: 0.5 }; // Default gray
  }
  return {
    r: parseInt(result[1], 16) / 255.0,
    g: parseInt(result[2], 16) / 255.0,
    b: parseInt(result[3], 16) / 255.0,
  };
}

/**
 * Normalize density to 0-1 range
 * Assumes density range: 0.001 (air) to 20000 (uranium)
 */
function normalizeDensity(density?: number): number {
  if (!density) return 0.5;
  return Math.min(Math.max((density - 0.001) / (20000 - 0.001), 0), 1);
}

/**
 * Normalize viscosity to 0-1 range
 * Assumes viscosity range: 0 (water) to 10000 (molten materials)
 */
function normalizeViscosity(viscosity?: number): number {
  if (!viscosity) return 0;
  return Math.min(Math.max(viscosity / 10000, 0), 1);
}

/**
 * Get behavior ID from behavior string
 */
function getBehaviorID(behavior: string): number {
  if (!behavior || behavior.trim() === '') {
    console.warn(`Empty behavior string, defaulting to powder`);
    return 4; // Default to powder
  }
  
  // Handle BEHAVIOR_TYPES constants (e.g., "behaviors.POWDER" or just "POWDER")
  let lower = behavior.toLowerCase().trim();
  
  // Remove "behaviors." prefix if present
  if (lower.startsWith('behaviors.')) {
    lower = lower.substring(10);
  }
  
  // Remove any other prefixes
  const parts = lower.split('.');
  lower = parts[parts.length - 1];
  
  // Map to behavior ID
  const behaviorID = BEHAVIOR_IDS[lower];
  if (behaviorID === undefined) {
    // Log unexpected behavior strings for debugging
    console.warn(`Unknown behavior "${behavior}" (normalized: "${lower}"), defaulting to powder. Available:`, Object.keys(BEHAVIOR_IDS));
    return 4; // Default to powder (not gas!)
  }
  return behaviorID;
}

/**
 * Get state ID from state string
 */
function getStateID(state?: string): number {
  if (!state) return 0; // Default to solid
  return STATE_IDS[state.toLowerCase()] ?? 0;
}

/**
 * Generate material properties array for texture
 * Each material gets one pixel: RGBA = behavior, density, viscosity, state
 */
export function generateMaterialPropertiesTexture(
  materialMap: Map<string, MaterialIDMapping>,
  maxMaterials: number = 512
): Float32Array {
  const data = new Float32Array(maxMaterials * 4); // RGBA per material
  
  for (const mapping of materialMap.values()) {
    if (mapping.id >= maxMaterials) continue;
    
    const index = mapping.id * 4;
    data[index + 0] = getBehaviorID(mapping.behavior); // R = behavior
    data[index + 1] = normalizeDensity(mapping.density); // G = density
    data[index + 2] = normalizeViscosity(mapping.viscosity); // B = viscosity
    data[index + 3] = getStateID(mapping.state); // A = state
  }
  
  return data;
}

/**
 * Convert RGB to HSV
 */
function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  
  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
  }
  h = h / 6;
  if (h < 0) h += 1;
  
  const s = max === 0 ? 0 : delta / max;
  const v = max;
  
  return { h, s, v };
}

/**
 * Convert HSV to RGB
 */
function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const c = v * s;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = v - c;
  
  let r = 0, g = 0, b = 0;
  
  if (h < 1/6) {
    r = c; g = x; b = 0;
  } else if (h < 2/6) {
    r = x; g = c; b = 0;
  } else if (h < 3/6) {
    r = 0; g = c; b = x;
  } else if (h < 4/6) {
    r = 0; g = x; b = c;
  } else if (h < 5/6) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  
  return {
    r: r + m,
    g: g + m,
    b: b + m
  };
}

/**
 * Generate material colors array for texture
 * Each material gets one pixel: RGBA = color
 */
export function generateMaterialColorsTexture(
  materialMap: Map<string, MaterialIDMapping>,
  maxMaterials: number = 512,
  useAlternateColors: boolean = false
): Float32Array {
  const data = new Float32Array(maxMaterials * 4); // RGBA per material
  
  // Collect all materials with their IDs for redistribution
  const materials: Array<{ id: number; mapping: MaterialIDMapping; originalRgb: { r: number; g: number; b: number } }> = [];
  
  for (const mapping of materialMap.values()) {
    if (mapping.id >= maxMaterials) continue;
    
    // Handle color arrays - use first color, or fallback to string or default
    let colorStr: string;
    if (Array.isArray(mapping.color)) {
      colorStr = mapping.color[0] || '#888888';
    } else {
      colorStr = mapping.color || '#888888';
    }
    const rgb = hexToRgb(colorStr);
    
    materials.push({ id: mapping.id, mapping, originalRgb: rgb });
  }
  
  // Sort by ID for consistent ordering
  materials.sort((a, b) => a.id - b.id);
  
  if (useAlternateColors) {
    // Alternate color scheme: Optimal RGB space coverage
    // Strategy: Distribute materials evenly across the entire RGB color cube
    // to maximize color matching fidelity for image sampling
    
    const totalMaterials = materials.length;
    
    // Calculate optimal grid dimensions for RGB space coverage
    // We want to distribute materials evenly across the RGB cube (0-1 range)
    // For ~372 materials, use a grid that provides good coverage
    // Using 8x8x6 = 384 grid points provides good distribution
    const gridR = 8;
    const gridG = 8;
    const gridB = 6;
    const totalGridPoints = gridR * gridG * gridB;
    
    // Generate evenly distributed RGB points using a space-filling approach
    // Use a 3D grid with deterministic jitter to avoid perfect alignment
    const gridPoints: Array<{ r: number; g: number; b: number }> = [];
    for (let r = 0; r < gridR; r++) {
      for (let g = 0; g < gridG; g++) {
        for (let b = 0; b < gridB; b++) {
          // Use center of each grid cell with deterministic jitter for better distribution
          const jitter = 0.08; // Small jitter to avoid perfect grid alignment
          const index = (r * gridG * gridB + g * gridB + b);
          // Deterministic jitter based on grid position
          const jitterR = ((index * 0.618) % 1 - 0.5) * jitter;
          const jitterG = ((index * 0.382) % 1 - 0.5) * jitter;
          const jitterB = ((index * 0.236) % 1 - 0.5) * jitter;
          gridPoints.push({
            r: Math.max(0, Math.min(1, (r + 0.5) / gridR + jitterR)),
            g: Math.max(0, Math.min(1, (g + 0.5) / gridG + jitterG)),
            b: Math.max(0, Math.min(1, (b + 0.5) / gridB + jitterB))
          });
        }
      }
    }
    
    // Shuffle grid points deterministically using material IDs
    // This ensures consistent mapping while providing good RGB space coverage
    const shuffledPoints: Array<{ r: number; g: number; b: number }> = [];
    const used = new Set<number>();
    
    // Assign materials to grid points using a deterministic hash
    for (let i = 0; i < materials.length; i++) {
      const { id } = materials[i];
      
      // Use multiple hash functions to find a good distribution
      let pointIndex = ((id * 137.508) % totalGridPoints) | 0;
      
      // Try to find an unused point
      let attempts = 0;
      while (used.has(pointIndex) && attempts < totalGridPoints) {
        // Use a different hash function for the next attempt
        pointIndex = ((id * 97.1 + attempts * 61.7) % totalGridPoints) | 0;
        attempts++;
      }
      
      if (!used.has(pointIndex) && pointIndex < gridPoints.length) {
        used.add(pointIndex);
        shuffledPoints.push(gridPoints[pointIndex]);
      } else {
        // Fallback: generate a color using golden ratio distribution
        // This ensures we still get good coverage even if grid is exhausted
        const r = ((id * 0.618033988749) % 1);
        const g = ((id * 0.381966011251) % 1);
        const b = ((id * 0.2360679775) % 1);
        shuffledPoints.push({ r, g, b });
      }
    }
    
    // Assign colors to materials
    for (let i = 0; i < materials.length; i++) {
      const { id } = materials[i];
      const index = id * 4;
      const color = shuffledPoints[i] || shuffledPoints[i % shuffledPoints.length];
      
      data[index + 0] = color.r; // R
      data[index + 1] = color.g; // G
      data[index + 2] = color.b; // B
      data[index + 3] = 1.0; // A
    }
    
    console.log(`Alternate color scheme: ${totalMaterials} materials distributed across RGB space (${gridR}x${gridG}x${gridB} grid)`);
  } else {
    // Original color scheme: use colors as-is
    for (const { id, originalRgb } of materials) {
      const index = id * 4;
      data[index + 0] = originalRgb.r; // R
      data[index + 1] = originalRgb.g; // G
      data[index + 2] = originalRgb.b; // B
      data[index + 3] = 1.0; // A
    }
  }
  
  return data;
}

/**
 * Create WebGL texture from material properties data
 */
export function createMaterialPropertiesTexture(
  gl: WebGL2RenderingContext,
  data: Float32Array,
  width: number = 512
): WebGLTexture | null {
  const texture = gl.createTexture();
  if (!texture) return null;
  
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA32F, // 32-bit float texture
    width,
    1, // Height = 1 (1D texture stored as 2D)
    0,
    gl.RGBA,
    gl.FLOAT,
    data
  );
  
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  
  return texture;
}

/**
 * Create WebGL texture from material colors data
 */
export function createMaterialColorsTexture(
  gl: WebGL2RenderingContext,
  data: Float32Array,
  width: number = 512
): WebGLTexture | null {
  const texture = gl.createTexture();
  if (!texture) return null;
  
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA32F, // 32-bit float texture
    width,
    1, // Height = 1 (1D texture stored as 2D)
    0,
    gl.RGBA,
    gl.FLOAT,
    data
  );
  
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  
  return texture;
}

