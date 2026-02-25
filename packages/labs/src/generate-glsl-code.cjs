/**
 * Generate GLSL code for all materials
 */

const fs = require('fs');
const path = require('path');

// Read the extracted materials JSON
const jsonPath = path.join(__dirname, 'sandboxels-all-materials.json');
const materialsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Core materials (existing ones with specific IDs)
const coreMaterials = [
  { name: 'air', id: 0 },
  { name: 'smoke', id: 1 },
  { name: 'water', id: 2 },
  { name: 'lava', id: 3 },
  { name: 'sand', id: 4 },
  { name: 'plant', id: 5 },
  { name: 'stone', id: 6 },
  { name: 'wall', id: 7 },
  { name: 'ice', id: 8 },
  { name: 'fire', id: 9 },
  { name: 'steam', id: 10 },
  { name: 'moss', id: 11 },
];

// Get all materials
const allMaterials = [...materialsData.liquids, ...materialsData.solids, ...materialsData.gases];

// Create material map with IDs
const materialMap = new Map();
let nextId = 12; // Start after core materials

// Add core materials first
coreMaterials.forEach(m => {
  materialMap.set(m.name, { ...m, id: m.id });
});

// Add all other materials
allMaterials.forEach(m => {
  if (!materialMap.has(m.name)) {
    materialMap.set(m.name, { ...m, id: nextId++ });
  }
});

console.log(`Total materials: ${materialMap.size}`);

// Generate GLSL constants
let constants = `#define AIR 0.0
#define SMOKE 1.0
#define WATER 2.0
#define LAVA 3.0
#define SAND 4.0
#define PLANT 5.0
#define STONE 6.0
#define WALL 7.0
#define COLLISION 99.0
#define ICE 8.0
#define FIRE 9.0
#define STEAM 10.0
#define MOSS 11.0
`;

materialMap.forEach((material, name) => {
  if (material.id >= 12) {
    const glslName = name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    constants += `#define ${glslName} ${material.id}.0\n`;
  }
});

// Generate createParticle code
let createParticleCode = `vec4 createParticle(float id)
{
\tif (id == AIR)
\t{
\t\treturn vec4(0.0, 0.0, 0.0, AIR);
\t}`;

// Add core materials with special handling
const specialMaterials = {
  'steam': 'hash13(vec3(gl_FragCoord.xy, float(frame)))',
  'smoke': 'hash13(vec3(gl_FragCoord.xy, float(frame)))',
  'water': 'hash13(vec3(gl_FragCoord.xy, float(frame)))',
  'lava': 'hash13(vec3(gl_FragCoord.xy, float(frame)))',
  'sand': 'hash13(vec3(gl_FragCoord.xy, float(frame)))',
  'ice': 'hash13(vec3(gl_FragCoord.xy, float(frame)))',
  'plant': 'hash13(vec3(gl_FragCoord.xy, float(frame)))',
  'stone': 'hash13(vec3(gl_FragCoord.xy, float(frame)))',
  'wall': 'hash13(vec3(gl_FragCoord.xy, float(frame)))',
  'fire': 'hash13(vec3(gl_FragCoord.xy, float(frame)))',
  'moss': 'hash13(vec3(gl_FragCoord.xy, float(frame)))',
};

materialMap.forEach((material, name) => {
  const glslName = name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  const color = material.color || '#888888';
  const hex = color.replace('#', '');
  
  let r, g, b;
  if (hex.length === 6) {
    r = parseInt(hex.substr(0, 2), 16) / 255.0;
    g = parseInt(hex.substr(2, 2), 16) / 255.0;
    b = parseInt(hex.substr(4, 2), 16) / 255.0;
  } else {
    r = g = b = 0.5;
  }
  
  // Use special handling for known materials, otherwise use color
  if (specialMaterials[name]) {
    createParticleCode += `\n\telse if (id == ${glslName})\n\t{\n\t\treturn vec4(${specialMaterials[name]}, 0.0, 0.0, ${glslName});\n\t}`;
  } else {
    createParticleCode += `\n\telse if (id == ${glslName})\n\t{\n\t\treturn vec4(${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)}, ${glslName});\n\t}`;
  }
});

createParticleCode += `\n\treturn vec4(0.0, 0.0, 0.0, AIR);\n}`;

// Write output
const output = {
  constants,
  createParticle: createParticleCode,
  materialCount: materialMap.size,
  materialMap: Object.fromEntries(materialMap)
};

const outputPath = path.join(__dirname, 'glsl-generated.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`Generated GLSL code for ${materialMap.size} materials`);
console.log(`Written to ${outputPath}`);

