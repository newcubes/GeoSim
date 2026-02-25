/**
 * Shader Code Generator
 * 
 * Generates GLSL shader code using texture-based lookups and custom behaviors
 */

import type { MaterialIDMapping } from './material-id-map';
import { generateGLSLConstants } from './material-id-map';
import type { CustomBehavior } from './custom-behavior-system';
import { generateCustomTickFunctions, generateCustomVisualizationFunctions, generateCustomTickCalls, generateCustomVisualizationCalls } from './custom-behavior-system';

/**
 * Generate helper functions for texture-based material lookups
 * @param densityClampFactor - Factor to clamp density range (1.0 = no clamp, 0.25 = 1/4 range)
 */
export function generateMaterialLookupFunctions(densityClampFactor: number = 1.0): string {
  const densityRange = (20000.0 - 0.001) * densityClampFactor;
  const densityMin = 0.001;
  const densityMax = densityMin + densityRange;
  
  // For core materials, we need to scale their densities too
  // Original range: 0.001 to 20000
  // Clamped range: 0.001 to (0.001 + (20000-0.001)*clampFactor)
  // Scale factor: (density - 0.001) * clampFactor + 0.001
  
  return `
// Material properties texture lookup
// RGBA = behavior, density, viscosity, state
uniform sampler2D u_materialPropertiesTex;

// Material colors texture lookup
// RGBA = color
uniform sampler2D u_materialColorsTex;

// Density clamp constants (always present for consistency)
const float DENSITY_CLAMP_FACTOR = ${densityClampFactor.toFixed(6)};
const float DENSITY_RANGE = ${densityRange.toFixed(6)};
const float DENSITY_MIN = ${densityMin.toFixed(6)};
const float DENSITY_MAX = ${densityMax.toFixed(6)};

// Get material properties from texture
vec4 getMaterialProperties(float materialId) {
    // Use center of pixel for accurate lookup (materialId + 0.5) / width
    vec2 uv = vec2((materialId + 0.5) / 512.0, 0.5);
    return texture(u_materialPropertiesTex, uv);
}

// Get material color from texture
vec3 getMaterialColor(float materialId) {
    // Use center of pixel for accurate lookup
    vec2 uv = vec2((materialId + 0.5) / 512.0, 0.5);
    vec3 color = texture(u_materialColorsTex, uv).rgb;
    return color;
}

// Behavior type constants
#define BEHAVIOR_GAS 0.0
#define BEHAVIOR_DGAS 1.0
#define BEHAVIOR_LIQUID 2.0
#define BEHAVIOR_MOLTEN 3.0
#define BEHAVIOR_POWDER 4.0
#define BEHAVIOR_STURDYPOWDER 5.0
#define BEHAVIOR_WALL 6.0
#define BEHAVIOR_SUPPORT 7.0
#define BEHAVIOR_SUPPORTPOWDER 8.0

// Get material density (denormalized from texture)
// Density is stored normalized: 0-1 range represents 0.001 to 20000
// When clamped, the range is compressed to 1/4 (or other factor) of original
float getMaterialDensity(float materialId) {
    float originalDensity;
    
    // Core materials - hardcode densities
    if (materialId < 12.0) {
        if (materialId == 0.0) originalDensity = 0.001;      // AIR
        else if (materialId == 1.0) originalDensity = 0.1;        // SMOKE
        else if (materialId == 2.0) originalDensity = 1000.0;    // WATER
        else if (materialId == 3.0) originalDensity = 2725.0;    // LAVA
        else if (materialId == 4.0) originalDensity = 1602.0;    // SAND
        else if (materialId == 5.0) originalDensity = 500.0;     // PLANT (approximate)
        else if (materialId == 6.0) originalDensity = 2000.0;    // STONE (approximate)
        else if (materialId == 7.0) originalDensity = 10000.0;   // WALL (very high)
        else if (materialId == 8.0) originalDensity = 917.0;     // ICE
        else if (materialId == 9.0) originalDensity = 0.1;       // FIRE (gas-like)
        else if (materialId == 10.0) originalDensity = 0.6;      // STEAM
        else if (materialId == 11.0) originalDensity = 500.0;     // MOSS (approximate)
        else originalDensity = 1000.0; // Default
        
        // Clamp core material density: scale from original range to clamped range
        // Formula: (density - min) * clampFactor + min
        return (originalDensity - 0.001) * DENSITY_CLAMP_FACTOR + 0.001;
    }
    
    // Extended materials - lookup from texture and denormalize
    vec4 props = getMaterialProperties(materialId);
    float normalizedDensity = props.g; // G channel = normalized density
    // Denormalize with clamped range: density = normalized * clampedRange + min
    return normalizedDensity * DENSITY_RANGE + DENSITY_MIN;
}

// Get material state (0.0 = solid, 1.0 = liquid, 2.0 = gas)
float getMaterialViscosity(float materialId) {
    // Core materials - hardcode viscosities
    if (materialId < 12.0) {
        if (materialId == 2.0) return 1.0;   // WATER = 1 (very low viscosity)
        if (materialId == 3.0) return 1000.0; // LAVA = 1000 (molten, viscous)
        // Other core materials don't use viscosity
        return 1.0; // Default to low viscosity
    }
    // Extended materials - lookup from texture
    vec4 props = getMaterialProperties(materialId);
    float normalizedVisc = props.b; // B channel = viscosity (0-1)
    // Denormalize: 0-1 range maps to 0-10000
    float visc = normalizedVisc * 10000.0;
    // If viscosity is 0 (undefined), default to 1.0 (low viscosity like water)
    // This ensures liquids without explicit viscosity flow freely
    if (visc < 0.5) return 1.0;
    return visc;
}

float getMaterialState(float materialId) {
    // Core materials - hardcode states
    if (materialId < 12.0) {
        if (materialId == 0.0) return 2.0;  // AIR = gas
        if (materialId == 1.0) return 2.0;  // SMOKE = gas
        if (materialId == 2.0) return 1.0;  // WATER = liquid
        if (materialId == 3.0) return 1.0;  // LAVA = liquid
        if (materialId == 4.0) return 0.0;  // SAND = solid
        if (materialId == 5.0) return 0.0;  // PLANT = solid
        if (materialId == 6.0) return 0.0;  // STONE = solid
        if (materialId == 7.0) return 0.0;  // WALL = solid
        if (materialId == 8.0) return 0.0;  // ICE = solid
        if (materialId == 9.0) return 2.0;  // FIRE = gas
        if (materialId == 10.0) return 2.0; // STEAM = gas
        if (materialId == 11.0) return 0.0; // MOSS = solid
        return 0.0; // Default to solid
    }
    
    // Extended materials - lookup from texture
    vec4 props = getMaterialProperties(materialId);
    return props.a; // A channel = state (0.0 = solid, 1.0 = liquid, 2.0 = gas)
}

// Check if a gas is high-temperature (can penetrate heavier materials)
// Only SMOKE and STEAM can penetrate - this is a feature difference from Sandboxels
bool isHighTempGas(float materialId) {
    // Core materials: SMOKE (1) and STEAM (10) are high-temp
    if (materialId == 1.0) return true;  // SMOKE
    if (materialId == 10.0) return true; // STEAM
    // Extended gases: assume not high-temp unless we add temperature to texture later
    return false;
}

// Check if two materials can swap based on density and state
// Returns true if material1 can swap with material2
// For normal materials: material1 density >= material2 density
// For gases: Only high-temp gases (SMOKE, STEAM) can penetrate heavier materials
// Regular gases can only swap with lighter materials or AIR
// NOTE: Extended materials (ID > 11) can swap with core materials based on density
// BUT: Extended powders cannot swap with core powders (SAND, STONE, MOSS) - they use ID-based physics
bool canSwapByDensity(float materialId1, float materialId2) {
    // Always allow swapping with AIR
    if (materialId2 == 0.0) return true;
    
    // All materials now use density-based physics - no core/extended distinction
    // Removed restriction: extended materials can swap with core powders based on density
    
    float state1 = getMaterialState(materialId1);
    float state2 = getMaterialState(materialId2);
    
    // Check validDensitySwaps rules:
    // solid ↔ liquid: YES
    // solid ↔ gas: YES (but gases use special logic)
    // liquid ↔ liquid: YES
    // liquid ↔ gas: YES (but gases use special logic)
    // gas ↔ gas: YES
    // solid ↔ solid: YES (implicit, same state)
    
    bool canSwap = false;
    if (state1 == state2) {
        // Same state - can swap (solid↔solid, liquid↔liquid, gas↔gas)
        canSwap = true;
    } else if (state1 == 0.0 && state2 == 1.0) {
        // solid ↔ liquid
        canSwap = true;
    } else if (state1 == 0.0 && state2 == 2.0) {
        // solid ↔ gas (gas can rise through solid)
        canSwap = true;
    } else if (state1 == 1.0 && state2 == 2.0) {
        // liquid ↔ gas (gas can rise through liquid)
        canSwap = true;
    } else if (state1 == 1.0 && state2 == 0.0) {
        // liquid ↔ solid
        canSwap = true;
    } else if (state1 == 2.0 && state2 == 0.0) {
        // gas ↔ solid (gas can rise through solid)
        canSwap = true;
    } else if (state1 == 2.0 && state2 == 1.0) {
        // gas ↔ liquid (gas can rise through liquid)
        canSwap = true;
    }
    
    if (!canSwap) return false;
    
    float density1 = getMaterialDensity(materialId1);
    float density2 = getMaterialDensity(materialId2);
    
    // Special case: Gases (disabled for extended materials for now)
    if (state1 == 2.0) {
        // Skip gas logic for extended materials - we're not processing them
        if (materialId1 > 11.0) {
            return false; // Extended gases disabled
        }
        // High-temp gases (SMOKE, STEAM) can penetrate heavier materials
        if (isHighTempGas(materialId1)) {
            // Can swap if target is heavier OR both are gases
            return (density2 > density1) || (state2 == 2.0);
        } else {
            // Regular gases can only swap with lighter materials or other gases
            return (density2 < density1) || (state2 == 2.0);
        }
    }
    
    // Normal case: material1 must be denser or equal
    return density1 >= density2;
}

// Check if material is a specific behavior type
float getBehaviorType(float materialId) {
    // For core materials (0-11), return a sentinel value to use core physics
    if (materialId < 12.0) {
        return -1.0; // Sentinel: use core physics
    }
    vec4 props = getMaterialProperties(materialId);
    float behavior = props.r;
    // If behavior is 0 and material is not actually gas, texture lookup failed
    // Default to powder for extended materials if lookup fails
    if (behavior == 0.0 && materialId >= 12.0) {
        return 4.0; // Default to powder
    }
    return behavior;
}

bool isGas(float materialId) {
    // Core gases: SMOKE (1) and STEAM (10) are gases
    if (materialId == 1.0 || materialId == 10.0) return true;
    
    // Extended materials: check behavior from texture
    if (materialId < 12.0) return false; // Other core materials are not gases
    
    float behavior = getBehaviorType(materialId);
    if (behavior < 0.0) return false; // Shouldn't happen for extended materials
    return behavior == BEHAVIOR_GAS || behavior == BEHAVIOR_DGAS;
}

bool isLiquid(float materialId) {
    float behavior = getBehaviorType(materialId);
    if (behavior < 0.0) return false; // Core materials use core physics
    return behavior == BEHAVIOR_LIQUID || behavior == BEHAVIOR_MOLTEN;
}

bool isPowder(float materialId) {
    float behavior = getBehaviorType(materialId);
    if (behavior < 0.0) return false; // Core materials use core physics
    return behavior == BEHAVIOR_POWDER || behavior == BEHAVIOR_STURDYPOWDER || behavior == BEHAVIOR_SUPPORTPOWDER;
}

bool isWall(float materialId) {
    float behavior = getBehaviorType(materialId);
    if (behavior < 0.0) return false; // Core materials use core physics
    return behavior == BEHAVIOR_WALL || behavior == BEHAVIOR_SUPPORT;
}
`;
}

/**
 * Generate createParticle function using texture lookups
 */
export function generateCreateParticleFunction(
  materialMap: Map<string, MaterialIDMapping>,
  customBehaviors: Map<number, CustomBehavior>
): string {
  // For core materials, keep special initialization
  // For others, use texture lookup
  return `
vec4 createParticle(float id) {
    if (id == AIR) {
        return vec4(0.0, 0.0, 0.0, AIR);
    }
    else if (id == SMOKE) {
        return vec4(hash13(vec3(gl_FragCoord.xy, float(frame))), 0.0, 0.0, SMOKE);
    }
    else if (id == WATER) {
        return vec4(hash13(vec3(gl_FragCoord.xy, float(frame))), 0.0, 0.0, WATER);
    }
    else if (id == LAVA) {
        return vec4(hash13(vec3(gl_FragCoord.xy, float(frame))), 0.0, 0.0, LAVA);
    }
    else if (id == SAND) {
        return vec4(hash13(vec3(gl_FragCoord.xy, float(frame))), 0.0, 0.0, SAND);
    }
    else if (id == PLANT) {
        return vec4(hash13(vec3(gl_FragCoord.xy, float(frame))), 0.0, 0.5, PLANT);
    }
    else if (id == STONE) {
        return vec4(hash13(vec3(gl_FragCoord.xy, float(frame))), 0.0, 0.0, STONE);
    }
    else if (id == WALL) {
        return vec4(hash13(vec3(gl_FragCoord.xy, float(frame))), 0.0, 0.0, WALL);
    }
    else if (id == ICE) {
        return vec4(hash13(vec3(gl_FragCoord.xy, float(frame))), 0.0, 0.0, ICE);
    }
    else if (id == FIRE) {
        return vec4(hash13(vec3(gl_FragCoord.xy, float(frame))), 0.0, 0.5 + hash13(vec3(gl_FragCoord.xy, float(frame) + 1.0)) * 0.5, FIRE);
    }
    else if (id == STEAM) {
        return vec4(hash13(vec3(gl_FragCoord.xy, float(frame))), 0.0, 0.0, STEAM);
    }
    else if (id == MOSS) {
        return vec4(hash13(vec3(gl_FragCoord.xy, float(frame))), hash13(vec3(gl_FragCoord.xy, float(frame) + 2.0)), 0.3, MOSS);
    }
    ${generateCustomParticleCreation(customBehaviors, materialMap)}
    else {
        // Generic material creation using texture lookup
        float rand = hash13(vec3(gl_FragCoord.xy, float(frame)));
        return vec4(rand, 0.0, 0.0, id);
    }
}
`;
}

/**
 * Generate custom particle creation code for complex materials
 */
function generateCustomParticleCreation(
  customBehaviors: Map<number, CustomBehavior>,
  materialMap: Map<string, MaterialIDMapping>
): string {
  const cases: string[] = [];
  
  for (const behavior of customBehaviors.values()) {
    const mapping = materialMap.get(behavior.materialName);
    if (mapping) {
      // Uranium needs special initialization
      if (behavior.materialName === 'uranium') {
        cases.push(`
        else if (id == ${mapping.glslConstant}) {
            // Initialize uranium with color variation and radiation level
            float rand = hash13(vec3(gl_FragCoord.xy, float(frame)));
            return vec4(rand, 0.0, 0.0, ${mapping.glslConstant});
        }
        `);
      }
    }
  }
  
  return cases.join('\n');
}

/**
 * Generate behavior-based physics code
 */
export function generateBehaviorBasedPhysics(): string {
  return `
// Check if material is wall (no physics applied)
bool isWallMaterial(float materialId) {
    if (materialId < 12.0) return false; // Core materials use core physics
    float behavior = getBehaviorType(materialId);
    return behavior == BEHAVIOR_WALL || behavior == BEHAVIOR_SUPPORT;
}

// Generic powder physics
void applyPowderPhysics(inout vec4 t00, inout vec4 t01, inout vec4 t10, inout vec4 t11, vec4 r) {
    // Skip if any are walls (walls don't move)
    if (isWallMaterial(t00.a) || isWallMaterial(t01.a) || isWallMaterial(t10.a) || isWallMaterial(t11.a)) {
        return;
    }
    
    // Skip if any are gases (gases have their own physics)
    if ((t00.a > 11.0 && isGas(t00.a)) || (t01.a > 11.0 && isGas(t01.a)) || 
        (t10.a > 11.0 && isGas(t10.a)) || (t11.a > 11.0 && isGas(t11.a))) {
        return;
    }
    
    // Process extended materials (ID > 11) - can interact with core materials via density
    // Check if any are powders (extended materials only)
    // Allow interaction with core materials (like AIR) - density-based swapping handles it
    bool powder01 = t01.a > 11.0 && isPowder(t01.a);
    bool powder11 = t11.a > 11.0 && isPowder(t11.a);
    
    // Check if sturdypowder (slower fall, more stable)
    float behavior01 = powder01 ? getBehaviorType(t01.a) : -1.0;
    float behavior11 = powder11 ? getBehaviorType(t11.a) : -1.0;
    bool sturdy01 = behavior01 == BEHAVIOR_STURDYPOWDER || behavior01 == BEHAVIOR_SUPPORTPOWDER;
    bool sturdy11 = behavior11 == BEHAVIOR_STURDYPOWDER || behavior11 == BEHAVIOR_SUPPORTPOWDER;
    
    // Get density to make heavier powders slower (like STONE vs SAND)
    float density01 = powder01 ? getMaterialDensity(t01.a) : 0.0;
    float density11 = powder11 ? getMaterialDensity(t11.a) : 0.0;
    
    // Base fall chances: sturdypowders are slower, regular powders vary by density
    // Heavier powders (like rock ~2550) should be slower than lighter powders (like salt ~2160)
    // Core STONE uses 0.9, but feels slower due to ID restrictions
    // Make extended powders slower to match STONE behavior
    float baseFallChance01 = sturdy01 ? 0.6 : 0.7;  // Reduced from 0.9/0.7
    float baseFallChance11 = sturdy11 ? 0.6 : 0.7;  // Reduced from 0.9/0.7
    
    // Apply density-based slowdown: heavier powders move slower
    // Density range: ~100 (snow) to ~2550 (rock)
    // Normalize to 0-1 and apply slowdown factor
    float densityFactor01 = 1.0;
    float densityFactor11 = 1.0;
    if (powder01 && density01 > 1000.0) {
        // Heavier than 1000: apply slowdown
        // Rock (2550) should be slower than salt (2160)
        densityFactor01 = 1.0 - min((density01 - 1000.0) / 2000.0, 0.3); // Max 30% slowdown
    }
    if (powder11 && density11 > 1000.0) {
        densityFactor11 = 1.0 - min((density11 - 1000.0) / 2000.0, 0.3); // Max 30% slowdown
    }
    
    float fallChance01 = baseFallChance01 * densityFactor01;
    float fallChance11 = baseFallChance11 * densityFactor11;
    
    // Track whether downward movement was attempted but failed
    bool downwardFailedPowder01 = false;
    bool downwardFailedPowder11 = false;
    
    // Check density before swapping
    // Extended powders can swap with core materials (like AIR) via density
    if (powder01 && r.y < fallChance01) {
        // We attempted downward movement
        if (canSwapByDensity(t01.a, t00.a)) {
            float density01 = getMaterialDensity(t01.a);
            float density00 = getMaterialDensity(t00.a);
            // Handle AIR specially - always allow swap into AIR
            // But reduce swap chance to make powders slower/more viscous
            float swapChance;
            if (t00.a == 0.0) {
                swapChance = 0.7; // Reduced from 0.9 - makes powders slower to fall into AIR
            } else {
                swapChance = (density01 - density00) / (density01 + density00 + 0.001);
                // Apply additional slowdown for heavier powders
                if (density01 > 1500.0) {
                    swapChance *= 0.8; // 20% slower for heavy powders
                }
            }
            if (r.y < swapChance) {
                swap(t01, t00);
            } else {
                // Attempted but swap chance not met - downward failed
                downwardFailedPowder01 = true;
            }
        } else {
            // Can't swap - downward failed
            downwardFailedPowder01 = true;
        }
    }
    if (powder11 && r.y < fallChance11) {
        // We attempted downward movement
        if (canSwapByDensity(t11.a, t10.a)) {
            float density11 = getMaterialDensity(t11.a);
            float density10 = getMaterialDensity(t10.a);
            // Handle AIR specially - always allow swap into AIR
            // But reduce swap chance to make powders slower/more viscous
            float swapChance;
            if (t10.a == 0.0) {
                swapChance = 0.7; // Reduced from 0.9 - makes powders slower to fall into AIR
            } else {
                swapChance = (density11 - density10) / (density11 + density10 + 0.001);
                // Apply additional slowdown for heavier powders
                if (density11 > 1500.0) {
                    swapChance *= 0.8; // 20% slower for heavy powders
                }
            }
            if (r.y < swapChance) {
                swap(t11, t10);
            } else {
                // Attempted but swap chance not met - downward failed
                downwardFailedPowder11 = true;
            }
        } else {
            // Can't swap - downward failed
            downwardFailedPowder11 = true;
        }
    }
    
    // Horizontal/diagonal movement (only if downward was attempted but failed)
    // Powders should prioritize vertical movement - only move horizontally/diagonally if blocked below
    // Allow movement when blocked - can interact with core materials
    // Check both left and right directions
    // Reduced horizontal movement chance to make powders more "viscous" (slower to spread)
    // Core STONE has very limited horizontal movement (only when blocked)
    float horizChance = (sturdy01 || sturdy11) ? 0.15 : 0.25;  // Reduced from 0.2/0.4
    
    // Powder in t01 (bottom left) can move:
    // - Right: to t11 (bottom right) - horizontal
    // - Diagonal right: to t10 (top right) - diagonal
    if (powder01 && downwardFailedPowder01 && r.x < horizChance) {
        // Try moving right (horizontal) to t11
        if (canSwapByDensity(t01.a, t11.a)) {
            float density01 = getMaterialDensity(t01.a);
            float density11 = getMaterialDensity(t11.a);
            float swapChance = (density01 - density11) / (density01 + density11 + 0.001);
            if (r.x < swapChance * 0.5) { // 50% chance to try right
                swap(t01, t11);
            }
        }
        // Try moving diagonal right to t10 (if right didn't work)
        else if (canSwapByDensity(t01.a, t10.a)) {
            float density01 = getMaterialDensity(t01.a);
            float density10 = getMaterialDensity(t10.a);
            float swapChance = (density01 - density10) / (density01 + density10 + 0.001);
            if (r.x < swapChance * 0.5) { // 50% chance to try diagonal right
                swap(t01, t10);
            }
        }
    }
    
    // Powder in t11 (bottom right) can move:
    // - Left: to t01 (bottom left) - horizontal
    // - Diagonal left: to t00 (top left) - diagonal
    if (powder11 && downwardFailedPowder11 && r.x < horizChance) {
        // Try moving left (horizontal) to t01
        if (canSwapByDensity(t11.a, t01.a)) {
            float density11 = getMaterialDensity(t11.a);
            float density01 = getMaterialDensity(t01.a);
            float swapChance = (density11 - density01) / (density11 + density01 + 0.001);
            if (r.x < swapChance * 0.5) { // 50% chance to try left
                swap(t11, t01);
            }
        }
        // Try moving diagonal left to t00 (if left didn't work)
        else if (canSwapByDensity(t11.a, t00.a)) {
            float density11 = getMaterialDensity(t11.a);
            float density00 = getMaterialDensity(t00.a);
            float swapChance = (density11 - density00) / (density11 + density00 + 0.001);
            if (r.x < swapChance * 0.5) { // 50% chance to try diagonal left
                swap(t11, t00);
            }
        }
    }
}

// Generic liquid physics with viscosity
void applyLiquidPhysics(inout vec4 t00, inout vec4 t01, inout vec4 t10, inout vec4 t11, vec4 r) {
    // Skip if any are walls (walls don't move)
    if (isWallMaterial(t00.a) || isWallMaterial(t01.a) || isWallMaterial(t10.a) || isWallMaterial(t11.a)) {
        return;
    }
    
    // Skip if any are gases (gases have their own physics)
    if ((t00.a > 11.0 && isGas(t00.a)) || (t01.a > 11.0 && isGas(t01.a)) || 
        (t10.a > 11.0 && isGas(t10.a)) || (t11.a > 11.0 && isGas(t11.a))) {
        return;
    }
    
    // Process extended materials (ID > 11) - can interact with core materials via density
    // Check if any are liquids (extended materials only)
    // Allow interaction with core materials (like AIR, WATER) - density-based swapping handles it
    bool liquid01 = t01.a > 11.0 && isLiquid(t01.a);
    bool liquid11 = t11.a > 11.0 && isLiquid(t11.a);
    
    // Calculate viscosity-based move chance for each liquid
    // Formula from Sandboxels: moveChance = 100 / (viscosity^0.25)
    // We check if random < moveChance/100
    // Adjusted: Make liquids less viscous by default - if viscosity is undefined or very low, always move
    bool viscMove01 = true;
    bool viscMove11 = true;
    
    if (liquid01) {
        float visc01 = getMaterialViscosity(t01.a);
        // Only apply viscosity check if viscosity is significant (> 2.0)
        // This makes most liquids (water, acid, oil, alcohol) flow freely
        if (visc01 > 2.0) {
            // moveChance = 100 / (visc^0.25)
            float moveChance = 100.0 / pow(visc01, 0.25);
            viscMove01 = (r.z * 100.0) < moveChance;
        }
        // If viscosity <= 2.0, viscMove01 stays true (always moves)
    }
    if (liquid11) {
        float visc11 = getMaterialViscosity(t11.a);
        // Only apply viscosity check if viscosity is significant (> 2.0)
        if (visc11 > 2.0) {
            float moveChance = 100.0 / pow(visc11, 0.25);
            viscMove11 = (r.w * 100.0) < moveChance;
        }
        // If viscosity <= 2.0, viscMove11 stays true (always moves)
    }
    
    // Downward movement (with viscosity check)
    // Liquids can swap if: liquid density >= target density AND states are compatible
    // CRITICAL: Extended liquids must be able to swap with core WATER (ID=2) based on density
    if (liquid01 && viscMove01 && r.y < 0.95) {
        float density01 = getMaterialDensity(t01.a);
        float density00 = getMaterialDensity(t00.a);
        float state01 = getMaterialState(t01.a);
        float state00 = getMaterialState(t00.a);
        
        // Liquids can move into empty spaces (AIR) or swap with lighter/equal materials
        // From Sandboxels: liquid can swap with liquid, gas, or solid if liquid is denser
        // BRIDGE: Extended liquids can swap with core WATER based on density
        bool canSwap = false;
        if (t00.a == 0.0) {
            // Target is AIR - always allow liquid to flow down
            canSwap = true;
        } else if (t00.a == 2.0) {
            // Target is core WATER - only swap if extended liquid is denser (falls through water)
            // Lighter liquids (alcohol 785, oil 825) should rise, not fall - handled by upward movement
            // Heavier liquids (honey 1420) should fall through water
            canSwap = density01 >= density00; // Only swap if extended liquid is denser
        } else if (state01 == 1.0 && state00 == 1.0 && density01 >= density00) {
            // Both are liquids - swap if moving liquid is denser or equal
            canSwap = true;
        } else if (state01 == 1.0 && state00 == 2.0 && density01 >= density00) {
            // Liquid ↔ gas - swap if liquid is denser or equal
            canSwap = true;
        } else if (state01 == 1.0 && state00 == 0.0 && density01 >= density00) {
            // Liquid ↔ solid - swap if liquid is denser or equal
            canSwap = true;
        }
        
        if (canSwap) {
            float swapChance = 0.95; // Default to high chance for liquids
            if (t00.a == 0.0) {
                // Moving into AIR - very high chance
                swapChance = 0.98;
            } else if (t00.a == 2.0) {
                // Swapping with core WATER - extended liquid is denser (e.g., honey 1420 > water 1000)
                // Only reaches here if density01 >= density00 (checked in canSwap above)
                swapChance = (density01 - density00) / (density01 + density00 + 0.001);
                swapChance = max(swapChance, 0.7);
            } else {
                // Use density difference for swap chance
                // For liquids, we want them to flow more easily
                swapChance = (density01 - density00) / (density01 + density00 + 0.001);
                // Ensure minimum swap chance for liquids - they should flow easily
                swapChance = max(swapChance, 0.7); // Increased from 0.5 to 0.7
            }
            // Use a different random component for swap chance to avoid double-checking r.y
            if (r.z < swapChance) {
                swap(t01, t00);
            }
        }
    }
    if (liquid11 && viscMove11 && r.y < 0.95) {
        float density11 = getMaterialDensity(t11.a);
        float density10 = getMaterialDensity(t10.a);
        float state11 = getMaterialState(t11.a);
        float state10 = getMaterialState(t10.a);
        
        // BRIDGE: Extended liquids can swap with core WATER based on density
        bool canSwap = false;
        if (t10.a == 0.0) {
            canSwap = true;
        } else if (t10.a == 2.0) {
            // Target is core WATER - allow density-based swapping
            // Only swap if extended liquid is denser (falls through water)
            canSwap = density11 >= density10;
        } else if (state11 == 1.0 && state10 == 1.0 && density11 >= density10) {
            canSwap = true;
        } else if (state11 == 1.0 && state10 == 2.0 && density11 >= density10) {
            canSwap = true;
        } else if (state11 == 1.0 && state10 == 0.0 && density11 >= density10) {
            canSwap = true;
        }
        
        if (canSwap) {
            float swapChance = 0.95; // Default to high chance for liquids
            if (t10.a == 0.0) {
                // Moving into AIR - very high chance
                swapChance = 0.98;
            } else if (t10.a == 2.0) {
                // Swapping with core WATER - use density-based swap chance
                // Extended liquid is denser - falls through water
                swapChance = (density11 - density10) / (density11 + density10 + 0.001);
                swapChance = max(swapChance, 0.7);
            } else {
                // Use density difference for swap chance
                // For liquids, we want them to flow more easily
                swapChance = (density11 - density10) / (density11 + density10 + 0.001);
                // Ensure minimum swap chance for liquids - they should flow easily
                swapChance = max(swapChance, 0.7); // Increased from 0.5 to 0.7
            }
            // Use a different random component for swap chance to avoid double-checking r.y
            if (r.w < swapChance) {
                swap(t11, t10);
            }
        }
    }
    
    // UPWARD MOVEMENT: Lighter extended liquids rising through heavier core WATER
    // If extended liquid is lighter than water above, it should rise (alcohol/oil float on water)
    // This handles the case where alcohol (785) or oil (825) is below water (1000) - they should rise
    // CRITICAL: This must run BEFORE downward movement to prioritize rising over falling
    // Check all positions where extended liquid is below water
    if (liquid01 && viscMove01 && t00.a == 2.0) {
        float density01 = getMaterialDensity(t01.a);
        float density00 = getMaterialDensity(t00.a); // WATER density = 1000
        // If extended liquid is lighter, it should rise (swap upward)
        if (density01 < density00) {
            float swapChance = (density00 - density01) / (density01 + density00 + 0.001);
            swapChance = max(swapChance, 0.8); // Increased from 0.7 to 0.8 for more reliable floating
            // Use r.z for upward movement to avoid conflicts with downward movement (r.y)
            if (r.z < swapChance) {
                swap(t01, t00); // Alcohol/oil rises through water
            }
        }
    }
    if (liquid11 && viscMove11 && t10.a == 2.0) {
        float density11 = getMaterialDensity(t11.a);
        float density10 = getMaterialDensity(t10.a); // WATER density = 1000
        // If extended liquid is lighter, it should rise (swap upward)
        if (density11 < density10) {
            float swapChance = (density10 - density11) / (density11 + density10 + 0.001);
            swapChance = max(swapChance, 0.8); // Increased from 0.7 to 0.8 for more reliable floating
            // Use r.w for upward movement to avoid conflicts with downward movement (r.y)
            if (r.w < swapChance) {
                swap(t11, t10); // Alcohol/oil rises through water
            }
        }
    }
    
    // Horizontal movement (only if downward was attempted but failed AND viscMove = true)
    // In Sandboxels: horizontal movement only happens if downward movement was attempted but couldn't move
    // We need to track if downward was attempted but failed (swap didn't happen)
    bool triedDown01 = false;
    bool triedDown11 = false;
    
    // Check if we attempted downward movement but it failed
    if (liquid01 && viscMove01 && r.y < 0.95) {
        // We attempted downward - check if swap would have succeeded
        if (canSwapByDensity(t01.a, t00.a)) {
            float density01 = getMaterialDensity(t01.a);
            float density00 = getMaterialDensity(t00.a);
            float swapChance = (density01 - density00) / (density01 + density00);
            // If swap chance was high enough but we didn't swap, downward failed
            if (r.y >= swapChance) {
                triedDown01 = true; // Attempted but failed
            }
        } else {
            triedDown01 = true; // Can't swap, so downward failed
        }
    }
    
    if (liquid11 && viscMove11 && r.y < 0.95) {
        if (canSwapByDensity(t11.a, t10.a)) {
            float density11 = getMaterialDensity(t11.a);
            float density10 = getMaterialDensity(t10.a);
            float swapChance = (density11 - density10) / (density11 + density10);
            if (r.y >= swapChance) {
                triedDown11 = true; // Attempted but failed
            }
        } else {
            triedDown11 = true; // Can't swap, so downward failed
        }
    }
    
    // Only allow horizontal movement if downward was attempted but failed
    // Allow interaction with core materials
    // Check both left and right directions
    bool liquid01_h = t01.a > 11.0 && isLiquid(t01.a);
    bool liquid11_h = t11.a > 11.0 && isLiquid(t11.a);
    
    // Horizontal movement: 50% chance (r.x < 0.5), only if viscosity allows and downward failed
    // Liquid in t01 (bottom left) can move right to t11
    if (liquid01_h && viscMove01 && triedDown01 && r.x < 0.5) {
        if (canSwapByDensity(t01.a, t11.a)) {
            float density01 = getMaterialDensity(t01.a);
            float density11 = getMaterialDensity(t11.a);
            float swapChance = (density01 - density11) / (density01 + density11 + 0.001);
            if (r.x < swapChance * 0.5) { // 50% chance to try right
                swap(t01, t11);
            }
        }
    }
    
    // Liquid in t11 (bottom right) can move left to t01
    if (liquid11_h && viscMove11 && triedDown11 && r.x < 0.5) {
        if (canSwapByDensity(t11.a, t01.a)) {
            float density11 = getMaterialDensity(t11.a);
            float density01 = getMaterialDensity(t01.a);
            float swapChance = (density11 - density01) / (density11 + density01 + 0.001);
            if (r.x < swapChance * 0.5) { // 50% chance to try left
                swap(t11, t01);
            }
        }
    }
    
    // Also check top row horizontal movement
    bool liquid00_h = t00.a > 11.0 && isLiquid(t00.a);
    bool liquid10_h = t10.a > 11.0 && isLiquid(t10.a);
    
    // Liquid in t00 (top left) can move right to t10
    if (liquid00_h && r.x < 0.5) {
        float visc00 = getMaterialViscosity(t00.a);
        bool viscMove00 = true;
        if (visc00 > 1.0) {
            float moveChance = 100.0 / pow(visc00, 0.25);
            viscMove00 = (r.z * 100.0) < moveChance;
        }
        if (viscMove00 && canSwapByDensity(t00.a, t10.a)) {
            float density00 = getMaterialDensity(t00.a);
            float density10 = getMaterialDensity(t10.a);
            float swapChance = (density00 - density10) / (density00 + density10 + 0.001);
            if (r.x < swapChance * 0.5) {
                swap(t00, t10);
            }
        }
    }
    
    // Liquid in t10 (top right) can move left to t00
    if (liquid10_h && r.x < 0.5) {
        float visc10 = getMaterialViscosity(t10.a);
        bool viscMove10 = true;
        if (visc10 > 1.0) {
            float moveChance = 100.0 / pow(visc10, 0.25);
            viscMove10 = (r.w * 100.0) < moveChance;
        }
        if (viscMove10 && canSwapByDensity(t10.a, t00.a)) {
            float density10 = getMaterialDensity(t10.a);
            float density00 = getMaterialDensity(t00.a);
            float swapChance = (density10 - density00) / (density10 + density00 + 0.001);
            if (r.x < swapChance * 0.5) {
                swap(t10, t00);
            }
        }
    }
}

// Generic gas physics - Simple: mimic SMOKE/STEAM behavior using density instead of ID
// Original SMOKE/STEAM: if (t01.a < t00.a && r.y < 0.25) swap(t00, t01)
// This makes gas in t00 move DOWN into t01 if t01 has lower ID
// For gases to RISE, we need to reverse: gas in t01 moves UP into t00 if t00 has higher density
// But we'll keep the same structure and just use density comparison
void applyGasPhysics(inout vec4 t00, inout vec4 t01, inout vec4 t10, inout vec4 t11, vec4 r) {
    // Check if any are gases - include BOTH core gases (SMOKE=1, STEAM=10) AND extended gases (ID > 11)
    bool gas00 = (t00.a == 1.0 || t00.a == 10.0) || (t00.a > 11.0 && isGas(t00.a));
    bool gas01 = (t01.a == 1.0 || t01.a == 10.0) || (t01.a > 11.0 && isGas(t01.a));
    bool gas10 = (t10.a == 1.0 || t10.a == 10.0) || (t10.a > 11.0 && isGas(t10.a));
    bool gas11 = (t11.a == 1.0 || t11.a == 10.0) || (t11.a > 11.0 && isGas(t11.a));
    
    if (!gas00 && !gas01 && !gas10 && !gas11) {
        return; // No gases to process
    }
    
    // Horizontal movement (mimics original SMOKE/STEAM horizontal code)
    // Original: bool smoke01 = t01.a == SMOKE && t11.a < SMOKE; if (smoke01 && r.x < 0.25) swap(t01, t11);
    // We use density: swap if both are gases OR target is lighter
    if (r.x < 0.25) {
        if (gas01 && gas11) {
            // Both are gases - always swap horizontally
            swap(t01, t11);
        } else if (gas01) {
            float density01 = getMaterialDensity(t01.a);
            float density11 = getMaterialDensity(t11.a);
            // Swap if target is lighter (gas can move into lighter material)
            if (density11 < density01) {
                swap(t01, t11);
            }
        } else if (gas11) {
            float density01 = getMaterialDensity(t01.a);
            float density11 = getMaterialDensity(t11.a);
            if (density01 < density11) {
                    swap(t01, t11);
            }
        }
        
        // Also check top row horizontal
        if (gas00 && gas10) {
            swap(t00, t10);
        } else if (gas00) {
        float density00 = getMaterialDensity(t00.a);
        float density10 = getMaterialDensity(t10.a);
            if (density10 < density00) {
                swap(t00, t10);
            }
        } else if (gas10) {
            float density00 = getMaterialDensity(t00.a);
            float density10 = getMaterialDensity(t10.a);
            if (density00 < density10) {
                    swap(t00, t10);
            }
        }
    }
    
    // Vertical movement - Gases RISE (move UP)
    // Original SMOKE code: if (t01.a < t00.a && r.y < 0.25) swap(t00, t01)
    // This makes gas in t00 move DOWN into t01 if t01 has lower ID
    // For gases to RISE, we need: gas in t01 moves UP into t00 if t00 has lower density
    // So we reverse: if (density00 < density01 && r.y < 0.25) swap(t01, t00)
    
    // Gas in bottom row (t01, t11) moves UP into top row (t00, t10) if top is lighter
    if (gas01) {
        float density01 = getMaterialDensity(t01.a);
        float density00 = getMaterialDensity(t00.a);
        // Gas rises UP: swap if material above is lighter (or AIR)
        // Reversed from original: original checks t01 < t00 (makes gas move DOWN)
        // We check density00 < density01 (makes gas move UP)
        if ((t00.a == 0.0 || density00 < density01) && r.y < 0.25) {
            swap(t01, t00);
        }
    }
    
    if (gas11) {
        float density11 = getMaterialDensity(t11.a);
        float density10 = getMaterialDensity(t10.a);
        if ((t10.a == 0.0 || density10 < density11) && r.y < 0.25) {
            swap(t11, t10);
        }
    }
    
    // Gas in top row: can move DOWN only into AIR (to allow spreading)
    // But prioritize staying in top row (rising behavior)
    if (gas00) {
        float density00 = getMaterialDensity(t00.a);
        float density01 = getMaterialDensity(t01.a);
        // Only move DOWN if target is AIR (gases spread into empty spaces)
        if (t01.a == 0.0 && r.y < 0.1) {  // Lower probability to prioritize rising
                    swap(t00, t01);
        }
    }
    
    if (gas10) {
        float density10 = getMaterialDensity(t10.a);
        float density11 = getMaterialDensity(t11.a);
        if (t11.a == 0.0 && r.y < 0.1) {
                    swap(t10, t11);
        }
    }
}
`;
}

/**
 * Generate visualization function using texture lookups
 */
export function generateVisualizationFunction(
  materialMap: Map<string, MaterialIDMapping>,
  customBehaviors: Map<number, CustomBehavior>
): string {
  // Disable custom behaviors for now - don't generate any custom visualization calls
  return `
vec3 getParticleColor(vec4 data) {
    float rand = data.r;
    
    // Core materials with special rendering
    if (data.a == AIR) {
        return bgColor;
    }
    else if (data.a == STEAM) {
        return vec3(0.8); // Full brightness - no mixing with background
    }
    else if (data.a == SMOKE) {
        return vec3(0.15); // Full brightness - no mixing with background
    }
    else if (data.a == WATER) {
        vec3 waterColor = vec3(0.2, 0.4, 0.8);
        return waterColor; // Full brightness - no mixing with background
    }
    else if (data.a == LAVA) {
        vec3 baseColor = vec3(0.7, 0.1, 0.03);
        vec3 glowColor = vec3(0.8, 0.2, 0.05);
        return mix(baseColor, glowColor, rand); // Full brightness - no darkening
    }
    else if (data.a == SAND) {
        vec3 baseColor = vec3(0.86, 0.62, 0.27);
        vec3 altColor = vec3(0.82, 0.58, 0.23);
        return mix(baseColor, altColor, rand); // Full brightness - no darkening
    }
    else if (data.a == PLANT) {
        vec3 darkGreen = vec3(0.13, 0.55, 0.13);
        vec3 lightGreen = vec3(0.2, 0.65, 0.2);
        vec3 baseColor = mix(darkGreen, lightGreen, rand);
        return baseColor; // Full brightness - no darkening
    }
    else if (data.a == STONE) {
        vec3 baseColor = vec3(0.08, 0.1, 0.12);
        vec3 altColor = vec3(0.12, 0.14, 0.16);
        return mix(baseColor, altColor, rand); // Full brightness - no darkening
    }
    else if (data.a == WALL) {
        return bgColor; // Full brightness - no darkening
    }
    else if (data.a == ICE) {
        vec3 baseColor = vec3(0.8, 0.9, 1.0);
        vec3 altColor = vec3(0.7, 0.85, 0.95);
        return mix(baseColor, altColor, rand); // Full brightness - no darkening
    }
    else if (data.a == FIRE) {
        vec3 coolColor = vec3(0.8, 0.2, 0.0);
        vec3 hotColor = vec3(1.0, 0.7, 0.2);
        vec3 fireColor = mix(coolColor, hotColor, data.b);
        return fireColor; // Full brightness - no darkening
    }
    else if (data.a == MOSS) {
        vec3 darkMoss = vec3(0.13, 0.55, 0.13);
        vec3 lightMoss = vec3(0.2, 0.65, 0.2);
        vec3 baseColor = mix(darkMoss, lightMoss, rand);
        float fleckIntensity = data.g;
        vec3 redFleck = vec3(0.8, 0.2, 0.1);
        vec3 orangeFleck = vec3(0.9, 0.5, 0.2);
        float fleckRand = hash13(vec3(gl_FragCoord.xy, data.r * 100.0));
        if (fleckRand < fleckIntensity * 0.15) {
            baseColor = mix(baseColor, redFleck, 0.4);
        } else if (fleckRand < fleckIntensity * 0.25) {
            baseColor = mix(baseColor, orangeFleck, 0.3);
        }
        return baseColor; // Full brightness - no darkening
    }
    else {
        // Generic material color from texture (for extended materials 12+)
        return getMaterialColor(data.a);
    }
}
`;
}

