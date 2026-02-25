/**
 * Extract all liquids, solids, and gases from Sandboxels HTML
 */

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../../../sandboxels-main/index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Find the elements object - it starts with "elements = {" and ends with "};"
const startMarker = 'elements = {';
const startIdx = html.indexOf(startMarker);
if (startIdx === -1) {
  console.error('Could not find elements object');
  process.exit(1);
}

// Find the end - look for the closing }; after a reasonable amount
let braceCount = 0;
let inString = false;
let stringChar = null;
let i = startIdx + startMarker.length;
let elementsStr = '';

while (i < html.length && i < startIdx + 2000000) { // Limit search
  const char = html[i];
  
  if (!inString) {
    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
    } else if (char === '{') {
      braceCount++;
    } else if (char === '}') {
      braceCount--;
      if (braceCount < 0) {
        elementsStr = html.substring(startIdx + startMarker.length, i);
        break;
      }
    }
  } else {
    if (char === stringChar && html[i-1] !== '\\') {
      inString = false;
      stringChar = null;
    }
  }
  i++;
}

// Now parse the elements (simplified - just extract key info)
const materials = {
  liquids: [],
  solids: [],
  gases: []
};

// Extract material definitions using regex
const materialRegex = /"([^"]+)":\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/g;
let match;

while ((match = materialRegex.exec(elementsStr)) !== null) {
  const name = match[1];
  const content = match[2];
  
  // Check for state
  const stateMatch = content.match(/state:\s*"?(liquid|solid|gas)"?/);
  if (!stateMatch) continue;
  
  const state = stateMatch[1];
  
  // Extract key properties
  const colorMatch = content.match(/color:\s*"([^"]+)"|color:\s*\["([^"]+)"\]/);
  const categoryMatch = content.match(/category:\s*"([^"]+)"/);
  const behaviorMatch = content.match(/behavior:\s*(behaviors\.\w+|\[[\s\S]*?\])/);
  const densityMatch = content.match(/density:\s*(\d+\.?\d*)/);
  const tempHighMatch = content.match(/tempHigh:\s*(\d+\.?\d*)/);
  const tempLowMatch = content.match(/tempLow:\s*(-?\d+\.?\d*)/);
  const stateHighMatch = content.match(/stateHigh:\s*"([^"]+)"|stateHigh:\s*\["([^"]+)"\]/);
  const stateLowMatch = content.match(/stateLow:\s*"([^"]+)"|stateLow:\s*\["([^"]+)"\]/);
  
  const material = {
    name,
    state,
    color: colorMatch ? (colorMatch[1] || colorMatch[2]) : '#888888',
    category: categoryMatch ? categoryMatch[1] : 'other',
    behavior: behaviorMatch ? behaviorMatch[1].trim() : 'WALL',
    density: densityMatch ? parseFloat(densityMatch[1]) : undefined,
    tempHigh: tempHighMatch ? parseFloat(tempHighMatch[1]) : undefined,
    tempLow: tempLowMatch ? parseFloat(tempLowMatch[1]) : undefined,
    stateHigh: stateHighMatch ? (stateHighMatch[1] || stateHighMatch[2]) : undefined,
    stateLow: stateLowMatch ? (stateLowMatch[1] || stateLowMatch[2]) : undefined,
  };
  
  if (state === 'liquid') {
    materials.liquids.push(material);
  } else if (state === 'solid') {
    materials.solids.push(material);
  } else if (state === 'gas') {
    materials.gases.push(material);
  }
}

console.log(`Extracted ${materials.liquids.length} liquids, ${materials.solids.length} solids, ${materials.gases.length} gases`);

// Write to JSON file
const outputPath = path.join(__dirname, 'sandboxels-materials-extracted.json');
fs.writeFileSync(outputPath, JSON.stringify(materials, null, 2));
console.log(`Written to ${outputPath}`);

// Also create a summary
console.log('\nSample materials:');
console.log('Liquids:', materials.liquids.slice(0, 5).map(m => m.name).join(', '));
console.log('Solids:', materials.solids.slice(0, 5).map(m => m.name).join(', '));
console.log('Gases:', materials.gases.slice(0, 5).map(m => m.name).join(', '));

