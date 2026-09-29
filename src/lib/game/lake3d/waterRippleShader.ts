export const WaterRippleChunk = `
uniform sampler2D ripples;
uniform sampler2D waterNoise;

const mat2 SwellTurn = mat2(0.921, 0.389, -0.389, 0.921);
const mat2 BroadTurn = mat2(-0.323, 0.946, -0.946, -0.323);
const mat2 FineTurn = mat2(-0.904, 0.427, -0.427, -0.904);
const mat2 FinestTurn = mat2(-0.575, -0.818, 0.818, -0.575);
const float GustMetres = 170.0;
const float SlickMetres = 460.0;
const float CalmingDistance = 70.0;
const vec2 GustDrift = vec2(0.004, 0.0027);
const float SlickDrift = 0.0015;
const vec2 WindRange = vec2(0.3, 1.3);
const vec2 WindPatches = vec2(0.2, 0.8);
const float WindMix = 0.6;
const vec4 RippleScales = vec4(23.7, 8.9, 3.07, 1.13);
const vec4 RippleWeights = vec4(0.8, 1.1, 0.8, 0.4);
const vec2 SwellDrift = vec2(0.006, -0.009);
const vec2 BroadDrift = vec2(-0.011, 0.016);
const vec2 FineDrift = vec2(0.024, 0.011);
const vec2 FinestDrift = vec2(-0.033, -0.021);
const vec2 FineFade = vec2(12.0, 38.0);
const vec2 FinestFade = vec2(4.0, 16.0);

vec2 rippleAt(vec2 position, mat2 turn, float scale, vec2 drift) {
	vec3 texel = texture2D(ripples, turn * position / scale + drift * time).rgb * 2.0 - 1.0;
	return texel.xy * turn;
}

float windOver(vec2 position) {
	float gust = texture2D(waterNoise, position / GustMetres + GustDrift * time).g;
	float slick = texture2D(waterNoise, position / SlickMetres - vec2(time * SlickDrift, 0.0)).r;
	return mix(WindRange.x, WindRange.y, smoothstep(WindPatches.x, WindPatches.y, (gust + slick) * WindMix));
}

vec3 rippledNormal(vec2 position, float distanceAway, float calm) {
	float calming = calm * windOver(position) / (1.0 + distanceAway / CalmingDistance);
	vec2 swell = rippleAt(position, SwellTurn, RippleScales.x, SwellDrift);
	vec2 broad = rippleAt(position, BroadTurn, RippleScales.y, BroadDrift);
	vec2 fine = rippleAt(position, FineTurn, RippleScales.z, FineDrift) * (1.0 - smoothstep(FineFade.x, FineFade.y, distanceAway));
	vec2 finest = rippleAt(position, FinestTurn, RippleScales.w, FinestDrift) * (1.0 - smoothstep(FinestFade.x, FinestFade.y, distanceAway));
	vec2 slope = (swell * RippleWeights.x + broad * RippleWeights.y + fine * RippleWeights.z + finest * RippleWeights.w) * choppiness * calming;
	return normalize(vec3(slope.x, 1.0, slope.y));
}
`;
