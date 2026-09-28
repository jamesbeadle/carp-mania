import type { Material } from 'three';

const SwayVertex = `
vec4 swayRoot = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
float swayPhase = swayRoot.x * 0.21 + swayRoot.z * 0.17;
float swayHeight = max(0.0, position.y - swayRoots);
transformed.x += sin(swayTime * 1.3 + swayPhase) * swayStrength * swayHeight * swayHeight;
transformed.z += cos(swayTime * 1.1 + swayPhase * 1.3) * swayStrength * 0.6 * swayHeight * swayHeight;
`;

const Breeze = { Still: 0.02, PerWind: 0.1 } as const;

export class WindSway {
	private readonly time = { value: 0 };
	private readonly strength = { value: 0.06 };

	private readonly roots: { value: number };

	constructor(private readonly give = 1, roots = 0.25) {
		this.roots = { value: roots };
	}

	sway(material: Material) {
		material.onBeforeCompile = (shader) => {
			Object.assign(shader.uniforms, { swayTime: this.time, swayStrength: this.strength, swayRoots: this.roots });
			shader.vertexShader = 'uniform float swayTime;\nuniform float swayStrength;\nuniform float swayRoots;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n' + SwayVertex);
		};
		return material;
	}

	blow(timeSeconds: number, windStrength: number) {
		this.time.value = timeSeconds;
		this.strength.value = (Breeze.Still + windStrength * Breeze.PerWind) * this.give;
	}
}
