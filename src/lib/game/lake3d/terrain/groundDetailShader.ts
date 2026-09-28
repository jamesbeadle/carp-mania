export const GroundDetailFunctions = `
const float TriplanarSharpness = 4.0;
const float WarpScale = 2.9;
const float WarpStrength = 0.6;
const float WarpDrift = 0.5;
const float SecondCausticScale = 1.37;
const float SecondCausticDrift = 1.3;
const vec2 CausticDriftShare = vec2(1.0, 0.7);
const float CausticShare = 0.55;
const vec2 CausticFromDepth = vec2(0.02, 0.12);
const vec2 CausticGoneDepth = vec2(0.4, 1.4);
const float AbsorptionScale = 2.0;
const vec2 ShingleToe = vec2(0.55, 0.8);
const float ShingleSpread = 0.1;
const float BareEarthUnderShingle = 0.7;
vec3 tileAt(sampler2D tile, vec2 ground, float metres) {
	return texture2D(tile, ground / metres).rgb;
}

vec3 facingTile(sampler2D tile, vec3 position, vec3 normal, float metres) {
#ifdef GROUND_LITE
	return tileAt(tile, position.xz, metres);
#else
	vec3 weights = pow(abs(normal), vec3(TriplanarSharpness));
	weights /= dot(weights, vec3(1.0));
	vec3 across = tileAt(tile, position.zy, metres) * weights.x + tileAt(tile, position.xz, metres) * weights.y;
	return across + tileAt(tile, position.xy, metres) * weights.z;
#endif
}

ShoreTexel shoreTexelAt(vec2 ground) {
	vec4 texel = texture2D(shoreMap, (ground - shoreOrigin) / shoreSize);
	return ShoreTexel(texel.r * 2.0 - 1.0, texel.b, texel.a);
}

vec3 marginColour(vec4 fine, vec3 earth, float toe) {
	vec3 shingle = facingTile(shingleTile, vGroundPosition, normalize(vGroundNormal), ShingleMetres);
	float stony = smoothstep(1.0 - ShingleSpread - shingleShare, 1.0 + ShingleSpread - shingleShare, fine.b * (ShingleToe.x + ShingleToe.y * toe));
	return mix(earth * BareEarthUnderShingle, shingle, stony);
}

float causticsAt(vec2 ground, float height) {
#ifdef GROUND_LITE
	return 0.0;
#else
	vec2 drift = CausticDriftShare * groundTime * CausticDrift;
	vec2 warp = (texture2D(groundNoise, ground / (CausticMetres * WarpScale) + drift * WarpDrift).ga - 0.5) * WarpStrength;
	float first = texture2D(causticTile, ground / CausticMetres + warp + drift).r;
	float second = texture2D(causticTile, Turned * ground / (CausticMetres * SecondCausticScale) - warp - drift * SecondCausticDrift).r;
	float network = pow((first + second) * CausticShare, 2.0);
	float shallow = smoothstep(CausticFromDepth.x, CausticFromDepth.y, -height) * (1.0 - smoothstep(CausticGoneDepth.x, CausticGoneDepth.y, -height));
	return network * shallow;
#endif
}

vec3 seenThroughWater(vec3 colour, float height) {
	float depth = max(0.0, -height);
	vec3 kept = exp(-Absorption * depth * AbsorptionScale);
	return colour * kept + underwaterTint * (1.0 - kept);
}

vec3 groundRelief(vec3 surfaceNormal, vec3 surfacePosition, float relief) {
#ifdef GROUND_LITE
	return surfaceNormal;
#else
	vec3 sigmaX = dFdx(surfacePosition);
	vec3 sigmaY = dFdy(surfacePosition);
	vec3 across = cross(sigmaY, surfaceNormal);
	vec3 along = cross(surfaceNormal, sigmaX);
	float determinant = dot(sigmaX, across);
	vec3 gradient = sign(determinant) * (dFdx(relief) * across + dFdy(relief) * along);
	return normalize(abs(determinant) * surfaceNormal - gradient);
#endif
}
`;

export const GroundReliefNormal = `
normal = groundRelief(normal, -vViewPosition, ground.relief);
`;
