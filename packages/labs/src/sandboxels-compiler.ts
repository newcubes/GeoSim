/**
 * Sandboxels Material Compiler
 * 
 * Compiles material definitions to GLSL shader code for the folk-sand system.
 */

import type { MaterialDefinition } from './sandboxels-material-definitions';
import { BEHAVIOR_TYPES } from './sandboxels-material-definitions';
import { ALL_MATERIALS } from './all-materials';

export interface CompiledMaterial {
  id: number;
  name: string;
  glslConstant: string;
  behavior: string;
  properties: {
    density?: number;
    temp?: number;
    tempHigh?: number;
    tempLow?: number;
    stateHigh?: string;
    stateLow?: string;
    viscosity?: number;
  };
  reactions: Array<{
    with: string;
    result1?: string;
    result2?: string;
    chance?: number;
    tempMin?: number;
    tempMax?: number;
  }>;
}

/**
 * Compile material definitions to GLSL-compatible format
 */
export function compileMaterials(): {
  constants: string;
  materialMap: Map<string, CompiledMaterial>;
  reactions: string;
} {
  const materials = Object.entries(ALL_MATERIALS);
  const compiled = new Map<string, CompiledMaterial>();
  const constants: string[] = [];
  const reactions: string[] = [];

  materials.forEach(([name, def], index) => {
    const glslName = name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const id = index;
    
    constants.push(`#define ${glslName} ${id}.0`);

    const compiledMaterial: CompiledMaterial = {
      id,
      name,
      glslConstant: glslName,
      behavior: typeof def.behavior === 'string' ? def.behavior : 'CUSTOM',
      properties: {
        density: def.density,
        temp: def.temp,
        tempHigh: def.tempHigh,
        tempLow: def.tempLow,
        stateHigh: Array.isArray(def.stateHigh) ? def.stateHigh[0] : def.stateHigh,
        stateLow: Array.isArray(def.stateLow) ? def.stateLow[0] : def.stateLow,
        viscosity: def.viscosity,
      },
      reactions: [],
    };

    // Compile reactions
    if (def.reactions) {
      Object.entries(def.reactions).forEach(([withMaterial, reaction]) => {
        const result1 = Array.isArray(reaction.elem1) 
          ? reaction.elem1[0] 
          : reaction.elem1;
        const result2 = Array.isArray(reaction.elem2)
          ? reaction.elem2[0]
          : reaction.elem2;

        compiledMaterial.reactions.push({
          with: withMaterial,
          result1,
          result2,
          chance: reaction.chance ?? 1.0,
          tempMin: reaction.tempMin,
          tempMax: reaction.tempMax,
        });
      });
    }

    compiled.set(name, compiledMaterial);
  });

  // Generate reaction code
  compiled.forEach((material) => {
    if (material.reactions.length > 0) {
      material.reactions.forEach((reaction) => {
        const withId = compiled.get(reaction.with)?.id;
        const result1Id = reaction.result1 ? compiled.get(reaction.result1)?.id : -1;
        const result2Id = reaction.result2 ? compiled.get(reaction.result2)?.id : -1;

        if (withId !== undefined && result1Id !== undefined && result1Id >= 0) {
          reactions.push(
            `// ${material.name} + ${reaction.with} -> ${reaction.result1}${reaction.result2 ? ' + ' + reaction.result2 : ''}`
          );
        }
      });
    }
  });

  return {
    constants: constants.join('\n'),
    materialMap: compiled,
    reactions: reactions.join('\n'),
  };
}

/**
 * Generate GLSL shader code for material creation
 */
export function generateCreateParticleCode(): string {
  const materials = Object.entries(ALL_MATERIALS);
  const cases: string[] = [];

  materials.forEach(([name, def]) => {
    const glslName = name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const color = Array.isArray(def.color) ? def.color[0] : def.color;
    
    // Convert hex color to vec3
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255.0;
    const g = parseInt(hex.substr(2, 2), 16) / 255.0;
    const b = parseInt(hex.substr(4, 2), 16) / 255.0;

    cases.push(
      `\telse if (id == ${glslName}) {`,
      `\t\treturn vec4(${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)}, ${glslName});`,
      `\t}`
    );
  });

  return cases.join('\n');
}

