import { BackSide, Color, ShaderMaterial, Vector2, Vector3, type Camera, type Object3D } from 'three';
import { CloudFragment, CloudVertex } from './cloudShader';
import { NearDetailLayer, renderQuality } from './renderQuality';

function isReflectionCamera(camera: Camera) {
	return !camera.layers.isEnabled(NearDetailLayer);
}

export function cloudMaterial() {
	const uniforms = {
		sunDirection: { value: new Vector3(0, 1, 0) },
		litColour: { value: new Color() },
		shadeColour: { value: new Color() },
		hazeColour: { value: new Color() },
		cover: { value: 0 },
		heaviness: { value: 0 },
		veil: { value: 0 },
		reflected: { value: 0 },
		drift: { value: new Vector2() }
	};
	const { cloudOctaves } = renderQuality();
	const shaders = { vertexShader: CloudVertex, fragmentShader: CloudFragment };
	return new ShaderMaterial({ uniforms, defines: { OCTAVES: cloudOctaves }, ...shaders, side: BackSide, transparent: true, depthWrite: false, fog: false });
}

export function fadeInReflections(dome: Object3D, material: ShaderMaterial) {
	const { reflected } = material.uniforms;
	dome.onBeforeRender = (_renderer, _scene, camera) => void (reflected.value = Number(isReflectionCamera(camera)));
}
