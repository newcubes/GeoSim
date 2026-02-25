/**
 * Comprehensive extraction of all liquids, solids, and gases from Sandboxels
 */

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../../../sandboxels-main/index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Find elements object
const startMarker = 'elements = {';
const startIdx = html.indexOf(startMarker);
if (startIdx === -1) {
  console.error('Could not find elements object');
  process.exit(1);
}

// Extract the elements object more carefully
let braceCount = 0;
let inString = false;
let stringChar = null;
let escapeNext = false;
let i = startIdx + startMarker.length;
let elementsStr = '';

while (i < html.length && i < startIdx + 3000000) {
  const char = html[i];
  
  if (escapeNext) {
    escapeNext = false;
    elementsStr += char;
    i++;
    continue;
  }
  
  if (char === '\\') {
    escapeNext = true;
    elementsStr += char;
    i++;
    continue;
  }
  
  if (!inString) {
    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      elementsStr += char;
    } else if (char === '{') {
      braceCount++;
      elementsStr += char;
    } else if (char === '}') {
      braceCount--;
      elementsStr += char;
      if (braceCount < 0) {
        break;
      }
    } else {
      elementsStr += char;
    }
  } else {
    if (char === stringChar) {
      inString = false;
      stringChar = null;
    }
    elementsStr += char;
  }
  i++;
}

// Now parse materials - look for patterns like "name": { ... state: "liquid" ... }
const materials = {
  liquids: [],
  solids: [],
  gases: []
};

// Split by material definitions
const materialPattern = /"([^"]+)":\s*\{/g;
let match;
const materialDefs = [];

while ((match = materialPattern.exec(elementsStr)) !== null) {
  const name = match[1];
  const startPos = match.index + match[0].length;
  
  // Find the matching closing brace
  let braceCount = 1;
  let pos = startPos;
  let inStr = false;
  let strChar = null;
  let escape = false;
  
  while (pos < elementsStr.length && braceCount > 0) {
    const c = elementsStr[pos];
    
    if (escape) {
      escape = false;
      pos++;
      continue;
    }
    
    if (c === '\\') {
      escape = true;
      pos++;
      continue;
    }
    
    if (!inStr) {
      if (c === '"' || c === "'") {
        inStr = true;
        strChar = c;
      } else if (c === '{') {
        braceCount++;
      } else if (c === '}') {
        braceCount--;
      }
    } else {
      if (c === strChar) {
        inStr = false;
        strChar = null;
      }
    }
    
    if (braceCount === 0) {
      const content = elementsStr.substring(startPos, pos);
      
      // Extract properties
      const stateMatch = content.match(/state:\s*"?(liquid|solid|gas)"?/);
      if (stateMatch) {
        const state = stateMatch[1];
        const colorMatch = content.match(/color:\s*"([^"]+)"|color:\s*\["([^"]+)"\]/);
        const categoryMatch = content.match(/category:\s*"([^"]+)"/);
        const behaviorMatch = content.match(/behavior:\s*(behaviors\.\w+)/);
        const densityMatch = content.match(/density:\s*(\d+\.?\d*)/);
        const tempHighMatch = content.match(/tempHigh:\s*(\d+\.?\d*)/);
        const tempLowMatch = content.match(/tempLow:\s*(-?\d+\.?\d*)/);
        const stateHighMatch = content.match(/stateHigh:\s*"([^"]+)"|stateHigh:\s*\["([^"]+)"\]/);
        const stateLowMatch = content.match(/stateLow:\s*"([^"]+)"|stateLow:\s*\["([^"]+)"\]/);
        
        const material = {
          name,
          state,
          color: colorMatch ? (colorMatch[1] || colorMatch[2] || '#888888') : '#888888',
          category: categoryMatch ? categoryMatch[1] : 'other',
          behavior: behaviorMatch ? behaviorMatch[1] : 'WALL',
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
      break;
    }
    
    pos++;
  }
}

console.log(`Extracted ${materials.liquids.length} liquids, ${materials.solids.length} solids, ${materials.gases.length} gases`);

// Write to JSON
const outputPath = path.join(__dirname, 'sandboxels-all-materials.json');
fs.writeFileSync(outputPath, JSON.stringify(materials, null, 2));
console.log(`Written to ${outputPath}`);

// Summary
console.log('\nSample materials:');
console.log('Liquids:', materials.liquids.slice(0, 10).map(m => m.name).join(', '));
console.log('Solids:', materials.solids.slice(0, 10).map(m => m.name).join(', '));
console.log('Gases:', materials.gases.slice(0, 10).map(m => m.name).join(', '));

