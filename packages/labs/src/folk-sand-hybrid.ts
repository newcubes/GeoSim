/**
 * FolkSand Hybrid - Texture-Based Material System
 * 
 * This is a new version that uses texture-based lookups for materials
 * while maintaining backward compatibility with core materials.
 * 
 * The original folk-sand.ts remains unchanged for continued use.
 */

import { css, type PropertyValues } from '@folkjs/dom/ReactiveElement';
import { WebGLUtils } from '@folkjs/dom/webgl';
import { FolkBaseSet } from './folk-base-set';
import {
  collisionFragmentShader,
  collisionVertexShader,
  distanceFieldInitShader,
  distanceFieldPropagationShader,
} from './folk-sand.glsl';
import {
  simulationShader,
  vertexShader,
  visualizationShader,
} from './folk-sand-hybrid.glsl';

// Import new systems
import { generateMaterialIDMap } from './material-id-map';
import {
  generateMaterialPropertiesTexture,
  generateMaterialColorsTexture,
  createMaterialPropertiesTexture,
  createMaterialColorsTexture,
} from './material-texture-generator';
import { registerCustomBehaviors } from './custom-behavior-system';
import {
  generateMaterialLookupFunctions,
  generateCreateParticleFunction,
  generateBehaviorBasedPhysics,
  generateVisualizationFunction,
} from './shader-code-generator';
import { generateGLSLConstants } from './material-id-map';
import type { MaterialIDMapping } from './material-id-map';
import type { CustomBehavior } from './custom-behavior-system';

export class FolkSandHybrid extends FolkBaseSet {
  static override tagName = 'folk-sand-hybrid';

  static override styles = [
    FolkBaseSet.styles,
    css`
      canvas {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        pointer-events: auto;
      }
    `,
  ];

  // Debug flags
  #debugGasPhysics = true;
  #debugReactions = true;
  #debugFrameCount = 0;
  #debugSampleInterval = 60; // Sample every 60 frames
  #lastDebugSample = 0;
  #lastReactionDebugSample = 0;
  #gasDebugLog: Array<{frame: number, materialId: number, materialName: string, density: number, isHighTemp: boolean, detected: boolean}> = [];
  #reactionDebugLog: Array<{frame: number, reaction: string, material1: string, material2: string, detected: boolean}> = [];

  static override properties = {
    initialSand: { type: Number, attribute: 'initial-sand' },
    densityClampFactor: { type: Number, attribute: 'density-clamp-factor' },
  };

  initialSand = 0.0;
  densityClampFactor = 1.0; // 1.0 = no clamp, 0.25 = 1/4 range
  useAlternateColors = false; // false = original colors, true = redistributed colors

  #canvas = document.createElement('canvas');
  #gl!: WebGL2RenderingContext;

  #program!: WebGLProgram;
  #blitProgram!: WebGLProgram;
  #jfaShadowProgram!: WebGLProgram;
  #jfaInitProgram!: WebGLProgram;
  #stateUpdateProgram!: WebGLProgram; // For temperature/age updates

  #vao!: WebGLVertexArrayObject;
  #posBuffer!: WebGLBuffer;

  #bufferWidth!: number;
  #bufferHeight!: number;

  #fbo: WebGLFramebuffer[] = [];
  #tex: WebGLTexture[] = [];

  #shadowFbo: WebGLFramebuffer[] = [];
  #shadowTexR: WebGLTexture[] = [];
  #shadowTexG: WebGLTexture[] = [];
  #shadowTexB: WebGLTexture[] = [];

  // Per-pixel state textures (ping-pong buffers)
  #temperatureFbo: WebGLFramebuffer[] = [];
  #temperatureTex: WebGLTexture[] = [];
  #ageFbo: WebGLFramebuffer[] = [];
  #ageTex: WebGLTexture[] = [];

  #pointer = {
    x: -1,
    y: -1,
    prevX: -1,
    prevY: -1,
    down: false,
  };

  #materialType = 4;
  #brushRadius = 10;

  #frames = 0;
  #swap = 0;
  #shadowSwap = 0;

  #PIXELS_PER_PARTICLE = 4;
  #PIXEL_RATIO = window.devicePixelRatio || 1;

  #collisionProgram!: WebGLProgram;
  #collisionFbo!: WebGLFramebuffer;
  #collisionTex!: WebGLTexture;
  #shapeVao!: WebGLVertexArrayObject;
  #shapePositionBuffer!: WebGLBuffer;
  #shapeIndexBuffer!: WebGLBuffer;
  #shapeIndexCount = 0;

  // New: Material system
  #materialMap!: Map<string, MaterialIDMapping>;
  #customBehaviors!: Map<number, CustomBehavior>;
  #materialPropertiesTex!: WebGLTexture;
  #materialColorsTex!: WebGLTexture;

  onMaterialChange?: (type: number) => void;

  override connectedCallback(): void {
    super.connectedCallback();

    this.renderRoot.appendChild(this.#canvas);
    this.#initializeWebGL();
    this.#initializeMaterialSystem();
    this.#initializeSimulation();
    this.#initializeCollisionDetection();
    this.#attachEventListeners();
    this.#handleShapeTransform();
    this.#render();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.#detachEventListeners();
  }

  #initializeWebGL() {
    this.#gl = this.#canvas.getContext('webgl2')!;
    if (!this.#gl) {
      console.error('WebGL2 context not available!');
    }

    if (!this.#gl.getExtension('EXT_color_buffer_float')) {
      console.error('need EXT_color_buffer_float');
    }

    if (!this.#gl.getExtension('OES_texture_float_linear')) {
      console.error('need OES_texture_float_linear');
    }
  }

  /**
   * Initialize the new material system
   */
  #initializeMaterialSystem() {
    // Generate material ID map
    this.#materialMap = generateMaterialIDMap();
    console.log(`Initialized material system with ${this.#materialMap.size} materials`);

    // Register custom behaviors
    this.#customBehaviors = registerCustomBehaviors(this.#materialMap);
    console.log(`Registered ${this.#customBehaviors.size} custom behaviors`);

    // Generate texture data
    const propertiesData = generateMaterialPropertiesTexture(this.#materialMap);
    const colorsData = generateMaterialColorsTexture(this.#materialMap, 512, this.useAlternateColors);

    // Debug: Check a few material colors and behaviors
    const testMaterials = ['dirt', 'mud', 'snow', 'rock', 'wood', 'glass', 'oil', 'carbon_dioxide', 'oxygen', 'hydrogen', 'water', 'alcohol', 'honey'];
    console.log('Sample material data:');
    for (const name of testMaterials) {
      const mapping = this.#materialMap.get(name);
      if (mapping) {
        const colorIndex = mapping.id * 4;
        const propIndex = mapping.id * 4;
        const r = colorsData[colorIndex];
        const g = colorsData[colorIndex + 1];
        const b = colorsData[colorIndex + 2];
        const behaviorID = propertiesData[propIndex];
        const densityNorm = propertiesData[propIndex + 1];
        const stateID = propertiesData[propIndex + 3];
        // Denormalize density: 0-1 range maps to 0.001-20000
        const density = densityNorm * (20000 - 0.001) + 0.001;
        const behaviorNames: Record<number, string> = {0: 'gas', 1: 'dgas', 2: 'liquid', 3: 'molten', 4: 'powder', 5: 'sturdypowder', 6: 'wall', 7: 'support', 8: 'supportpowder'};
        const stateNames: Record<number, string> = {0: 'solid', 1: 'liquid', 2: 'gas'};
        const behaviorName = behaviorNames[Math.round(behaviorID)] || `unknown(${behaviorID})`;
        const stateName = stateNames[Math.round(stateID)] || `unknown(${stateID})`;
        console.log(`  ${name} (ID ${mapping.id}): RGB(${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)}), behavior=${behaviorName}, state=${stateName}, density=${density.toFixed(1)}, stored behavior="${mapping.behavior}"`);
      }
    }

    // Create WebGL textures
    this.#materialPropertiesTex = createMaterialPropertiesTexture(this.#gl, propertiesData)!;
    this.#materialColorsTex = createMaterialColorsTexture(this.#gl, colorsData)!;

    if (!this.#materialPropertiesTex || !this.#materialColorsTex) {
      console.error('Failed to create material textures');
    } else {
      console.log('Material textures created successfully');
    }
    
    // Debug: Log gas material properties
    if (this.#debugGasPhysics) {
      console.log('=== GAS PHYSICS DEBUG: Material Properties ===');
      const gasMaterials = ['carbon_dioxide', 'oxygen', 'hydrogen', 'smoke', 'steam'];
      for (const name of gasMaterials) {
        const mapping = this.#materialMap.get(name);
        if (mapping) {
          const propIndex = mapping.id * 4;
          const propertiesData = generateMaterialPropertiesTexture(this.#materialMap);
          const behaviorID = propertiesData[propIndex];
          const densityNorm = propertiesData[propIndex + 1];
          const stateID = propertiesData[propIndex + 3];
          const density = densityNorm * (20000 - 0.001) + 0.001;
          const behaviorNames: Record<number, string> = {0: 'gas', 1: 'dgas', 2: 'liquid', 3: 'molten', 4: 'powder', 5: 'sturdypowder', 6: 'wall', 7: 'support', 8: 'supportpowder'};
          const stateNames: Record<number, string> = {0: 'solid', 1: 'liquid', 2: 'gas'};
          const behaviorName = behaviorNames[Math.round(behaviorID)] || `unknown(${behaviorID})`;
          const stateName = stateNames[Math.round(stateID)] || `unknown(${stateID})`;
          const isHighTemp = (mapping.id === 1.0 || mapping.id === 10.0); // SMOKE=1, STEAM=10
          console.log(`  ${name} (ID ${mapping.id}): behavior=${behaviorName}, state=${stateName}, density=${density.toFixed(3)}, isHighTemp=${isHighTemp}, willPenetrate=${isHighTemp}`);
        }
      }
      console.log('=== END GAS DEBUG ===');
    }
  }
  
  /**
   * Debug: Sample simulation state to check gas behavior
   */
  #debugSampleGasState() {
    if (!this.#debugGasPhysics) return;
    
    const gl = this.#gl;
    const sampleSize = 10; // Sample 10x10 area
    const centerX = Math.floor(this.#bufferWidth / 2);
    const centerY = Math.floor(this.#bufferHeight / 2);
    
    // Read pixels from the current simulation texture
    // Use FLOAT format to get actual material IDs (not clamped to 0-255)
    const pixels = new Float32Array(sampleSize * sampleSize * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.#fbo[1 - this.#swap]);
    gl.readPixels(
      centerX - sampleSize / 2,
      centerY - sampleSize / 2,
      sampleSize,
      sampleSize,
      gl.RGBA,
      gl.FLOAT,
      pixels
    );
    
    // Count materials
    const materialCounts: Record<number, number> = {};
    const gasMaterials: Array<{id: number, x: number, y: number}> = [];
    
    for (let y = 0; y < sampleSize; y++) {
      for (let x = 0; x < sampleSize; x++) {
        const idx = (y * sampleSize + x) * 4;
        const materialId = Math.round(pixels[idx + 3]); // Alpha channel = material ID (round float to int)
        
        materialCounts[materialId] = (materialCounts[materialId] || 0) + 1;
        
        // Check if it's a gas
        if (materialId === 1 || materialId === 10) {
          // SMOKE (1) or STEAM (10) - core gases
          gasMaterials.push({id: materialId, x: centerX - sampleSize / 2 + x, y: centerY - sampleSize / 2 + y});
        } else if (materialId > 11) {
          const mapping = Array.from(this.#materialMap.values()).find(m => m.id === materialId);
          if (mapping && (mapping.behavior === 'gas' || mapping.behavior === 'dgas')) {
            gasMaterials.push({id: materialId, x: centerX - sampleSize / 2 + x, y: centerY - sampleSize / 2 + y});
          }
        }
      }
    }
    
    if (gasMaterials.length > 0) {
      console.log(`[Frame ${this.#frames}] GAS DETECTED in center area:`, {
        gasCount: gasMaterials.length,
        totalPixels: sampleSize * sampleSize,
        gasPositions: gasMaterials.slice(0, 5), // First 5
        materialCounts: Object.entries(materialCounts)
          .filter(([id]) => {
            const idNum = parseInt(id);
            return idNum === 1 || idNum === 10 || (idNum > 11 && 
              Array.from(this.#materialMap.values()).some(m => 
                m.id === idNum && (m.behavior === 'gas' || m.behavior === 'dgas')
              ));
          })
          .map(([id, count]) => {
            const idNum = parseInt(id);
            const mapping = Array.from(this.#materialMap.values()).find(m => m.id === idNum);
            return {id: idNum, name: mapping?.name || `unknown(${idNum})`, count};
          })
      });
    }
  }
  
  /**
   * Debug: Sample simulation state to check reactions
   */
  #debugSampleReactions() {
    if (!this.#debugReactions) return;
    
    const gl = this.#gl;
    const sampleSize = 20; // Sample 20x20 area
    const centerX = Math.floor(this.#bufferWidth / 2);
    const centerY = Math.floor(this.#bufferHeight / 2);
    
    // Read pixels from the current simulation texture
    const pixels = new Float32Array(sampleSize * sampleSize * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.#fbo[1 - this.#swap]);
    gl.readPixels(
      centerX - sampleSize / 2,
      centerY - sampleSize / 2,
      sampleSize,
      sampleSize,
      gl.RGBA,
      gl.FLOAT,
      pixels
    );
    
    // Define reaction pairs to check
    // IMPORTANT: Get actual material IDs from the material map to ensure we're using correct IDs
    const dirtId = this.getMaterialID('dirt');
    const mudId = this.getMaterialID('mud');
    const saltId = this.getMaterialID('salt');
    const snowId = this.getMaterialID('snow');
    const woodId = this.getMaterialID('wood');
    const charcoalId = this.getMaterialID('charcoal');
    
    const reactionsToCheck = [
      { mat1: dirtId || 87, mat2: 2, name: 'DIRT + WATER → MUD', mat1Name: 'dirt', mat2Name: 'water', mat1IdActual: dirtId, mat2IdActual: 2 },
      { mat1: mudId || 88, mat2: 2, name: 'MUD + WATER → MOSS', mat1Name: 'mud', mat2Name: 'water', mat1IdActual: mudId, mat2IdActual: 2 },
      { mat1: saltId || 110, mat2: 8, name: 'SALT + ICE → WATER', mat1Name: 'salt', mat2Name: 'ice', mat1IdActual: saltId, mat2IdActual: 8 },
      { mat1: snowId || 100, mat2: 2, name: 'SNOW + WATER → WATER', mat1Name: 'snow', mat2Name: 'water', mat1IdActual: snowId, mat2IdActual: 2 },
      { mat1: 9, mat2: woodId || 102, name: 'FIRE + WOOD → CHARCOAL', mat1Name: 'fire', mat2Name: 'wood', mat1IdActual: 9, mat2IdActual: woodId },
      { mat1: 3, mat2: 2, name: 'LAVA + WATER → STONE', mat1Name: 'lava', mat2Name: 'water', mat1IdActual: 3, mat2IdActual: 2 },
    ];
    
    // Log the actual IDs being checked
    if (this.#frames % (this.#debugSampleInterval * 2) === 0) {
      console.log(`[Frame ${this.#frames}] Reaction ID mapping:`, reactionsToCheck.map(r => ({
        reaction: r.name,
        mat1: `${r.mat1Name} (ID ${r.mat1IdActual || r.mat1})`,
        mat2: `${r.mat2Name} (ID ${r.mat2IdActual || r.mat2})`
      })));
    }
    
    // Check for reaction conditions (materials adjacent to each other)
    const foundReactions: Array<{reaction: string, x: number, y: number, mat1: number, mat2: number}> = [];
    
    for (let y = 0; y < sampleSize - 1; y++) {
      for (let x = 0; x < sampleSize - 1; x++) {
        const idx = (y * sampleSize + x) * 4;
        const matId = Math.round(pixels[idx + 3]);
        
        // Check right neighbor
        const rightIdx = (y * sampleSize + (x + 1)) * 4;
        const rightMatId = Math.round(pixels[rightIdx + 3]);
        
        // Check bottom neighbor
        const bottomIdx = ((y + 1) * sampleSize + x) * 4;
        const bottomMatId = Math.round(pixels[bottomIdx + 3]);
        
        // Check each reaction
        for (const reaction of reactionsToCheck) {
          // Check if current pixel matches mat1 and neighbor matches mat2
          if ((matId === reaction.mat1 && rightMatId === reaction.mat2) ||
              (matId === reaction.mat1 && bottomMatId === reaction.mat2) ||
              (matId === reaction.mat2 && rightMatId === reaction.mat1) ||
              (matId === reaction.mat2 && bottomMatId === reaction.mat1)) {
            foundReactions.push({
              reaction: reaction.name,
              x: centerX - sampleSize / 2 + x,
              y: centerY - sampleSize / 2 + y,
              mat1: matId,
              mat2: rightMatId === reaction.mat1 || rightMatId === reaction.mat2 ? rightMatId : bottomMatId
            });
          }
        }
      }
    }
    
    // Also check material counts to see what's present
    const materialCounts: Record<number, number> = {};
    for (let y = 0; y < sampleSize; y++) {
      for (let x = 0; x < sampleSize; x++) {
        const idx = (y * sampleSize + x) * 4;
        const materialId = Math.round(pixels[idx + 3]);
        materialCounts[materialId] = (materialCounts[materialId] || 0) + 1;
      }
    }
    
    // Log materials that could participate in reactions
    const reactionMaterials = [87, 88, 2, 110, 8, 100, 9, 102, 3, 11, 150]; // dirt, mud, water, salt, ice, snow, fire, wood, lava, moss, charcoal
    const presentReactionMaterials = Object.entries(materialCounts)
      .filter(([id]) => reactionMaterials.includes(parseInt(id)))
      .map(([id, count]) => {
        const idNum = parseInt(id);
        const mapping = Array.from(this.#materialMap.values()).find(m => m.id === idNum);
        return {id: idNum, name: mapping?.name || `unknown(${idNum})`, count};
      });
    
    if (foundReactions.length > 0) {
      console.log(`[Frame ${this.#frames}] ✅ REACTIONS DETECTED:`, {
        count: foundReactions.length,
        reactions: foundReactions.slice(0, 10), // First 10
        sampleArea: `${sampleSize}x${sampleSize} at center`
      });
      
      // Group by reaction type
      const reactionGroups: Record<string, number> = {};
      for (const r of foundReactions) {
        reactionGroups[r.reaction] = (reactionGroups[r.reaction] || 0) + 1;
      }
      console.log(`[Frame ${this.#frames}] Reaction counts:`, reactionGroups);
    } else if (presentReactionMaterials.length > 0) {
      // Materials are present but no reactions detected - log detailed info
      console.log(`[Frame ${this.#frames}] ⚠️ Reaction-capable materials present but NO reactions detected:`, presentReactionMaterials);
      
      // Show detailed adjacency check for first few materials
      const detailedChecks: Array<{
        mat1: string, 
        mat1Id: number, 
        mat2: string, 
        mat2Id: number, 
        adjacent: boolean, 
        positions: Array<{x: number, y: number}>,
        otherMatPresent?: boolean,
        otherMatCount?: number
      }> = [];
      
      for (const presentMat of presentReactionMaterials.slice(0, 3)) {
        const matId = presentMat.id;
        // Find which reaction this material can participate in
        const relevantReactions = reactionsToCheck.filter(r => r.mat1 === matId || r.mat2 === matId);
        
        for (const reaction of relevantReactions) {
          const otherMatId = reaction.mat1 === matId ? reaction.mat2 : reaction.mat1;
          const otherMatName = reaction.mat1 === matId ? reaction.mat2Name : reaction.mat1Name;
          
          // Check if these two materials are adjacent
          const adjacentPositions: Array<{x: number, y: number}> = [];
          for (let y = 0; y < sampleSize - 1; y++) {
            for (let x = 0; x < sampleSize - 1; x++) {
              const idx = (y * sampleSize + x) * 4;
              const currentMatId = Math.round(pixels[idx + 3]);
              
              // Check right neighbor
              const rightIdx = (y * sampleSize + (x + 1)) * 4;
              const rightMatId = Math.round(pixels[rightIdx + 3]);
              
              // Check bottom neighbor
              const bottomIdx = ((y + 1) * sampleSize + x) * 4;
              const bottomMatId = Math.round(pixels[bottomIdx + 3]);
              
              if ((currentMatId === matId && (rightMatId === otherMatId || bottomMatId === otherMatId)) ||
                  (currentMatId === otherMatId && (rightMatId === matId || bottomMatId === matId))) {
                adjacentPositions.push({
                  x: centerX - sampleSize / 2 + x,
                  y: centerY - sampleSize / 2 + y
                });
              }
            }
          }
          
          if (adjacentPositions.length > 0) {
            detailedChecks.push({
              mat1: presentMat.name,
              mat1Id: matId,
              mat2: otherMatName,
              mat2Id: otherMatId,
              adjacent: true,
              positions: adjacentPositions.slice(0, 5) // First 5 positions
            });
          } else {
            // Check if the other material is even present
            const otherMatPresent = presentReactionMaterials.find(m => m.id === otherMatId);
            detailedChecks.push({
              mat1: presentMat.name,
              mat1Id: matId,
              mat2: otherMatName,
              mat2Id: otherMatId,
              adjacent: false,
              positions: [],
              otherMatPresent: otherMatPresent ? true : false,
              otherMatCount: otherMatPresent?.count || 0
            });
          }
        }
      }
      
      console.log(`[Frame ${this.#frames}] Detailed adjacency checks:`, detailedChecks);
      
      // Also show ALL materials in the sample area (for debugging)
      const allMaterials = Object.entries(materialCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([id, count]) => {
          const idNum = parseInt(id);
          const mapping = Array.from(this.#materialMap.values()).find(m => m.id === idNum);
          return {id: idNum, name: mapping?.name || `ID${idNum}`, count};
        });
      console.log(`[Frame ${this.#frames}] Top 10 materials in sample area:`, allMaterials);
    } else {
      // Still log occasionally to show we're checking
      if (this.#frames % (this.#debugSampleInterval * 5) === 0) {
        console.log(`[Frame ${this.#frames}] No reaction-capable materials detected in sample area`);
      }
    }
  }

  #initializeSimulation() {
    // NOTE: Currently uses existing shaders from folk-sand.glsl.ts
    // The texture system is initialized but not yet integrated into shaders
    // This allows the component to work while we build out the full integration
    // TODO: Generate new shader code with texture lookups using shader-code-generator.ts
    
    // Apply density clamping if needed
    let fragmentShader = simulationShader;
    if (this.densityClampFactor !== 1.0) {
      // Replace density calculations in the shader
      const densityRange = (20000.0 - 0.001) * this.densityClampFactor;
      const densityMin = 0.001;
      const densityMax = densityMin + densityRange;
      
      // Replace constants if they exist
      fragmentShader = fragmentShader.replace(
        /const float DENSITY_CLAMP_FACTOR = [\d.]+;/g,
        `const float DENSITY_CLAMP_FACTOR = ${this.densityClampFactor};`
      ).replace(
        /const float DENSITY_RANGE = [\d.]+;/g,
        `const float DENSITY_RANGE = ${densityRange};`
      ).replace(
        /const float DENSITY_MIN = [\d.]+;/g,
        `const float DENSITY_MIN = ${densityMin};`
      ).replace(
        /const float DENSITY_MAX = [\d.]+;/g,
        `const float DENSITY_MAX = ${densityMax};`
      );
      
      // Generate clamped lookup functions and replace the entire lookup section
      const clampedLookupFunctions = generateMaterialLookupFunctions(this.densityClampFactor);
      
      // Find the lookup functions section - it starts with the comment
      let lookupStart = fragmentShader.indexOf('// Material properties texture lookup');
      if (lookupStart === -1) {
        lookupStart = fragmentShader.indexOf('uniform sampler2D u_materialPropertiesTex');
      }
      
      if (lookupStart !== -1) {
        // Find where the lookup functions section ends
        // The section includes all helper functions and ends before temperature functions or main()
        let lookupEnd = fragmentShader.indexOf('float getTemperature', lookupStart);
        if (lookupEnd === -1) {
          lookupEnd = fragmentShader.indexOf('// Temperature helper functions', lookupStart);
        }
        if (lookupEnd === -1) {
          // Look for the main function as last resort
          lookupEnd = fragmentShader.indexOf('void main()', lookupStart);
        }
        
        if (lookupEnd !== -1) {
          // Remove the old lookup functions section completely
          const before = fragmentShader.substring(0, lookupStart);
          const after = fragmentShader.substring(lookupEnd);
          // Insert the new clamped lookup functions
          fragmentShader = before + clampedLookupFunctions + '\n\n' + after;
        } else {
          console.warn('Could not find end of material lookup functions, density clamping may not work correctly');
        }
      } else {
        console.warn('Could not find material lookup functions in shader, density clamping may not work correctly');
      }
    }
    
    // Create shaders and programs
    this.#program = this.#createProgramFromStrings({
      vertex: vertexShader,
      fragment: fragmentShader,
    })!;
    this.#blitProgram = this.#createProgramFromStrings({
      vertex: vertexShader,
      fragment: visualizationShader, // Will be replaced with generated shader
    })!;
    this.#jfaShadowProgram = this.#createProgramFromStrings({
      vertex: vertexShader,
      fragment: distanceFieldPropagationShader,
    })!;
    this.#jfaInitProgram = this.#createProgramFromStrings({
      vertex: vertexShader,
      fragment: distanceFieldInitShader,
    })!;

    // Setup buffers and vertex arrays
    this.#setupBuffers();

    // Initialize framebuffers and textures
    this.#initializeFramebuffers();

    // Bind material textures to shader uniforms
    this.#bindMaterialTextures();
  }

  /**
   * Bind material textures to shader uniforms
   */
  #bindMaterialTextures() {
    const gl = this.#gl;

    // Bind material properties texture
    // Use texture units 4 and 5 to avoid conflicts with shadow textures (0-3)
    gl.useProgram(this.#program);
    const propsLoc = gl.getUniformLocation(this.#program, 'u_materialPropertiesTex');
    if (propsLoc) {
      gl.activeTexture(gl.TEXTURE0 + 4); // Use texture unit 4
      gl.bindTexture(gl.TEXTURE_2D, this.#materialPropertiesTex);
      gl.uniform1i(propsLoc, 4);
    }

    // Bind material colors texture
    const colorsLoc = gl.getUniformLocation(this.#program, 'u_materialColorsTex');
    if (colorsLoc) {
      gl.activeTexture(gl.TEXTURE0 + 5); // Use texture unit 5
      gl.bindTexture(gl.TEXTURE_2D, this.#materialColorsTex);
      gl.uniform1i(colorsLoc, 5);
    }

    // Also bind to visualization shader
    gl.useProgram(this.#blitProgram);
    const visPropsLoc = gl.getUniformLocation(this.#blitProgram, 'u_materialPropertiesTex');
    const visColorsLoc = gl.getUniformLocation(this.#blitProgram, 'u_materialColorsTex');
    if (visPropsLoc) {
      gl.activeTexture(gl.TEXTURE0 + 4);
      gl.bindTexture(gl.TEXTURE_2D, this.#materialPropertiesTex);
      gl.uniform1i(visPropsLoc, 4);
    }
    if (visColorsLoc) {
      gl.activeTexture(gl.TEXTURE0 + 5);
      gl.bindTexture(gl.TEXTURE_2D, this.#materialColorsTex);
      gl.uniform1i(visColorsLoc, 5);
    }
  }

  #initializeCollisionDetection() {
    const gl = this.#gl;

    const collisionProgram = this.#createProgramFromStrings({
      vertex: collisionVertexShader,
      fragment: collisionFragmentShader,
    })!;

    this.#collisionProgram = collisionProgram;

    const collisionFbo = gl.createFramebuffer();
    if (!collisionFbo) {
      throw new Error('Failed to create collision framebuffer');
    }
    this.#collisionFbo = collisionFbo;

    const collisionTex = gl.createTexture();
    if (!collisionTex) {
      throw new Error('Failed to create collision texture');
    }
    this.#collisionTex = collisionTex;

    gl.bindTexture(gl.TEXTURE_2D, this.#collisionTex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.#bufferWidth,
      this.#bufferHeight,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.#collisionFbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.#collisionTex,
      0
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  // Copy remaining methods from folk-sand.ts
  // (These would be the same - setupBuffers, initializeFramebuffers, etc.)
  // For now, I'll add placeholders and we can copy the full implementation

  #setupBuffers() {
    const gl = this.#gl;
    const quad = [-1.0, -1.0, 0.0, 0.0, -1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 0.0];

    this.#posBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.#posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quad), gl.STATIC_DRAW);

    this.#vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.#vao);

    const posAttribLoc = gl.getAttribLocation(this.#program, 'aPosition');
    const uvAttribLoc = gl.getAttribLocation(this.#program, 'aUv');

    gl.vertexAttribPointer(posAttribLoc, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(posAttribLoc);

    gl.vertexAttribPointer(uvAttribLoc, 2, gl.FLOAT, false, 16, 8);
    gl.enableVertexAttribArray(uvAttribLoc);
  }

  #initializeFramebuffers() {
    const gl = this.#gl;
    this.#resizeCanvas();
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    this.#bufferWidth = Math.ceil(gl.canvas.width / this.#PIXELS_PER_PARTICLE);
    this.#bufferHeight = Math.ceil(gl.canvas.height / this.#PIXELS_PER_PARTICLE);

    for (let i = 0; i < 2; i++) {
      this.#tex[i] = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, this.#tex[i]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, this.#bufferWidth, this.#bufferHeight, 0, gl.RGBA, gl.FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      this.#fbo[i] = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.#fbo[i]);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#tex[i], 0);

      this.#shadowTexR[i] = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, this.#shadowTexR[i]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, this.#bufferWidth, this.#bufferHeight, 0, gl.RGBA, gl.FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      this.#shadowTexG[i] = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, this.#shadowTexG[i]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, this.#bufferWidth, this.#bufferHeight, 0, gl.RGBA, gl.FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      this.#shadowTexB[i] = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, this.#shadowTexB[i]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, this.#bufferWidth, this.#bufferHeight, 0, gl.RGBA, gl.FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      this.#shadowFbo[i] = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.#shadowFbo[i]);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#shadowTexR[i], 0);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this.#shadowTexG[i], 0);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, this.#shadowTexB[i], 0);
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1, gl.COLOR_ATTACHMENT2]);

      // Initialize temperature texture (R channel = temperature, others unused for now)
      this.#temperatureTex[i] = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, this.#temperatureTex[i]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, this.#bufferWidth, this.#bufferHeight, 0, gl.RGBA, gl.FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      // Initialize temperature framebuffer
      this.#temperatureFbo[i] = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.#temperatureFbo[i]);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#temperatureTex[i], 0);

      // Initialize age texture (R channel = age, others for custom properties)
      this.#ageTex[i] = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, this.#ageTex[i]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, this.#bufferWidth, this.#bufferHeight, 0, gl.RGBA, gl.FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      // Initialize age framebuffer
      this.#ageFbo[i] = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.#ageFbo[i]);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#ageTex[i], 0);
    }

    // Initialize temperature and age textures with default values
    this.#initializeStateTextures();
  }

  /**
   * Initialize temperature and age textures with default values
   */
  #initializeStateTextures() {
    const gl = this.#gl;
    const size = this.#bufferWidth * this.#bufferHeight;
    
    // Default temperature: 20°C (room temperature)
    // Store as normalized: (temp + 273.15) / 1000.0 to fit in 0-1 range
    // This allows temperatures from -273°C to 727°C
    const defaultTemp = (20.0 + 273.15) / 1000.0;
    const tempData = new Float32Array(size * 4);
    for (let i = 0; i < size; i++) {
      tempData[i * 4] = defaultTemp; // R = temperature
      tempData[i * 4 + 1] = 0.0; // G = unused
      tempData[i * 4 + 2] = 0.0; // B = unused
      tempData[i * 4 + 3] = 1.0; // A = unused
    }

    // Default age: 0
    const ageData = new Float32Array(size * 4);
    for (let i = 0; i < size; i++) {
      ageData[i * 4] = 0.0; // R = age
      ageData[i * 4 + 1] = 0.0; // G = custom property 1
      ageData[i * 4 + 2] = 0.0; // B = custom property 2
      ageData[i * 4 + 3] = 0.0; // A = custom property 3
    }

    // Upload initial data to both ping-pong buffers
    for (let i = 0; i < 2; i++) {
      gl.bindTexture(gl.TEXTURE_2D, this.#temperatureTex[i]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, this.#bufferWidth, this.#bufferHeight, 0, gl.RGBA, gl.FLOAT, tempData);
      
      gl.bindTexture(gl.TEXTURE_2D, this.#ageTex[i]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, this.#bufferWidth, this.#bufferHeight, 0, gl.RGBA, gl.FLOAT, ageData);
    }
  }

  #attachEventListeners() {
    this.#canvas.style.touchAction = 'none';
    this.#canvas.addEventListener('pointerdown', this.#handlePointerDown);
    this.#canvas.addEventListener('pointermove', this.#handlePointerMove);
    this.#canvas.addEventListener('pointerup', this.#handlePointerUp);
    this.#canvas.addEventListener('pointerleave', this.#handlePointerUp);
    document.addEventListener('keydown', this.#handleKeyDown);
  }

  #detachEventListeners() {
    this.#canvas.removeEventListener('pointerdown', this.#handlePointerDown);
    this.#canvas.removeEventListener('pointermove', this.#handlePointerMove);
    this.#canvas.removeEventListener('pointerup', this.#handlePointerUp);
    this.#canvas.removeEventListener('pointerleave', this.#handlePointerUp);
    document.removeEventListener('keydown', this.#handleKeyDown);
  }

  #handlePointerMove = (event: PointerEvent) => {
    if (!this.#pointer.down) return;
    const rect = this.#canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.#pointer.prevX = this.#pointer.x;
    this.#pointer.prevY = this.#pointer.y;
    this.#pointer.x = (x / rect.width) * this.#canvas.width;
    this.#pointer.y = (y / rect.height) * this.#canvas.height;
  };

  #handlePointerDown = (event: PointerEvent) => {
    event.preventDefault();
    const rect = this.#canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.#pointer.x = (x / rect.width) * this.#canvas.width;
    this.#pointer.y = (y / rect.height) * this.#canvas.height;
    this.#pointer.prevX = this.#pointer.x;
    this.#pointer.prevY = this.#pointer.y;
    this.#pointer.down = true;
    this.#canvas.setPointerCapture(event.pointerId);
  };

  #handlePointerUp = (event?: PointerEvent) => {
    this.#pointer.down = false;
    if (event && this.#canvas.hasPointerCapture(event.pointerId)) {
      this.#canvas.releasePointerCapture(event.pointerId);
    }
  };

  #handleKeyDown = (event: KeyboardEvent) => {
    const key = parseInt(event.key);
    if (!isNaN(key) && key >= 0 && key <= 9) {
      const materialType = key === 0 ? 10 : key;
      this.#setMaterialType(materialType);
    } else if (event.key === 'm' || event.key === 'M') {
      this.#setMaterialType(11);
    }
  };

  #resizeCanvas() {
    const width = (this.#canvas.clientWidth * this.#PIXEL_RATIO) | 0;
    const height = (this.#canvas.clientHeight * this.#PIXEL_RATIO) | 0;
    if (this.#canvas.width !== width || this.#canvas.height !== height) {
      this.#canvas.width = width;
      this.#canvas.height = height;
      return true;
    }
    return false;
  }

  #createProgramFromStrings({ vertex, fragment }: { vertex: string; fragment: string }): WebGLProgram | undefined {
    const vertexShader = WebGLUtils.createShader(this.#gl, this.#gl.VERTEX_SHADER, vertex);
    const fragmentShader = WebGLUtils.createShader(this.#gl, this.#gl.FRAGMENT_SHADER, fragment);
    if (!vertexShader || !fragmentShader) {
      console.error('Failed to create shaders');
      return undefined;
    }
    return WebGLUtils.createProgram(this.#gl, vertexShader, fragmentShader);
  }

  #handleShapeTransform() {
    // Placeholder - will implement collision detection later
  }

  #paused = false;
  #animationFrameId: number | null = null;

  pause(): void {
    this.#paused = true;
    if (this.#animationFrameId !== null) {
      cancelAnimationFrame(this.#animationFrameId);
      this.#animationFrameId = null;
    }
  }

  play(): void {
    if (!this.#paused) return;
    this.#paused = false;
    this.#render();
  }

  get isPaused(): boolean {
    return this.#paused;
  }

  #render = (time: number = performance.now()) => {
    if (this.#paused) return;
    
    if (this.#resizeCanvas()) {
      this.#processResize();
    }
    this.#simulationPass(time);
    this.#shadowPass();
    this.#jfaPass();
    this.#renderPass(time);
    this.#pointer.prevX = this.#pointer.x;
    this.#pointer.prevY = this.#pointer.y;
    this.#animationFrameId = requestAnimationFrame(this.#render);
  };

  #simulationPass(time: number) {
    const gl = this.#gl;
    gl.useProgram(this.#program);
    gl.bindVertexArray(this.#vao);

    const timeLoc = gl.getUniformLocation(this.#program, 'time');
    const frameLoc = gl.getUniformLocation(this.#program, 'frame');
    const resLoc = gl.getUniformLocation(this.#program, 'resolution');
    const texLoc = gl.getUniformLocation(this.#program, 'tex');
    const mouseLoc = gl.getUniformLocation(this.#program, 'mouse');
    const materialTypeLoc = gl.getUniformLocation(this.#program, 'materialType');
    const brushRadiusLoc = gl.getUniformLocation(this.#program, 'brushRadius');
    const collisionTexLoc = gl.getUniformLocation(this.#program, 'u_collisionTex');
    const initialSandLoc = gl.getUniformLocation(this.#program, 'initialSand');

    gl.uniform1f(initialSandLoc, this.initialSand);

    let mx = 0.0, my = 0.0, mpx = 0.0, mpy = 0.0;
    if (this.#pointer.x >= 0 && this.#pointer.y >= 0) {
      mx = (this.#pointer.x / gl.canvas.width) * this.#bufferWidth;
      my = (1.0 - this.#pointer.y / gl.canvas.height) * this.#bufferHeight;
      mpx = (this.#pointer.prevX / gl.canvas.width) * this.#bufferWidth;
      mpy = (1.0 - this.#pointer.prevY / gl.canvas.height) * this.#bufferHeight;
      mx = Math.max(0, Math.min(mx, this.#bufferWidth - 1));
      my = Math.max(0, Math.min(my, this.#bufferHeight - 1));
      mpx = Math.max(0, Math.min(mpx, this.#bufferWidth - 1));
      mpy = Math.max(0, Math.min(mpy, this.#bufferHeight - 1));
    }

    gl.uniform1f(timeLoc, time * 0.001);
    gl.uniform2f(resLoc, this.#bufferWidth, this.#bufferHeight);
    gl.uniform1i(materialTypeLoc, this.#materialType);
    gl.uniform1f(brushRadiusLoc, this.#brushRadius);
    
    // Bind material textures to simulation shader (must be done each frame)
    const simPropsLoc = gl.getUniformLocation(this.#program, 'u_materialPropertiesTex');
    const simColorsLoc = gl.getUniformLocation(this.#program, 'u_materialColorsTex');
    if (simPropsLoc) {
      gl.activeTexture(gl.TEXTURE0 + 4);
      gl.bindTexture(gl.TEXTURE_2D, this.#materialPropertiesTex);
      gl.uniform1i(simPropsLoc, 4);
    }
    if (simColorsLoc) {
      gl.activeTexture(gl.TEXTURE0 + 5);
      gl.bindTexture(gl.TEXTURE_2D, this.#materialColorsTex);
      gl.uniform1i(simColorsLoc, 5);
    }

    if (this.#pointer.down && this.#pointer.x >= 0 && this.#pointer.y >= 0) {
      gl.uniform4f(mouseLoc, mx, my, mpx, mpy);
    } else {
      gl.uniform4f(mouseLoc, -1.0, -1.0, -1.0, -1.0);
    }

    if (collisionTexLoc) {
      gl.uniform1i(collisionTexLoc, 6); // Use texture unit 6 to avoid conflict with material textures (4,5)
      gl.activeTexture(gl.TEXTURE0 + 6);
      gl.bindTexture(gl.TEXTURE_2D, this.#collisionTex);
    }

    const PASSES = 3;
    for (let i = 0; i < PASSES; i++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.#fbo[this.#swap]);
      gl.viewport(0, 0, this.#bufferWidth, this.#bufferHeight);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1i(frameLoc, this.#frames * PASSES + i);
      gl.uniform1i(texLoc, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.#tex[1 - this.#swap]);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
      this.#swap = 1 - this.#swap;
    }
    this.#frames++;
    
    // Debug: Sample simulation state periodically to check gas behavior
    if (this.#debugGasPhysics && this.#frames - this.#lastDebugSample >= this.#debugSampleInterval) {
      this.#debugSampleGasState();
      this.#lastDebugSample = this.#frames;
    }
    
    // Debug: Sample simulation state periodically to check reactions
    if (this.#debugReactions && this.#frames - this.#lastReactionDebugSample >= this.#debugSampleInterval) {
      this.#debugSampleReactions();
      this.#lastReactionDebugSample = this.#frames;
    }
  }

  #shadowPass() {
    const gl = this.#gl;
    this.#shadowSwap = 0;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.#shadowFbo[this.#shadowSwap]);
    gl.viewport(0, 0, this.#bufferWidth, this.#bufferHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.#jfaInitProgram);
    gl.bindVertexArray(this.#vao);
    const resLoc = gl.getUniformLocation(this.#jfaInitProgram, 'resolution');
    const texLoc = gl.getUniformLocation(this.#jfaInitProgram, 'dataTex');
    gl.uniform2f(resLoc, this.#bufferWidth, this.#bufferHeight);
    gl.uniform1i(texLoc, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.#tex[this.#swap]);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    this.#shadowSwap = 1 - this.#shadowSwap;
  }

  #jfaPass() {
    const gl = this.#gl;
    const JFA_PASSES = 5;
    gl.useProgram(this.#jfaShadowProgram);
    const resLoc = gl.getUniformLocation(this.#jfaShadowProgram, 'resolution');
    const texLoc = gl.getUniformLocation(this.#jfaShadowProgram, 'texR');
    const texGLoc = gl.getUniformLocation(this.#jfaShadowProgram, 'texG');
    const texBLoc = gl.getUniformLocation(this.#jfaShadowProgram, 'texB');
    const stepSizeLoc = gl.getUniformLocation(this.#jfaShadowProgram, 'stepSize');
    const passCountLoc = gl.getUniformLocation(this.#jfaShadowProgram, 'passCount');
    const passIdxLoc = gl.getUniformLocation(this.#jfaShadowProgram, 'passIndex');
    gl.uniform2f(resLoc, this.#bufferWidth, this.#bufferHeight);
    gl.uniform1i(texLoc, 0);
    gl.uniform1i(texGLoc, 1);
    gl.uniform1i(texBLoc, 2);
    gl.uniform1i(passCountLoc, JFA_PASSES);
    for (let i = 0; i < JFA_PASSES; i++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.#shadowFbo[this.#shadowSwap]);
      gl.viewport(0, 0, this.#bufferWidth, this.#bufferHeight);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const stepSize = Math.pow(2, JFA_PASSES - i - 1);
      gl.uniform1f(stepSizeLoc, stepSize);
      gl.uniform1i(passIdxLoc, i);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.#shadowTexR[1 - this.#shadowSwap]);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.#shadowTexG[1 - this.#shadowSwap]);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, this.#shadowTexB[1 - this.#shadowSwap]);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
      this.#shadowSwap = 1 - this.#shadowSwap;
    }
  }

  #renderPass(time: number) {
    const gl = this.#gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.drawBuffers([gl.BACK]);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.#blitProgram);
    gl.bindVertexArray(this.#vao);
    const timeLoc = gl.getUniformLocation(this.#blitProgram, 'time');
    const resLoc = gl.getUniformLocation(this.#blitProgram, 'resolution');
    const texLoc = gl.getUniformLocation(this.#blitProgram, 'tex');
    const shadowTexLoc = gl.getUniformLocation(this.#blitProgram, 'shadowTexR');
    const shadowTexGLoc = gl.getUniformLocation(this.#blitProgram, 'shadowTexG');
    const shadowTexBLoc = gl.getUniformLocation(this.#blitProgram, 'shadowTexB');
    const scaleLoc = gl.getUniformLocation(this.#blitProgram, 'scale');
    const texResLoc = gl.getUniformLocation(this.#blitProgram, 'texResolution');
    const texScaleLoc = gl.getUniformLocation(this.#blitProgram, 'texScale');
    
    // Bind material textures (must be done each frame)
    // Use texture units 4 and 5 to avoid conflicts with shadow textures (0-3)
    const visPropsLoc = gl.getUniformLocation(this.#blitProgram, 'u_materialPropertiesTex');
    const visColorsLoc = gl.getUniformLocation(this.#blitProgram, 'u_materialColorsTex');
    if (visPropsLoc) {
      gl.activeTexture(gl.TEXTURE0 + 4);
      gl.bindTexture(gl.TEXTURE_2D, this.#materialPropertiesTex);
      gl.uniform1i(visPropsLoc, 4);
    }
    if (visColorsLoc) {
      gl.activeTexture(gl.TEXTURE0 + 5);
      gl.bindTexture(gl.TEXTURE_2D, this.#materialColorsTex);
      gl.uniform1i(visColorsLoc, 5);
    }
    
    gl.uniform1f(timeLoc, time * 0.001);
    gl.uniform2f(resLoc, gl.canvas.width, gl.canvas.height);
    gl.uniform2f(texResLoc, this.#bufferWidth, this.#bufferHeight);
    gl.uniform1f(texScaleLoc, this.#PIXELS_PER_PARTICLE);
    gl.uniform1f(scaleLoc, 1.0);
    
    gl.uniform1i(texLoc, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.#tex[this.#swap]);
    gl.uniform1i(shadowTexLoc, 1);
    gl.uniform1i(shadowTexGLoc, 2);
    gl.uniform1i(shadowTexBLoc, 3);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.#shadowTexR[1 - this.#shadowSwap]);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.#shadowTexG[1 - this.#shadowSwap]);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, this.#shadowTexB[1 - this.#shadowSwap]);
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, this.#collisionTex);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }

  #processResize() {
    const gl = this.#gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    this.#bufferWidth = Math.ceil(gl.canvas.width / this.#PIXELS_PER_PARTICLE);
    this.#bufferHeight = Math.ceil(gl.canvas.height / this.#PIXELS_PER_PARTICLE);
    gl.bindTexture(gl.TEXTURE_2D, this.#collisionTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, this.#bufferWidth, this.#bufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    for (let i = 0; i < 2; i++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.#fbo[i]);
      const newTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, newTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, this.#bufferWidth, this.#bufferHeight, 0, gl.RGBA, gl.FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindTexture(gl.TEXTURE_2D, newTex);
      gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, this.#bufferWidth, this.#bufferHeight);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, newTex, 0);
      gl.deleteTexture(this.#tex[i]);
      this.#tex[i] = newTex!;
    }
    for (let i = 0; i < 2; i++) {
      gl.bindTexture(gl.TEXTURE_2D, this.#shadowTexR[i]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, this.#bufferWidth, this.#bufferHeight, 0, gl.RGBA, gl.FLOAT, null);
      gl.bindTexture(gl.TEXTURE_2D, this.#shadowTexG[i]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, this.#bufferWidth, this.#bufferHeight, 0, gl.RGBA, gl.FLOAT, null);
      gl.bindTexture(gl.TEXTURE_2D, this.#shadowTexB[i]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, this.#bufferWidth, this.#bufferHeight, 0, gl.RGBA, gl.FLOAT, null);
    }
  }

  /**
   * Set material type (public API)
   */
  setMaterialType(type: number): void {
    this.#setMaterialType(type);
  }

  /**
   * Set material type by name (e.g., "dirt", "rock", "wood")
   */
  setMaterialTypeByName(name: string): void {
    const mapping = this.#materialMap?.get(name.toLowerCase());
    if (mapping) {
      this.#setMaterialType(mapping.id);
    } else {
      console.warn(`Material "${name}" not found`);
    }
  }

  /**
   * Get material ID by name
   */
  getMaterialID(name: string): number | undefined {
    return this.#materialMap?.get(name.toLowerCase())?.id;
  }

  #setMaterialType(type: number): void {
    // Support up to 367 materials (0-366)
    this.#materialType = Math.min(Math.max(type, 0), 366);
    this.onMaterialChange?.(this.#materialType);
  }

  /**
   * Get material name by ID
   */
  /**
   * Switch between original and alternate color schemes
   */
  setColorScheme(useAlternate: boolean): void {
    if (this.useAlternateColors === useAlternate) {
      return; // No change needed
    }
    
    this.useAlternateColors = useAlternate;
    
    // Regenerate color texture with new scheme
    const colorsData = generateMaterialColorsTexture(this.#materialMap, 512, this.useAlternateColors);
    
    // Update the texture
    const gl = this.#gl;
    gl.bindTexture(gl.TEXTURE_2D, this.#materialColorsTex);
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      512,
      1,
      gl.RGBA,
      gl.FLOAT,
      colorsData
    );
    
    console.log(`Switched to ${useAlternate ? 'alternate' : 'original'} color scheme`);
  }

  /**
   * Get the color for a material by name
   * Returns hex color string (e.g., "#ff00ff")
   * If using alternate colors, reads from texture; otherwise uses original color
   */
  getMaterialColor(materialName: string): string | undefined {
    if (!this.#materialMap) {
      console.warn('Material map not initialized');
      return undefined;
    }
    
    const normalizedName = materialName.toLowerCase();
    const mapping = this.#materialMap.get(normalizedName);
    
    if (!mapping) {
      // Try to find with different variations
      const variations = [
        normalizedName.replace(/_/g, ''),
        normalizedName.replace(/-/g, '_'),
        normalizedName.replace(/_/g, '-'),
      ];
      for (const variant of variations) {
        const altMapping = this.#materialMap.get(variant);
        if (altMapping) {
          console.log(`Found material ${normalizedName} as ${variant}`);
          // If using alternate colors, read from texture
          if (this.useAlternateColors) {
            return this.#getColorFromTexture(altMapping.id);
          }
          return this.#extractColor(altMapping.color);
        }
      }
      console.warn(`Material not found in map: ${normalizedName} (tried variations: ${variations.join(', ')})`);
      return undefined;
    }
    
    // If using alternate colors, read from texture
    if (this.useAlternateColors) {
      return this.#getColorFromTexture(mapping.id);
    }
    
    return this.#extractColor(mapping.color);
  }

  /**
   * Get color from texture (for alternate color scheme)
   */
  #getColorFromTexture(materialId: number): string | undefined {
    if (!this.#gl || !this.#materialColorsTex) {
      return undefined;
    }
    
    // Read pixel from texture
    const gl = this.#gl;
    const pixels = new Float32Array(4);
    
    // Create a temporary framebuffer to read from texture
    const tempFbo = gl.createFramebuffer();
    if (!tempFbo) return undefined;
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, tempFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#materialColorsTex, 0);
    
    gl.readPixels(materialId, 0, 1, 1, gl.RGBA, gl.FLOAT, pixels);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(tempFbo);
    
    // Convert to hex
    const r = Math.round(pixels[0] * 255);
    const g = Math.round(pixels[1] * 255);
    const b = Math.round(pixels[2] * 255);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Extract color from various formats
   */
  #extractColor(color: string | string[] | undefined): string | undefined {
    if (!color) {
      return undefined;
    }
    
    // Handle different color formats
    if (typeof color === 'string') {
      return color;
    } else if (Array.isArray(color)) {
      // If it's an array, take the first color
      const firstColor = color[0];
      if (typeof firstColor === 'string') {
        return firstColor;
      } else if (Array.isArray(firstColor)) {
        // RGB array [r, g, b] where values are 0-1
        const rgbArray = firstColor as unknown as number[];
        if (rgbArray.length >= 3) {
          const r = Math.round(rgbArray[0] * 255);
          const g = Math.round(rgbArray[1] * 255);
          const b = Math.round(rgbArray[2] * 255);
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }
      }
    } else if (color && typeof color === 'object' && !Array.isArray(color)) {
      // Object with r, g, b properties
      const colorObj = color as { r?: number; g?: number; b?: number };
      if (colorObj.r !== undefined && colorObj.g !== undefined && colorObj.b !== undefined) {
        const r = Math.round(colorObj.r * 255);
        const g = Math.round(colorObj.g * 255);
        const b = Math.round(colorObj.b * 255);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      }
    }
    
    return undefined;
  }

  getMaterialName(id: number): string | undefined {
    for (const [name, mapping] of this.#materialMap.entries()) {
      if (mapping.id === id) {
        return name;
      }
    }
    return undefined;
  }

  /**
   * Get all available material IDs and names
   */
  getAllMaterials(): Array<{ id: number; name: string }> {
    const materials: Array<{ id: number; name: string }> = [];
    for (const [name, mapping] of this.#materialMap.entries()) {
      materials.push({ id: mapping.id, name });
    }
    return materials.sort((a, b) => a.id - b.id);
  }

  /**
   * Get all materials with their properties (density, behavior, state, color)
   */
  getAllMaterialsWithProperties(): Array<{ id: number; name: string; density: number; behavior: string; state: string; color: string | string[] }> {
    if (!this.#materialMap) {
      return [];
    }
    
    const materials: Array<{ id: number; name: string; density: number; behavior: string; state: string; color: string | string[] }> = [];
    
    for (const mapping of this.#materialMap.values()) {
      // Get density - core materials have hardcoded densities
      let density = 1000; // default
      if (mapping.id === 0) density = 0.001;      // AIR
      else if (mapping.id === 1) density = 0.1;        // SMOKE
      else if (mapping.id === 2) density = 1000.0;    // WATER
      else if (mapping.id === 3) density = 2725.0;    // LAVA
      else if (mapping.id === 4) density = 1602.0;    // SAND
      else if (mapping.id === 5) density = 500.0;     // PLANT
      else if (mapping.id === 6) density = 2000.0;    // STONE
      else if (mapping.id === 7) density = 10000.0;   // WALL
      else if (mapping.id === 8) density = 917.0;     // ICE
      else if (mapping.id === 9) density = 0.1;       // FIRE
      else if (mapping.id === 10) density = 0.6;      // STEAM
      else if (mapping.id === 11) density = 500.0;     // MOSS
      else {
        // Extended materials - use density from mapping
        density = mapping.density || 1000;
      }
      
      materials.push({
        id: mapping.id,
        name: mapping.name,
        density,
        behavior: mapping.behavior,
        state: mapping.state || 'solid',
        color: mapping.color || '#888888'
      });
    }
    
    return materials;
  }

  /**
   * Get the buffer dimensions (internal simulation resolution)
   */
  getBufferDimensions(): { width: number; height: number } | null {
    if (!this.#bufferWidth || !this.#bufferHeight) {
      return null;
    }
    return { width: this.#bufferWidth, height: this.#bufferHeight };
  }

  /**
   * Fill the lower two-thirds of the canvas with random materials
   * @param airRatio Ratio of air (0-1), default 0.25 (25% air)
   */
  fillLowerTwoThirdsWithRandomMaterials(airRatio: number = 0.25): void {
    if (!this.#gl || !this.#bufferWidth || !this.#bufferHeight) {
      console.error('Simulator not initialized. Buffer dimensions:', {
        width: this.#bufferWidth,
        height: this.#bufferHeight,
        gl: !!this.#gl
      });
      return;
    }
    
    const lowerTwoThirdsStartY = Math.floor(this.#bufferHeight / 3);
    const regionHeight = this.#bufferHeight - lowerTwoThirdsStartY;
    
    console.log('Filling lower two-thirds:', {
      startY: lowerTwoThirdsStartY,
      height: regionHeight,
      width: this.#bufferWidth,
      airRatio
    });
    
    this.fillRegionWithRandomMaterials(
      0,                    // startX
      lowerTwoThirdsStartY, // startY
      this.#bufferWidth,   // width
      regionHeight,        // height
      airRatio             // airRatio
    );
  }

  /**
   * Fill a region of the canvas with random materials
   * @param startX Start X coordinate (in buffer pixels)
   * @param startY Start Y coordinate (in buffer pixels)
   * @param width Width of region (in buffer pixels)
   * @param height Height of region (in buffer pixels)
   * @param airRatio Ratio of air (0-1), default 0.33
   */
  fillRegionWithRandomMaterials(
    startX: number,
    startY: number,
    width: number,
    height: number,
    airRatio: number = 0.33,
    materialsOverride?: Array<{ id: number; name: string }>,
    useBlobs: boolean = false
  ): void {
    const gl = this.#gl;
    const materials = materialsOverride || this.getAllMaterials();
    
    // Filter out air for non-air positions
    const nonAirMaterials = materials.filter(m => m.id !== 0);
    
    // Separate materials into "falling" (powders, liquids, molten) and "other" categories
    // Falling behaviors: powder, sturdypowder, liquid, molten, supportpowder
    const fallingMaterials: Array<{ id: number; name: string }> = [];
    const otherMaterials: Array<{ id: number; name: string }> = [];
    
    const fallingBehaviors = ['powder', 'liquid', 'molten', 'sturdypowder', 'supportpowder'];
    
    for (const mat of nonAirMaterials) {
      const mapping = this.#materialMap.get(mat.name.toLowerCase());
      if (!mapping) continue;
      
      // Check behavior from mapping
      const behaviorStr = (mapping.behavior || '').toLowerCase();
      const isFalling = fallingBehaviors.some(b => behaviorStr.includes(b));
      
      if (isFalling) {
        fallingMaterials.push(mat);
      } else {
        otherMaterials.push(mat);
      }
    }
    
    // If we don't have enough falling materials, use all materials as falling
    if (fallingMaterials.length === 0) {
      fallingMaterials.push(...nonAirMaterials);
    }
    // If we don't have other materials, use falling materials for the "other" category too
    if (otherMaterials.length === 0) {
      otherMaterials.push(...fallingMaterials);
    }
    
    // Set viewport to match buffer dimensions
    gl.viewport(0, 0, this.#bufferWidth, this.#bufferHeight);
    
    // Read current texture data directly from texture (more reliable than framebuffer)
    // We'll generate new data instead of reading, since we're replacing everything
    const pixels = new Float32Array(width * height * 4);
    
    // Helper function to create particle data (matches createParticle in shader)
    // When useBlobs is true, use full brightness (1.0) instead of random values
    const createParticleData = (materialId: number, useFullBrightness: boolean = false): Float32Array => {
      const data = new Float32Array(4);
      if (materialId === 0) {
        // AIR
        return new Float32Array([0.0, 0.0, 0.0, 0.0]);
      } else {
        if (useFullBrightness) {
          // Use full brightness for blob-based fills to keep colors vibrant
          if (materialId === 5) { // PLANT
            return new Float32Array([1.0, 0.0, 0.5, materialId]);
          } else if (materialId === 9) { // FIRE
            return new Float32Array([1.0, 0.0, 1.0, materialId]);
          } else if (materialId === 11) { // MOSS
            return new Float32Array([1.0, 1.0, 0.3, materialId]);
          } else {
            // Default: full brightness in R channel, material ID in A
            return new Float32Array([1.0, 0.0, 0.0, materialId]);
          }
        } else {
          // Original random variation for non-blob fills
          const rand = Math.random();
          if (materialId === 5) { // PLANT
            return new Float32Array([rand, 0.0, 0.5, materialId]);
          } else if (materialId === 9) { // FIRE
            return new Float32Array([rand, 0.0, 0.5 + rand * 0.5, materialId]);
          } else if (materialId === 11) { // MOSS
            return new Float32Array([rand, Math.random(), 0.3, materialId]);
          } else {
            // Default: random in R channel, material ID in A
            return new Float32Array([rand, 0.0, 0.0, materialId]);
          }
        }
      }
    };
    
    // Simple diversity - just avoid using the same material too frequently
    const recentMaterialIds: number[] = [];
    const maxRecent = 15;
    
    const selectDiverseMaterial = (
      materials: Array<{ id: number; name: string }>
    ): { id: number; name: string } => {
      // Filter out recently used materials (last 15)
      const available = materials.filter(m => !recentMaterialIds.includes(m.id));
      const pool = available.length > 0 ? available : materials;
      
      // Pick randomly from pool
      const selected = pool[Math.floor(Math.random() * pool.length)];
      
      // Track recent usage
      recentMaterialIds.push(selected.id);
      if (recentMaterialIds.length > maxRecent) {
        recentMaterialIds.shift();
      }
      
      return selected;
    };
    
    // Modify pixels
    const totalPixels = width * height;
    const airPixels = Math.floor(totalPixels * airRatio);
    const materialPixels = totalPixels - airPixels;
    const fallingPixels = Math.floor(materialPixels * (6/7)); // 6/7 of materials should fall
    const otherPixels = materialPixels - fallingPixels; // Remaining 1/7
    
    if (useBlobs) {
      // Create blob-based distribution (roughly 20 pixels per blob)
      const blobSize = Math.ceil(Math.sqrt(20)); // ~4-5 pixels per side for ~20 pixel blobs
      const blobsX = Math.ceil(width / blobSize);
      const blobsY = Math.ceil(height / blobSize);
      const totalBlobs = blobsX * blobsY;
      
      // Determine which blobs should be air vs material
      const airBlobs = Math.floor(totalBlobs * airRatio);
      const materialBlobs = totalBlobs - airBlobs;
      const fallingBlobs = Math.floor(materialBlobs * (6/7));
      const otherBlobs = materialBlobs - fallingBlobs;
      
      // Create blob assignments
      const blobAssignments: Array<{ isAir: boolean; isFalling: boolean; material?: { id: number; name: string } }> = [];
      for (let i = 0; i < totalBlobs; i++) {
        if (i < airBlobs) {
          blobAssignments.push({ isAir: true, isFalling: false });
        } else {
          const isFalling = (i - airBlobs) < fallingBlobs;
          blobAssignments.push({ isAir: false, isFalling });
        }
      }
      
      // Shuffle blob assignments for random distribution
      for (let i = blobAssignments.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [blobAssignments[i], blobAssignments[j]] = [blobAssignments[j], blobAssignments[i]];
      }
      
      // Assign materials to non-air blobs
      // Double the chance for water (ID 2) - make ~30% of falling blobs water instead of ~15%
      const waterMaterial = fallingMaterials.find(m => m.id === 2);
      let fallingCount = 0;
      let otherCount = 0;
      let waterCount = 0;
      const targetWaterBlobs = Math.floor(fallingBlobs * 0.3); // ~30% of falling blobs should be water (doubled from ~15%)
      
      for (let i = 0; i < blobAssignments.length; i++) {
        const blob = blobAssignments[i];
        if (!blob.isAir) {
          if (blob.isFalling && fallingCount < fallingBlobs) {
            // Prioritize water for first portion of falling blobs
            if (waterMaterial && waterCount < targetWaterBlobs && Math.random() < 0.5) {
              blob.material = waterMaterial;
              waterCount++;
            } else {
              blob.material = selectDiverseMaterial(fallingMaterials);
            }
            fallingCount++;
          } else if (!blob.isFalling && otherCount < otherBlobs) {
            blob.material = selectDiverseMaterial(otherMaterials);
            otherCount++;
          } else {
            // Fallback if counts don't match
            blob.material = selectDiverseMaterial(fallingMaterials.length > 0 ? fallingMaterials : otherMaterials);
          }
        }
      }
      
      // Fill pixels based on blob assignments
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const blobX = Math.floor(x / blobSize);
          const blobY = Math.floor(y / blobSize);
          const blobIdx = blobY * blobsX + blobX;
          const blob = blobAssignments[Math.min(blobIdx, blobAssignments.length - 1)];
          
          const dataIdx = (y * width + x) * 4;
          let materialId: number;
          
          if (blob.isAir) {
            materialId = 0; // AIR
          } else if (blob.material) {
            materialId = blob.material.id;
          } else {
            // Fallback to air if no material assigned
            materialId = 0;
          }
          
          const particleData = createParticleData(materialId, true); // Use full brightness for blobs
          pixels[dataIdx] = particleData[0];     // R
          pixels[dataIdx + 1] = particleData[1]; // G
          pixels[dataIdx + 2] = particleData[2]; // B
          pixels[dataIdx + 3] = particleData[3]; // A (material ID)
        }
      }
    } else {
      // Original random distribution
      const pixelIndices = Array.from({ length: totalPixels }, (_, i) => i);
      
      // Shuffle for random distribution
      for (let i = pixelIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pixelIndices[i], pixelIndices[j]] = [pixelIndices[j], pixelIndices[i]];
      }
      
      // Assign materials
      let fallingCount = 0;
      let otherCount = 0;
      
      for (let i = 0; i < totalPixels; i++) {
        const pixelIdx = pixelIndices[i];
        const dataIdx = pixelIdx * 4;
        
        let materialId: number;
        if (i < airPixels) {
          materialId = 0; // AIR
        } else {
          // Determine if this should be a falling material (6/7) or other (1/7)
          const isFalling = fallingCount < fallingPixels;
          
          let selectedMat: { id: number; name: string };
          if (isFalling) {
            // Use falling material with diversity
            selectedMat = selectDiverseMaterial(fallingMaterials);
            fallingCount++;
          } else {
            // Use other material with diversity
            selectedMat = selectDiverseMaterial(otherMaterials);
            otherCount++;
          }
          
          materialId = selectedMat.id;
        }
        
        const particleData = createParticleData(materialId);
        pixels[dataIdx] = particleData[0];     // R
        pixels[dataIdx + 1] = particleData[1]; // G
        pixels[dataIdx + 2] = particleData[2]; // B
        pixels[dataIdx + 3] = particleData[3]; // A (material ID)
      }
    }
    
    // Write back to both ping-pong buffers to keep them in sync
    // Important: Unbind any framebuffer first
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    // Flip pixel data vertically because WebGL texSubImage2D expects bottom-left origin
    // but we're writing from top-left. We need to reverse the rows.
    const flippedPixels = new Float32Array(width * height * 4);
    for (let y = 0; y < height; y++) {
      const srcRow = height - 1 - y; // Flip row index
      for (let x = 0; x < width; x++) {
        const srcIdx = (srcRow * width + x) * 4;
        const dstIdx = (y * width + x) * 4;
        flippedPixels[dstIdx] = pixels[srcIdx];
        flippedPixels[dstIdx + 1] = pixels[srcIdx + 1];
        flippedPixels[dstIdx + 2] = pixels[srcIdx + 2];
        flippedPixels[dstIdx + 3] = pixels[srcIdx + 3];
      }
    }
    
    for (let i = 0; i < 2; i++) {
      gl.bindTexture(gl.TEXTURE_2D, this.#tex[i]);
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        startX,
        startY,
        width,
        height,
        gl.RGBA,
        gl.FLOAT,
        flippedPixels
      );
    }
    
    console.log(`Wrote ${width * height} pixels to textures at (${startX}, ${startY}), flipped vertically`);
  }

  /**
   * Fill the lower two-thirds of the canvas with a random distribution of specific materials
   * Materials: water, dye, lava, helium, sand, mud, moss, stone, air
   * @param airRatio Ratio of air (0-1), default 0.25 (25% air)
   */
  fillLowerTwoThirdsWithSpecificMaterials(airRatio: number = 0.25): void {
    if (!this.#gl || !this.#bufferWidth || !this.#bufferHeight) {
      console.error('Simulator not initialized. Buffer dimensions:', {
        width: this.#bufferWidth,
        height: this.#bufferHeight,
        gl: !!this.#gl
      });
      return;
    }
    
    const lowerTwoThirdsStartY = Math.floor(this.#bufferHeight / 3);
    const regionHeight = this.#bufferHeight - lowerTwoThirdsStartY;
    
    // Get specific materials: water, dye, lava, helium, sand, mud, moss, stone
    const specificMaterialIds = new Set<number>();
    
    // Core materials by ID
    specificMaterialIds.add(2);  // water
    // specificMaterialIds.add(3);  // lava - removed
    specificMaterialIds.add(4);  // sand
    specificMaterialIds.add(6);  // stone
    specificMaterialIds.add(11); // moss
    
    // Extended materials by name lookup - adding more colorful materials
    for (const name of ['dye', 'helium', 'mud', 'chlorine', 'sulfur', 'acid', 'oil', 'honey', 'alcohol', 'nitrogen', 'oxygen', 'hydrogen']) {
      const mapping = this.#materialMap.get(name.toLowerCase());
      if (mapping) {
        specificMaterialIds.add(mapping.id);
      }
    }
    
    // Get filtered materials list
    const allMaterials = this.getAllMaterials();
    const filteredMaterials = allMaterials.filter(m => specificMaterialIds.has(m.id));
    
    if (filteredMaterials.length === 0) {
      console.error('No valid materials found');
      return;
    }
    
    console.log('Filling lower two-thirds with specific materials:', {
      startY: lowerTwoThirdsStartY,
      height: regionHeight,
      width: this.#bufferWidth,
      airRatio,
      materials: filteredMaterials.map(m => `${m.name} (ID: ${m.id})`)
    });
    
    // Call fillRegionWithRandomMaterials but pass filtered materials and enable blob clustering
    this.fillRegionWithRandomMaterials(
      0,                    // startX
      lowerTwoThirdsStartY, // startY
      this.#bufferWidth,   // width
      regionHeight,        // height
      airRatio,            // airRatio
      filteredMaterials,   // optional: filtered materials
      true                 // useBlobs: cluster into ~20 pixel blobs
    );
  }

  /**
   * Fill the lower two-thirds of the canvas with high-contrast materials
   * Selects materials that have high visual contrast with each other
   * @param airRatio Ratio of air (0-1), default 0.25 (25% air)
   */
  fillLowerTwoThirdsWithHighContrastMaterials(airRatio: number = 0.25): void {
    if (!this.#gl || !this.#bufferWidth || !this.#bufferHeight) {
      console.error('Simulator not initialized. Buffer dimensions:', {
        width: this.#bufferWidth,
        height: this.#bufferHeight,
        gl: !!this.#gl
      });
      return;
    }
    
    const lowerTwoThirdsStartY = Math.floor(this.#bufferHeight / 3);
    const regionHeight = this.#bufferHeight - lowerTwoThirdsStartY;
    
    // Get all materials and calculate their colors
    const allMaterials = this.getAllMaterials();
    const materialsWithColors: Array<{ id: number; name: string; color: [number, number, number] }> = [];
    
    for (const mat of allMaterials) {
      if (mat.id === 0) continue; // Skip air
      
      const mapping = this.#materialMap.get(mat.name.toLowerCase());
      if (mapping && mapping.color) {
        // Skip wall and support materials (solid blocks that don't move)
        const behavior = (mapping.behavior || '').toLowerCase();
        if (behavior === 'wall' || behavior === 'support') {
          continue;
        }
        
        let color: [number, number, number] = [0.5, 0.5, 0.5]; // Default gray
        
        try {
          if (Array.isArray(mapping.color)) {
            // Color is an array of RGB arrays, take the first one
            const firstColor = mapping.color[0];
            if (Array.isArray(firstColor) && firstColor.length >= 3) {
              color = [firstColor[0] as number, firstColor[1] as number, firstColor[2] as number];
            }
          } else if (typeof mapping.color === 'string') {
            // Parse hex color
            const hex = mapping.color.replace('#', '');
            if (hex.length >= 6) {
              color = [
                parseInt(hex.substr(0, 2), 16) / 255,
                parseInt(hex.substr(2, 2), 16) / 255,
                parseInt(hex.substr(4, 2), 16) / 255
              ];
            }
          } else if (typeof mapping.color === 'object') {
            // Color is an object with r, g, b properties
            const c = mapping.color as any;
            color = [c.r || 0.5, c.g || 0.5, c.b || 0.5];
          }
        } catch (e) {
          console.warn(`Failed to parse color for ${mat.name}, using default gray`);
        }
        
        materialsWithColors.push({ id: mat.id, name: mat.name, color });
      }
    }
    
    // Select high-contrast materials using a greedy algorithm
    // Start with the brightest material, then add materials that contrast most with existing set
    const selectedMaterials: Array<{ id: number; name: string; color: [number, number, number] }> = [];
    
    // Calculate brightness (luminance)
    const getBrightness = (color: [number, number, number]) => {
      return 0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2];
    };
    
    // Calculate color distance (Euclidean in RGB space)
    const colorDistance = (c1: [number, number, number], c2: [number, number, number]) => {
      return Math.sqrt(
        Math.pow(c1[0] - c2[0], 2) +
        Math.pow(c1[1] - c2[1], 2) +
        Math.pow(c1[2] - c2[2], 2)
      );
    };
    
    // Find minimum distance to any selected material
    const minDistanceToSet = (color: [number, number, number], selected: Array<{ color: [number, number, number] }>) => {
      if (selected.length === 0) return Infinity;
      return Math.min(...selected.map(m => colorDistance(color, m.color)));
    };
    
    // Start with brightest material
    materialsWithColors.sort((a, b) => getBrightness(b.color) - getBrightness(a.color));
    if (materialsWithColors.length > 0) {
      selectedMaterials.push(materialsWithColors[0]);
    }
    
    // Add 7 more materials that maximize contrast
    const targetCount = 8;
    for (let i = 1; i < targetCount && i < materialsWithColors.length; i++) {
      let bestMaterial = materialsWithColors[i];
      let bestDistance = minDistanceToSet(bestMaterial.color, selectedMaterials);
      
      // Check remaining materials for better contrast
      for (let j = i + 1; j < materialsWithColors.length; j++) {
        const dist = minDistanceToSet(materialsWithColors[j].color, selectedMaterials);
        if (dist > bestDistance) {
          bestDistance = dist;
          bestMaterial = materialsWithColors[j];
          // Swap to bring best to front
          [materialsWithColors[i], materialsWithColors[j]] = [materialsWithColors[j], materialsWithColors[i]];
        }
      }
      
      selectedMaterials.push(bestMaterial);
    }
    
    const filteredMaterials = selectedMaterials.map(m => ({ id: m.id, name: m.name }));
    
    console.log('Filling lower two-thirds with high-contrast materials:', {
      startY: lowerTwoThirdsStartY,
      height: regionHeight,
      width: this.#bufferWidth,
      airRatio,
      materials: filteredMaterials.map(m => `${m.name} (ID: ${m.id})`)
    });
    
    // Use blob clustering with high-contrast materials
    this.fillRegionWithRandomMaterials(
      0,                    // startX
      lowerTwoThirdsStartY, // startY
      this.#bufferWidth,   // width
      regionHeight,        // height
      airRatio,            // airRatio
      filteredMaterials,   // high-contrast materials
      true                 // useBlobs: cluster into ~20 pixel blobs
    );
  }

  /**
   * Fill a region with a random distribution of specific materials (duplicate of fillRegionWithRandomMaterials but with filtered material list)
   */
  fillRegionWithSpecificMaterialsList(
    startX: number,
    startY: number,
    width: number,
    height: number,
    materials: Array<{ id: number; name: string }>,
    airRatio: number = 0.25
  ): void {
    const gl = this.#gl;
    
    // Filter out air for non-air positions
    const nonAirMaterials = materials.filter(m => m.id !== 0);
    
    // Separate materials into "falling" (powders, liquids, molten) and "other" categories
    const fallingMaterials: Array<{ id: number; name: string }> = [];
    const otherMaterials: Array<{ id: number; name: string }> = [];
    
    const fallingBehaviors = ['powder', 'liquid', 'molten', 'sturdypowder', 'supportpowder'];
    
    for (const mat of nonAirMaterials) {
      // For core materials, determine behavior by ID
      let behaviorStr = '';
      if (mat.id === 2) { // WATER
        behaviorStr = 'liquid';
      } else if (mat.id === 3) { // LAVA
        behaviorStr = 'molten';
      } else if (mat.id === 4) { // SAND
        behaviorStr = 'powder';
      } else if (mat.id === 6) { // STONE
        behaviorStr = 'powder';
      } else if (mat.id === 11) { // MOSS
        behaviorStr = 'powder';
      } else {
        // Extended material - look up in materialMap
        const mapping = this.#materialMap.get(mat.name.toLowerCase());
        if (mapping) {
          behaviorStr = (mapping.behavior || '').toLowerCase();
        }
      }
      
      const isFalling = fallingBehaviors.some(b => behaviorStr.includes(b));
      
      if (isFalling) {
        fallingMaterials.push(mat);
      } else {
        otherMaterials.push(mat);
      }
    }
    
    if (fallingMaterials.length === 0) {
      fallingMaterials.push(...nonAirMaterials);
    }
    if (otherMaterials.length === 0) {
      otherMaterials.push(...fallingMaterials);
    }
    
    console.log('Material categorization:', {
      total: nonAirMaterials.length,
      falling: fallingMaterials.length,
      other: otherMaterials.length
    });
    
    gl.viewport(0, 0, this.#bufferWidth, this.#bufferHeight);
    const pixels = new Float32Array(width * height * 4);
    
    const createParticleData = (materialId: number): Float32Array => {
      const data = new Float32Array(4);
      if (materialId === 0) {
        return new Float32Array([0.0, 0.0, 0.0, 0.0]);
      } else {
        const rand = Math.random();
        if (materialId === 5) {
          return new Float32Array([rand, 0.0, 0.5, materialId]);
        } else if (materialId === 9) {
          return new Float32Array([rand, 0.0, 0.5 + rand * 0.5, materialId]);
        } else if (materialId === 11) {
          return new Float32Array([rand, Math.random(), 0.3, materialId]);
        } else {
          return new Float32Array([rand, 0.0, 0.0, materialId]);
        }
      }
    };
    
    const recentMaterialIds: number[] = [];
    const maxRecent = 15;
    
    const selectDiverseMaterial = (
      materials: Array<{ id: number; name: string }>
    ): { id: number; name: string } => {
      const available = materials.filter(m => !recentMaterialIds.includes(m.id));
      const pool = available.length > 0 ? available : materials;
      const selected = pool[Math.floor(Math.random() * pool.length)];
      recentMaterialIds.push(selected.id);
      if (recentMaterialIds.length > maxRecent) {
        recentMaterialIds.shift();
      }
      return selected;
    };
    
    const totalPixels = width * height;
    const airPixels = Math.floor(totalPixels * airRatio);
    const materialPixels = totalPixels - airPixels;
    const fallingPixels = Math.floor(materialPixels * (6/7));
    const otherPixels = materialPixels - fallingPixels;
    
    const pixelIndices = Array.from({ length: totalPixels }, (_, i) => i);
    for (let i = pixelIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pixelIndices[i], pixelIndices[j]] = [pixelIndices[j], pixelIndices[i]];
    }
    
    let fallingCount = 0;
    let otherCount = 0;
    
    for (let i = 0; i < totalPixels; i++) {
      const pixelIdx = pixelIndices[i];
      const dataIdx = pixelIdx * 4;
      
      let materialId: number;
      if (i < airPixels) {
        materialId = 0;
      } else {
        const isFalling = fallingCount < fallingPixels;
        let selectedMat: { id: number; name: string };
        if (isFalling) {
          selectedMat = selectDiverseMaterial(fallingMaterials);
          fallingCount++;
        } else {
          selectedMat = selectDiverseMaterial(otherMaterials);
          otherCount++;
        }
        materialId = selectedMat.id;
      }
      
      const particleData = createParticleData(materialId);
      pixels[dataIdx] = particleData[0];
      pixels[dataIdx + 1] = particleData[1];
      pixels[dataIdx + 2] = particleData[2];
      pixels[dataIdx + 3] = particleData[3];
    }
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    const flippedPixels = new Float32Array(width * height * 4);
    for (let y = 0; y < height; y++) {
      const srcRow = height - 1 - y;
      for (let x = 0; x < width; x++) {
        const srcIdx = (srcRow * width + x) * 4;
        const dstIdx = (y * width + x) * 4;
        flippedPixels[dstIdx] = pixels[srcIdx];
        flippedPixels[dstIdx + 1] = pixels[srcIdx + 1];
        flippedPixels[dstIdx + 2] = pixels[srcIdx + 2];
        flippedPixels[dstIdx + 3] = pixels[srcIdx + 3];
      }
    }
    
    for (let i = 0; i < 2; i++) {
      gl.bindTexture(gl.TEXTURE_2D, this.#tex[i]);
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        startX,
        startY,
        width,
        height,
        gl.RGBA,
        gl.FLOAT,
        flippedPixels
      );
    }
    
    // Debug: Check what material IDs were written
    const materialIdCounts = new Map<number, number>();
    for (let i = 0; i < Math.min(1000, pixels.length / 4); i++) {
      const materialId = pixels[i * 4 + 3];
      materialIdCounts.set(materialId, (materialIdCounts.get(materialId) || 0) + 1);
    }
    console.log('Sample of material IDs written:', Array.from(materialIdCounts.entries()).slice(0, 10));
    
    console.log(`Wrote ${width * height} pixels to textures at (${startX}, ${startY}), flipped vertically`);
    // Reset frames to force immediate visibility
    this.#frames = 0;
  }

  /**
   * Fill a region from image data by mapping colors to materials
   * 
   * IMPORTANT: This method uses the ACTIVE color scheme (original or alternate) for matching.
   * When alternate colors are enabled, it matches against the optimally distributed RGB colors.
   * This ensures chromatic fidelity - image pixels are matched to materials using the same
   * color space that is currently being displayed.
   * 
   * @param imageData ImageData from canvas
   * @param startX Starting X coordinate
   * @param startY Starting Y coordinate
   * @param width Width of region to fill
   * @param height Height of region to fill
   * @param imageWidth Original image width
   * @param imageHeight Original image height
   */
  fillRegionFromImage(
    imageData: ImageData,
    startX: number,
    startY: number,
    width: number,
    height: number,
    imageWidth: number,
    imageHeight: number
  ): void {
    if (!this.#gl || !this.#bufferWidth || !this.#bufferHeight) {
      console.error('Simulator not initialized');
      return;
    }

    const gl = this.#gl;
    
    // Build color-to-material mapping - use ALL materials with properties
    const allMaterials = this.getAllMaterialsWithProperties();
    
    // Parse hex colors to RGB for comparison
    const hexToRgb = (hex: string): [number, number, number] | null => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] : null;
    };
    
    // Helper to get material behavior
    const getMaterialBehavior = (materialId: number, materialName: string): string => {
      // Core materials - hardcoded behaviors
      if (materialId === 0) return 'gas';      // AIR
      if (materialId === 1) return 'dgas';     // SMOKE
      if (materialId === 2) return 'liquid';   // WATER
      if (materialId === 3) return 'molten';    // LAVA
      if (materialId === 4) return 'powder';   // SAND
      if (materialId === 5) return 'powder';   // PLANT (treat as powder-like)
      if (materialId === 6) return 'powder';   // STONE (treat as powder)
      if (materialId === 7) return 'wall';     // WALL
      if (materialId === 8) return 'powder';   // ICE (treat as powder)
      if (materialId === 9) return 'gas';      // FIRE
      if (materialId === 10) return 'dgas';    // STEAM
      if (materialId === 11) return 'powder';  // MOSS
      
      // Extended materials - use behavior from material properties
      return 'powder'; // Will be overridden below
    };
    
    // Helper to check if behavior is interactive (liquid or powder)
    const isInteractiveBehavior = (behavior: string): boolean => {
      return behavior === 'liquid' || 
             behavior === 'molten' || 
             behavior === 'powder' || 
             behavior === 'sturdypowder' || 
             behavior === 'supportpowder' ||
             behavior === 'gas' ||
             behavior === 'dgas';
    };
    
    // Helper to check if behavior is solid/wall (not interactive)
    const isSolidBehavior = (behavior: string): boolean => {
      return behavior === 'wall' || behavior === 'support';
    };
    
    // Build material color cache with behavior info - use ALL materials
    // IMPORTANT: Use the ACTIVE color scheme (original or alternate) for matching
    // This ensures chromatic fidelity - when alternate colors are enabled,
    // we match against those colors, not the original ones
    const materialColors: Array<{ id: number; name: string; rgb: [number, number, number]; behavior: string }> = [];
    for (const mat of allMaterials) {
      // Get color from the ACTIVE color scheme
      let colorStr: string | undefined;
      
      if (this.useAlternateColors) {
        // Use alternate color from texture
        const colorFromTex = this.#getColorFromTexture(mat.id);
        if (colorFromTex) {
          colorStr = colorFromTex;
        }
      }
      
      // Fallback to original color if alternate not available or not using alternate
      if (!colorStr) {
        const mapping = this.#materialMap.get(mat.name);
        if (!mapping) continue;
        colorStr = this.#extractColor(mapping.color);
      }
      
      if (!colorStr) continue;
      
      const rgb = hexToRgb(colorStr);
      if (rgb) {
        // Use behavior from material properties, fallback to helper
        let behavior = mat.behavior || getMaterialBehavior(mat.id, mat.name);
        // Normalize behavior string
        behavior = behavior.toLowerCase();
        materialColors.push({ id: mat.id, name: mat.name, rgb, behavior });
      }
    }
    
    // Log material distribution by behavior
    const behaviorCounts: Record<string, number> = {};
    for (const mat of materialColors) {
      behaviorCounts[mat.behavior] = (behaviorCounts[mat.behavior] || 0) + 1;
    }
    console.log(`Building color mapping with ${materialColors.length} materials:`, behaviorCounts);
    
    // Improved color distance calculation using weighted RGB (perceptually better)
    // Uses weights that approximate human color perception
    const colorDistance = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number => {
      // Convert to 0-1 range for better calculation
      const r1n = r1 / 255;
      const g1n = g1 / 255;
      const b1n = b1 / 255;
      const r2n = r2 / 255;
      const g2n = g2 / 255;
      const b2n = b2 / 255;
      
      // Weighted RGB distance (approximates perceptual distance)
      // Red and green are more perceptually important than blue
      const dr = (r1n - r2n) * 0.3;
      const dg = (g1n - g2n) * 0.59;
      const db = (b1n - b2n) * 0.11;
      
      // Also consider luminance difference
      const l1 = 0.299 * r1n + 0.587 * g1n + 0.114 * b1n;
      const l2 = 0.299 * r2n + 0.587 * g2n + 0.114 * b2n;
      const dl = Math.abs(l1 - l2);
      
      // Combine RGB distance with luminance difference
      const rgbDist = Math.sqrt(dr * dr + dg * dg + db * db);
      return rgbDist * 255 + dl * 100; // Scale back to 0-255 range
    };
    
    // Find closest material for a given RGB color, preferring liquids and powders
    const findClosestMaterial = (r: number, g: number, b: number): { id: number; name: string } => {
      // Calculate brightness (luminance)
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // If color is close to black (brightness < 30), default to air
      if (brightness < 30) {
        return { id: 0, name: 'air' };
      }
      
      // Find all candidates with distances
      const candidates: Array<{ mat: typeof materialColors[0]; distance: number }> = [];
      for (const mat of materialColors) {
        const distance = colorDistance(r, g, b, mat.rgb[0], mat.rgb[1], mat.rgb[2]);
        candidates.push({ mat, distance });
      }
      
      // Sort by distance
      candidates.sort((a, b) => a.distance - b.distance);
      
      // Find the best candidate, preferring interactive materials
      // Use a more generous threshold to allow better color matching
      const closestDistance = candidates[0].distance;
      const threshold = closestDistance * 1.3; // 30% tolerance for interactive materials
      
      // First, try to find an interactive material within threshold
      let bestInteractive: typeof candidates[0] | null = null;
      for (const candidate of candidates) {
        if (candidate.distance <= threshold) {
          if (isInteractiveBehavior(candidate.mat.behavior)) {
            bestInteractive = candidate;
            break; // Take the first (closest) interactive material
          }
        } else {
          break; // Beyond threshold, stop looking
        }
      }
      
      // If we found an interactive material, use it
      if (bestInteractive) {
        return { id: bestInteractive.mat.id, name: bestInteractive.mat.name };
      }
      
      // If no interactive material found within threshold, but closest is solid/wall, 
      // try to find a better alternative with a more relaxed threshold
      if (isSolidBehavior(candidates[0].mat.behavior)) {
        // Look for any interactive material within 80% more distance
        const relaxedThreshold = closestDistance * 1.8;
        for (const candidate of candidates) {
          if (candidate.distance <= relaxedThreshold) {
            if (isInteractiveBehavior(candidate.mat.behavior)) {
              return { id: candidate.mat.id, name: candidate.mat.name };
            }
          } else {
            break;
          }
        }
        
        // If still no interactive material and color is dark, prefer air
        if (brightness < 60) {
          return { id: 0, name: 'air' };
        }
      }
      
      // Return closest match (even if solid, it's better than nothing)
      return { id: candidates[0].mat.id, name: candidates[0].mat.name };
    };
    
    // Create pixel data
    const pixels = new Float32Array(width * height * 4);
    const createParticleData = (materialId: number): Float32Array => {
      if (materialId === 0) {
        return new Float32Array([0.0, 0.0, 0.0, 0.0]);
      }
      const rand = Math.random();
      if (materialId === 5) { // PLANT
        return new Float32Array([rand, 0.0, 0.5, materialId]);
      } else if (materialId === 9) { // FIRE
        return new Float32Array([rand, 0.0, 0.5 + rand * 0.5, materialId]);
      } else if (materialId === 11) { // MOSS
        return new Float32Array([rand, Math.random(), 0.3, materialId]);
      } else {
        return new Float32Array([rand, 0.0, 0.0, materialId]);
      }
    };
    
    // Sample image pixels and map to materials
    const scaleX = imageWidth / width;
    const scaleY = imageHeight / height;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Sample from image (with minimal downsampling - nearest neighbor)
        const srcX = Math.floor(x * scaleX);
        const srcY = Math.floor(y * scaleY);
        const srcIdx = (srcY * imageWidth + srcX) * 4;
        
        const r = imageData.data[srcIdx];
        const g = imageData.data[srcIdx + 1];
        const b = imageData.data[srcIdx + 2];
        const a = imageData.data[srcIdx + 3];
        
        // If pixel is transparent or very dark, use air
        let materialId = 0;
        if (a > 10 && (r + g + b) > 30) {
          const closest = findClosestMaterial(r, g, b);
          materialId = closest.id;
        }
        
        const dataIdx = (y * width + x) * 4;
        const particleData = createParticleData(materialId);
        pixels[dataIdx] = particleData[0];
        pixels[dataIdx + 1] = particleData[1];
        pixels[dataIdx + 2] = particleData[2];
        pixels[dataIdx + 3] = particleData[3];
      }
    }
    
    // Flip pixel data vertically for WebGL
    const flippedPixels = new Float32Array(width * height * 4);
    for (let y = 0; y < height; y++) {
      const srcRow = height - 1 - y;
      for (let x = 0; x < width; x++) {
        const srcIdx = (srcRow * width + x) * 4;
        const dstIdx = (y * width + x) * 4;
        flippedPixels[dstIdx] = pixels[srcIdx];
        flippedPixels[dstIdx + 1] = pixels[srcIdx + 1];
        flippedPixels[dstIdx + 2] = pixels[srcIdx + 2];
        flippedPixels[dstIdx + 3] = pixels[srcIdx + 3];
      }
    }
    
    // Write to textures
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    for (let i = 0; i < 2; i++) {
      gl.bindTexture(gl.TEXTURE_2D, this.#tex[i]);
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        startX,
        startY,
        width,
        height,
        gl.RGBA,
        gl.FLOAT,
        flippedPixels
      );
    }
    
    // Count unique materials used
    const usedMaterials = new Set<number>();
    for (let i = 0; i < pixels.length; i += 4) {
      usedMaterials.add(pixels[i + 3]);
    }
    console.log(`Filled region (${startX}, ${startY}) ${width}x${height} from image ${imageWidth}x${imageHeight}`);
    console.log(`Used ${usedMaterials.size} unique materials out of ${materialColors.length} available`);
  }

  /**
   * Remove all wall and support materials (solid blocks) from the canvas
   * Replaces them with air
   */
  removeSolidBlocks(): void {
    if (!this.#gl || !this.#bufferWidth || !this.#bufferHeight) {
      console.error('Simulator not initialized. Buffer dimensions:', {
        width: this.#bufferWidth,
        height: this.#bufferHeight,
        gl: !!this.#gl
      });
      return;
    }
    
    const gl = this.#gl;
    
    // Read current texture data
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.#fbo[1 - this.#swap]);
    const pixels = new Float32Array(this.#bufferWidth * this.#bufferHeight * 4);
    gl.readPixels(0, 0, this.#bufferWidth, this.#bufferHeight, gl.RGBA, gl.FLOAT, pixels);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    // Identify wall and support material IDs
    const solidMaterialIds = new Set<number>();
    const allMaterials = this.getAllMaterials();
    
    for (const mat of allMaterials) {
      const mapping = this.#materialMap.get(mat.name.toLowerCase());
      if (mapping) {
        const behavior = (mapping.behavior || '').toLowerCase();
        if (behavior === 'wall' || behavior === 'support') {
          solidMaterialIds.add(mat.id);
        }
      }
    }
    
    // Also add core wall material (ID 7)
    solidMaterialIds.add(7); // WALL
    
    console.log('Removing solid blocks. Material IDs to remove:', Array.from(solidMaterialIds));
    
    let removedCount = 0;
    
    // Replace solid materials with air
    for (let i = 0; i < pixels.length; i += 4) {
      const materialId = pixels[i + 3]; // A channel contains material ID
      if (solidMaterialIds.has(materialId)) {
        pixels[i] = 0.0;     // R
        pixels[i + 1] = 0.0; // G
        pixels[i + 2] = 0.0; // B
        pixels[i + 3] = 0.0; // A (AIR)
        removedCount++;
      }
    }
    
    console.log(`Removed ${removedCount} solid block pixels`);
    
    // Flip pixel data vertically for WebGL
    const flippedPixels = new Float32Array(this.#bufferWidth * this.#bufferHeight * 4);
    for (let y = 0; y < this.#bufferHeight; y++) {
      const srcRow = this.#bufferHeight - 1 - y;
      for (let x = 0; x < this.#bufferWidth; x++) {
        const srcIdx = (srcRow * this.#bufferWidth + x) * 4;
        const dstIdx = (y * this.#bufferWidth + x) * 4;
        flippedPixels[dstIdx] = pixels[srcIdx];
        flippedPixels[dstIdx + 1] = pixels[srcIdx + 1];
        flippedPixels[dstIdx + 2] = pixels[srcIdx + 2];
        flippedPixels[dstIdx + 3] = pixels[srcIdx + 3];
      }
    }
    
    // Write back to both ping-pong buffers
    for (let i = 0; i < 2; i++) {
      gl.bindTexture(gl.TEXTURE_2D, this.#tex[i]);
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        this.#bufferWidth,
        this.#bufferHeight,
        gl.RGBA,
        gl.FLOAT,
        flippedPixels
      );
    }
    
    this.#frames = 0; // Force immediate update
    console.log('Solid blocks removed successfully');
  }

  /**
   * Fill the lower two-thirds of the canvas with ALL materials (core + extended)
   * Uses all available materials from the material system
   * @param airRatio Ratio of air (0-1), default 0.25 (25% air)
   */
  fillLowerTwoThirdsWithAllMaterials(airRatio: number = 0.25): void {
    if (!this.#gl || !this.#bufferWidth || !this.#bufferHeight) {
      console.error('Simulator not initialized. Buffer dimensions:', {
        width: this.#bufferWidth,
        height: this.#bufferHeight,
        gl: !!this.#gl
      });
      return;
    }
    
    const lowerTwoThirdsStartY = Math.floor(this.#bufferHeight / 3);
    const regionHeight = this.#bufferHeight - lowerTwoThirdsStartY;
    
    // Get ALL materials (core + extended)
    const allMaterials = this.getAllMaterials();
    
    console.log('Filling lower two-thirds with ALL materials:', {
      startY: lowerTwoThirdsStartY,
      height: regionHeight,
      width: this.#bufferWidth,
      airRatio,
      totalMaterials: allMaterials.length,
      sampleMaterials: allMaterials.slice(0, 10).map(m => `${m.name} (ID: ${m.id})`)
    });
    
    // Use blob clustering with all materials
    this.fillRegionWithRandomMaterials(
      0,                    // startX
      lowerTwoThirdsStartY, // startY
      this.#bufferWidth,   // width
      regionHeight,        // height
      airRatio,            // airRatio
      allMaterials,        // ALL materials (core + extended)
      true                 // useBlobs: cluster into ~20 pixel blobs
    );
  }

  /**
   * Fill the lower two-thirds of the canvas with core materials only
   * Evenly distributes all 12 core materials (AIR, SMOKE, WATER, LAVA, SAND, PLANT, STONE, WALL, ICE, FIRE, STEAM, MOSS)
   * @param airRatio Ratio of air (0-1), default 0.25 (25% air)
   */
  fillLowerTwoThirdsWithCoreMaterials(airRatio: number = 0.25): void {
    if (!this.#gl || !this.#bufferWidth || !this.#bufferHeight) {
      console.error('Simulator not initialized. Buffer dimensions:', {
        width: this.#bufferWidth,
        height: this.#bufferHeight,
        gl: !!this.#gl
      });
      return;
    }
    
    const lowerTwoThirdsStartY = Math.floor(this.#bufferHeight / 3);
    const regionHeight = this.#bufferHeight - lowerTwoThirdsStartY;
    
    // Core materials: 0-11
    const coreMaterials = [
      { id: 0, name: 'air' },
      { id: 1, name: 'smoke' },
      { id: 2, name: 'water' },
      { id: 3, name: 'lava' },
      { id: 4, name: 'sand' },
      { id: 5, name: 'plant' },
      { id: 6, name: 'stone' },
      { id: 7, name: 'wall' },
      { id: 8, name: 'ice' },
      { id: 9, name: 'fire' },
      { id: 10, name: 'steam' },
      { id: 11, name: 'moss' }
    ];
    
    console.log('Filling lower two-thirds with core materials:', {
      startY: lowerTwoThirdsStartY,
      height: regionHeight,
      width: this.#bufferWidth,
      airRatio,
      materials: coreMaterials.map(m => `${m.name} (ID: ${m.id})`)
    });
    
    // Use blob clustering with core materials
    this.fillRegionWithRandomMaterials(
      0,                    // startX
      lowerTwoThirdsStartY, // startY
      this.#bufferWidth,   // width
      regionHeight,        // height
      airRatio,            // airRatio
      coreMaterials,       // core materials only
      true                 // useBlobs: cluster into ~20 pixel blobs
    );
  }
}

// Export for use
FolkSandHybrid.define();

