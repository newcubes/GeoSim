/**
 * Generate GLSL constants for all materials
 */

import { ALL_MATERIALS } from './all-materials';

export function generateGLSLConstants(): string {
  const materials = Object.entries(ALL_MATERIALS);
  const constants: string[] = [];
  
  materials.forEach(([name, def], index) => {
    const glslName = name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    constants.push(`#define ${glslName} ${index}.0`);
  });
  
  return constants.join('\n');
}

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

export function getMaterialCount(): number {
  return Object.keys(ALL_MATERIALS).length;
}

