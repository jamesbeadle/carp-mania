import { Color, MathUtils, ShaderChunk, ShaderLib, UniformsLib, type FogExp2, type Vector2, type Vector3 } from 'three';
import { HazeFragment, HazeParsFragment, HazeParsVertex, HazeVertex } from './hazeChunks';
import { brightnessOf } from './skyLook';

const SunDirectionParts = 3;
const GlowParts = 4;
const CloudParts = 4;

const sharedSunDirection = new Float32Array(SunDirectionParts);
const sharedGlow = new Float32Array(GlowParts);
const sharedClouds = new Float32Array(CloudParts);

function hazeUniforms() {
	return { hazeSunDirection: { value: sharedSunDirection }, hazeGlow: { value: sharedGlow }, hazeClouds: { value: sharedClouds } };
}

function installHaze() {
	Object.assign(ShaderChunk, { fog_pars_vertex: HazeParsVertex, fog_vertex: HazeVertex, fog_pars_fragment: HazeParsFragment, fog_fragment: HazeFragment });
	Object.assign(UniformsLib.fog, hazeUniforms());
	Object.values(ShaderLib)
		.filter((shader) => 'fogColor' in shader.uniforms)
		.forEach((shader) => Object.assign(shader.uniforms, hazeUniforms()));
}

installHaze();

export interface HazeColours {
	away: Color;
	glow: Color;
}

export const Glow = { Sharpness: 8, Strength: 0.7, ProbeTurn: MathUtils.degToRad(35), LeastFacing: 0.2 } as const;

const Veil = { Brightening: 1.2, GlowShare: 0.3 } as const;
const Leaden = new Color('#7f8fa3');

export interface HazeMood {
	veil: number;
	hazeShade: number;
	leadenness: number;
}

function leadenLike(colour: Color) {
	return Leaden.clone().multiplyScalar(brightnessOf(colour) / brightnessOf(Leaden));
}

export function veiled(colours: HazeColours, mood: HazeMood): HazeColours {
	const { away, glow } = colours;
	const { veil, hazeShade, leadenness } = mood;
	const grey = brightnessOf(glow.clone().multiplyScalar(Veil.GlowShare).add(away)) * Veil.Brightening;
	const veiledAway = away.clone().lerp(new Color(grey, grey, grey), veil);
	const leadenAway = veiledAway.clone().lerp(leadenLike(veiledAway), leadenness).multiplyScalar(hazeShade);
	return { away: leadenAway, glow: glow.clone().multiplyScalar((1 - veil) * hazeShade) };
}

export function tintHaze(fog: FogExp2, colours: HazeColours, sunDirection: Vector3) {
	const { away, glow } = colours;
	fog.color.copy(away);
	sharedSunDirection.set([sunDirection.x, sunDirection.y, sunDirection.z]);
	sharedGlow.set([glow.r * Glow.Strength, glow.g * Glow.Strength, glow.b * Glow.Strength, Glow.Sharpness]);
}

export function shadeUnderClouds(drift: Vector2, cover: number, strength: number) {
	sharedClouds.set([drift.x, drift.y, cover, strength]);
}
