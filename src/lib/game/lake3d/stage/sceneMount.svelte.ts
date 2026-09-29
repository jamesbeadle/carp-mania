import { LakeScene } from './lakeScene';
import type { LakeScenePlan } from './scenePlan';
import type { SceneView } from './sceneView';

export class SceneMount {
	scene = $state<LakeScene | null>(null);
	hasDrawn = $state(false);

	get isVeiled() {
		return !this.hasDrawn;
	}

	open(canvas: HTMLCanvasElement, plan: LakeScenePlan, readView: () => SceneView, prepare: (scene: LakeScene) => void = () => {}) {
		const abandon = new AbortController();
		const { signal } = abandon;
		const show = (made: LakeScene) => {
			if (signal.aborted) return made.dispose();
			prepare(made);
			this.scene = made;
			void made.whenFirstFrameDrawn.then(() => void (this.hasDrawn = !signal.aborted));
		};
		const unlessAbandoned = (reason: unknown) => {
			if (!signal.aborted) throw reason;
		};
		void LakeScene.create(canvas, plan, readView, signal).then(show, unlessAbandoned);
		return () => {
			abandon.abort();
			this.scene?.dispose();
			this.scene = null;
			this.hasDrawn = false;
		};
	}
}
