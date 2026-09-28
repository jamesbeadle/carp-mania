export const WaterShoreChunk = `
uniform sampler2D shoreMap;
uniform vec2 shoreOrigin;
uniform vec2 shoreSize;
uniform float shoreBand;
uniform float deepestMetres;
uniform vec3 shallowColour;

const vec3 FoamColour = vec3(0.78, 0.8, 0.74);
const float ClearestDepth = 0.8;
const float MurkiestDepth = 0.12;
const float CalmestEdge = 0.35;
const float CalmReach = 4.0;

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

WaterBody waterBodyAt(ShoreSample shore, float clarity, float lighting) {
	float murk = smoothstep(0.0, mix(MurkiestDepth, ClearestDepth, clarity), shore.depth);
	vec3 colour = mix(shallowColour, deepColour, murk) * lighting;
	return WaterBody(colour, mix(0.04, 0.96, murk * murk * (3.0 - 2.0 * murk)));
}

float foamAt(vec2 ground, ShoreSample shore) {
	float wobble = texture2D(ripples, ground / 7.0 + vec2(time * 0.006, 0.0)).r;
	float lap = 0.5 + 0.5 * sin(time * 1.1 + shore.fromShore * 2.5 + wobble * 9.0);
	float reach = 0.02 + 0.045 * lap;
	float line = 1.0 - smoothstep(0.0, reach, shore.depth);
	float lace = smoothstep(0.42, 0.62, texture2D(ripples, ground / 1.3 - vec2(0.0, time * 0.015)).g);
	return line * mix(0.25, 0.7, lace) * step(-0.5, shore.fromShore);
}
`;
