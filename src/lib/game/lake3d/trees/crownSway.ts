import type { WebGLProgramParametersWithUniforms } from 'three';
import { glslDefines } from './glslConstants';

const SwayShape = glslDefines({
	SWAY_PHASE_ACROSS: 0.21,
	SWAY_PHASE_DOWN: 0.17,
	SWAY_ROOTED_HEIGHT: 0.2,
	SWAY_PACE: 1.3,
	SWAY_CROSS_PACE: 1.1,
	SWAY_CROSS_PHASE: 1.3,
	SWAY_CROSS_SHARE: 0.6,
	LEAF_WAVE_PACE: 2.3,
	LEAF_DANGLE_PHASE: 2.5,
	LEAF_DANGLE_BEND: 2.5,
	LEAF_WAVE_SHARE: 0.25,
	LEAF_WAVE_CROSS: 0.5,
	LEAF_FLUTTER_PACE: 7.0,
	LEAF_FLUTTER_ACROSS: 97.0,
	LEAF_FLUTTER_UP: 61.0,
	LEAF_FLUTTER_DOWN: 83.0
});

const SwayDeclarations = `
uniform float swayTime;
uniform float swayStrength;
uniform float swayFlutter;
`;

const SwayVertex = `
#ifdef USE_BATCHING
vec3 swayRoot = batchingMatrix[3].xyz;
#elif defined(USE_INSTANCING)
vec3 swayRoot = instanceMatrix[3].xyz;
#else
vec3 swayRoot = vec3(0.0);
#endif
float swayPhase = swayRoot.x * SWAY_PHASE_ACROSS + swayRoot.z * SWAY_PHASE_DOWN;
float swayHeight = max(0.0, transformed.y - SWAY_ROOTED_HEIGHT);
vec2 swayBend = vec2(sin(swayTime * SWAY_PACE + swayPhase), cos(swayTime * SWAY_CROSS_PACE + swayPhase * SWAY_CROSS_PHASE) * SWAY_CROSS_SHARE) * swayStrength * swayHeight * swayHeight;
transformed.xz += swayBend;
`;

const LeafVertex = `
float leafWave = sin(swayTime * LEAF_WAVE_PACE + swayPhase + dangle * LEAF_DANGLE_PHASE);
transformed.xz += swayBend * dangle * LEAF_DANGLE_BEND + vec2(leafWave, leafWave * LEAF_WAVE_CROSS) * dangle * swayStrength * LEAF_WAVE_SHARE;
transformed += objectNormal * sin(swayTime * LEAF_FLUTTER_PACE + dot(position, vec3(LEAF_FLUTTER_ACROSS, LEAF_FLUTTER_UP, LEAF_FLUTTER_DOWN))) * swayFlutter;
transformed *= leafKeep;
`;

const Breeze = { Still: 0.015, PerWind: 0.07, FlutterStill: 0.0008, FlutterPerWind: 0.003 } as const;

export class CrownSway {
	private readonly time = { value: 0 };
	private readonly strength: { value: number } = { value: Breeze.Still };
	private readonly flutter: { value: number } = { value: Breeze.FlutterStill };

	attach(shader: WebGLProgramParametersWithUniforms, isLeafy: boolean) {
		Object.assign(shader.uniforms, { swayTime: this.time, swayStrength: this.strength, swayFlutter: this.flutter });
		const leafMotion = isLeafy ? LeafVertex : '';
		shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\n' + SwayShape + SwayDeclarations).replace('#include <begin_vertex>', '#include <begin_vertex>\n' + SwayVertex + leafMotion);
	}

	blow(timeSeconds: number, windStrength: number) {
		this.time.value = timeSeconds;
		this.strength.value = Breeze.Still + windStrength * Breeze.PerWind;
		this.flutter.value = Breeze.FlutterStill + windStrength * Breeze.FlutterPerWind;
	}
}
