import type { StageConditions } from '../../sky/stageConditions';
import { createSwimPegs, type SwimPeg } from '../bank/swimPegs';
import { CameraRig } from '../cameraRig';
import { RoamingFish } from '../fish/roamingFish';
import { startLakeRenderer, type LakeRenderer } from '../lakeRenderer';
import { bedDepthFor, type LakeWorld } from '../lakeWorld';
import { buildLakeWorld } from '../lakeWorldBuild';
import { createAimMarker } from './castAim';
import { pickedSwimId, pickedWaterPoint } from './scenePicking';
import { SceneDirector } from './sceneDirector';
import { SceneLighting } from './sceneLighting';
import { worldPlanOf, type LakeScenePlan } from './scenePlan';
import type { SceneView } from './sceneView';
import { WaterLife } from './waterLife';

export type { LakeScenePlan } from './scenePlan';

const Strength = { Thrash: 0.8, CastSplash: 0.4, Swirl: 0.5 } as const;

export class LakeScene {
	readonly rig: CameraRig;
	readonly director: SceneDirector;
	readonly aimMarker = createAimMarker();
	readonly whenFirstFrameDrawn: Promise<void>;
	private readonly pegs: SwimPeg[];
	private readonly life: WaterLife;
	private readonly roaming: RoamingFish;
	private readonly renderer: LakeRenderer;
	private readonly lighting: SceneLighting;

	static async create(canvas: HTMLCanvasElement, plan: LakeScenePlan, readView: () => SceneView) {
		const world = await buildLakeWorld(worldPlanOf(plan), canvas.clientWidth, canvas.clientHeight);
		return new LakeScene(canvas, world, plan, readView);
	}

	private constructor(private readonly canvas: HTMLCanvasElement, readonly world: LakeWorld, plan: LakeScenePlan, readView: () => SceneView) {
		const { lake, swims } = plan;
		this.rig = new CameraRig(world.camera);
		const swimPegs = createSwimPegs(swims, world.frame, world);
		this.pegs = swimPegs.pegs;
		this.life = new WaterLife(world.frame);
		this.roaming = new RoamingFish(plan.fish, world, bedDepthFor(lake.layout));
		this.director = new SceneDirector(world, this.rig, swims, this.pegs);
		this.director.listen({ onSplash: (point) => this.life.plop(point, Strength.CastSplash), onThrash: (point) => this.life.plop(point, Strength.Thrash), onSwirl: (point) => this.life.ripple(point, Strength.Swirl) });
		world.scene.add(swimPegs.group, this.life.group, this.roaming.group, this.director.group, this.aimMarker.group);
		this.renderer = startLakeRenderer(canvas, world.scene, world.camera, (secondsElapsed, timeSeconds) => this.frame(readView(), secondsElapsed, timeSeconds), (width, height) => world.water.resize(width, height), plan.isDiorama ?? false);
		this.whenFirstFrameDrawn = this.renderer.whenFirstFrameDrawn;
		this.lighting = new SceneLighting(world, this.renderer);
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
		this.world.sky.followSight(this.rig.sightline);
	}
}
