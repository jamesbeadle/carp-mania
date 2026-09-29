import { DepthTexture, HalfFloatType, Vector2, WebGLRenderTarget, type Camera, type Scene, type WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GradedOutputPass } from './gradedOutputPass';
import { GroundContactPass } from './groundContactPass';
import { renderQuality } from './renderQuality';

const Bloom = { Strength: 0.3, Radius: 0.35, Threshold: 2.4 } as const;
const ContactShare = 0.5;

export class PostEffects {
	private readonly composer: EffectComposer;
	private readonly contact: GroundContactPass | null = null;

	constructor(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
		const quality = renderQuality();
		const quadTarget = new WebGLRenderTarget(1, 1, { type: HalfFloatType });
		this.composer = new EffectComposer(renderer, quadTarget);
		const sceneTarget = this.composer.renderTarget2;
		sceneTarget.samples = quality.multisamples;
		sceneTarget.depthTexture = new DepthTexture(1, 1);
		this.composer.addPass(new RenderPass(scene, camera));
		if (quality.hasAmbientOcclusion) this.contact = new GroundContactPass(scene, camera);
		if (this.contact) this.composer.addPass(this.contact);
		if (quality.hasBloom) this.composer.addPass(new UnrealBloomPass(new Vector2(1, 1), Bloom.Strength, Bloom.Radius, Bloom.Threshold));
		this.composer.addPass(new GradedOutputPass());
	}

	resize(width: number, height: number, pixelRatio: number) {
		this.composer.setPixelRatio(pixelRatio);
		this.composer.setSize(width, height);
		this.contact?.setSize(Math.round(width * pixelRatio * ContactShare), Math.round(height * pixelRatio * ContactShare));
	}

	render() {
		this.startFromTheSceneTarget();
		this.composer.render();
	}

	dispose() {
		const { composer } = this;
		composer.passes.forEach((pass) => pass.dispose());
		composer.dispose();
	}

	private startFromTheSceneTarget() {
		const { composer } = this;
		composer.readBuffer = composer.renderTarget2;
		composer.writeBuffer = composer.renderTarget1;
	}
}
