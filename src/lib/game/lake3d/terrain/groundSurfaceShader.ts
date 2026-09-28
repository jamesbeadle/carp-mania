import { GroundCoverFunctions } from './groundCoverShader';

export const GroundSurfaceFunctions = `
${GroundCoverFunctions}
const float LipMetres = 15.0;
const float ToeStretchMetres = 29.0;
const vec2 LipHeight = vec2(0.1, 0.42);
const vec2 FaceSlope = vec2(0.04, 0.14);
const float LipFeather = 0.05;
const float FaceFoot = 0.02;
const float FaceFootTop = 0.08;
const vec2 SteepShoreFace = vec2(0.3, 0.65);
const vec2 BareSlope = vec2(0.2, 0.36);
const vec2 CliffSlope = vec2(0.42, 0.58);
const float BankBandTop = 1.1;
const float CliffRoughness = 0.97;
const float WetRoughness = 0.6;
const float CliffShine = 0.08;
const float WetFaceRise = 0.1;
const vec2 MarginToeRange = vec2(0.45, 1.5);
const float FaceSwing = 0.35;
const float BareSwing = 0.24;
const vec3 MarginHeight = vec3(0.035, 0.1, 0.12);
const float MarginFoot = 0.4;
const float GentleMarginShare = 0.35;
const vec2 EarthShade = vec2(0.62, 0.26);
const vec2 UnderwaterFrom = vec2(-0.12, -0.02);
const vec3 WetHeight = vec3(0.01, 0.06, 0.05);
const vec2 GroundRoughness = vec2(0.95, 0.88);

struct BankFace {
	float bare;
	float cliff;
	float margin;
	float toe;
};

BankFace bankFaceAt(vec2 ground, vec4 fine, float height, float steepness, ShoreTexel shore) {
	float lipTop = mix(LipHeight.x, LipHeight.y, texture2D(groundNoise, ground / LipMetres).r);
	float toe = texture2D(groundNoise, Turned * ground / ToeStretchMetres).a;
	float belowLip = 1.0 - smoothstep(lipTop - LipFeather, lipTop + LipFeather, height) * (1.0 - smoothstep(BankBandTop - LipFeather, BankBandTop, height));
	float faceBand = smoothstep(FaceFoot, FaceFootTop, height) * belowLip * smoothstep(FaceSlope.x, FaceSlope.y, steepness);
	float face = faceBand * smoothstep(SteepShoreFace.x, SteepShoreFace.y, shore.steepShore + (fine.r - 0.5) * FaceSwing);
	float bare = max(smoothstep(BareSlope.x, BareSlope.y, steepness + (fine.a - 0.5) * BareSwing) * belowLip, face);
	float marginTop = mix(MarginHeight.x, MarginHeight.y + MarginHeight.z * fine.r, shore.steepShore) * mix(MarginToeRange.x, MarginToeRange.y, toe);
	float margin = (1.0 - smoothstep(marginTop * MarginFoot, marginTop, height)) * mix(GentleMarginShare, 1.0, shore.steepShore);
	return BankFace(bare, smoothstep(CliffSlope.x, CliffSlope.y, steepness), margin, toe);
}

GroundSurface groundSurface() {
	vec2 ground = vGroundPosition.xz;
	float height = vGroundPosition.y + groundLift;
	vec3 normal = normalize(vGroundNormal);
	vec4 broad = texture2D(groundNoise, ground / BroadMetres);
	vec4 fine = texture2D(groundNoise, ground / FineMetres);
	ShoreTexel shore = shoreTexelAt(ground);
	BankFace bank = bankFaceAt(ground, fine, height, 1.0 - normal.y, shore);
	vec3 earth = facingTile(earthTile, vGroundPosition, normal, EarthMetres) * (EarthShade.x + EarthShade.y * fine.a);
	float under = 1.0 - smoothstep(UnderwaterFrom.x, UnderwaterFrom.y, height);
	float wetTop = WetHeight.y + WetHeight.z * fine.g + WetFaceRise * bank.cliff;
	float wet = (1.0 - smoothstep(WetHeight.x, wetTop, height)) * (1.0 - under);
	float roughness = mix(mix(GroundRoughness.x, GroundRoughness.y, bank.bare), CliffRoughness, bank.cliff);
	float shine = DryShine;
	vec3 grass = grassColour(ground, broad, fine, height);
	vec3 colour = trodden(mix(grass, earth, bank.bare), earth, ground, shore.wear * (1.0 - bank.margin), shine);
	colour = mix(colour, marginColour(fine, earth, bank.toe), bank.margin);
	colour = mix(colour, bedColour(ground, broad, fine, height, grass * DrownedGrass, 1.0 - shore.steepShore), under);
	float relief = dot(colour, Luminance) * mix(GrassRelief, StoneRelief, max(max(bank.bare, bank.margin), under));
	colour *= mix(1.0, wetDarkening, wet);
	roughness = mix(roughness, mix(WetRoughness, CliffRoughness, bank.cliff), wet);
	shine = mix(mix(shine, WetShine, wet), CliffShine, bank.cliff);
	colour *= 1.0 + causticsAt(ground, height) * CausticLight;
	return GroundSurface(seenThroughWater(colour, height), roughness, relief, shine);
}
`;
