import { glslDefines } from './glslConstants';

const HazeShape = glslDefines({ HAZE_DENSITY: 0.8, HAZE_CUT: 0.6, HAZE_LEAST: 0.05, HAZE_BLEND_DENSITY: 0.45, HAZE_FAR_GAIN: 1.2, HAZE_NEAR_TEXELS: 1.0, HAZE_FAR_TEXELS: 6.0, LEAF_EDGE_SOFTNESS: 0.75 });

export const HazyAlphaTest = HazeShape + `
#ifdef ALPHA_TO_COVERAGE
float leafTexels = length(fwidth(vMapUv)) * float(textureSize(map, 0).x);
float hazeGain = 1.0 + HAZE_FAR_GAIN * smoothstep(HAZE_NEAR_TEXELS, HAZE_FAR_TEXELS, leafTexels);
float hazeAlpha = min(1.0, diffuseColor.a * HAZE_DENSITY * hazeGain);
float leafEdge = fwidth(diffuseColor.a) * LEAF_EDGE_SOFTNESS;
float leafCrisp = smoothstep(alphaTest - leafEdge, alphaTest + leafEdge, diffuseColor.a);
diffuseColor.a = mix(leafCrisp, hazeAlpha, vLeafHaze);
if (diffuseColor.a == 0.0) discard;
#elif defined(LEAF_BLENDED)
diffuseColor.a = mix(step(alphaTest, diffuseColor.a), diffuseColor.a * HAZE_BLEND_DENSITY, vLeafHaze);
if (diffuseColor.a < HAZE_LEAST) discard;
#else
if (diffuseColor.a < mix(alphaTest, HAZE_CUT, vLeafHaze)) discard;
#endif
`;
