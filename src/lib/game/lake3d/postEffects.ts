import { HalfFloatType, Vector2, WebGLRenderTarget, type Camera, type Scene, type WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GradeShader, VignetteShader } from './gradeShaders';
import { renderQuality } from './renderQuality';

const Bloom = { Strength: 0.28, Radius: 0.5, Threshold: 0.93 } as const;

export class PostEffects {
	private readonly composer: EffectComposer;

	constructor(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
		const quality = renderQuality();
		const target = new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples: quality.multisamples });
		this.composer = new EffectComposer(renderer, target);
		this.composer.addPass(new RenderPass(scene, camera));
		this.composer.addPass(new ShaderPass(GradeShader));
		this.composer.addPass(new OutputPass());
		if (quality.hasBloom) this.composer.addPass(new UnrealBloomPass(new Vector2(1, 1), Bloom.Strength, Bloom.Radius, Bloom.Threshold));
		this.composer.addPass(new ShaderPass(VignetteShader));
	}

	resize(width: number, height: number, pixelRatio: number) {
		this.composer.setPixelRatio(pixelRatio);
		this.composer.setSize(width, height);
	}

	render() {
		this.composer.render();
	}
}
