/**
 * Custom Behavior System
 * 
 * Manages custom shader code for complex materials like uranium
 * Supports cellular automata patterns, custom tick functions, and custom visualization
 */

import type { MaterialIDMapping } from './material-id-map';

export interface CustomBehavior {
  materialId: number;
  materialName: string;
  tickCode: string; // GLSL code for custom tick function
  visualizationCode: string; // GLSL code for custom visualization
  stateChannels: {
    r?: string; // Description of what data.r stores
    g?: string; // Description of what data.g stores
    b?: string; // Description of what data.b stores
  };
}

/**
 * Generate custom tick function for uranium
 */
function generateUraniumTickCode(): string {
  return `
// Custom tick function for uranium
vec4 tickUranium(vec4 data, vec4 neighbors[9], float frame) {
    float hash = hash13(vec3(gl_FragCoord.xy, float(frame)));
    
    // Count radiation neighbors (RADIATION material not yet defined, skip for now)
    // float radCount = 0.0;
    // for (int i = 0; i < 9; i++) {
    //     if (neighbors[i].a == RADIATION) {
    //         radCount += 1.0;
    //     }
    // }
    
    // Convert to lead with 0.1% chance per frame (LEAD material not yet defined, just decay)
    if (hash < 0.001) {
        // For now, just cycle color (lead conversion would need LEAD material defined)
        data.r = mod(data.r + 0.1, 1.0);
    }
    
    // Emit radiation (10% chance)
    if (hash < 0.1) {
        // Mark for radiation emission (handled in separate pass)
        data.g = min(data.g + 0.1, 1.0);
    }
    
    // Cycle through 6 color variations
    data.r = mod(data.r + 0.01, 1.0);
    
    return data;
}
`;
}

/**
 * Generate custom visualization for uranium
 */
function generateUraniumVisualizationCode(): string {
  return `
// Custom visualization for uranium
vec3 visualizeUranium(vec4 data) {
    // Select color from 6 variations based on data.r
    int idx = int(mod(data.r * 6.0, 6.0));
    vec3 colors[6] = vec3[](
        vec3(0.35, 0.62, 0.38),  // #599e61
        vec3(0.21, 0.30, 0.24),  // #364d3c
        vec3(0.29, 0.30, 0.29),  // #494d4a
        vec3(0.42, 0.54, 0.26),  // #6c8a42
        vec3(0.47, 0.55, 0.40),  // #798d65
        vec3(0.71, 0.88, 0.54)   // #b5e089
    );
    
    vec3 baseColor = colors[idx];
    
    // Add green glow based on radiation level (data.g)
    float glow = data.g * 0.3;
    baseColor += vec3(0.2, 0.8, 0.2) * glow;
    
    return baseColor;
}
`;
}

/**
 * Register custom behaviors for complex materials
 */
export function registerCustomBehaviors(
  materialMap: Map<string, MaterialIDMapping>
): Map<number, CustomBehavior> {
  const customBehaviors = new Map<number, CustomBehavior>();
  
  // Register uranium
  const uraniumMapping = materialMap.get('uranium');
  if (uraniumMapping) {
    customBehaviors.set(uraniumMapping.id, {
      materialId: uraniumMapping.id,
      materialName: 'uranium',
      tickCode: generateUraniumTickCode(),
      visualizationCode: generateUraniumVisualizationCode(),
      stateChannels: {
        r: 'colorVariation (0-1, cycles through 6 colors)',
        g: 'radiationLevel (0-1, accumulates over time)',
        b: 'unused',
      },
    });
  }
  
  return customBehaviors;
}

/**
 * Generate GLSL code for all custom tick functions
 */
export function generateCustomTickFunctions(
  customBehaviors: Map<number, CustomBehavior>
): string {
  const functions: string[] = [];
  
  for (const behavior of customBehaviors.values()) {
    functions.push(behavior.tickCode);
  }
  
  return functions.join('\n');
}

/**
 * Generate GLSL code for all custom visualization functions
 */
export function generateCustomVisualizationFunctions(
  customBehaviors: Map<number, CustomBehavior>
): string {
  const functions: string[] = [];
  
  for (const behavior of customBehaviors.values()) {
    functions.push(behavior.visualizationCode);
  }
  
  return functions.join('\n');
}

/**
 * Generate GLSL code to call custom tick functions in main shader
 */
export function generateCustomTickCalls(
  customBehaviors: Map<number, CustomBehavior>,
  materialMap: Map<string, MaterialIDMapping>
): string {
  const calls: string[] = [];
  
  for (const behavior of customBehaviors.values()) {
    const mapping = materialMap.get(behavior.materialName);
    if (mapping) {
      calls.push(`
        if (data.a == ${mapping.glslConstant}) {
            vec4 neighbors[9];
            neighbors[0] = getData(p + ivec2(-1, -1));
            neighbors[1] = getData(p + ivec2(0, -1));
            neighbors[2] = getData(p + ivec2(1, -1));
            neighbors[3] = getData(p + ivec2(-1, 0));
            neighbors[4] = data;
            neighbors[5] = getData(p + ivec2(1, 0));
            neighbors[6] = getData(p + ivec2(-1, 1));
            neighbors[7] = getData(p + ivec2(0, 1));
            neighbors[8] = getData(p + ivec2(1, 1));
            data = tick${behavior.materialName.charAt(0).toUpperCase() + behavior.materialName.slice(1)}(data, neighbors, float(frame));
        }
      `);
    }
  }
  
  return calls.join('\n');
}

/**
 * Generate GLSL code to call custom visualization functions
 */
export function generateCustomVisualizationCalls(
  customBehaviors: Map<number, CustomBehavior>,
  materialMap: Map<string, MaterialIDMapping>
): string {
  const calls: string[] = [];
  
  for (const behavior of customBehaviors.values()) {
    const mapping = materialMap.get(behavior.materialName);
    if (mapping) {
      calls.push(`
        else if (data.a == ${mapping.glslConstant}) {
            return visualize${behavior.materialName.charAt(0).toUpperCase() + behavior.materialName.slice(1)}(data);
        }
      `);
    }
  }
  
  return calls.join('\n');
}

