import { Group, type Vector3 } from 'three';
import type { Swim } from '$lib/domain/types';
import type { RodOnBank } from '../../scene/rodState';
import { AnglerSpot } from '../angler/anglerSpot';
import { showPegs, type SwimPeg } from '../bank/swimPegs';
import type { CameraRig, CameraShot } from '../cameraRig';
import { plotReachOf } from '../lakeFrame';
import type { LakeWorld } from '../lakeWorld';
import { FightStaging } from './fightStaging';
import { isLookingOverTheLake, type SceneView } from './sceneView';
import { swimSpotOf, worldOfScenePoint, type SwimSpot } from './swimSpots';

export interface SceneListeners {
	onSplash: (point: Vector3) => void;
	onThrash: (point: Vector3) => void;
	onSwirl: (point: Vector3) => void;
}

function rodIdOf(rod: RodOnBank) {
	const { setup } = rod;
	return setup.rod;
}

function placementKeyOf(swimId: string | null, rods: RodOnBank[]) {
	return `${swimId}:${rods.map(rodIdOf).join(',')}`;
}

export class SceneDirector {
	readonly group = new Group();
	spot: SwimSpot | null = null;
	private readonly angler = new AnglerSpot();
	private readonly staging = new FightStaging();
	private placedFor = '';

	constructor(private readonly world: LakeWorld, private readonly rig: CameraRig, private readonly swims: Swim[], private readonly pegs: SwimPeg[]) {
		this.group.add(this.angler.group, this.staging.group);
	}

	listen(listeners: SceneListeners) {
		this.angler.onSplash = listeners.onSplash;
		this.staging.onThrash = listeners.onThrash;
		this.staging.onSwirl = listeners.onSwirl;
	}

	direct(view: SceneView, secondsElapsed: number, timeSeconds: number) {
		const { fight, rods } = view;
		const isOverview = isLookingOverTheLake(view);
		const reach = plotReachOf(this.world.frame);
		this.settleTheSwim(view.swimId, rods);
		showPegs(this.pegs, { chosenId: view.swimId, hoveredId: view.hoveredSwimId, areLabelsShown: isOverview, viewReach: isOverview ? reach : 0 });
		this.angler.show(!isOverview);
		this.world.facilityLabels.forEach((label) => (label.visible = isOverview));
		const baits = rods.map((rod) => (rod.baitPoint ? worldOfScenePoint(this.world.frame, rod.baitPoint) : null));
		const fightingFrom = fight ? (baits[fight.rodIndex] ?? null) : null;
		this.staging.stageTheFight(fight, fightingFrom, this.spot, secondsElapsed, timeSeconds);
		this.staging.stageTheMat(view.landed, this.spot);
		const hookedAt = this.staging.hookedAt;
		this.angler.advance(rods.map((rod, index) => ({ rod, baitWorld: baits[index] })), hookedAt, fight?.tension ?? 0, secondsElapsed, timeSeconds);
		this.rig.frame(this.shotFor(view, hookedAt, reach));
	}

	private settleTheSwim(swimId: string | null, rods: RodOnBank[]) {
		const swim = this.swims.find((candidate) => candidate.id === swimId);
		const placement = placementKeyOf(swimId, rods);
		if (!swim || rods.length === 0 || placement === this.placedFor) return;
		this.placedFor = placement;
		this.spot = swimSpotOf(swim, this.world.frame, this.world);
		this.angler.place(this.spot.pod, this.spot.heading, rods);
	}

	private shotFor(view: SceneView, hookedAt: Vector3 | null, reach: number): CameraShot {
		if (isLookingOverTheLake(view) || !this.spot) return { kind: 'overview', reach };
		const { pod, heading } = this.spot;
		if (view.landed) return { kind: 'mat', swim: pod, heading };
		if (hookedAt) return { kind: 'follow', swim: pod, heading, target: hookedAt.clone().setY(0) };
		return { kind: 'bank', swim: pod, heading };
	}
}
