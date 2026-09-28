import type { WebGLProgramParametersWithUniforms } from 'three';

const SwayDeclarations = `
uniform float swayTime;
uniform float swayStrength;
uniform float swayFlutter;
`;

const SwayVertex = `
#ifdef USE_BATCHING
vec3 swayRoot = batchingMatrix[3].xyz;
#else
vec3 swayRoot = vec3(0.0);
#endif
float swayPhase = swayRoot.x * 0.21 + swayRoot.z * 0.17;
float swayHeight = max(0.0, transformed.y - 0.2);
vec2 swayBend = vec2(sin(swayTime * 1.3 + swayPhase), cos(swayTime * 1.1 + swayPhase * 1.3) * 0.6) * swayStrength * swayHeight * swayHeight;
transformed.xz += swayBend;
`;

const LeafVertex = `
float leafWave = sin(swayTime * 2.3 + swayPhase + dangle * 2.5);
transformed.xz += swayBend * dangle * 2.5 + vec2(leafWave, leafWave * 0.5) * dangle * swayStrength * 0.25;
transformed += objectNormal * sin(swayTime * 7.0 + dot(position, vec3(97.0, 61.0, 83.0))) * swayFlutter;
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
		shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\n' + SwayDeclarations).replace('#include <begin_vertex>', '#include <begin_vertex>\n' + SwayVertex + leafMotion);
	}

	blow(timeSeconds: number, windStrength: number) {
		this.time.value = timeSeconds;
		this.strength.value = Breeze.Still + windStrength * Breeze.PerWind;
		this.flutter.value = Breeze.FlutterStill + windStrength * Breeze.FlutterPerWind;
	}
}
