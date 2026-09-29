import type { DirectionalLight, Material, Mesh, Object3D, Scene, ShaderMaterial, Texture } from 'three';

function isTexture(value: unknown): value is Texture {
	return (value as Texture)?.isTexture === true;
}

function texturesOf(material: Material) {
	const { uniforms } = material as ShaderMaterial;
	const inUniforms = Object.values(uniforms ?? {}).map((uniform) => uniform.value);
	return [...Object.values(material), ...inUniforms].filter(isTexture);
}

function disposeMaterial(material: Material) {
	texturesOf(material).forEach((texture) => texture.dispose());
	material.dispose();
}

function disposeObject(object: Object3D) {
	const drawn = object as Mesh;
	const light = object as DirectionalLight;
	if (drawn.geometry) drawn.geometry.dispose();
	if (drawn.material) [drawn.material].flat().forEach(disposeMaterial);
	if (light.isLight && light.shadow) light.shadow.dispose();
}

export function disposeWorldOf(scene: Scene) {
	scene.traverse(disposeObject);
	scene.environment?.dispose();
	scene.clear();
}
