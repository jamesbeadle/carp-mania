import { glslDefines } from './glslConstants';

const LeafTurning = glslDefines({ LEAF_AXIS_LEAST: 0.0001, LEAF_SHORTEST: 0.35 });

export const LeafVertexDeclarations = LeafTurning + `
attribute float dangle;
attribute float cardOrder;
attribute vec2 leafCorner;
attribute vec3 leafAxis;
attribute float leafHaze;
varying float vLeafHaze;
#ifdef USE_INSTANCING
attribute float instanceFullness;
#endif
`;

export const LeafFullness = `
#include <color_vertex>
#ifdef USE_INSTANCING
float leafFullness = instanceFullness;
#else
float leafFullness = vColor.a;
#endif
float leafKeep = step(cardOrder, leafFullness);
vColor.a = 1.0;
vLeafHaze = leafHaze;
`;

export const EveryLeafKept = `
#include <begin_vertex>
float leafKeep = 1.0;
`;

export const LeafBillboard = `
#include <project_vertex>
#ifdef USE_BATCHING
mat4 leafPlacement = batchingMatrix;
#elif defined(USE_INSTANCING)
mat4 leafPlacement = instanceMatrix;
#else
mat4 leafPlacement = mat4(1.0);
#endif
float leafScale = length(leafPlacement[1].xyz);
vec3 leafAxisSeen = mat3(modelViewMatrix) * mat3(leafPlacement) * leafAxis;
float leafAxisAcross = length(leafAxisSeen.xy);
float leafIsAligned = step(LEAF_AXIS_LEAST, leafAxisAcross);
vec2 leafUp = mix(vec2(0.0, 1.0), leafAxisSeen.xy / max(leafAxisAcross, LEAF_AXIS_LEAST), leafIsAligned);
vec2 leafSide = vec2(leafUp.y, -leafUp.x);
float leafForeshortening = mix(1.0, max(leafAxisAcross / max(length(leafAxisSeen), LEAF_AXIS_LEAST), LEAF_SHORTEST), leafIsAligned);
mvPosition.xy += (leafSide * leafCorner.x + leafUp * leafCorner.y * leafForeshortening) * leafScale * leafKeep;
gl_Position = projectionMatrix * mvPosition;
`;

export const LeafFragmentDeclarations = `
varying float vLeafHaze;
uniform float leafGlowSpread;
uniform float leafGlowFocus;
uniform float leafGlowStrength;
uniform float leafSheen;
uniform float leafMipBias;
uniform vec3 leafGlowTint;
`;

export const BiasedLeafTexture = `
#ifdef USE_MAP
diffuseColor *= texture2D(map, vMapUv, leafMipBias);
#endif
`;

export const SoftSheen = `
#include <lights_fragment_end>
reflectedLight.directSpecular *= leafSheen;
reflectedLight.indirectSpecular *= leafSheen;
`;

export const Translucency = `
#if NUM_DIR_LIGHTS > 0
vec3 leafSun = directionalLights[ 0 ].direction;
float leafFacing = max(dot(-geometryViewDir, leafSun), 0.0);
float leafThrough = max(dot(-normal, leafSun), 0.0) * leafGlowSpread + pow(leafFacing, leafGlowFocus);
outgoingLight += directionalLights[ 0 ].color * diffuseColor.rgb * leafGlowTint * leafThrough * leafGlowStrength * (1.0 - vLeafHaze);
#endif
#include <opaque_fragment>
`;
