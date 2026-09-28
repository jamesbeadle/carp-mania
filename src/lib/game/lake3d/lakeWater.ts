import { Color, ShapeGeometry, UniformsLib, UniformsUtils, Vector2, Vector3, type Camera, type ShaderMaterial } from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import type { WorldPoint } from './lakeFrame';
import type { Sunlight } from './skyAndLight';
import { renderQuality } from './renderQuality';
import { rippleNormalTexture } from './rippleTexture';
import type { ShoreMap } from './terrain/shoreMap';
import { pushedTowardsLand } from './waterEdge';
import { shapeWithHoles } from './worldShapes';
import { WaterFragmentShader, WaterVertexShader } from './waterShader';

export const WaterLook = { Tint: '#ffffff', Deep: '#1d463f', Shallow: '#5c6440', ClearestPercent: 100, CalmChop: 0.35, WindyChop: 1.1, MaximumReflectionPixels: 1024 } as const;

function shoreUniforms() {
	return { shoreMap: { value: null }, shoreOrigin: { value: new Vector2() }, shoreSize: { value: new Vector2(1, 1) }, shoreBand: { value: 1 }, deepestMetres: { value: 1 }, shallowColour: { value: new Color(WaterLook.Shallow) } };
}

function waterShader() {
	const own = { time: { value: 0 }, sunDirection: { value: new Vector3(0, 1, 0) }, sunColour: { value: new Color() }, deepColour: { value: new Color(WaterLook.Deep) }, clarity: { value: 0.5 }, daylight: { value: 1 }, ripples: { value: rippleNormalTexture() }, choppiness: { value: WaterLook.CalmChop }, color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null } };
	return { name: 'LakeWater', uniforms: UniformsUtils.merge([UniformsLib.fog, own, shoreUniforms()]), vertexShader: WaterVertexShader, fragmentShader: WaterFragmentShader };
}

function reflectionPixels(size: number) {
	return Math.min(WaterLook.MaximumReflectionPixels, Math.round(size * renderQuality().reflectionScale));
}

export class LakeWater {
	readonly mesh: Reflector;
	private readonly uniforms: ShaderMaterial['uniforms'];

	constructor(outline: WorldPoint[], islands: WorldPoint[][], transparencyPercent: number, width: number, height: number) {
		const reachingShape = shapeWithHoles(pushedTowardsLand(outline, false), islands.map((island) => pushedTowardsLand(island, true)));
		this.mesh = new Reflector(new ShapeGeometry(reachingShape), { color: new Color(WaterLook.Tint), textureWidth: reflectionPixels(width), textureHeight: reflectionPixels(height), shader: waterShader() });
		this.mesh.rotateX(-Math.PI / 2);
		const material = this.mesh.material as ShaderMaterial;
		material.fog = true;
		material.transparent = true;
		this.uniforms = material.uniforms;
		const { clarity } = this.uniforms;
		clarity.value = transparencyPercent / WaterLook.ClearestPercent;
	}

	useShoreMap(map: ShoreMap) {
		const { shoreMap, shoreOrigin, shoreSize, shoreBand, deepestMetres } = this.uniforms;
		shoreMap.value = map.texture;
		shoreOrigin.value.copy(map.origin);
		shoreSize.value.copy(map.size);
		shoreBand.value = map.bandMetres;
		deepestMetres.value = map.deepestMetres;
	}

	advance(timeSeconds: number) {
		const { time } = this.uniforms;
		time.value = timeSeconds;
	}

	light(sunlight: Sunlight) {
		const { daylight, sunDirection, sunColour, choppiness } = this.uniforms;
		daylight.value = sunlight.daylight;
		sunDirection.value.copy(sunlight.direction);
		sunColour.value.copy(sunlight.colour);
		choppiness.value = WaterLook.CalmChop + (WaterLook.WindyChop - WaterLook.CalmChop) * sunlight.windStrength;
	}

	keepOutOfTheReflection(camera: Camera, layer: number) {
		this.mesh.getReflectionCamera(camera);
		camera.layers.enable(layer);
	}

	resize(width: number, height: number) {
		this.mesh.getRenderTarget().setSize(reflectionPixels(width), reflectionPixels(height));
	}
}
