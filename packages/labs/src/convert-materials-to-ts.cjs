/**
 * Convert extracted JSON materials to TypeScript definitions
 */

const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'sandboxels-all-materials.json');
const materials = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Behavior mapping
const behaviorMap = {
  'behaviors.LIQUID': 'BEHAVIOR_TYPES.LIQUID',
  'behaviors.POWDER': 'BEHAVIOR_TYPES.POWDER',
  'behaviors.GAS': 'BEHAVIOR_TYPES.GAS',
  'behaviors.DGAS': 'BEHAVIOR_TYPES.DGAS',
  'behaviors.WALL': 'BEHAVIOR_TYPES.WALL',
  'behaviors.MOLTEN': 'BEHAVIOR_TYPES.MOLTEN',
  'behaviors.SUPPORT': 'BEHAVIOR_TYPES.SUPPORT',
  'behaviors.SUPPORTPOWDER': 'BEHAVIOR_TYPES.SUPPORTPOWDER',
  'behaviors.STURDYPOWDER': 'BEHAVIOR_TYPES.STURDYPOWDER',
};

function convertMaterial(m) {
  const behavior = behaviorMap[m.behavior] || `"${m.behavior}"`;
  const color = m.color || '#888888';
  
  let def = `  ${m.name}: {\n`;
  def += `    name: "${m.name.charAt(0).toUpperCase() + m.name.slice(1).replace(/_/g, ' ')}",\n`;
  def += `    color: "${color}",\n`;
  def += `    behavior: ${behavior},\n`;
  def += `    category: "${m.category || 'other'}",\n`;
  def += `    state: "${m.state}",\n`;
  
  if (m.density !== undefined) {
    def += `    density: ${m.density},\n`;
  }
  if (m.tempHigh !== undefined) {
    def += `    tempHigh: ${m.tempHigh},\n`;
  }
  if (m.tempLow !== undefined) {
    def += `    tempLow: ${m.tempLow},\n`;
  }
  if (m.stateHigh) {
    def += `    stateHigh: "${m.stateHigh}",\n`;
  }
  if (m.stateLow) {
    def += `    stateLow: "${m.stateLow}",\n`;
  }
  
  // Remove trailing comma
  def = def.trimEnd();
  if (def.endsWith(',')) {
    def = def.slice(0, -1);
  }
  
  def += '\n  }';
  return def;
}

// Convert all materials
let tsContent = `/**
 * All Sandboxels Materials - Auto-generated from extraction
 * 
 * This file contains ${materials.liquids.length + materials.solids.length + materials.gases.length} materials
 * extracted from Sandboxels: ${materials.liquids.length} liquids, ${materials.solids.length} solids, ${materials.gases.length} gases
 */

import { MaterialDefinition, BEHAVIOR_TYPES, MATERIAL_CATEGORIES } from './sandboxels-material-definitions';

export const ALL_SANDBOXELS_MATERIALS: Record<string, MaterialDefinition> = {
`;

// Add all materials
const allMaterials = [...materials.liquids, ...materials.solids, ...materials.gases];
allMaterials.forEach((m, i) => {
  tsContent += convertMaterial(m);
  if (i < allMaterials.length - 1) {
    tsContent += ',';
  }
  tsContent += '\n';
});

tsContent += `};

// Export by state for convenience
export const LIQUID_MATERIALS = Object.fromEntries(
  Object.entries(ALL_SANDBOXELS_MATERIALS).filter(([_, m]) => m.state === 'liquid')
);

export const SOLID_MATERIALS = Object.fromEntries(
  Object.entries(ALL_SANDBOXELS_MATERIALS).filter(([_, m]) => m.state === 'solid')
);

export const GAS_MATERIALS = Object.fromEntries(
  Object.entries(ALL_SANDBOXELS_MATERIALS).filter(([_, m]) => m.state === 'gas')
);
`;

const outputPath = path.join(__dirname, 'sandboxels-all-materials.ts');
fs.writeFileSync(outputPath, tsContent);
console.log(`Generated TypeScript definitions for ${allMaterials.length} materials`);
console.log(`Written to ${outputPath}`);

