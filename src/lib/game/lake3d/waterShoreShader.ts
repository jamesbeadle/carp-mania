export const WaterShoreChunk = `
uniform sampler2D shoreMap;
uniform vec2 shoreOrigin;
uniform vec2 shoreSize;
uniform float shoreBand;
uniform float deepestMetres;
uniform vec3 shallowColour;

const vec3 FoamColour = vec3(0.72, 0.74, 0.68);
const float ClearestMurkMetres = 1.0;
const float MurkiestMurkMetres = 0.2;
const float CalmestEdge = 0.35;
const float EdgeOpacity = 0.08;
const float DeepOpacity = 0.97;
const float CalmReach = 4.0;
const float FoamFadeNear = 20.0;
const float FoamFadeFar = 70.0;

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
	float murk = 1.0 - exp(-shore.depth / mix(MurkiestMurkMetres, ClearestMurkMetres, clarity));
	vec3 colour = mix(shallowColour, deepColour, smoothstep(0.1, 0.9, murk)) * lighting;
	return WaterBody(colour, mix(EdgeOpacity, DeepOpacity, murk));
}

float foamAt(vec2 ground, ShoreSample shore) {
	float wobble = texture2D(ripples, ground / 7.0 + vec2(time * 0.006, 0.0)).r;
	float lap = 0.5 + 0.5 * sin(time * 1.1 + shore.fromShore * 2.5 + wobble * 9.0);
	float reach = 0.02 + 0.045 * lap;
	float line = 1.0 - smoothstep(0.0, reach, shore.depth);
	float lace = smoothstep(0.42, 0.62, texture2D(ripples, ground / 1.3 - vec2(0.0, time * 0.015)).g);
	return line * mix(0.2, 0.6, lace) * step(-0.5, shore.fromShore);
}
`;
