import { CylinderGeometry, Group, Mesh, MeshBasicMaterial, RingGeometry, MathUtils } from 'three';
import type { WorldPoint } from '../lakeFrame';
import { pointToward } from '../worldGeometry';

export const AimLook = { Clear: '#3ee83a', Blocked: '#ff5f5a' } as const;
const Pull = { FullPowerShareOfHeight: 0.38, MostAimRadians: 0.9, AimPerShareOfWidth: 1.6, LeastPower: 0.06 } as const;
const Marker = { Inner: 0.9, Outer: 1.25, BeamHeight: 5, BeamRadius: 0.05, Lift: 0.05 } as const;
const PowerCycleSeconds = 1.6;

export interface Aim {
	power: number;
	turn: number;
}

export function aimFromPull(acrossPixels: number, downPixels: number, width: number, height: number): Aim {
	const power = MathUtils.clamp(downPixels / (height * Pull.FullPowerShareOfHeight), 0, 1);
	const turn = MathUtils.clamp((acrossPixels / width) * Pull.AimPerShareOfWidth, -Pull.MostAimRadians, Pull.MostAimRadians);
	return { power, turn };
}

export function powerAfterHolding(seconds: number) {
	const phase = (seconds % PowerCycleSeconds) / PowerCycleSeconds;
	return 1 - Math.abs(phase * 2 - 1);
}

export function isWorthCasting(aim: Aim) {
	return aim.power >= Pull.LeastPower;
}

export function aimedLanding(peg: WorldPoint, heading: number, aim: Aim, reachMetres: number) {
	return pointToward(peg, heading + aim.turn, reachMetres * aim.power);
}

export function createAimMarker() {
	const material = new MeshBasicMaterial({ color: AimLook.Clear, transparent: true, opacity: 0.9, depthWrite: false });
	const ring = new Mesh(new RingGeometry(Marker.Inner, Marker.Outer, 40), material);
	ring.rotateX(-Math.PI / 2);
	ring.position.setY(Marker.Lift);
	const beam = new Mesh(new CylinderGeometry(Marker.BeamRadius, Marker.BeamRadius, Marker.BeamHeight, 6), material);
	beam.position.setY(Marker.BeamHeight / 2);
	const group = new Group().add(ring, beam);
	group.visible = false;
	return { group, show: (point: WorldPoint | null, isClear: boolean) => showMarker(group, material, point, isClear) };
}

function showMarker(group: Group, material: MeshBasicMaterial, point: WorldPoint | null, isClear: boolean) {
	group.visible = point !== null;
	if (!point) return;
	group.position.set(point.x, 0, point.z);
	material.color.set(isClear ? AimLook.Clear : AimLook.Blocked);
}
