import { MostWornSwims } from './swimWear';

export const GroundDetailFunctions = `
uniform vec4 swimWear[${MostWornSwims}];
uniform int swimCount;
uniform float groundTime;

const int MostWornSwims = ${MostWornSwims};
const float PatchNear = 1.5;
const float PatchFar = 3.6;
const float PathNear = 0.3;
const float PathFar = 0.85;
const float WornRagged = 1.4;
const float PathShare = 0.65;
const float CausticMetres = 2.7;
const float CausticDrift = 0.035;

float wearAt(vec2 ground, float ragged) {
	float worn = 0.0;
	for (int index = 0; index < MostWornSwims; index++) {
		if (index >= swimCount) break;
		vec4 path = swimWear[index];
		vec2 span = path.zw - path.xy;
		float along = clamp(dot(ground - path.xy, span) / max(dot(span, span), 0.0001), 0.0, 1.0);
		float away = length(ground - path.xy - span * along);
		float camp = 1.0 - smoothstep(PatchNear, PatchFar, distance(ground, path.zw) + ragged * WornRagged);
		float trodden = (1.0 - smoothstep(PathNear, PathFar, away + ragged * WornRagged * 0.4)) * PathShare;
		worn = max(worn, max(camp, trodden));
	}
	return worn;
}

float causticsAt(vec2 ground, float height) {
	vec2 drift = vec2(groundTime * CausticDrift, groundTime * CausticDrift * 0.7);
	float first = texture2D(groundNoise, ground / CausticMetres + drift).b;
	float second = texture2D(groundNoise, Turned * ground / (CausticMetres * 0.83) - drift * 1.3).b;
	float ridge = pow(clamp(1.0 - abs(first - second) * 5.0, 0.0, 1.0), 5.0);
	float shallow = smoothstep(-0.02, -0.08, height) * (1.0 - smoothstep(0.25, 0.9, -height));
	return ridge * shallow;
}

vec3 seenThroughWater(vec3 colour, float height) {
	float depth = max(0.0, -height);
	vec3 kept = exp(-Absorption * depth * 2.0);
	return colour * kept + underwaterTint * (1.0 - kept);
}

vec3 groundRelief(vec3 surfaceNormal, vec3 surfacePosition, float relief) {
	vec3 sigmaX = dFdx(surfacePosition);
	vec3 sigmaY = dFdy(surfacePosition);
	vec3 across = cross(sigmaY, surfaceNormal);
	vec3 along = cross(surfaceNormal, sigmaX);
	float determinant = dot(sigmaX, across);
	vec3 gradient = sign(determinant) * (dFdx(relief) * across + dFdy(relief) * along);
	return normalize(abs(determinant) * surfaceNormal - gradient);
}
`;

export const GroundReliefNormal = `
normal = groundRelief(normal, -vViewPosition, ground.relief);
`;
