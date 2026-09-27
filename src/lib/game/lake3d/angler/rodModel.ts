import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, Object3D, TorusGeometry } from 'three';
import type { RodKit } from '$lib/domain/tackle/rodSetup';
import type { RodItem } from '$lib/domain/tackle/tackleItem';
import { MetresPerFoot } from '../lakeFrame';
import { rodLookOf, type RodLook } from './kitLooks';
import { createReel } from './reelModel';

const Blank = { Segments: 10, ButtRadius: 0.011, TipRadius: 0.0022, Sides: 8 } as const;
const Grip = { Radius: 0.017, FullLength: 0.85, ShortLength: 0.3, UpperStart: 0.62, UpperLength: 0.2, Sides: 10 } as const;
const Ring = { Largest: 0.03, Smallest: 0.006, Tube: 0.0018, Every: 2, Sides: 6, Around: 14, Drop: 0.01, AlongSegment: 0.9 } as const;
const ReelSeatMetres = 0.5;
const MostBendPerSegment = 0.075;
const BendCurve = 1.5;

export interface RodModel {
	group: Group;
	tip: Object3D;
	bend: (amount: number) => void;
}

function along(geometry: CylinderGeometry, length: number) {
	geometry.rotateX(Math.PI / 2);
	geometry.translate(0, 0, length / 2);
	return geometry;
}

function radiusAt(share: number) {
	return Blank.ButtRadius + (Blank.TipRadius - Blank.ButtRadius) * share;
}

function ringAt(length: number, share: number, look: RodLook) {
	const radius = Ring.Largest + (Ring.Smallest - Ring.Largest) * share;
	const ring = new Mesh(new TorusGeometry(radius, Ring.Tube, Ring.Sides, Ring.Around), new MeshStandardMaterial({ color: look.fitting, metalness: 0.8, roughness: 0.3 }));
	ring.position.set(0, -Ring.Largest * (1 - share) - Ring.Drop, length * Ring.AlongSegment);
	return ring;
}

function blankSegment(index: number, length: number, look: RodLook) {
	const share = index / Blank.Segments;
	const segment = new Group();
	const blank = new MeshStandardMaterial({ color: look.blank, roughness: 1 - look.sheen, metalness: look.sheen * 0.3 });
	segment.add(new Mesh(along(new CylinderGeometry(radiusAt((index + 1) / Blank.Segments), radiusAt(share), length, Blank.Sides), length), blank));
	if (index % Ring.Every === 1) segment.add(ringAt(length, share, look));
	return segment;
}

function grip(length: number, start: number, material: MeshStandardMaterial) {
	const mesh = new Mesh(along(new CylinderGeometry(Grip.Radius, Grip.Radius, length, Grip.Sides), length), material);
	mesh.position.setZ(start);
	return mesh;
}

function grips(rod: RodItem, look: RodLook) {
	const material = new MeshStandardMaterial({ color: look.grip, roughness: 0.9 });
	const stats = rod.rod;
	if (stats.isFullDuplon) return new Group().add(grip(Grip.FullLength, 0, material));
	return new Group().add(grip(Grip.ShortLength, 0, material), grip(Grip.UpperLength, Grip.UpperStart, material));
}

function blankOf(segmentLength: number, look: RodLook, tip: Object3D) {
	const segments = Array.from({ length: Blank.Segments }, (_, index) => blankSegment(index, segmentLength, look));
	segments.forEach((segment, index) => {
		if (index > 0) segment.position.setZ(segmentLength);
		segments[index - 1]?.add(segment);
	});
	tip.position.setZ(segmentLength);
	segments[Blank.Segments - 1].add(tip);
	return segments;
}

export function createRod(kit: RodKit): RodModel {
	const { rod } = kit;
	const look = rodLookOf(rod.brand);
	const stats = rod.rod;
	const tip = new Object3D();
	const segments = blankOf((stats.lengthFeet * MetresPerFoot) / Blank.Segments, look, tip);
	const reel = createReel(kit.reel);
	reel.position.setZ(ReelSeatMetres);
	const group = new Group().add(grips(rod, look), reel, segments[0]);
	const bend = (amount: number) => segments.forEach((segment, index) => segment.rotation.set(amount * MostBendPerSegment * (index / Blank.Segments) ** BendCurve, 0, 0));
	return { group, tip, bend };
}
