export const WaterShoreChunk = `
uniform sampler2D shoreMap;
uniform vec2 shoreOrigin;
uniform vec2 shoreSize;
uniform float shoreBand;
uniform float deepestMetres;
uniform vec3 shallowColour;

const vec3 FoamColour = vec3(0.72, 0.74, 0.68);
const vec2 MurkShareOfDepth = vec2(0.16, 0.5);
const float CalmestEdge = 0.35;
const float EdgeOpacity = 0.08;
const float DeepOpacity = 0.93;
const float CalmReach = 4.0;
const float FoamFadeNear = 20.0;
const float FoamFadeFar = 70.0;
const float DarkestDepthShare = 0.74;
const vec2 DepthDarkening = vec2(0.3, 1.0);
const vec2 MurkColouring = vec2(0.1, 0.9);
const float TintMetres = 97.0;
const vec3 CoolTint = vec3(0.9, 0.95, 0.9);
const vec3 WarmTint = vec3(1.07, 1.04, 0.94);
const float EdgeMetres = 23.0;
const float MostEdgeOpacity = 0.3;
const vec2 EdgePatches = vec2(0.35, 0.75);
const float WobbleMetres = 7.0;
const float WobbleDrift = 0.006;
const float LapPace = 1.1;
const float LapsPerMetre = 2.5;
const float WobbleTwist = 9.0;
const vec2 LapReach = vec2(0.02, 0.045);
const float LaceMetres = 1.3;
const float LaceDrift = 0.015;
const mat2 LaceTurn = mat2(0.54, 0.84, -0.84, 0.54);
const float SecondLaceScale = 1.71;
const vec2 LaceThreshold = vec2(0.42, 0.62);
const vec2 LaceStrength = vec2(0.2, 0.6);
const float FoamOnLand = -0.5;

struct ShoreSample {
	float depth;
	float fromShore;
};

struct WaterBody {
	vec3 colour;
	float opacity;
};

ShoreSample shoreAt(vec2 ground) {
	vec4 texel = texture2D(shoreMap, (ground - shoreOrigin) / shoreSize);
	return ShoreSample(texel.g * deepestMetres, (texel.r * 2.0 - 1.0) * shoreBand);
}

float shoreCalm(ShoreSample shore) {
	return mix(CalmestEdge, 1.0, smoothstep(0.0, CalmReach, shore.fromShore));
}

WaterBody waterBodyAt(ShoreSample shore, vec2 ground, float clarity, float lighting) {
	float murkMetres = deepestMetres * mix(MurkShareOfDepth.x, MurkShareOfDepth.y, clarity);
	float murk = 1.0 - exp(-shore.depth / murkMetres);
	float depthShare = smoothstep(DepthDarkening.x, DepthDarkening.y, shore.depth / deepestMetres);
	float tint = texture2D(waterNoise, ground / TintMetres).b;
	vec3 colour = mix(shallowColour, deepColour, smoothstep(MurkColouring.x, MurkColouring.y, murk)) * mix(1.0, DarkestDepthShare, depthShare);
	colour *= mix(CoolTint, WarmTint, tint) * lighting;
	float edge = mix(EdgeOpacity, MostEdgeOpacity, smoothstep(EdgePatches.x, EdgePatches.y, texture2D(waterNoise, ground / EdgeMetres).a));
	return WaterBody(colour, mix(edge, DeepOpacity, murk));
}

float laceAt(vec2 ground) {
	vec2 drift = vec2(0.0, time * LaceDrift);
	float first = texture2D(ripples, ground / LaceMetres - drift).g;
	float second = texture2D(ripples, LaceTurn * ground / (LaceMetres * SecondLaceScale) + drift).r;
	return smoothstep(LaceThreshold.x, LaceThreshold.y, first * second * 2.0);
}

float foamAt(vec2 ground, ShoreSample shore) {
	float wobble = texture2D(ripples, ground / WobbleMetres + vec2(time * WobbleDrift, 0.0)).r;
	float lap = 0.5 + 0.5 * sin(time * LapPace + shore.fromShore * LapsPerMetre + wobble * WobbleTwist);
	float reach = LapReach.x + LapReach.y * lap;
	float line = 1.0 - smoothstep(0.0, reach, shore.depth);
	return line * mix(LaceStrength.x, LaceStrength.y, laceAt(ground)) * step(FoamOnLand, shore.fromShore);
}
`;
