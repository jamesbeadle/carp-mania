import { ShaderChunk } from 'three';
import { glslNumber as n } from './glslNumber';

const Scramble = { Across: 12.9898, Down: 78.233, Spread: 43758.5453 } as const;
const MipAlphaBoost = 0.35;
const Tilt = { Share: 0.7 } as const;

export const CoverVertexUniforms = `
attribute vec3 coverPlant;
uniform float coverGive;
uniform vec3 coverGrid;
uniform vec4 coverThinning;
uniform float coverGrowth;
uniform vec2 coverAbove;
uniform float coverFacing;
`;

export const CoverFragmentUniforms = `
uniform float coverSheen;
uniform vec3 coverSheenReach;
`;

export function atlasVertex(cellExpression: string) {
	return `
float atlasColumn = mod(${cellExpression}, coverGrid.x);
float atlasRow = coverGrid.y - 1.0 - floor(${cellExpression} / coverGrid.x);
vMapUv = (vec2(atlasColumn, atlasRow) + coverGrid.z + vMapUv * (1.0 - 2.0 * coverGrid.z)) / coverGrid.xy;
`;
}

export const CoverAtlasVertex = atlasVertex('coverPlant.x');

export function scrambled(pointExpression: string) {
	return `fract(sin(dot(${pointExpression}, vec2(${n(Scramble.Across)}, ${n(Scramble.Down)}))) * ${n(Scramble.Spread)})`;
}

export function facingTurn(rootExpression: string, jitterExpression: string) {
	return `atan(cameraPosition.x - ${rootExpression}.x, cameraPosition.z - ${rootExpression}.z) + (${jitterExpression} - 0.5) * coverFacing`;
}

export function turnedAbout(turnExpression: string) {
	return `transformed.xz = mat2(cos(${turnExpression}), -sin(${turnExpression}), sin(${turnExpression}), cos(${turnExpression})) * transformed.xz;`;
}

export function tiltedAway(rootExpression: string, aspectExpression = '1.0') {
	return `
float tiltAngle = asin(clamp(normalize(cameraPosition - ${rootExpression}).y, 0.0, 1.0)) * ${n(Tilt.Share)};
transformed.yz = vec2(transformed.y * cos(tiltAngle), transformed.z - transformed.y * sin(tiltAngle) * ${aspectExpression});
`;
}

export const CoverThinningVertex = `
vec3 thinningRoot = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
float thinningDistance = distance(thinningRoot, cameraPosition) / coverPlant.z;
float thinningShare = clamp((coverThinning.y - thinningDistance) / (coverThinning.y - coverThinning.x), 0.0, 1.0);
float thinningKeep = pow(thinningShare, coverThinning.z) * (1.0 + coverThinning.w);
float thinningShown = smoothstep(thinningKeep, thinningKeep - coverThinning.w, coverPlant.y);
transformed *= thinningShown;
transformed.xz *= 1.0 + thinningDistance * coverGrowth;
`;

export const CoverFromAboveVertex = `
vec3 aboveRoot = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
vec3 aboveView = normalize(cameraPosition - aboveRoot);
transformed.y -= smoothstep(coverAbove.x, coverAbove.y, aboveView.y);
`;

export const CoverFacingVertex = `
vec3 facingRoot = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
float facingJitter = ${scrambled('facingRoot.xz')};
float facingAngle = ${facingTurn('facingRoot', 'facingJitter')};
float facingAspect = length(instanceMatrix[1].xyz) / length(instanceMatrix[0].xyz);
${tiltedAway('facingRoot', 'facingAspect')}
${turnedAbout('facingAngle')}
`;

export const CoverMipAlphaFragment = `
vec2 coverTexels = vMapUv * vec2(textureSize(map, 0));
vec2 coverAcross = dFdx(coverTexels);
vec2 coverDown = dFdy(coverTexels);
float coverMip = max(0.0, 0.5 * log2(max(dot(coverAcross, coverAcross), dot(coverDown, coverDown))));
diffuseColor.a = min(1.0, diffuseColor.a * (1.0 + coverMip * ${n(MipAlphaBoost)}));
`;

export const CoverSheenFragment = `
float coverSheenNow = mix(coverSheen, coverSheenReach.z, smoothstep(coverSheenReach.x, coverSheenReach.y, length(vViewPosition)));
material.specularF90 = coverSheenNow;
material.specularColor *= coverSheenNow;
material.specularColorBlended *= coverSheenNow;
`;

export const SameNormalBothSides = ShaderChunk.normal_fragment_begin.replace('normal *= faceDirection;', '');
