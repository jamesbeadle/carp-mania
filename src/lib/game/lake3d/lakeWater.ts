import { Color, LinearMipmapLinearFilter, ShapeGeometry, type Camera, type ShaderMaterial } from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import type { WorldPoint } from './lakeFrame';
import type { Sunlight } from './skyAndLight';
import { renderQuality } from './renderQuality';
import type { ShoreMap } from './terrain/shoreMap';
import { pushedTowardsLand } from './waterEdge';
import { shapeWithHoles } from './worldShapes';
import { WaterLook, waterShader } from './waterUniforms';

const Reflection = { Multisamples: 0, RefreshEveryFrames: 2 } as const;

function reflectionPixels(size: number) {
	return Math.min(WaterLook.MaximumReflectionPixels, Math.round(size * renderQuality().reflectionScale));
}

export class LakeWater {
	readonly mesh: Reflector;
	private readonly uniforms: ShaderMaterial['uniforms'];

	constructor(outline: WorldPoint[], islands: WorldPoint[][], transparencyPercent: number, width: number, height: number) {
		const reachingShape = shapeWithHoles(pushedTowardsLand(outline, false), islands.map((island) => pushedTowardsLand(island, true)));
		this.mesh = new Reflector(new ShapeGeometry(reachingShape), { color: new Color(WaterLook.Tint), textureWidth: reflectionPixels(width), textureHeight: reflectionPixels(height), shader: waterShader(), multisample: Reflection.Multisamples });
		this.mesh.rotateX(-Math.PI / 2);
		this.reflectEveryOtherFrame();
		this.softenTheFarReflection();
		const material = this.mesh.material as ShaderMaterial;
		material.fog = true;
		material.transparent = true;
		this.uniforms = material.uniforms;
		const { clarity } = this.uniforms;
		clarity.value = transparencyPercent / WaterLook.ClearestPercent;
	}

	get clock(): { value: number } {
		return this.uniforms.time;
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

	dispose() {
		this.mesh.dispose();
	}

	private softenTheFarReflection() {
		const reflection = this.mesh.getRenderTarget().texture;
		reflection.generateMipmaps = true;
		reflection.minFilter = LinearMipmapLinearFilter;
	}

	private reflectEveryOtherFrame() {
		const { mesh } = this;
		const reflect = mesh.onBeforeRender;
		let frames = 0;
		mesh.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
			frames += 1;
			const isRestingFrame = frames % Reflection.RefreshEveryFrames !== 0;
			if (isRestingFrame) return;
			reflect.call(mesh, renderer, scene, camera, geometry, material, group);
		};
	}
}
