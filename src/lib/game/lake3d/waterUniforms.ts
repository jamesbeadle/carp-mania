import { Color, UniformsLib, UniformsUtils, Vector2, Vector3 } from 'three';
import { rippleNormalTexture } from './rippleTexture';
import { sharedGroundNoise } from './terrain/groundTiles';
import { WaterFragmentShader, WaterVertexShader } from './waterShader';

export const WaterLook = { Tint: '#ffffff', Deep: '#2a5446', Shallow: '#4c5436', ClearestPercent: 100, CalmChop: 0.35, WindyChop: 1.1, MaximumReflectionPixels: 1024 } as const;

function shoreUniforms() {
	return { shoreMap: { value: null }, shoreOrigin: { value: new Vector2() }, shoreSize: { value: new Vector2(1, 1) }, shoreBand: { value: 1 }, deepestMetres: { value: 1 }, shallowColour: { value: new Color(WaterLook.Shallow) } };
}

export function waterShader() {
	const own = { time: { value: 0 }, sunDirection: { value: new Vector3(0, 1, 0) }, sunColour: { value: new Color() }, deepColour: { value: new Color(WaterLook.Deep) }, clarity: { value: 0.5 }, daylight: { value: 1 }, ripples: { value: rippleNormalTexture() }, waterNoise: { value: sharedGroundNoise() }, choppiness: { value: WaterLook.CalmChop }, color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null } };
	return { name: 'LakeWater', uniforms: UniformsUtils.merge([UniformsLib.fog, own, shoreUniforms()]), vertexShader: WaterVertexShader, fragmentShader: WaterFragmentShader };
}
