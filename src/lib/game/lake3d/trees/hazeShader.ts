import { glslDefines } from './glslConstants';

const HazeShape = glslDefines({ HAZE_DENSITY: 0.8, DITHER_HALF: 0.5, DITHER_ROW: 0.75, DITHER_QUARTER: 0.25, DITHER_CENTRE: 0.03125, LEAF_EDGE_SOFTNESS: 0.75 });

export const HazyAlphaTest = HazeShape + `
#ifdef ALPHA_TO_COVERAGE
float leafEdge = fwidth(diffuseColor.a) * LEAF_EDGE_SOFTNESS;
float leafCrisp = smoothstep(alphaTest - leafEdge, alphaTest + leafEdge, diffuseColor.a);
diffuseColor.a = mix(leafCrisp, diffuseColor.a * HAZE_DENSITY, vLeafHaze);
if (diffuseColor.a == 0.0) discard;
#else
vec2 leafCell = floor(gl_FragCoord.xy);
vec2 leafHalfCell = floor(leafCell * DITHER_HALF);
float leafFine = fract(dot(leafCell, vec2(DITHER_HALF, leafCell.y * DITHER_ROW)));
float leafCoarse = fract(dot(leafHalfCell, vec2(DITHER_HALF, leafHalfCell.y * DITHER_ROW)));
float leafDither = leafCoarse * DITHER_QUARTER + leafFine + DITHER_CENTRE;
float leafCut = mix(alphaTest, fract(leafDither), vLeafHaze);
if (diffuseColor.a * mix(1.0, HAZE_DENSITY, vLeafHaze) < leafCut) discard;
#endif
`;
