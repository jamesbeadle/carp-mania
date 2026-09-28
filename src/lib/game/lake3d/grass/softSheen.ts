import type { Material } from 'three';

const Chunk = '#include <lights_physical_fragment>';

export function withSoftSheen<Shaded extends Material>(material: Shaded, sheen: number) {
	const dimming = `\nmaterial.specularF90 = ${sheen.toFixed(3)};\nmaterial.specularColor *= ${sheen.toFixed(3)};\nmaterial.specularColorBlended *= ${sheen.toFixed(3)};\n`;
	material.onBeforeCompile = (shader) => {
		shader.fragmentShader = shader.fragmentShader.replace(Chunk, Chunk + dimming);
	};
	material.customProgramCacheKey = () => `soft-sheen-${sheen}`;
	return material;
}
