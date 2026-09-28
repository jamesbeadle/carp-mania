export const GroundCoverFunctions = `
const vec3 WornEarth = vec3(0.62, 0.58, 0.53);
const float WornGreying = 0.5;
const float RemnantMetres = 0.55;
const vec2 TussockRange = vec2(0.9, 1.07);
const vec2 MeadowRange = vec2(0.88, 1.08);
const float RoughMetres = 58.0;
const vec3 RoughGrass = vec3(0.8, 0.9, 0.78);
const vec2 RoughPatches = vec2(0.45, 0.75);
const vec2 DrynessBroad = vec2(0.35, 0.85);
const vec2 DrynessHeight = vec2(2.0, 6.0);
const float HillDryness = 0.5;
const vec2 DrownedDepth = vec2(0.02, 0.22);
const vec2 ThinnedWear = vec2(0.15, 0.65);
const vec2 MuddyWear = vec2(0.6, 1.1);
const vec2 RemnantShare = vec2(0.5, 0.9);
const float ClumpSwing = 0.6;
const float PatchSwing = 0.5;
const float RemnantsKept = 0.65;
const vec2 FarBladeShare = vec2(0.25, 0.25);
const float SecondTussockScale = 1.63;
const vec2 TussockShare = vec2(0.1, 0.5);
const vec2 GrassBrightness = vec2(0.88, 0.24);
const float PatchScale = 3.1;
const vec2 SiltShare = vec2(0.35, 0.75);
const vec2 SiltDepth = vec2(0.1, 1.0);
const float SiltDepthShare = 0.45;
const vec2 SiltShade = vec2(0.75, 0.5);
const vec2 WeedShare = vec2(0.55, 0.7);
const vec2 WeedPatchiness = vec2(0.75, 0.5);
const vec2 WeedShade = vec2(0.7, 0.6);
const vec2 WeedDepth = vec2(0.06, 0.25);

vec3 grassColour(vec2 ground, vec4 broad, vec4 fine, float height) {
	vec3 near = tileAt(grassTile, ground, GrassMetres);
	vec3 far = tileAt(grassTile, Turned * ground, GrassFarMetres);
	vec3 blades = mix(near, far, FarBladeShare.x + FarBladeShare.y * fine.r);
	float tussock = texture2D(groundNoise, ground / TussockMetres).g * texture2D(groundNoise, Turned * ground / (TussockMetres * SecondTussockScale)).a;
	float meadow = texture2D(groundNoise, Turned * ground / MeadowMetres).r;
	float rough = smoothstep(RoughPatches.x, RoughPatches.y, texture2D(groundNoise, ground / RoughMetres).a);
	blades *= mix(vec3(1.0), RoughGrass, rough);
	blades *= mix(TussockRange.x, TussockRange.y, smoothstep(TussockShare.x, TussockShare.y, tussock)) * mix(MeadowRange.x, MeadowRange.y, meadow);
	float dryness = clamp(smoothstep(DrynessBroad.x, DrynessBroad.y, broad.r) + smoothstep(DrynessHeight.x, DrynessHeight.y, height) * HillDryness, 0.0, 1.0);
	return blades * mix(lushGrass, dryGrass, dryness) * (GrassBrightness.x + GrassBrightness.y * fine.g);
}

float drownedShare(float height) {
	return 1.0 - smoothstep(DrownedDepth.x, DrownedDepth.y, -height);
}

vec3 wornEarth(vec3 earth) {
	return mix(earth, vec3(dot(earth, Luminance)), WornGreying) * WornEarth;
}

vec3 trodden(vec3 grass, vec3 earth, vec2 ground, float wear, inout float shine) {
	float clumps = texture2D(groundNoise, ground / ClumpMetres).b;
	float patches = texture2D(groundNoise, Turned * ground / (ClumpMetres * PatchScale)).g;
	float remnants = texture2D(groundNoise, Turned * ground / RemnantMetres).r;
	float worn = wear * (1.0 + (clumps - 0.5) * ClumpSwing + (patches - 0.5) * PatchSwing);
	float thinned = smoothstep(ThinnedWear.x, ThinnedWear.y, worn);
	float muddy = smoothstep(MuddyWear.x, MuddyWear.y, worn) * (1.0 - smoothstep(RemnantShare.x, RemnantShare.y, remnants) * RemnantsKept);
	shine = mix(shine, MuddyShine, muddy);
	vec3 flattened = mix(grass, grass * FlattenedGrass, thinned);
	return mix(flattened, wornEarth(earth), muddy);
}

vec3 bedColour(vec2 ground, vec4 broad, vec4 fine, float height, vec3 drowned, float gentleness) {
	vec3 bed = mix(tileAt(bedTile, ground, BedMetres) * SiltFilm, drowned, drownedShare(height) * gentleness);
	float silt = smoothstep(SiltShare.x, SiltShare.y, (fine.g + broad.b) * 0.5 + smoothstep(SiltDepth.x, SiltDepth.y, -height) * SiltDepthShare);
	bed = mix(bed, SiltColour * (SiltShade.x + SiltShade.y * fine.a), silt);
	float weed = smoothstep(WeedShare.x, WeedShare.y, texture2D(groundNoise, ground / WeedMetres).a * (WeedPatchiness.x + WeedPatchiness.y * fine.b));
	return mix(bed, WeedColour * (WeedShade.x + WeedShade.y * fine.r), weed * smoothstep(WeedDepth.x, WeedDepth.y, -height));
}
`;
