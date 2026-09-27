import { Group, Vector3 } from 'three';
import { kitFor } from '$lib/domain/tackle/rodSetup';
import type { RodOnBank } from '../../scene/rodState';
import { Heights } from '../lakeGround';
import type { WorldPoint } from '../lakeFrame';
import { castFlightBetween, hasLanded, leadPositionOf, type CastFlight } from './castFlight';
import { createFishingLine, type FishingLine } from './fishingLine';
import type { PodRod } from './podRod';
import { createRodPod } from './rodPod';
import { playFish, restRod, sounderRod } from './rodPoses';

export interface RodOnScreen {
	rod: RodOnBank;
	baitWorld: Vector3 | null;
}

interface RodTrack {
	line: FishingLine;
	flight: CastFlight | null;
	secondsSinceCast: number;
	wasCast: boolean;
}

const Sag = { Resting: 0.9, Flying: 0.1, Fighting: 0.15 } as const;
const LongSinceACast = 99;

export class AnglerSpot {
	readonly group = new Group();
	private rods: PodRod[] = [];
	private tracks: RodTrack[] = [];
	private podAt = new Vector3();
	private heading = 0;
	onSplash: (point: Vector3) => void = () => {};

	place(spot: WorldPoint, heading: number, rods: RodOnBank[]) {
		this.group.clear();
		this.heading = heading;
		const pod = createRodPod(rods.map((rod) => kitFor(rod.setup)));
		this.podAt = new Vector3(spot.x, Heights.Bank, spot.z);
		const podGroup = pod.group;
		podGroup.position.copy(this.podAt);
		podGroup.rotateY(heading);
		this.rods = pod.rods;
		const lines = rods.map(() => createFishingLine());
		this.tracks = lines.map((line) => ({ line, flight: null, secondsSinceCast: LongSinceACast, wasCast: false }));
		this.group.add(podGroup, ...lines.map((line) => line.line));
	}

	show(isShown: boolean) {
		this.group.visible = isShown;
	}

	advance(rods: RodOnScreen[], fishWorld: Vector3 | null, tension: number, secondsElapsed: number, timeSeconds: number) {
		rods.forEach((onScreen, index) => this.advanceRod(index, onScreen, fishWorld, tension, secondsElapsed, timeSeconds));
	}

	private advanceRod(index: number, onScreen: RodOnScreen, fishWorld: Vector3 | null, tension: number, secondsElapsed: number, timeSeconds: number) {
		const podRod = this.rods[index];
		const track = this.tracks[index];
		if (!podRod || !track) return;
		const { rod, baitWorld } = onScreen;
		const phase = rod.phase;
		track.secondsSinceCast += secondsElapsed;
		const tip = podRod.tip.getWorldPosition(new Vector3());
		if (baitWorld && !track.wasCast) this.startFlight(track, tip, baitWorld);
		track.wasCast = baitWorld !== null;
		if (!baitWorld) return (restRod(podRod, track.secondsSinceCast), track.line.hide());
		if (phase === 'fighting' && fishWorld) return (playFish(podRod, this.yawTo(fishWorld), tension), track.line.span(tip, fishWorld, Sag.Fighting));
		if (phase === 'biting') sounderRod(podRod, timeSeconds);
		if (phase !== 'biting') restRod(podRod, track.secondsSinceCast);
		this.drawLine(track, tip, baitWorld, secondsElapsed);
	}

	private startFlight(track: RodTrack, tip: Vector3, bait: Vector3) {
		track.flight = castFlightBetween(tip, bait);
		track.secondsSinceCast = 0;
	}

	private drawLine(track: RodTrack, tip: Vector3, bait: Vector3, secondsElapsed: number) {
		const flight = track.flight;
		if (!flight) return track.line.span(tip, bait, Sag.Resting);
		flight.elapsed += secondsElapsed;
		track.line.span(tip, leadPositionOf(flight), Sag.Flying);
		if (!hasLanded(flight)) return;
		track.flight = null;
		this.onSplash(bait);
	}

	private yawTo(point: Vector3) {
		const pod = this.podAt;
		const turn = Math.atan2(point.x - pod.x, point.z - pod.z) - this.heading;
		return Math.atan2(Math.sin(turn), Math.cos(turn));
	}
}
