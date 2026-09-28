import { Color, ShapeGeometry, UniformsLib, UniformsUtils, Vector3, type Camera, type ShaderMaterial } from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import type { WorldPoint } from './lakeFrame';
import type { Sunlight } from './skyAndLight';
import { renderQuality } from './renderQuality';
import { rippleNormalTexture } from './rippleTexture';
import { shapeWithHoles } from './worldShapes';
import { WaterFragmentShader, WaterVertexShader } from './waterShader';

export const WaterLook = { Tint: '#ffffff', Deep: '#1f4d45', ClearestPercent: 100, CalmChop: 0.35, WindyChop: 1.1, MaximumReflectionPixels: 1024 } as const;

function waterShader() {
	const own = { time: { value: 0 }, sunDirection: { value: new Vector3(0, 1, 0) }, sunColour: { value: new Color() }, deepColour: { value: new Color(WaterLook.Deep) }, clarity: { value: 0.5 }, daylight: { value: 1 }, ripples: { value: rippleNormalTexture() }, choppiness: { value: WaterLook.CalmChop }, color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null } };
	return { name: 'LakeWater', uniforms: UniformsUtils.merge([UniformsLib.fog, own]), vertexShader: WaterVertexShader, fragmentShader: WaterFragmentShader };
}

function reflectionPixels(size: number) {
	return Math.min(WaterLook.MaximumReflectionPixels, Math.round(size * renderQuality().reflectionScale));
}

export class LakeWater {
	readonly mesh: Reflector;
	private readonly uniforms: ShaderMaterial['uniforms'];

	constructor(outline: WorldPoint[], islands: WorldPoint[][], transparencyPercent: number, width: number, height: number) {
		const geometry = new ShapeGeometry(shapeWithHoles(outline, islands));
		this.mesh = new Reflector(geometry, { color: new Color(WaterLook.Tint), textureWidth: reflectionPixels(width), textureHeight: reflectionPixels(height), shader: waterShader() });
		this.mesh.rotateX(-Math.PI / 2);
		const material = this.mesh.material as ShaderMaterial;
		material.fog = true;
		material.transparent = true;
		this.uniforms = material.uniforms;
		const { clarity } = this.uniforms;
		clarity.value = transparencyPercent / WaterLook.ClearestPercent;
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
