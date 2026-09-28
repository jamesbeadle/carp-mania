import { MostWornSwims } from './swimWear';

export const GroundDetailFunctions = `
uniform vec4 swimWear[${MostWornSwims}];
uniform int swimCount;

const int MostWornSwims = ${MostWornSwims};
const float WornNear = 1.4;
const float WornFar = 3.4;
const float WornRagged = 1.6;

float wearAt(vec2 ground, float ragged) {
	float worn = 0.0;
	for (int index = 0; index < MostWornSwims; index++) {
		if (index >= swimCount) break;
		vec4 path = swimWear[index];
		vec2 span = path.zw - path.xy;
		float along = clamp(dot(ground - path.xy, span) / max(dot(span, span), 0.0001), 0.0, 1.0);
		float away = length(ground - path.xy - span * along);
		worn = max(worn, 1.0 - smoothstep(WornNear, WornFar, away + ragged * WornRagged));
	}
	return worn;
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
