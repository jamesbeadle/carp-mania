import { DepthTexture, HalfFloatType, Vector2, WebGLRenderTarget, type Camera, type Scene, type WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GradeShader } from './gradeShaders';
import { GroundContactPass } from './groundContactPass';
import { renderQuality } from './renderQuality';

const Bloom = { Strength: 0.32, Radius: 0.35, Threshold: 1.8 } as const;

export class PostEffects {
	private readonly composer: EffectComposer;
	private readonly contact: GroundContactPass | null = null;

	constructor(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
		const quality = renderQuality();
		const target = new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples: quality.multisamples, depthTexture: new DepthTexture(1, 1) });
		this.composer = new EffectComposer(renderer, target);
		this.composer.addPass(new RenderPass(scene, camera));
		if (quality.hasAmbientOcclusion) this.contact = new GroundContactPass(scene, camera);
		if (this.contact) this.composer.addPass(this.contact);
		if (quality.hasBloom) this.composer.addPass(new UnrealBloomPass(new Vector2(1, 1), Bloom.Strength, Bloom.Radius, Bloom.Threshold));
		this.composer.addPass(new OutputPass());
		this.composer.addPass(new ShaderPass(GradeShader));
	}

	resize(width: number, height: number, pixelRatio: number) {
		this.composer.setPixelRatio(pixelRatio);
		this.composer.setSize(width, height);
		this.contact?.setSize(width, height);
	}

	render() {
		this.composer.render();
	}
}
