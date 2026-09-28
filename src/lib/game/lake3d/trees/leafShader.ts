export const LeafVertexDeclarations = `
attribute float dangle;
attribute float cardOrder;
attribute vec2 leafCorner;
`;

export const LeafFullness = `
#include <color_vertex>
float leafKeep = step(cardOrder, vColor.a);
vColor.a = 1.0;
`;

export const EveryLeafKept = `
#include <begin_vertex>
float leafKeep = 1.0;
`;

export const LeafBillboard = `
#include <project_vertex>
#ifdef USE_BATCHING
float leafScale = length(batchingMatrix[1].xyz);
#else
float leafScale = 1.0;
#endif
mvPosition.xy += leafCorner * leafScale * leafKeep;
gl_Position = projectionMatrix * mvPosition;
`;

export const LeafFragmentDeclarations = `
uniform float leafGlowSpread;
uniform float leafGlowFocus;
uniform float leafGlowStrength;
uniform float leafSheen;
uniform vec3 leafGlowTint;
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
outgoingLight += directionalLights[ 0 ].color * diffuseColor.rgb * leafGlowTint * leafThrough * leafGlowStrength;
#endif
#include <opaque_fragment>
`;
