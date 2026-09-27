import { MeshStandardMaterial, type MeshStandardMaterialParameters } from 'three';

const SwimVertex = `
float tailness = clamp((0.12 - position.z) / 0.68, 0.0, 1.0);
float phase = modelMatrix[3].x * 0.7 + modelMatrix[3].z * 1.3;
transformed.x += sin(position.z * 7.0 - swimTime * swimBeat + phase) * swimSweep * tailness * tailness;
`;
const SwimUniforms = 'uniform float swimTime;\nuniform float swimBeat;\nuniform float swimSweep;\n';

export class SwimBeat {
	private readonly time = { value: 0 };
	private readonly beat: { value: number };
	private readonly sweep: { value: number };

	constructor(beat: number, sweep: number) {
		this.beat = { value: beat };
		this.sweep = { value: sweep };
	}

	at(timeSeconds: number) {
		this.time.value = timeSeconds;
	}

	pace(beat: number, sweep: number) {
		this.beat.value = beat;
		this.sweep.value = sweep;
	}

	uniforms() {
		return { swimTime: this.time, swimBeat: this.beat, swimSweep: this.sweep };
	}
}

export function swimmingMaterial(parameters: MeshStandardMaterialParameters, beat: SwimBeat) {
	const material = new MeshStandardMaterial(parameters);
	material.onBeforeCompile = (shader) => {
		Object.assign(shader.uniforms, beat.uniforms());
		shader.vertexShader = SwimUniforms + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n' + SwimVertex);
	};
	return material;
}

export function swimBeat(beat: number, sweep: number) {
	return new SwimBeat(beat, sweep);
}
