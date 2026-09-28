export const GroundDetailFunctions = `
vec3 tileAt(sampler2D tile, vec2 ground, float metres) {
	return texture2D(tile, ground / metres).rgb;
}

vec3 facingTile(sampler2D tile, vec3 position, vec3 normal, float metres) {
#ifdef GROUND_LITE
	return tileAt(tile, position.xz, metres);
#else
	vec3 weights = pow(abs(normal), vec3(4.0));
	weights /= dot(weights, vec3(1.0));
	vec3 across = tileAt(tile, position.zy, metres) * weights.x + tileAt(tile, position.xz, metres) * weights.y;
	return across + tileAt(tile, position.xy, metres) * weights.z;
#endif
}

ShoreTexel shoreTexelAt(vec2 ground) {
	vec4 texel = texture2D(shoreMap, (ground - shoreOrigin) / shoreSize);
	return ShoreTexel(texel.r * 2.0 - 1.0, texel.b, texel.a);
}

vec3 marginColour(vec4 fine, vec3 earth) {
	vec3 shingle = facingTile(shingleTile, vGroundPosition, normalize(vGroundNormal), ShingleMetres);
	float stony = smoothstep(0.9 - shingleShare, 1.1 - shingleShare, fine.b);
	return mix(earth * 0.7, shingle, stony);
}

float causticsAt(vec2 ground, float height) {
#ifdef GROUND_LITE
	return 0.0;
#else
	vec2 drift = vec2(groundTime * CausticDrift, groundTime * CausticDrift * 0.7);
	vec2 warp = (texture2D(groundNoise, ground / (CausticMetres * 2.9) + drift * 0.5).ga - 0.5) * 0.6;
	float first = texture2D(causticTile, ground / CausticMetres + warp + drift).r;
	float second = texture2D(causticTile, Turned * ground / (CausticMetres * 1.37) - warp - drift * 1.3).r;
	float network = pow(first * 0.55 + second * 0.55, 2.0);
	float shallow = smoothstep(-0.02, -0.12, height) * (1.0 - smoothstep(0.4, 1.4, -height));
	return network * shallow;
#endif
}

vec3 seenThroughWater(vec3 colour, float height) {
	float depth = max(0.0, -height);
	vec3 kept = exp(-Absorption * depth * 2.0);
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
