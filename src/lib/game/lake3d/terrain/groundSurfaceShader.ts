export const GroundSurfaceFunctions = `
vec3 grassColour(vec2 ground, vec4 broad, vec4 fine, float height) {
	vec3 near = tileAt(grassTile, ground, GrassMetres);
	vec3 far = tileAt(grassTile, Turned * ground, GrassFarMetres);
	vec3 blades = mix(near, far, 0.25 + 0.25 * fine.r);
	float tussock = texture2D(groundNoise, ground / TussockMetres).g * texture2D(groundNoise, Turned * ground / (TussockMetres * 1.63)).a;
	float meadow = texture2D(groundNoise, Turned * ground / MeadowMetres).r;
	blades *= mix(0.9, 1.07, smoothstep(0.1, 0.5, tussock)) * mix(0.88, 1.08, meadow);
	float dryness = clamp(smoothstep(0.35, 0.85, broad.r) + smoothstep(2.0, 6.0, height) * 0.5, 0.0, 1.0);
	return blades * mix(lushGrass, dryGrass, dryness) * (0.88 + 0.24 * fine.g);
}

float drownedShare(float height) {
	return 1.0 - smoothstep(0.02, 0.22, -height);
}

vec3 trodden(vec3 grass, vec3 earth, vec2 ground, float wear, inout float shine) {
	float clumps = texture2D(groundNoise, ground / ClumpMetres).b;
	float patches = texture2D(groundNoise, Turned * ground / (ClumpMetres * 3.1)).g;
	float thinned = smoothstep(0.18, 0.6, wear + (clumps - 0.5) * 0.6);
	float muddy = smoothstep(0.7, 1.0, wear + (clumps - 0.5) * 0.3 + (patches - 0.5) * 0.4);
	shine = mix(shine, MuddyShine, muddy);
	vec3 flattened = mix(grass, grass * FlattenedGrass, thinned);
	return mix(flattened, earth * MudTint, muddy);
}

vec3 bedColour(vec2 ground, vec4 broad, vec4 fine, float height, vec3 drowned, float gentleness) {
	vec3 bed = mix(tileAt(bedTile, ground, BedMetres) * SiltFilm, drowned, drownedShare(height) * gentleness);
	float silt = smoothstep(0.35, 0.75, fine.g * 0.5 + broad.b * 0.5 + smoothstep(0.1, 1.0, -height) * 0.45);
	bed = mix(bed, SiltColour * (0.75 + 0.5 * fine.a), silt);
	float weed = smoothstep(0.55, 0.7, texture2D(groundNoise, ground / WeedMetres).a * (0.75 + 0.5 * fine.b));
	return mix(bed, WeedColour * (0.7 + 0.6 * fine.r), weed * smoothstep(0.06, 0.25, -height));
}

GroundSurface groundSurface() {
	vec2 ground = vGroundPosition.xz;
	float height = vGroundPosition.y + groundLift;
	vec3 normal = normalize(vGroundNormal);
	vec4 broad = texture2D(groundNoise, ground / BroadMetres);
	vec4 fine = texture2D(groundNoise, ground / FineMetres);
	ShoreTexel shore = shoreTexelAt(ground);
	float steepness = 1.0 - normal.y;
	vec3 earth = facingTile(earthTile, vGroundPosition, normal, EarthMetres) * (0.62 + 0.26 * fine.a);
	float faceBand = smoothstep(0.02, 0.08, height) * (1.0 - smoothstep(0.28, 0.4, height + (fine.g - 0.5) * 0.14));
	float face = faceBand * smoothstep(0.3, 0.65, shore.steepShore + (fine.r - 0.5) * 0.35);
	float bare = max(smoothstep(0.2, 0.36, steepness + (fine.a - 0.5) * 0.24), face);
	float marginTop = mix(0.035, 0.1 + 0.12 * fine.r, shore.steepShore);
	float margin = (1.0 - smoothstep(marginTop * 0.4, marginTop, height)) * mix(0.35, 1.0, shore.steepShore);
	float under = 1.0 - smoothstep(-0.12, -0.02, height);
	float wet = 1.0 - smoothstep(0.01, 0.06 + 0.05 * fine.g, height);
	float roughness = mix(0.95, 0.88, bare);
	float shine = DryShine;
	vec3 grass = grassColour(ground, broad, fine, height);
	vec3 colour = trodden(mix(grass, earth, bare), earth, ground, shore.wear * (1.0 - margin), shine);
	colour = mix(colour, marginColour(fine, earth), margin);
	colour = mix(colour, bedColour(ground, broad, fine, height, grass * DrownedGrass, 1.0 - shore.steepShore), under);
	float relief = dot(colour, Luminance) * mix(GrassRelief, StoneRelief, max(max(bare, margin), under));
	colour *= mix(1.0, wetDarkening, wet * (1.0 - under));
	roughness = mix(roughness, 0.6, wet * (1.0 - under));
	shine = mix(shine, WetShine, wet * (1.0 - under));
	colour *= 1.0 + causticsAt(ground, height) * CausticLight;
	return GroundSurface(seenThroughWater(colour, height), roughness, relief, shine);
}
`;
