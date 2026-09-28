import { GroundDetailFunctions } from './groundDetailShader';
import { GroundSurfaceFunctions } from './groundSurfaceShader';

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
uniform sampler2D causticTile;
uniform sampler2D shoreMap;
uniform vec2 shoreOrigin;
uniform vec2 shoreSize;
uniform vec3 lushGrass;
uniform vec3 dryGrass;
uniform vec3 underwaterTint;
uniform float shingleShare;
uniform float wetDarkening;
uniform float groundLift;
uniform float groundTime;
varying vec3 vGroundPosition;
varying vec3 vGroundNormal;

const float GrassMetres = 1.4;
const float GrassFarMetres = 4.3;
const float EarthMetres = 2.1;
const float ShingleMetres = 1.1;
const float BedMetres = 2.6;
const float BroadMetres = 190.0;
const float MeadowMetres = 43.0;
const float FineMetres = 17.0;
const float TussockMetres = 4.1;
const float ClumpMetres = 1.9;
const float WeedMetres = 9.0;
const float CausticMetres = 2.3;
const float CausticDrift = 0.03;
const vec3 Absorption = vec3(1.1, 0.42, 0.55);
const mat2 Turned = mat2(0.8, 0.6, -0.6, 0.8);
const float GrassRelief = 0.004;
const float StoneRelief = 0.012;
const vec3 Luminance = vec3(0.3, 0.59, 0.11);
const vec3 SiltFilm = vec3(0.6, 0.6, 0.46);
const vec3 SiltColour = vec3(0.075, 0.07, 0.04);
const vec3 WeedColour = vec3(0.03, 0.05, 0.014);
const vec3 FlattenedGrass = vec3(0.96, 0.9, 0.66);
const vec3 MudTint = vec3(0.66, 0.52, 0.38);
const float CausticLight = 0.75;
const float DryShine = 0.22;
const float MuddyShine = 0.4;
const float WetShine = 0.75;

struct GroundSurface {
	vec3 albedo;
	float roughness;
	float relief;
	float shine;
};

struct ShoreTexel {
	float fromWater;
	float wear;
	float steepShore;
};
${GroundDetailFunctions}
${GroundSurfaceFunctions}
`;

export const GroundAlbedo = `
GroundSurface ground = groundSurface();
diffuseColor.rgb *= ground.albedo;
`;

export const GroundRoughness = `
float roughnessFactor = ground.roughness;
`;

export const GroundShine = `
#include <lights_physical_fragment>
material.specularF90 = ground.shine;
`;
