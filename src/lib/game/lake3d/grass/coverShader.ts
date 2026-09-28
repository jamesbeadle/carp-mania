import { ShaderChunk } from 'three';

export const CoverVertexUniforms = `
attribute vec3 coverPlant;
uniform float coverGive;
uniform vec3 coverGrid;
uniform vec4 coverThinning;
uniform float coverGrowth;
`;

export const CoverFragmentUniforms = `
uniform float coverSheen;
uniform vec3 coverSheenReach;
`;

export const CoverAtlasVertex = `
float atlasColumn = mod(coverPlant.x, coverGrid.x);
float atlasRow = coverGrid.y - 1.0 - floor(coverPlant.x / coverGrid.x);
vMapUv = (vec2(atlasColumn, atlasRow) + coverGrid.z + vMapUv * (1.0 - 2.0 * coverGrid.z)) / coverGrid.xy;
`;

export const CoverThinningVertex = `
vec3 thinningRoot = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
float thinningDistance = distance(thinningRoot, cameraPosition) / coverPlant.z;
float thinningKeep = pow(clamp((coverThinning.y - thinningDistance) / (coverThinning.y - coverThinning.x), 0.0, 1.0), coverThinning.z) * (1.0 + coverThinning.w);
float thinningShown = smoothstep(thinningKeep, thinningKeep - coverThinning.w, coverPlant.y);
transformed *= thinningShown;
transformed.xz *= 1.0 + thinningDistance * coverGrowth;
`;

export const CoverMipAlphaFragment = `
vec2 coverTexels = vMapUv * vec2(textureSize(map, 0));
vec2 coverAcross = dFdx(coverTexels);
vec2 coverDown = dFdy(coverTexels);
float coverMip = max(0.0, 0.5 * log2(max(dot(coverAcross, coverAcross), dot(coverDown, coverDown))));
diffuseColor.a = min(1.0, diffuseColor.a * (1.0 + coverMip * 0.35));
`;

export const CoverSheenFragment = `
float coverSheenNow = mix(coverSheen, coverSheenReach.z, smoothstep(coverSheenReach.x, coverSheenReach.y, length(vViewPosition)));
material.specularF90 = coverSheenNow;
material.specularColor *= coverSheenNow;
material.specularColorBlended *= coverSheenNow;
`;

export const SameNormalBothSides = ShaderChunk.normal_fragment_begin.replace('normal *= faceDirection;', '');
