/**
 * FolkSand Hybrid Shaders
 * 
 * Shaders with texture-based material lookups for 367+ materials
 * while maintaining backward compatibility with core materials (0-11)
 */

import { glsl } from '@folkjs/dom/tags';
import { generateMaterialIDMap } from './material-id-map';
import { registerCustomBehaviors } from './custom-behavior-system';
import {
  generateMaterialLookupFunctions,
  generateCreateParticleFunction,
  generateBehaviorBasedPhysics,
  generateVisualizationFunction,
} from './shader-code-generator';
import { generateGLSLConstants } from './material-id-map';
import { generateCustomTickFunctions, generateCustomVisualizationFunctions, generateCustomTickCalls, generateCustomVisualizationCalls } from './custom-behavior-system';

// Constants from original shader (must match exactly)
const CONSTANTS = glsl`
#define AIR 0.0
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

const vec3 bgColor = pow(vec3(31, 34, 36) / 255.0, vec3(2));
`;

const UTILS = glsl`

const float EPSILON = 1e-4;

const float PI = acos(-1.);
const float TAU = PI * 2.0;

vec3 saturate(vec3 x) { return clamp(x, vec3(0), vec3(1)); }

// https://iquilezles.org/articles/palettes/
vec3 palette(float t)
{
	return .5 + .5 * cos(TAU * (vec3(1, 1, 1) * t + vec3(0, .33, .67)));
}

// Hash without Sine
// https://www.shadertoy.com/view/4djSRW
float hash12(vec2 p)
{
	vec3 p3  = fract(vec3(p.xyx) * .1031);
	p3 += dot(p3, p3.yzx + 33.33);
	return fract((p3.x + p3.y) * p3.z);
}

float hash13(vec3 p3)
{
	p3  = fract(p3 * .1031);
	p3 += dot(p3, p3.zyx + 31.32);
	return fract((p3.x + p3.y) * p3.z);
}

vec3 hash33(vec3 p3)
{
	p3 = fract(p3 * vec3(.1031, .1030, .0973));
	p3 += dot(p3, p3.yxz+33.33);
	return fract((p3.xxy + p3.yxx)*p3.zyx);
}

vec4 hash43(vec3 p)
{
	vec4 p4 = fract(vec4(p.xyzx)  * vec4(.1031, .1030, .0973, .1099));
	p4 += dot(p4, p4.wzxy+33.33);
	return fract((p4.xxyz+p4.yzzw)*p4.zywx);
}

vec3 linearTosRGB(vec3 col)
{
	return mix(1.055 * pow(col, vec3(1.0 / 2.4)) - 0.055, col * 12.92, lessThan(col, vec3(0.0031308)));
}
`;

// Generate material system data
const materialMap = generateMaterialIDMap();
const customBehaviors = registerCustomBehaviors(materialMap);

// Generate GLSL constants for all materials
const MATERIAL_CONSTANTS = generateGLSLConstants(materialMap);

// Generate helper functions
const MATERIAL_LOOKUP_FUNCTIONS = generateMaterialLookupFunctions();
const MATERIAL_LOOKUP_FUNCTIONS_CLAMPED = generateMaterialLookupFunctions(0.25); // 1/4 density range
const BEHAVIOR_PHYSICS = generateBehaviorBasedPhysics();
const CREATE_PARTICLE_FUNCTION = generateCreateParticleFunction(materialMap, customBehaviors);
const VISUALIZATION_FUNCTION = generateVisualizationFunction(materialMap, customBehaviors);

// Disable custom behaviors for now (not compatible with block-based simulation)
// const CUSTOM_TICK_FUNCTIONS = generateCustomTickFunctions(customBehaviors);
// const CUSTOM_VISUALIZATION_FUNCTIONS = generateCustomVisualizationFunctions(customBehaviors);
// const CUSTOM_TICK_CALLS = generateCustomTickCalls(customBehaviors, materialMap);
// const CUSTOM_VISUALIZATION_CALLS = generateCustomVisualizationCalls(customBehaviors, materialMap);
const CUSTOM_TICK_FUNCTIONS = '';
const CUSTOM_VISUALIZATION_FUNCTIONS = '';
const CUSTOM_TICK_CALLS = '';
const CUSTOM_VISUALIZATION_CALLS = '';

// Re-export vertex shader (unchanged)
export const vertexShader = glsl`#version 300 es
in vec4 aPosition;
in vec2 aUv;

out vec2 outUv;

void main() {
	gl_Position = aPosition;
	outUv = aUv;
}
`;

// Re-export distance field shaders (unchanged)
export { distanceFieldInitShader, distanceFieldPropagationShader } from './folk-sand.glsl';

// Re-export collision shaders (unchanged)
export { collisionVertexShader, collisionFragmentShader } from './folk-sand.glsl';

/** Simulation shader with texture-based material lookups */
export const simulationShader = glsl`#version 300 es
precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform int frame;
uniform vec4 mouse;
uniform int materialType;
uniform float brushRadius;
uniform sampler2D tex;
uniform sampler2D u_collisionTex;
uniform sampler2D u_temperatureTex;
uniform sampler2D u_ageTex;
uniform float initialSand;

in vec2 outUv;

out vec4 fragColor;

${CONSTANTS}
${MATERIAL_CONSTANTS}
${UTILS}
${MATERIAL_LOOKUP_FUNCTIONS}

// Temperature helper functions
float getTemperature(ivec2 p) {
    vec2 uv = (vec2(p) + 0.5) / resolution;
    float normalizedTemp = texture(u_temperatureTex, uv).r;
    // Denormalize: 0-1 range maps to -273°C to 727°C
    return normalizedTemp * 1000.0 - 273.15;
}

float setTemperature(float temp) {
    // Normalize: (temp + 273.15) / 1000.0
    return (temp + 273.15) / 1000.0;
}

// Age helper functions
float getAge(ivec2 p) {
    vec2 uv = (vec2(p) + 0.5) / resolution;
    return texture(u_ageTex, uv).r;
}

// Get material temperature properties (tempHigh, tempLow)
// These need to be looked up from material definitions
// For now, hardcode core materials
float getMaterialTempHigh(float materialId) {
    if (materialId == 2.0) return 100.0; // WATER → steam at 100°C
    if (materialId == 2.0) return 0.0;   // WATER → ice at 0°C
    if (materialId == 3.0) return 800.0; // LAVA → rock at 800°C
    return 9999.0; // No state change
}

float getMaterialTempLow(float materialId) {
    if (materialId == 2.0) return 0.0; // WATER → ice at 0°C
    if (materialId == 8.0) return 5.0;  // ICE → water at 5°C
    return -9999.0; // No state change
}

// Get state change material ID
float getMaterialStateHigh(float materialId) {
    if (materialId == 2.0) return 10.0; // WATER → STEAM
    return -1.0; // No state change
}

float getMaterialStateLow(float materialId) {
    if (materialId == 2.0) return 8.0; // WATER → ICE
    if (materialId == 8.0) return 2.0; // ICE → WATER
    return -1.0; // No state change
}

// Helper function: swap (must be defined before behavior physics)
void swap(inout vec4 a, inout vec4 b)
{
	vec4 tmp = a;
	a = b;
	b = tmp;
}

${BEHAVIOR_PHYSICS}
// Custom tick functions disabled for now (not compatible with block-based simulation)
// ${CUSTOM_TICK_FUNCTIONS}

// https://iquilezles.org/articles/distfunctions2d/
float sdSegment(vec2 p, vec2 a, vec2 b)
{
	vec2 pa = p-a, ba = b-a;
	float h = clamp( dot(pa,ba) / dot(ba,ba), 0.0, 1.0 );
	return length( pa - ba*h );
}

ivec2 getOffset(int frame)
{
	int i = frame % 4;
	if (i == 0)
		return ivec2(0, 0);
	else if (i == 1)
		return ivec2(1, 1);
	else if (i == 2)
		return ivec2(0, 1);
	return ivec2(1, 0);
}

vec4 getData(ivec2 p)
{
    // Check boundaries first
    if (p.x < 0 || p.y < 0 || p.x >= int(resolution.x) || p.y >= int(resolution.y)) {
        return vec4(vec3(0.02), WALL);
    }
    
    // Calculate UV coordinates for the collision texture
    vec2 collisionUv = (vec2(p) + 0.5) / resolution;
    float collisionValue = texture(u_collisionTex, collisionUv).r;
    
    // If there's a collision at this position, always return COLLISION type
    if (collisionValue > 0.5) {
        return vec4(bgColor, COLLISION);
    }
    
    // If no collision, get the data from the simulation texture
    vec4 data = texelFetch(tex, p, 0);
    if (data.xyz == vec3(0)) {
        data.xyz = bgColor;
    }
    return data;
}

${CREATE_PARTICLE_FUNCTION}

void main() {
	vec2 uv = gl_FragCoord.xy / resolution;

	if (frame == 0) {
		float r = hash12(gl_FragCoord.xy);
		float id = AIR;
		if (r < initialSand)
		{
			id = SAND;
		} 

		fragColor = createParticle(id);
		return;
	}

	if (mouse.x > 0.0)
	{
		float d = sdSegment(gl_FragCoord.xy, mouse.xy, mouse.zw);
		if (d < brushRadius)
		{
			fragColor = createParticle(float(materialType));
			return;
		}
		// Continue with normal simulation if outside brush radius
	}

	ivec2 offset = getOffset(frame);
	ivec2 fc = ivec2(gl_FragCoord.xy) + offset;
	ivec2 p = (fc / 2) * 2 - offset;
	ivec2 xy = fc % 2;
	int i = xy.x + xy.y * 2;

	vec4 t00 = getData(p);                  // top-left
	vec4 t10 = getData(p + ivec2(1, 0));    // top-right
	vec4 t01 = getData(p + ivec2(0, 1));    // bottom-left
	vec4 t11 = getData(p + ivec2(1, 1));    // bottom-right

	vec4 tn00 = getData(p + ivec2(0, -1));
	vec4 tn10 = getData(p + ivec2(1, -1));

	if (t00.a == t10.a && t01.a == t11.a && t00.a == t01.a)
	{
		fragColor = i == 0 ? t00 :
					i == 1 ? t10 :
					i == 2 ? t01 : t11;
		return;
	}

	vec4 r = hash43(vec3(vec2(p), float(frame)));

	// Apply custom behavior ticks (e.g., uranium)
	// NOTE: Custom behaviors are applied per-cell in the block
	// For now, custom behaviors are disabled until we implement per-cell tick system
	// ${CUSTOM_TICK_CALLS}

	// ============================================
	// CORE MATERIALS (0-12) - ORIGINAL BEHAVIOR
	// ============================================
	// This section contains the EXACT original physics from folk-sand.glsl.ts
	// DO NOT MODIFY - Extended materials are handled separately below

	// SMOKE and STEAM horizontal movement
	bool smoke01 = t01.a == SMOKE && t11.a < SMOKE;
	bool smoke11 = t01.a < SMOKE && t11.a == SMOKE;
	bool steam01 = t01.a == STEAM && t11.a < STEAM;
	bool steam11 = t01.a < STEAM && t11.a == STEAM;
	if ((smoke01 || smoke11 || steam01 || steam11) && r.x < 0.25)
	{
		swap(t01, t11);
	}

	if (t00.a == SMOKE || t00.a == STEAM)
	{
		if (t01.a < t00.a && r.y < 0.25)
		{
			swap(t00, t01);
		} else if (r.z < 0.003)
		{
			t00 = vec4(bgColor, AIR);
		} else if (t00.a == STEAM && r.w < 0.001) {
			t00 = createParticle(WATER);
		}
	}
	if (t10.a == SMOKE || t10.a == STEAM)
	{
		if (t11.a < t10.a && r.y < 0.25)
		{
			swap(t10, t11);
		} else if (r.z < 0.003)
		{
			t10 = vec4(bgColor, AIR);
		}
	}

	// SAND horizontal movement - EXACT ORIGINAL (for angle of repose)
	// This creates the characteristic pile shape by allowing horizontal movement when blocked
	bool sand01 = t01.a == SAND && t11.a < SAND;
	bool sand11 = t01.a < SAND && t11.a == SAND;
	// Original ID-based check: both cells above must be lighter than SAND
	if ((sand01 || sand11) && t00.a < SAND && t10.a < SAND && r.x < 0.4)
	{
		swap(t01, t11);
	}

	// STONE does NOT have horizontal movement in original - it only falls vertically
	// Removed horizontal movement section to match original behavior

	// MOSS horizontal movement - DENSITY-BASED
	// Moss spreads horizontally through air and gases
	bool moss01 = t01.a == MOSS && (t11.a == AIR || t11.a == SMOKE || t11.a == STEAM || (canSwapByDensity(MOSS, t11.a) && getMaterialState(t11.a) == 2.0));
	bool moss11 = t11.a == MOSS && (t01.a == AIR || t01.a == SMOKE || t01.a == STEAM || (canSwapByDensity(MOSS, t01.a) && getMaterialState(t01.a) == 2.0));
	// Moss can spread through air and gases (light materials)
	bool mossCanSpread = (t00.a == AIR || t00.a == SMOKE || t00.a == STEAM || (canSwapByDensity(MOSS, t00.a) && getMaterialState(t00.a) == 2.0)) && 
	                     (t10.a == AIR || t10.a == SMOKE || t10.a == STEAM || (canSwapByDensity(MOSS, t10.a) && getMaterialState(t10.a) == 2.0));
	if ((moss01 || moss11) && mossCanSpread && r.x < 0.4)
	{
		swap(t01, t11);
	}

	// Core powder physics (SAND, STONE, MOSS) - DENSITY-BASED VERTICAL, ORIGINAL HORIZONTAL
	if (t01.a == SAND || t01.a == STONE || t01.a == MOSS)
	{
		float powderDensity = getMaterialDensity(t01.a);
		float targetDensity = getMaterialDensity(t00.a);
		float targetState = getMaterialState(t00.a);
		
		// Can fall through if powder is denser and states are compatible
		if (canSwapByDensity(t01.a, t00.a) && powderDensity >= targetDensity)
		{
			// Special handling for liquids - slower fall through
			// MOSS should fall through water more easily (it's denser)
			if (targetState == 1.0) // liquid
			{
				float fallChance = (t01.a == MOSS && t00.a == WATER) ? 0.9 : 0.3;
				if (r.y < fallChance) swap(t01, t00);
			}
			// Special handling for lava - very slow fall through
			else if (t00.a == LAVA)
			{
				float fallProb = t01.a == SAND ? 0.15 : (t01.a == MOSS ? 0.2 : 0.25);
				if (r.y < fallProb) swap(t01, t00);
			}
			// Normal fall through gases and lighter solids
			else
			{
				if (r.y < 0.9) swap(t01, t00);
			}
		}
		// Horizontal/diagonal movement when blocked - EXACT ORIGINAL LOGIC for angle of repose
		// SAND: Original ID-based check for diagonal movement
		// STONE: No diagonal movement (only falls vertically)
		// MOSS: Can spread through air and gases
		else
		{
			if (t01.a == SAND)
			{
				// SAND: Original ID-based diagonal movement
				if (t11.a < SAND && t10.a < SAND && t11.a != MOSS && t10.a != MOSS)
				{
					swap(t01, t10); // Immediate diagonal movement - creates angle of repose
				}
			}
			else if (t01.a == MOSS)
			{
				// MOSS: Can move diagonally through air and gases
				bool canMoveDiag = (t10.a == AIR || t10.a == SMOKE || t10.a == STEAM || (canSwapByDensity(MOSS, t10.a) && getMaterialState(t10.a) == 2.0)) &&
				                   (t11.a == AIR || t11.a == SMOKE || t11.a == STEAM || (canSwapByDensity(MOSS, t11.a) && getMaterialState(t11.a) == 2.0));
				if (canMoveDiag)
				{
					swap(t01, t10);
				}
			}
			// STONE: No diagonal movement - only falls vertically
		}
	}

	if (t11.a == SAND || t11.a == STONE || t11.a == MOSS)
	{
		float powderDensity = getMaterialDensity(t11.a);
		float targetDensity = getMaterialDensity(t10.a);
		float targetState = getMaterialState(t10.a);
		
		// Can fall through if powder is denser and states are compatible
		if (canSwapByDensity(t11.a, t10.a) && powderDensity >= targetDensity)
		{
			// Special handling for liquids - slower fall through
			// MOSS should fall through water more easily (it's denser)
			if (targetState == 1.0) // liquid
			{
				float fallChance = (t11.a == MOSS && t10.a == WATER) ? 0.9 : 0.3;
				if (r.y < fallChance) swap(t11, t10);
			}
			// Special handling for lava - very slow fall through
			else if (t10.a == LAVA)
			{
				float fallProb = t11.a == SAND ? 0.15 : (t11.a == MOSS ? 0.2 : 0.25);
				if (r.y < fallProb) swap(t11, t10);
			}
			// Normal fall through gases and lighter solids
			else
			{
				if (r.y < 0.9) swap(t11, t10);
			}
		}
		// Horizontal/diagonal movement when blocked - EXACT ORIGINAL LOGIC for angle of repose
		// SAND: Original ID-based check for diagonal movement
		// STONE: No diagonal movement (only falls vertically)
		// MOSS: Can spread through air and gases
		else
		{
			if (t11.a == SAND)
			{
				// SAND: Original ID-based diagonal movement
				if (t01.a < SAND && t00.a < SAND && t01.a != MOSS && t00.a != MOSS)
				{
					swap(t11, t00); // Immediate diagonal movement - creates angle of repose
				}
			}
			else if (t11.a == MOSS)
			{
				// MOSS: Can move diagonally through air and gases
				bool canMoveDiag = (t00.a == AIR || t00.a == SMOKE || t00.a == STEAM || (canSwapByDensity(MOSS, t00.a) && getMaterialState(t00.a) == 2.0)) &&
				                   (t01.a == AIR || t01.a == SMOKE || t01.a == STEAM || (canSwapByDensity(MOSS, t01.a) && getMaterialState(t01.a) == 2.0));
				if (canMoveDiag)
				{
					swap(t11, t00);
				}
			}
			// STONE: No diagonal movement - only falls vertically
		}
	}

	// Core liquid physics (WATER) - DENSITY-BASED
	// Water should flow very freely - increased probabilities
	bool drop = false;
	if (t01.a == WATER)
	{
		float waterDensity = getMaterialDensity(WATER);
		float targetDensity = getMaterialDensity(t00.a);
		
		// Can fall through if water is denser and states are compatible
		if (canSwapByDensity(t01.a, t00.a) && waterDensity >= targetDensity)
		{
			float swapChance = 0.98; // Very fluid
			// If swapping with another liquid, adjust chance based on density difference
			if (getMaterialState(t00.a) == 1.0) // liquid
			{
				float densityDiff = waterDensity - targetDensity;
				swapChance = max(0.85, min(0.98, 0.85 + densityDiff / 1000.0));
			}
			if (r.y < swapChance)
			{
				swap(t01, t00);
				drop = true;
			}
		}
		// Diagonal movement when blocked
		else if (canSwapByDensity(t01.a, t10.a) && waterDensity >= getMaterialDensity(t10.a))
		{
			if (r.z < 0.5)
			{
				swap(t01, t10);
				drop = true;
			}
		}
	}
	if (t11.a == WATER)
	{
		float waterDensity = getMaterialDensity(WATER);
		float targetDensity = getMaterialDensity(t10.a);
		
		// Can fall through if water is denser and states are compatible
		if (canSwapByDensity(t11.a, t10.a) && waterDensity >= targetDensity)
		{
			float swapChance = 0.98; // Very fluid
			// If swapping with another liquid, adjust chance based on density difference
			if (getMaterialState(t10.a) == 1.0) // liquid
			{
				float densityDiff = waterDensity - targetDensity;
				swapChance = max(0.85, min(0.98, 0.85 + densityDiff / 1000.0));
			}
			if (r.y < swapChance)
			{
				swap(t11, t10);
				drop = true;
			}
		}
		// Diagonal movement when blocked
		else if (canSwapByDensity(t11.a, t00.a) && waterDensity >= getMaterialDensity(t00.a))
		{
			if (r.z < 0.5)
			{
				swap(t11, t00);
				drop = true;
			}
		}
	}
	
	// WATER horizontal movement - Only when NOT falling (restore if (!drop) check)
	// This prevents erratic horizontal movement while falling through lighter materials
	// But allows faster leveling when water is pooled/blocked
	if (!drop)
	{
		// WATER horizontal movement - DENSITY-BASED
		// Water should spread horizontally very easily when blocked to level out quickly
		float waterDensity = getMaterialDensity(WATER);
		// Water can spread horizontally to other water or lighter materials
		bool water01 = t01.a == WATER && (t11.a == WATER || (canSwapByDensity(WATER, t11.a) && waterDensity >= getMaterialDensity(t11.a)));
		bool water11 = t11.a == WATER && (t01.a == WATER || (canSwapByDensity(WATER, t01.a) && waterDensity >= getMaterialDensity(t01.a)));
		// Check if path above is clear (water can spread horizontally when not blocked above)
		bool pathClear01 = (t00.a == AIR || t00.a == WATER || (canSwapByDensity(WATER, t00.a) && waterDensity >= getMaterialDensity(t00.a))) &&
		                   (t10.a == AIR || t10.a == WATER || (canSwapByDensity(WATER, t10.a) && waterDensity >= getMaterialDensity(t10.a)));
		if ((water01 || water11) && pathClear01 && r.w < 0.95)
		{
			swap(t01, t11);
		}
		bool water00 = t00.a == WATER && (t10.a == WATER || (canSwapByDensity(WATER, t10.a) && waterDensity >= getMaterialDensity(t10.a)));
		bool water10 = t10.a == WATER && (t00.a == WATER || (canSwapByDensity(WATER, t00.a) && waterDensity >= getMaterialDensity(t00.a)));
		bool pathClear00 = (tn00.a == AIR || tn00.a == WATER || (canSwapByDensity(WATER, tn00.a) && waterDensity >= getMaterialDensity(tn00.a))) &&
		                   (tn10.a == AIR || tn10.a == WATER || (canSwapByDensity(WATER, tn10.a) && waterDensity >= getMaterialDensity(tn10.a)));
		if ((water00 || water10) && pathClear00 && r.w < 0.95)
		{
			swap(t00, t10);
		}
	}

	// Core molten physics (LAVA) - DENSITY-BASED
	if (t01.a == LAVA)
	{
		float lavaDensity = getMaterialDensity(LAVA);
		float targetDensity = getMaterialDensity(t00.a);
		
		// Can fall through if lava is denser and states are compatible
		if (canSwapByDensity(t01.a, t00.a) && lavaDensity >= targetDensity)
		{
			if (r.y < 0.8) swap(t01, t00);
		}
		// Diagonal movement when blocked
		else if (canSwapByDensity(t01.a, t10.a) && lavaDensity >= getMaterialDensity(t10.a))
		{
			if (r.z < 0.2) swap(t01, t10);
		}
	}
	if (t11.a == LAVA)
	{
		float lavaDensity = getMaterialDensity(LAVA);
		float targetDensity = getMaterialDensity(t10.a);
		
		// Can fall through if lava is denser and states are compatible
		if (canSwapByDensity(t11.a, t10.a) && lavaDensity >= targetDensity)
		{
			if (r.y < 0.8) swap(t11, t10);
		}
		// Diagonal movement when blocked
		else if (canSwapByDensity(t11.a, t00.a) && lavaDensity >= getMaterialDensity(t00.a))
		{
			if (r.z < 0.2) swap(t11, t00);
		}
	}

	// LAVA + WATER reaction
	if (t00.a == LAVA)
	{
		if (t01.a == WATER)
		{
			t00 = createParticle(STONE);
			t01 = createParticle(SMOKE);
		} else if (t10.a == WATER)
		{
			t00 = createParticle(STONE);
			t10 = createParticle(SMOKE);
		} else if (t01.a == PLANT && r.x < 0.03)
		{
			t01 = createParticle(FIRE);
		} else if (t10.a == PLANT && r.x < 0.03)
		{
			t10 = createParticle(FIRE);
		}
	}

	if (t10.a == LAVA)
	{
		if (t11.a == WATER)
		{
			t10 = createParticle(STONE);
			t11 = createParticle(SMOKE);
		} else if (t00.a == WATER)
		{
			t10 = createParticle(STONE);
			t00 = createParticle(SMOKE);
		} else if (t11.a == PLANT && r.x < 0.03)
		{
			t11 = createParticle(FIRE);
		} else if (t00.a == PLANT && r.x < 0.03)
		{
			t00 = createParticle(FIRE);
		}
	}

	if (t01.a == LAVA)
	{
		if (t00.a == PLANT && r.x < 0.3)
		{
			t00 = createParticle(FIRE);
		} else if (t11.a == PLANT && r.x < 0.3)
		{
			t11 = createParticle(FIRE);
		}
	}

	if (t11.a == LAVA)
	{
		if (t10.a == PLANT && r.x < 0.3)
		{
			t10 = createParticle(FIRE);
		} else if (t01.a == PLANT && r.x < 0.3)
		{
			t01 = createParticle(FIRE);
		}
	}

	// LAVA horizontal movement - EXACT ORIGINAL
	bool lava01 = t01.a == LAVA && t11.a < LAVA;
	bool lava11 = t01.a < LAVA && t11.a == LAVA;
	if ((lava01 || lava11) && r.x < 0.6)
	{
		swap(t01, t11);
	}

	// Fire spreads to plants
	if (t00.a == FIRE && t01.a == PLANT && r.x < 0.3)
	{
		t01 = createParticle(FIRE);
		t01.b = 1.0;
	}
	if (t00.a == FIRE && t10.a == PLANT && r.y < 0.3)
	{
		t10 = createParticle(FIRE);
		t10.b = 1.0;
	}
	if (t00.a == FIRE && t11.a == PLANT && r.z < 0.3)
	{
		t11 = createParticle(FIRE);
		t11.b = 1.0;
	}
	
	// Fire loses heat and converts to smoke
	if (t00.a == FIRE)
	{
		t00.b = max(t00.b - 0.01, 0.0);
		if (t00.b < 0.1 && r.z < 0.1)
		{
			t00 = createParticle(SMOKE);
		}
		if (t01.a == AIR && r.w < t00.b * 0.2)
		{
			t01 = createParticle(SMOKE);
		}
		// Fire melts ice
		if (t01.a == ICE && r.x < 0.1)
		{
			t01 = createParticle(WATER);
		}
		if (t10.a == ICE && r.y < 0.1)
		{
			t10 = createParticle(WATER);
		}
		if (t11.a == ICE && r.z < 0.1)
		{
			t11 = createParticle(WATER);
		}
	}

	// ICE physics - EXACT ORIGINAL
	if (t01.a == ICE)
	{
		bool nearHeat = (t00.a == LAVA || t00.a == FIRE || t10.a == LAVA || t10.a == FIRE || t11.a == LAVA || t11.a == FIRE);
		if (nearHeat && r.x < 0.05)
		{
			t01 = createParticle(WATER);
		}
		else if (t00.a < SAND && t00.a != WATER && t00.a != LAVA && t00.a != MOSS && r.y < 0.9)
		{
			swap(t01, t00);
		}
	}
	if (t11.a == ICE)
	{
		bool nearHeat = (t00.a == LAVA || t00.a == FIRE || t01.a == LAVA || t01.a == FIRE || t10.a == LAVA || t10.a == FIRE);
		if (nearHeat && r.x < 0.05)
		{
			t11 = createParticle(WATER);
		}
		else if (t10.a < SAND && t10.a != WATER && t10.a != LAVA && t10.a != MOSS && r.y < 0.9)
		{
			swap(t11, t10);
		}
	}

	// LAVA melts ice
	if (t00.a == LAVA)
	{
		if (t01.a == ICE)
		{
			t01 = createParticle(WATER);
		}
		if (t10.a == ICE)
		{
			t10 = createParticle(WATER);
		}
	}
	if (t10.a == LAVA)
	{
		if (t11.a == ICE)
		{
			t11 = createParticle(WATER);
		}
		if (t00.a == ICE)
		{
			t00 = createParticle(WATER);
		}
	}

	// ============================================
	// MATERIAL REACTIONS (Core + Extended)
	// ============================================
	
	// Helper function to check reactions for all positions
	// DIRT + WATER → MUD (dirt becomes mud when wet)
	// Dirt ID = 87, Mud ID = 88
	// Check all adjacent positions (including diagonal) for faster reactions
	if (t00.a == 87.0) // DIRT
	{
		if (t01.a == WATER || t10.a == WATER || t11.a == WATER)
		{
			// Higher chance when water is directly adjacent
			float chance = (t01.a == WATER || t10.a == WATER) ? 0.3 : 0.15;
			if (r.x < chance)
			{
				t00 = createParticle(88.0); // MUD
			}
		}
	}
	if (t10.a == 87.0) // DIRT
	{
		if (t00.a == WATER || t11.a == WATER || t01.a == WATER)
		{
			float chance = (t00.a == WATER || t11.a == WATER) ? 0.3 : 0.15;
			if (r.y < chance)
			{
				t10 = createParticle(88.0); // MUD
			}
		}
	}
	if (t01.a == 87.0) // DIRT
	{
		if (t00.a == WATER || t11.a == WATER || t10.a == WATER)
		{
			float chance = (t00.a == WATER || t11.a == WATER) ? 0.3 : 0.15;
			if (r.z < chance)
			{
				t01 = createParticle(88.0); // MUD
			}
		}
	}
	if (t11.a == 87.0) // DIRT
	{
		if (t01.a == WATER || t10.a == WATER || t00.a == WATER)
		{
			float chance = (t01.a == WATER || t10.a == WATER) ? 0.3 : 0.15;
			if (r.w < chance)
			{
				t11 = createParticle(88.0); // MUD
			}
		}
	}
	
	// MUD + WATER → MOSS (mud becomes fertile ground for moss growth)
	// Mud ID = 88, MOSS ID = 11
	// Check all adjacent positions (including diagonal) - higher chance for faster growth
	if (t00.a == 88.0) // MUD
	{
		if (t01.a == WATER || t10.a == WATER || t11.a == WATER)
		{
			// Higher chance when water is directly adjacent
			float chance = (t01.a == WATER || t10.a == WATER) ? 0.2 : 0.1;
			if (r.x < chance)
			{
				t00 = createParticle(MOSS);
			}
		}
	}
	if (t10.a == 88.0) // MUD
	{
		if (t00.a == WATER || t11.a == WATER || t01.a == WATER)
		{
			float chance = (t00.a == WATER || t11.a == WATER) ? 0.2 : 0.1;
			if (r.y < chance)
			{
				t10 = createParticle(MOSS);
			}
		}
	}
	if (t01.a == 88.0) // MUD
	{
		if (t00.a == WATER || t11.a == WATER || t10.a == WATER)
		{
			float chance = (t00.a == WATER || t11.a == WATER) ? 0.2 : 0.1;
			if (r.z < chance)
			{
				t01 = createParticle(MOSS);
			}
		}
	}
	if (t11.a == 88.0) // MUD
	{
		if (t01.a == WATER || t10.a == WATER || t00.a == WATER)
		{
			float chance = (t01.a == WATER || t10.a == WATER) ? 0.2 : 0.1;
			if (r.w < chance)
			{
				t11 = createParticle(MOSS);
			}
		}
	}
	
	// SALT + ICE → WATER (salt lowers freezing point, melts ice)
	// Salt ID = 110
	if (t00.a == 110.0) // SALT
	{
		if (t01.a == ICE)
		{
			t01 = createParticle(WATER); // Instant - salt melts ice
		}
		else if (t10.a == ICE)
		{
			t10 = createParticle(WATER);
		}
	}
	if (t10.a == 110.0) // SALT
	{
		if (t11.a == ICE)
		{
			t11 = createParticle(WATER);
		}
		else if (t00.a == ICE)
		{
			t00 = createParticle(WATER);
		}
	}
	if (t01.a == 110.0) // SALT
	{
		if (t00.a == ICE)
		{
			t00 = createParticle(WATER);
		}
		else if (t11.a == ICE)
		{
			t11 = createParticle(WATER);
		}
	}
	if (t11.a == 110.0) // SALT
	{
		if (t10.a == ICE)
		{
			t10 = createParticle(WATER);
		}
		else if (t01.a == ICE)
		{
			t01 = createParticle(WATER);
		}
	}
	
	// SNOW + WATER → WATER (snow melts in water)
	// Snow ID = 100
	if (t00.a == 100.0) // SNOW
	{
		if (t01.a == WATER)
		{
			t00 = createParticle(WATER); // Instant - snow melts
		}
		else if (t10.a == WATER)
		{
			t00 = createParticle(WATER);
		}
	}
	if (t10.a == 100.0) // SNOW
	{
		if (t11.a == WATER)
		{
			t10 = createParticle(WATER);
		}
		else if (t00.a == WATER)
		{
			t10 = createParticle(WATER);
		}
	}
	if (t01.a == 100.0) // SNOW
	{
		if (t00.a == WATER)
		{
			t01 = createParticle(WATER);
		}
		else if (t11.a == WATER)
		{
			t01 = createParticle(WATER);
		}
	}
	if (t11.a == 100.0) // SNOW
	{
		if (t10.a == WATER)
		{
			t11 = createParticle(WATER);
		}
		else if (t01.a == WATER)
		{
			t11 = createParticle(WATER);
		}
	}
	
	// FIRE + WOOD → CHARCOAL + SMOKE (wood burns)
	// Wood ID = 102, Charcoal ID = 150
	if (t00.a == FIRE)
	{
		if (t01.a == 102.0 && r.x < 0.15) // 15% chance - wood burns
		{
			t01 = createParticle(150.0); // CHARCOAL
			// Create smoke in adjacent air
			if (t11.a == AIR && r.y < 0.3)
			{
				t11 = createParticle(SMOKE);
			}
		}
		else if (t10.a == 102.0 && r.y < 0.15)
		{
			t10 = createParticle(150.0); // CHARCOAL
			if (t11.a == AIR && r.z < 0.3)
			{
				t11 = createParticle(SMOKE);
			}
		}
	}
	if (t10.a == FIRE)
	{
		if (t11.a == 102.0 && r.x < 0.15)
		{
			t11 = createParticle(150.0); // CHARCOAL
			if (t01.a == AIR && r.y < 0.3)
			{
				t01 = createParticle(SMOKE);
			}
		}
		else if (t00.a == 102.0 && r.y < 0.15)
		{
			t00 = createParticle(150.0); // CHARCOAL
			if (t01.a == AIR && r.z < 0.3)
			{
				t01 = createParticle(SMOKE);
			}
		}
	}
	if (t01.a == FIRE)
	{
		if (t00.a == 102.0 && r.x < 0.15)
		{
			t00 = createParticle(150.0); // CHARCOAL
			if (t10.a == AIR && r.y < 0.3)
			{
				t10 = createParticle(SMOKE);
			}
		}
		else if (t11.a == 102.0 && r.z < 0.15)
		{
			t11 = createParticle(150.0); // CHARCOAL
			if (t10.a == AIR && r.w < 0.3)
			{
				t10 = createParticle(SMOKE);
			}
		}
	}
	if (t11.a == FIRE)
	{
		if (t10.a == 102.0 && r.x < 0.15)
		{
			t10 = createParticle(150.0); // CHARCOAL
			if (t00.a == AIR && r.y < 0.3)
			{
				t00 = createParticle(SMOKE);
			}
		}
		else if (t01.a == 102.0 && r.z < 0.15)
		{
			t01 = createParticle(150.0); // CHARCOAL
			if (t00.a == AIR && r.w < 0.3)
			{
				t00 = createParticle(SMOKE);
			}
		}
	}

	// ============================================
	// EXTENDED MATERIALS (>12) - BEHAVIOR-BASED PHYSICS
	// ============================================
	// Process extended materials (powders and liquids only - gases disabled for now)
	// Extended materials can interact with core materials (like AIR) via density-based swapping
	// NOTE: Gases are disabled - we're focusing on getting powders and liquids working perfectly
	bool hasExtended = t00.a > 12.0 || t01.a > 12.0 || t10.a > 12.0 || t11.a > 12.0;
	if (hasExtended) {
		// Apply powder and liquid physics for extended materials
		// Gases disabled: applyGasPhysics(t00, t01, t10, t11, r);
		applyPowderPhysics(t00, t01, t10, t11, r);
		applyLiquidPhysics(t00, t01, t10, t11, r);
	}

	fragColor = i == 0 ? t00 :
    i == 1 ? t10 :
    i == 2 ? t01 : t11;

	if (fragColor.a == COLLISION) {
		vec2 collisionUv = gl_FragCoord.xy / resolution;
		float collisionValue = texture(u_collisionTex, collisionUv).r;
		if (collisionValue <= 0.5) {
			fragColor = vec4(bgColor, AIR);
		}
	}
	
}
`;

/** Temperature and Age update shader - runs after main simulation */
export const stateUpdateShader = glsl`#version 300 es
precision mediump float;

uniform vec2 resolution;
uniform int frame;
uniform sampler2D u_simulationTex;
uniform sampler2D u_temperatureTex;
uniform sampler2D u_ageTex;

in vec2 outUv;

out vec4 fragColor;

ivec2 getOffset(int frame)
{
	int i = frame % 4;
	if (i == 0)
		return ivec2(0, 0);
	else if (i == 1)
		return ivec2(1, 1);
	else if (i == 2)
		return ivec2(0, 1);
	return ivec2(1, 0);
}

vec4 getData(sampler2D tex, ivec2 p) {
    if (p.x < 0 || p.y < 0 || p.x >= int(resolution.x) || p.y >= int(resolution.y)) {
        return vec4(0.0);
    }
    vec2 uv = (vec2(p) + 0.5) / resolution;
    return texture(tex, uv);
}

float getTemperature(ivec2 p) {
    vec4 data = getData(u_temperatureTex, p);
    float normalizedTemp = data.r;
    return normalizedTemp * 1000.0 - 273.15; // Denormalize
}

float setTemperature(float temp) {
    return (temp + 273.15) / 1000.0; // Normalize
}

void main() {
	ivec2 offset = getOffset(frame);
	ivec2 fc = ivec2(gl_FragCoord.xy) + offset;
	ivec2 p = (fc / 2) * 2 - offset;
	ivec2 xy = fc % 2;
	int i = xy.x + xy.y * 2;

	// Get current material
	vec4 simData = getData(u_simulationTex, p + ivec2(xy.x, xy.y));
	float materialId = simData.a;

	// Get current temperature and age
	vec4 tempData = getData(u_temperatureTex, p + ivec2(xy.x, xy.y));
	vec4 ageData = getData(u_ageTex, p + ivec2(xy.x, xy.y));
	
	float currentTemp = getTemperature(p + ivec2(xy.x, xy.y));
	float currentAge = ageData.r;

	// Get neighbor temperatures for heat transfer
	float tempN = getTemperature(p + ivec2(xy.x, xy.y - 1));
	float tempS = getTemperature(p + ivec2(xy.x, xy.y + 1));
	float tempE = getTemperature(p + ivec2(xy.x + 1, xy.y));
	float tempW = getTemperature(p + ivec2(xy.x - 1, xy.y));
	
	// Simple heat transfer: average with neighbors
	float avgTemp = (currentTemp + tempN + tempS + tempE + tempW) / 5.0;
	float tempTransferRate = 0.1; // 10% transfer per frame
	float newTemp = mix(currentTemp, avgTemp, tempTransferRate);
	
	// Heat sources: LAVA and FIRE generate heat
	if (materialId == 3.0) { // LAVA
		newTemp = max(newTemp, 1200.0); // LAVA is hot
	} else if (materialId == 9.0) { // FIRE
		newTemp = max(newTemp, 500.0); // FIRE is hot
	} else if (materialId == 1.0) { // SMOKE
		newTemp = max(newTemp, 114.0); // SMOKE is hot
	} else if (materialId == 10.0) { // STEAM
		newTemp = max(newTemp, 100.0); // STEAM is hot
	}

	// Increment age
	float newAge = currentAge + 1.0;

	// Output updated temperature (R channel) and age (R channel)
	if (i == 0 || i == 1 || i == 2 || i == 3) {
		// This shader outputs to temperature texture
		fragColor = vec4(setTemperature(newTemp), 0.0, 0.0, 1.0);
	}
}
`;

/** Age update shader - runs after temperature update */
export const ageUpdateShader = glsl`#version 300 es
precision mediump float;

uniform vec2 resolution;
uniform int frame;
uniform sampler2D u_simulationTex;
uniform sampler2D u_ageTex;

in vec2 outUv;

out vec4 fragColor;

ivec2 getOffset(int frame)
{
	int i = frame % 4;
	if (i == 0)
		return ivec2(0, 0);
	else if (i == 1)
		return ivec2(1, 1);
	else if (i == 2)
		return ivec2(0, 1);
	return ivec2(1, 0);
}

vec4 getData(sampler2D tex, ivec2 p) {
    if (p.x < 0 || p.y < 0 || p.x >= int(resolution.x) || p.y >= int(resolution.y)) {
        return vec4(0.0);
    }
    vec2 uv = (vec2(p) + 0.5) / resolution;
    return texture(tex, uv);
}

void main() {
	ivec2 offset = getOffset(frame);
	ivec2 fc = ivec2(gl_FragCoord.xy) + offset;
	ivec2 p = (fc / 2) * 2 - offset;
	ivec2 xy = fc % 2;

	// Get current age
	vec4 ageData = getData(u_ageTex, p + ivec2(xy.x, xy.y));
	float currentAge = ageData.r;

	// Increment age
	float newAge = currentAge + 1.0;

	// Output updated age
	fragColor = vec4(newAge, ageData.g, ageData.b, ageData.a);
}
`;

/** Visualization shader with texture-based color lookups */
export const visualizationShader = glsl`#version 300 es
precision highp float;

uniform vec2 texResolution;
uniform float texScale;
uniform vec2 resolution;
uniform sampler2D tex;
uniform sampler2D shadowTexR;
uniform sampler2D shadowTexG;
uniform sampler2D shadowTexB;
uniform sampler2D u_collisionTex;
uniform float scale;

${CONSTANTS}
${MATERIAL_CONSTANTS}
${UTILS}
${MATERIAL_LOOKUP_FUNCTIONS}
${CUSTOM_VISUALIZATION_FUNCTIONS}

out vec4 fragColor;

vec2 getCoordsAA(vec2 uv)
{
	float w = 1.5;
	vec2 fl = floor(uv + 0.5);
	vec2 fr = fract(uv + 0.5);
	vec2 aa = fwidth(uv) * w * 0.5;
	fr = smoothstep(0.5 - aa, 0.5 + aa, fr);

	return fl + fr - 0.5;
}

${VISUALIZATION_FUNCTION}

void main() {
	vec2 uv = gl_FragCoord.xy / (texResolution * texScale);

	uv -= 0.5;
	uv *= scale;
	uv += 0.5;

	vec2 fc = uv * texResolution;

	vec4 data = texture(tex, getCoordsAA(fc) / texResolution);
	vec4 dataUp = texture(tex, getCoordsAA(fc + vec2(0, 1)) / texResolution);
	vec4 dataDown = texture(tex, getCoordsAA(fc - vec2(0, 1)) / texResolution);

	// Expand single channel into RGB for each sample
	data.gb = data.rr;
	dataUp.gb = dataUp.rr;
	dataDown.gb = dataDown.rr;

	float hig = float(data.a > dataUp.a);
	float dropSha = 1.0 - float(data.a > dataDown.a);

	vec3 color = getParticleColor(data);

	vec4 shaDataR = texture(shadowTexR, uv);
	vec4 shaDataG = texture(shadowTexG, uv);
	vec4 shaDataB = texture(shadowTexB, uv);
	
	float shaR = shaDataR.xy != vec2(-1) ? shaDataR.z : 16.0;
	float shaG = shaDataG.xy != vec2(-1) ? shaDataG.z : 16.0;
	float shaB = shaDataB.xy != vec2(-1) ? shaDataB.z : 16.0;

	// DISABLED: All shading and lighting effects removed for full brightness
	// vec3 sha = clamp(1.0 - vec3(shaR, shaG, shaB) / 16.0, vec3(0.0), vec3(1.0));
	// sha *= sha;

	// Add extra lava glow contribution (but keep it at full brightness)
	if (data.a == LAVA) {
		// Keep lava color but at full brightness
		vec3 emission = vec3(0.6, 0.05, 0.0);
		color += emission;
	}

	// DISABLED: All height-based and shadow-based darkening
	// color *= 0.5 * max(hig, dropSha) + 0.5;
	// color *= sha * 1.0 + 0.2;
	// color += color * 0.4 * hig;

	if (data.a == FIRE) {
		float glowIntensity = data.b * data.b;
		vec3 glowColor = vec3(1.0, 0.3, 0.1) * glowIntensity;
		color += glowColor;
	}
	
	// Ensure full brightness - clamp to prevent any darkening
	color = clamp(color, vec3(0.0), vec3(1.0));

	fragColor = vec4(linearTosRGB(color), 1.0);
}
`;

