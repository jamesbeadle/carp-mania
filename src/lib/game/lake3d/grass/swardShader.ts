import { atlasVertex, facingTurn, tiltedAway, turnedAbout } from './coverShader';
import { glslNumber as n } from './glslNumber';

const Sunk = { Share: 0.2 } as const;
const FromAbove = { SinkFrom: 0.75, SunkAt: 0.97 } as const;

export const SwardVertexHead = `
attribute vec4 swardSpot;
attribute vec4 swardLook;
uniform sampler2D swardField;
uniform vec4 swardArea;
uniform vec4 swardReach;
uniform vec3 swardWarmth;
uniform float coverGive;
uniform vec3 coverGrid;
uniform float coverFacing;
`;

export const SwardPlacementVertex = `
${atlasVertex('swardLook.x')}
float swardSpan = swardReach.x;
vec2 swardWorld = cameraPosition.xz + mod(swardSpot.xy - cameraPosition.xz + swardSpan * 0.5, swardSpan) - swardSpan * 0.5;
vec4 swardGround = textureLod(swardField, (swardWorld - swardArea.xy) * swardArea.zw, 0.0);
vec3 swardRoot = vec3(swardWorld.x, swardGround.r, swardWorld.y);
float swardNear = 1.0 - smoothstep(swardReach.y, swardReach.z, distance(swardRoot, cameraPosition));
float swardShown = smoothstep(swardSpot.z, swardSpot.z + swardReach.w, swardGround.g * swardNear);
float swardAbove = smoothstep(${n(FromAbove.SinkFrom)}, ${n(FromAbove.SunkAt)}, normalize(cameraPosition - swardRoot).y);
float swardHeight = swardLook.y * swardGround.b;
`;

export const SwardTintVertex = `
vColor.rgb *= swardLook.w * mix(vec3(1.0), swardWarmth, swardGround.a);
`;

export const SwardShapeVertex = `
transformed.xz *= swardLook.z;
transformed.y *= swardHeight;
float swardTurn = ${facingTurn('swardRoot', 'swardSpot.w')};
${tiltedAway('swardRoot')}
${turnedAbout('swardTurn')}
transformed *= swardShown;
transformed.y -= swardHeight * (${n(Sunk.Share)} + swardAbove);
transformed += swardRoot;
`;
