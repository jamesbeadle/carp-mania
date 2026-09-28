import { Float32BufferAttribute, PlaneGeometry, Vector3 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Canopy } from './canopies';

interface Lobe {
	centre: Vector3;
	radius: number;
}

const Lobes = { Spread: 0.5, LeastShare: 0.5, ShareRange: 0.25 } as const;
const Shade = { Deepest: 0.4, Outward: 0.4, Upward: 0.22 } as const;
const Lean = { FromLobe: 0.55, FromCrown: 0.45, Up: 0.3 } as const;
const CardSizeSpread = 0.5;
const UpAxis = new Vector3(0, 1, 0);

function randomDirection(random: () => number) {
	return new Vector3(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1).normalize();
}

function lobesOf(canopy: Canopy, random: () => number): Lobe[] {
	return Array.from({ length: canopy.lobes }, (_, index) => {
		const spread = index === 0 ? 0 : canopy.radius * Lobes.Spread * Math.cbrt(random());
		const centre = randomDirection(random).multiplyScalar(spread);
		centre.y *= canopy.stretch;
		return { centre, radius: canopy.radius * (Lobes.LeastShare + random() * Lobes.ShareRange) };
	});
}

function shadeAt(at: Vector3, canopy: Canopy) {
	const outward = Math.min(1, Math.hypot(at.x, at.z) / canopy.radius);
	const upward = Math.min(1, Math.max(-1, at.y / (canopy.radius * canopy.stretch)));
	return Shade.Deepest + Shade.Outward * outward + Shade.Upward * (upward * 0.5 + 0.5);
}

function cardIn(lobe: Lobe, canopy: Canopy, random: () => number) {
	const fromLobe = randomDirection(random);
	const at = fromLobe.clone().multiplyScalar(Math.cbrt(random()) * lobe.radius).add(lobe.centre);
	at.y -= canopy.droop * canopy.radius * (at.x * at.x + at.z * at.z) * 4;
	const size = canopy.cardSize * (1 - CardSizeSpread / 2 + random() * CardSizeSpread);
	const geometry = new PlaneGeometry(size, size).rotateX(random() * Math.PI).rotateY(random() * Math.PI * 2).rotateZ(random() * Math.PI);
	geometry.translate(at.x, at.y + canopy.centre, at.z);
	const normal = fromLobe.multiplyScalar(Lean.FromLobe).addScaledVector(at.clone().normalize(), Lean.FromCrown).addScaledVector(UpAxis, Lean.Up).normalize();
	const shade = shadeAt(at, canopy);
	const count = geometry.getAttribute('position').count;
	geometry.setAttribute('normal', new Float32BufferAttribute(Array.from({ length: count }, () => normal.toArray()).flat(), 3));
	geometry.setAttribute('color', new Float32BufferAttribute(Array.from({ length: count * 3 }, () => shade), 3));
	return geometry;
}

export function crownGeometry(canopy: Canopy, cardShare: number, random: () => number) {
	const lobes = lobesOf(canopy, random);
	const cards = Math.max(lobes.length, Math.round(canopy.cards * cardShare));
	return mergeGeometries(Array.from({ length: cards }, (_, index) => cardIn(lobes[index % lobes.length], canopy, random)));
}
