import { glsl } from '@folkjs/dom/tags';

/** ABSOLUTE MINIMAL VERSION - Just AIR, SAND, WATER to get click-to-emit working */

const CONSTANTS = glsl`
#define AIR 0.0
#define SAND 4.0
#define WATER 2.0
#define WALL 7.0
#define COLLISION 99.0

const vec3 bgColor = pow(vec3(31, 34, 36) / 255.0, vec3(2));
`;

const UTILS = glsl`
float hash12(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * .1031);
	p3 += dot(p3, p3.yzx + 33.33);
	return fract((p3.x + p3.y) * p3.z);
}

float hash13(vec3 p3) {
	p3 = fract(p3 * .1031);
	p3 += dot(p3, p3.zyx + 31.32);
	return fract((p3.x + p3.y) * p3.z);
}

vec4 hash43(vec3 p) {
	vec4 p4 = fract(vec4(p.xyzx) * vec4(.1031, .1030, .0973, .1099));
	p4 += dot(p4, p4.wzxy+33.33);
	return fract((p4.xxyz+p4.yzzw)*p4.zywx);
}
`;

// UTILS for visualization (includes linearTosRGB which is needed by visualizationShader)
const VIS_UTILS = glsl`
float hash12(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * .1031);
	p3 += dot(p3, p3.yzx + 33.33);
	return fract((p3.x + p3.y) * p3.z);
}

float hash13(vec3 p3) {
	p3 = fract(p3 * .1031);
	p3 += dot(p3, p3.zyx + 31.32);
	return fract((p3.x + p3.y) * p3.z);
}

vec3 linearTosRGB(vec3 col) {
	return mix(1.055 * pow(col, vec3(1.0 / 2.4)) - 0.055, col * 12.92, lessThan(col, vec3(0.0031308)));
}
`;

export const vertexShader = glsl`#version 300 es
in vec4 aPosition;
in vec2 aUv;
out vec2 outUv;
void main() {
	gl_Position = aPosition;
	outUv = aUv;
}
`;

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
uniform float initialSand;

in vec2 outUv;
out vec4 fragColor;

${CONSTANTS}
${UTILS}

float sdSegment(vec2 p, vec2 a, vec2 b) {
	vec2 pa = p-a, ba = b-a;
	float h = clamp(dot(pa,ba) / dot(ba,ba), 0.0, 1.0);
	return length(pa - ba*h);
}

ivec2 getOffset(int frame) {
	int i = frame % 4;
	if (i == 0) return ivec2(0, 0);
	if (i == 1) return ivec2(1, 1);
	if (i == 2) return ivec2(0, 1);
	return ivec2(1, 0);
}

vec4 getData(ivec2 p) {
	if (p.x < 0 || p.y < 0 || p.x >= int(resolution.x) || p.y >= int(resolution.y)) {
		return vec4(vec3(0.02), WALL);
	}
	vec2 collisionUv = (vec2(p) + 0.5) / resolution;
	float collisionValue = texture(u_collisionTex, collisionUv).r;
	if (collisionValue > 0.5) {
		return vec4(bgColor, COLLISION);
	}
	vec4 data = texelFetch(tex, p, 0);
	if (data.xyz == vec3(0)) {
		data.xyz = bgColor;
	}
	return data;
}

void swap(inout vec4 a, inout vec4 b) {
	vec4 tmp = a;
	a = b;
	b = tmp;
}

vec4 createParticle(float id) {
	float rand = hash13(vec3(gl_FragCoord.xy, float(frame)));
	if (id == AIR) {
		return vec4(0.0, 0.0, 0.0, AIR);
	}
	return vec4(rand, 0.0, 0.0, id);
}

void main() {
	if (frame == 0) {
		float r = hash12(gl_FragCoord.xy);
		fragColor = createParticle(r < initialSand ? SAND : AIR);
		return;
	}

	// MOUSE INPUT - CRITICAL FOR CLICK-TO-EMIT
	if (mouse.x > 0.0) {
		float d = sdSegment(gl_FragCoord.xy, mouse.xy, mouse.zw);
		if (d < brushRadius) {
			fragColor = createParticle(float(materialType));
			return;
		}
	}

	ivec2 offset = getOffset(frame);
	ivec2 fc = ivec2(gl_FragCoord.xy) + offset;
	ivec2 p = (fc / 2) * 2 - offset;
	ivec2 xy = fc % 2;
	int i = xy.x + xy.y * 2;

	vec4 t00 = getData(p);
	vec4 t10 = getData(p + ivec2(1, 0));
	vec4 t01 = getData(p + ivec2(0, 1));
	vec4 t11 = getData(p + ivec2(1, 1));

	if (t00.a == t10.a && t01.a == t11.a && t00.a == t01.a) {
		fragColor = i == 0 ? t00 : (i == 1 ? t10 : (i == 2 ? t01 : t11));
		return;
	}

	vec4 r = hash43(vec3(vec2(p), float(frame)));

	// SAND - simple fall
	if (t01.a == SAND && t00.a < SAND && r.y < 0.9) swap(t01, t00);
	if (t11.a == SAND && t10.a < SAND && r.y < 0.9) swap(t11, t10);
	if (t01.a == SAND && t11.a < SAND && t00.a < SAND && t10.a < SAND && r.x < 0.4) swap(t01, t11);
	if (t01.a < SAND && t11.a == SAND && t00.a < SAND && t10.a < SAND && r.x < 0.4) swap(t01, t11);

	// WATER - simple flow
	if (t01.a == WATER && t00.a < WATER && r.y < 0.95) swap(t01, t00);
	if (t11.a == WATER && t10.a < WATER && r.y < 0.95) swap(t11, t10);
	if (t01.a == WATER && t11.a < WATER && r.x < 0.8) swap(t01, t11);
	if (t01.a < WATER && t11.a == WATER && r.x < 0.8) swap(t01, t11);

	fragColor = i == 0 ? t00 : (i == 1 ? t10 : (i == 2 ? t01 : t11));

	if (fragColor.a == COLLISION) {
		vec2 collisionUv = gl_FragCoord.xy / resolution;
		float collisionValue = texture(u_collisionTex, collisionUv).r;
		if (collisionValue <= 0.5) {
			fragColor = vec4(bgColor, AIR);
		}
	}
}
`;

// Minimal visualization shader - only handles AIR, SAND, WATER
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
${VIS_UTILS}

out vec4 fragColor;

vec2 getCoordsAA(vec2 uv) {
	float w = 1.5;
	vec2 fl = floor(uv + 0.5);
	vec2 fr = fract(uv + 0.5);
	vec2 aa = fwidth(uv) * w * 0.5;
	fr = smoothstep(0.5 - aa, 0.5 + aa, fr);
	return fl + fr - 0.5;
}

vec3 getParticleColor(vec4 data) {
	float rand = data.r;
	if (data.a == AIR) {
		return bgColor;
	} else if (data.a == WATER) {
		vec3 waterColor = vec3(0.2, 0.4, 0.8);
		return mix(bgColor, waterColor, 0.6 + rand * 0.2);
	} else if (data.a == SAND) {
		vec3 baseColor = vec3(0.86, 0.62, 0.27);
		vec3 altColor = vec3(0.82, 0.58, 0.23);
		return mix(baseColor, altColor, rand) * (0.8 + rand * 0.3);
	}
	return bgColor;
}

void main() {
	vec2 uv = gl_FragCoord.xy / (texResolution * texScale);
	uv -= 0.5;
	uv *= scale;
	uv += 0.5;
	vec2 fc = uv * texResolution;
	vec4 data = texture(tex, getCoordsAA(fc) / texResolution);
	data.gb = data.rr;
	vec4 dataUp = texture(tex, getCoordsAA(fc + vec2(0, 1)) / texResolution);
	dataUp.gb = dataUp.rr;
	vec4 dataDown = texture(tex, getCoordsAA(fc - vec2(0, 1)) / texResolution);
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
	vec3 sha = clamp(1.0 - vec3(shaR, shaG, shaB) / 16.0, vec3(0.0), vec3(1.0));
	sha *= sha;
	color *= 0.5 * max(hig, dropSha) + 0.5;
	color *= sha * 1.0 + 0.2;
	color += color * 0.4 * hig;
	fragColor = vec4(linearTosRGB(color), 1.0);
}
`;

// Re-export other shaders from original file
export { 
  distanceFieldInitShader, 
  distanceFieldPropagationShader, 
  collisionVertexShader, 
  collisionFragmentShader 
} from './folk-sand.glsl';

