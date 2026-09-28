import { MathUtils, ShaderChunk, ShaderLib, UniformsLib, type Color, type FogExp2, type Vector3 } from 'three';
import { HazeFragment, HazeParsFragment, HazeParsVertex, HazeVertex } from './hazeChunks';

const SunDirectionParts = 3;
const GlowParts = 4;

const sharedSunDirection = new Float32Array(SunDirectionParts);
const sharedGlow = new Float32Array(GlowParts);

function hazeUniforms() {
	return { hazeSunDirection: { value: sharedSunDirection }, hazeGlow: { value: sharedGlow } };
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

export const Glow = { Sharpness: 6, ProbeTurn: MathUtils.degToRad(35), LeastFacing: 0.2 } as const;

export function tintHaze(fog: FogExp2, colours: HazeColours, sunDirection: Vector3) {
	const { away, glow } = colours;
	fog.color.copy(away);
	sharedSunDirection.set([sunDirection.x, sunDirection.y, sunDirection.z]);
	sharedGlow.set([glow.r, glow.g, glow.b, Glow.Sharpness]);
}
