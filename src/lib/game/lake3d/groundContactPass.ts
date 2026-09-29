import { DepthTexture, type Camera, type Scene, type WebGLRenderer, type WebGLRenderTarget } from 'three';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';

const Occlusion = { radius: 2.6, distanceExponent: 2, thickness: 3, scale: 1.5, samples: 16, screenSpaceRadius: false } as const;
const Denoise = { lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 1, samples: 8 } as const;
const PlaceholderPixels = 1;

export class GroundContactPass extends GTAOPass {
	constructor(scene: Scene, camera: Camera) {
		super(scene, camera, PlaceholderPixels, PlaceholderPixels);
		this.setGBuffer(new DepthTexture(PlaceholderPixels, PlaceholderPixels));
		this.updateGtaoMaterial(Occlusion);
		this.updatePdMaterial(Denoise);
	}

	render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget, deltaTime: number, isMaskActive: boolean) {
		const { depthTexture } = readBuffer;
		if (depthTexture && depthTexture !== this.depthTexture) this.setGBuffer(depthTexture);
		super.render(renderer, writeBuffer, readBuffer, deltaTime, isMaskActive);
	}
}
