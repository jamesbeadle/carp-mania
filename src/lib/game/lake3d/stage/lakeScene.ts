import { swimPoint } from '$lib/domain/layout/swimRules';
import type { Lake, Swim } from '$lib/domain/types';
import type { StageConditions } from '../../sky/stageConditions';
import { createSwimPegs, type SwimPeg } from '../bank/swimPegs';
import { CameraRig } from '../cameraRig';
import { RoamingFish, type FishToShow } from '../fish/roamingFish';
import { startLakeRenderer, type LakeRenderer } from '../lakeRenderer';
import { bedDepthFor, LakeWorld } from '../lakeWorld';
import { createAimMarker } from './castAim';
import { pickedSwimId, pickedWaterPoint } from './scenePicking';
import { SceneDirector } from './sceneDirector';
import { SceneLighting } from './sceneLighting';
import type { SceneView } from './sceneView';
import { WaterLife } from './waterLife';

export interface LakeScenePlan {
	lake: Lake;
	swims: Swim[];
	fish: FishToShow[];
	conditions: StageConditions;
	isDiorama?: boolean;
}

const LakeSeedStride = 7919;
function seedOf(lakeId: string) {
	return lakeId.length * LakeSeedStride;
}

const Strength = { Thrash: 0.8, CastSplash: 0.4, Swirl: 0.5 } as const;

export class LakeScene {
	readonly world: LakeWorld;
	readonly rig: CameraRig;
	readonly director: SceneDirector;
	readonly aimMarker = createAimMarker();
	private readonly pegs: SwimPeg[];
	private readonly life: WaterLife;
	private readonly roaming: RoamingFish;
	private readonly renderer: LakeRenderer;
	private readonly lighting: SceneLighting;

	constructor(private readonly canvas: HTMLCanvasElement, plan: LakeScenePlan, readView: () => SceneView) {
		const { lake, swims } = plan;
		const layout = lake.layout;
		const { season } = plan.conditions;
		const worldPlan = { layout, plotAcres: Number(lake.plot_acres), transparencyPercent: Number(lake.transparency), season, pegs: swims.map((swim) => swimPoint(swim)), seed: seedOf(lake.id), isDiorama: plan.isDiorama ?? false };
		this.world = new LakeWorld(worldPlan, canvas.clientWidth, canvas.clientHeight);
		this.rig = new CameraRig(this.world.camera);
		const swimPegs = createSwimPegs(swims, this.world.frame);
		this.pegs = swimPegs.pegs;
		this.life = new WaterLife(this.world.frame);
		this.roaming = new RoamingFish(plan.fish, this.world, bedDepthFor(layout));
		this.director = new SceneDirector(this.world, this.rig, swims, this.pegs);
		this.director.listen({ onSplash: (point) => this.life.plop(point, Strength.CastSplash), onThrash: (point) => this.life.plop(point, Strength.Thrash), onSwirl: (point) => this.life.ripple(point, Strength.Swirl) });
		this.world.scene.add(swimPegs.group, this.life.group, this.roaming.group, this.director.group, this.aimMarker.group);
		this.renderer = startLakeRenderer(canvas, this.world.scene, this.world.camera, (secondsElapsed, timeSeconds) => this.frame(readView(), secondsElapsed, timeSeconds), (width, height) => this.world.water.resize(width, height), worldPlan.isDiorama);
		this.lighting = new SceneLighting(this.world, this.renderer);
		this.setConditions(plan.conditions);
	}

	get spot() {
		return this.director.spot;
	}

	get lookTurn() {
		return this.rig.lookTurn;
	}

	get lakeFrame() {
		return this.world.frame;
	}

	setConditions(conditions: StageConditions) {
		this.lighting.light(conditions);
	}

	swimIdAt(clientX: number, clientY: number) {
		return pickedSwimId(this.canvas, this.world.camera, this.pegs.map((peg) => peg.hitTarget), clientX, clientY);
	}

	waterPointAt(clientX: number, clientY: number) {
		return pickedWaterPoint(this.canvas, this.world.camera, clientX, clientY);
	}

	dispose() {
		this.renderer.stop();
	}

	private frame(view: SceneView, secondsElapsed: number, timeSeconds: number) {
		this.world.advance(timeSeconds, secondsElapsed);
		this.director.direct(view, secondsElapsed, timeSeconds);
		this.life.showFishAt(view.showingAt);
		this.life.advance(secondsElapsed);
		this.roaming.advance(secondsElapsed, timeSeconds);
		this.rig.advance(secondsElapsed);
	}
}
