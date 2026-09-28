import { GroundDetailFunctions } from './groundDetailShader';

export const GroundVertexDeclarations = `
varying vec3 vGroundPosition;
varying vec3 vGroundNormal;
`;

export const GroundVertexPlacing = `
vGroundPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
vGroundNormal = normalize(mat3(modelMatrix) * objectNormal);
`;

export const GroundFragmentDeclarations = `
uniform sampler2D grassTile;
uniform sampler2D earthTile;
uniform sampler2D shingleTile;
uniform sampler2D bedTile;
uniform sampler2D groundNoise;
uniform vec3 lushGrass;
uniform vec3 dryGrass;
uniform vec3 underwaterTint;
uniform float shingleShare;
uniform float wetDarkening;
uniform float groundLift;
varying vec3 vGroundPosition;
varying vec3 vGroundNormal;

const float GrassMetres = 1.4;
const float GrassFarMetres = 4.3;
const float EarthMetres = 2.1;
const float ShingleMetres = 1.1;
const float BedMetres = 2.6;
const float BroadMetres = 190.0;
const float FineMetres = 17.0;
const float TussockMetres = 4.1;
const vec3 Absorption = vec3(1.1, 0.42, 0.55);
const mat2 Turned = mat2(0.8, 0.6, -0.6, 0.8);

const float GrassRelief = 0.004;
const float StoneRelief = 0.012;
const vec3 Luminance = vec3(0.3, 0.59, 0.11);
const vec3 SiltFilm = vec3(0.7, 0.68, 0.54);
const float CausticLight = 0.9;

struct GroundSurface {
	vec3 albedo;
	float roughness;
	float relief;
};
${GroundDetailFunctions}
vec3 grassColour(vec2 ground, vec4 broad, vec4 fine, float height) {
	vec3 near = tileAt(grassTile, ground, GrassMetres);
	vec3 far = tileAt(grassTile, Turned * ground, GrassFarMetres);
	vec3 blades = mix(near, far, 0.3 + 0.3 * fine.r);
	float tussock = texture2D(groundNoise, ground / TussockMetres).g * texture2D(groundNoise, Turned * ground / (TussockMetres * 1.63)).a;
	blades *= mix(0.78, 1.18, smoothstep(0.1, 0.5, tussock));
	float dryness = clamp(smoothstep(0.35, 0.85, broad.r) + smoothstep(2.0, 6.0, height) * 0.5, 0.0, 1.0);
	return blades * mix(lushGrass, dryGrass, dryness) * (0.8 + 0.4 * fine.g);
}

GroundSurface groundSurface() {
	vec2 ground = vGroundPosition.xz;
	float height = vGroundPosition.y + groundLift;
	vec4 broad = texture2D(groundNoise, ground / BroadMetres);
	vec4 fine = texture2D(groundNoise, ground / FineMetres);
	float steepness = 1.0 - normalize(vGroundNormal).y;
	vec3 earth = facingTile(earthTile, vGroundPosition, normalize(vGroundNormal), EarthMetres) * (0.62 + 0.26 * fine.a);
	float face = smoothstep(0.02, 0.08, height) * (1.0 - smoothstep(0.3, 0.4, height + (fine.g - 0.5) * 0.14)) * smoothstep(0.2, 0.5, fine.r);
	float bare = max(smoothstep(0.17, 0.33, steepness + (fine.a - 0.5) * 0.24), face);
	float margin = 1.0 - smoothstep(0.03, 0.1 + 0.12 * fine.r, height);
	float under = 1.0 - smoothstep(-0.12, -0.02, height);
	float wet = 1.0 - smoothstep(0.01, 0.07 + 0.06 * fine.g, height);
	float worn = wearAt(ground, fine.b) * (1.0 - margin) * 0.8;
	vec3 grass = mix(grassColour(ground, broad, fine, height), earth * 1.05, worn * smoothstep(0.25, 0.6, fine.r + worn * 0.5));
	vec3 colour = mix(grass, earth, bare);
	colour = mix(colour, marginColour(ground, fine, earth), margin);
	colour = mix(colour, tileAt(bedTile, ground, BedMetres) * SiltFilm, under);
	float relief = dot(colour, Luminance) * mix(GrassRelief, StoneRelief, max(max(bare, margin), under));
	colour *= mix(1.0, wetDarkening, wet * (1.0 - under));
	float roughness = mix(mix(0.95, 0.88, bare), 0.32, wet * (1.0 - under));
	colour *= 1.0 + causticsAt(ground, height) * CausticLight;
	return GroundSurface(seenThroughWater(colour, height), roughness, relief);
}
`;

export const GroundAlbedo = `
GroundSurface ground = groundSurface();
diffuseColor.rgb *= ground.albedo;
`;

export const GroundRoughness = `
float roughnessFactor = ground.roughness;
`;
