import { Group, Vector3 } from 'three';
import { createMatWithFish } from '../bank/unhookingMat';
import { HookedFish } from '../fish/hookedFish';
import { Heights } from '../lakeGround';
import { pointToward } from '../worldGeometry';
import type { FishOnTheLine, FishOnTheMat } from './sceneView';
import type { SwimSpot } from './swimSpots';

const MatBehindMetres = 1.8;
const NearNetSplashSeconds = 1.4;
const SwirlSeconds = 0.7;

export class FightStaging {
	readonly group = new Group();
	private hooked: HookedFish | null = null;
	private mat: Group | null = null;
	private splashClock = 0;
	private swirlClock = 0;
	onThrash: (point: Vector3) => void = () => {};
	onSwirl: (point: Vector3) => void = () => {};

	stageTheFight(fight: FishOnTheLine | null, from: Vector3 | null, spot: SwimSpot | null, secondsElapsed: number, timeSeconds: number) {
		if (!fight || !spot) return this.clearTheFight();
		if (!this.hooked && from) this.hookTheFish(fight, from, spot);
		if (!this.hooked) return;
		this.hooked.advance(fight, secondsElapsed, timeSeconds);
		this.splashClock += secondsElapsed;
		this.swirlClock += secondsElapsed;
		if (this.swirlClock > SwirlSeconds) this.swirl();
		const isThrashing = (this.hooked.isNearTheNet || fight.isRunning) && this.splashClock > NearNetSplashSeconds;
		if (!isThrashing) return;
		this.splashClock = 0;
		this.onThrash(this.hooked.position.clone().setY(0));
	}

	get hookedAt() {
		return this.hooked?.position ?? null;
	}

	stageTheMat(landed: FishOnTheMat | null, spot: SwimSpot | null) {
		if (!landed || !spot) return this.clearTheMat();
		if (this.mat) return;
		this.mat = new Group().add(createMatWithFish(landed.strain, landed.weightLb));
		const place = pointToward(spot.pod, spot.heading + Math.PI, MatBehindMetres);
		this.mat.position.set(place.x, Heights.Bank, place.z);
		this.mat.rotateY(spot.heading);
		this.group.add(this.mat);
	}

	private swirl() {
		this.swirlClock = 0;
		if (this.hooked) this.onSwirl(this.hooked.position.clone().setY(0));
	}

	private hookTheFish(fight: FishOnTheLine, from: Vector3, spot: SwimSpot) {
		this.hooked = new HookedFish(fight.strain, fight.weightLb, from, spot.net);
		this.group.add(this.hooked.body);
		this.onThrash(from);
	}

	private clearTheFight() {
		if (this.hooked) this.group.remove(this.hooked.body);
		this.hooked = null;
	}

	private clearTheMat() {
		if (this.mat) this.group.remove(this.mat);
		this.mat = null;
	}
}
