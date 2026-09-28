import type { Material } from 'three';
import { edited, including } from './shaderEdits';

function dimmedSpecular(sheen: string) {
	return `material.specularF90 = ${sheen};\nmaterial.specularColor *= ${sheen};\nmaterial.specularColorBlended *= ${sheen};`;
}

export function withSoftSheen<Shaded extends Material>(material: Shaded, sheen: number) {
	const edits = [including('lights_physical_fragment', dimmedSpecular(sheen.toFixed(3)))];
	material.onBeforeCompile = (shader) => {
		shader.fragmentShader = edited(shader.fragmentShader, edits);
	};
	material.customProgramCacheKey = () => `soft-sheen-${sheen}`;
	return material;
}
