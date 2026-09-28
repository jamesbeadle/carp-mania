import { Group } from 'three';
import type { RodKit } from '$lib/domain/tackle/rodSetup';
import { alarm, AlarmColours, bar, leg, PodSize } from './podParts';
import { PodRod } from './podRod';
import { createRod } from './rodModel';

export interface RodPod {
	group: Group;
	rods: PodRod[];
}

const ButtBehindRest = 0.3;
const RestingPitch = -Math.atan2(PodSize.FrontHeight - PodSize.BackHeight, PodSize.FrontDistance);
const BarOverhang = 0.2;
const LegSplay = { Front: 0.15, Back: -0.12 } as const;
const FrontBarDrop = 0.02;

function acrossFor(index: number, count: number) {
	return (index - (count - 1) / 2) * PodSize.RodSpacing;
}

function podRodFor(kit: RodKit, index: number, count: number, group: Group) {
	const across = acrossFor(index, count);
	const model = createRod(kit);
	const rise = Math.sin(-RestingPitch) * ButtBehindRest;
	const back = Math.cos(RestingPitch) * ButtBehindRest;
	const butt = model.group;
	butt.position.set(across, PodSize.BackHeight - rise, -back);
	const parts = alarm(AlarmColours[index % AlarmColours.length], across);
	group.add(model.group, parts.group, parts.hanger);
	const rod = new PodRod(model, parts, RestingPitch);
	rod.pose(RestingPitch);
	return rod;
}

export function createRodPod(kits: RodKit[]): RodPod {
	const group = new Group();
	const width = Math.max(1, kits.length - 1) * PodSize.RodSpacing + BarOverhang * 2;
	group.add(bar(width, PodSize.FrontHeight - FrontBarDrop, PodSize.FrontDistance), bar(width, PodSize.BackHeight, 0));
	group.add(leg(PodSize.FrontHeight, PodSize.FrontDistance, LegSplay.Front), leg(PodSize.BackHeight, 0, LegSplay.Back));
	const rods = kits.map((kit, index) => podRodFor(kit, index, kits.length, group));
	group.traverse((part) => (part.castShadow = true));
	return { group, rods };
}
