import { LakeScene, type LakeScenePlan } from './lakeScene';
import type { SceneView } from './sceneView';

export class SceneMount {
	scene = $state<LakeScene | null>(null);
	hasDrawn = $state(false);

	get isVeiled() {
		return !this.hasDrawn;
	}

	open(canvas: HTMLCanvasElement, plan: LakeScenePlan, readView: () => SceneView, prepare: (scene: LakeScene) => void = () => {}) {
		let isWanted = true;
		void LakeScene.create(canvas, plan, readView).then((made) => {
			if (!isWanted) return made.dispose();
			prepare(made);
			this.scene = made;
			void made.whenFirstFrameDrawn.then(() => void (this.hasDrawn = isWanted));
		});
		return () => {
			isWanted = false;
			this.scene?.dispose();
			this.scene = null;
			this.hasDrawn = false;
		};
	}
}
