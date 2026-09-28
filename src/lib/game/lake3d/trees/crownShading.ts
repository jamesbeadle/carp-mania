import { Color, Vector3 } from 'three';
import type { LeafSite } from './treeSkeleton';

export interface CrownVolume {
	centre: Vector3;
	radii: Vector3;
	bottom: number;
	top: number;
}

const Blend = { Crown: 0.55, Clump: 0.3, Card: 0.15 } as const;
const Occlusion = { Innermost: 0.2, OuterStart: 0.2, OuterEnd: 1.05, Lowest: 0.42, ClumpCore: 0.72 } as const;

export function crownVolumeOf(sites: LeafSite[], margin: number): CrownVolume {
	const least = new Vector3(Infinity, Infinity, Infinity);
	const most = new Vector3(-Infinity, -Infinity, -Infinity);
	sites.forEach((site) => {
		least.min(site.at);
		most.max(site.at);
	});
	least.subScalar(margin);
	most.addScalar(margin);
	const centre = least.clone().add(most).divideScalar(2);
	const radii = most.clone().sub(least).divideScalar(2).max(new Vector3(margin, margin, margin));
	return { centre, radii, bottom: least.y, top: most.y };
}

function relativeTo(volume: CrownVolume, position: Vector3) {
	return position.clone().sub(volume.centre).divide(volume.radii);
}

export function crownNormal(volume: CrownVolume, position: Vector3, clumpCentre: Vector3, cardNormal: Vector3) {
	const outward = relativeTo(volume, position).divide(volume.radii).normalize();
	const fromClump = position.clone().sub(clumpCentre).normalize();
	const facing = cardNormal.dot(outward) < 0 ? cardNormal.clone().negate() : cardNormal.clone();
	return outward.multiplyScalar(Blend.Crown).addScaledVector(fromClump, Blend.Clump).addScaledVector(facing, Blend.Card).normalize();
}

function smoothstep(from: number, to: number, value: number) {
	const share = Math.min(1, Math.max(0, (value - from) / (to - from)));
	return share * share * (3 - 2 * share);
}

export function crownShade(volume: CrownVolume, position: Vector3, clumpCentre: Vector3, clumpRadius: number) {
	const depth = relativeTo(volume, position).length();
	const outer = Occlusion.Innermost + (1 - Occlusion.Innermost) * smoothstep(Occlusion.OuterStart, Occlusion.OuterEnd, depth);
	const heightShare = Math.min(1, Math.max(0, (position.y - volume.bottom) / (volume.top - volume.bottom)));
	const lift = Occlusion.Lowest + (1 - Occlusion.Lowest) * heightShare;
	const clumpShare = Math.min(1, position.distanceTo(clumpCentre) / clumpRadius);
	const clump = Occlusion.ClumpCore + (1 - Occlusion.ClumpCore) * clumpShare;
	return outer * lift * clump;
}

export function shadedColour(tint: Color, shade: number) {
	return tint.clone().multiplyScalar(shade);
}
