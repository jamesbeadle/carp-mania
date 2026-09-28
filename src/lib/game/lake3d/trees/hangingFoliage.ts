import { Vector3 } from 'three';
import { clumpShading, writeClump, type FoliageContext } from './clumpFoliage';
import { AtlasRegions } from './foliageAtlas';
import type { GeometryWriter } from './geometryWriter';
import { writeCard, writeStrip } from './leafCards';
import { deviate, UpAxis } from './limbPaths';
import type { LeafSite } from './treeSkeleton';

const Curtain = { Strands: 2, TopClumpCards: 2, Floor: 0.05, ShortestHang: 0.45, HangRange: 0.5, Width: 0.034, Steps: 4, Drift: 0.12, Bulge: 0.04, Turn: 0.7, Scatter: 0.5 } as const;
const CurtainLight = { Outward: 0.75, Up: 0.35, Lowest: 0.5 } as const;
const Spray = { BaseBehind: 0.3, Roll: 0.45 } as const;

function outwardOf(point: Vector3) {
	const flat = new Vector3(point.x, 0, point.z);
	return flat.lengthSq() > 0 ? flat.normalize() : new Vector3(1, 0, 0);
}

function hangPath(top: Vector3, outward: Vector3, hang: number) {
	return Array.from({ length: Curtain.Steps + 1 }, (_, step) => {
		const share = step / Curtain.Steps;
		const drift = hang * (Curtain.Drift * share + Curtain.Bulge * Math.sin(Math.PI * share));
		return top.clone().addScaledVector(UpAxis, -hang * share).addScaledVector(outward, drift);
	});
}

export function writeCurtain(writer: GeometryWriter, site: LeafSite, context: FoliageContext) {
	const { random, volume, style } = context;
	writeClump(writer, site, { ...context, cards: Math.max(1, Math.round(Curtain.TopClumpCards * context.cards / style.cards)) });
	const strands = Math.max(1, Math.round((Curtain.Strands * context.cards) / style.cards));
	for (let strand = 0; strand < strands; strand++) {
		const top = site.at.clone().add(new Vector3(random() - 0.5, 0, random() - 0.5).multiplyScalar(style.clumpRadius * Curtain.Scatter));
		const outward = outwardOf(top);
		const hang = Math.max(0, top.y - Curtain.Floor) * (Curtain.ShortestHang + random() * Curtain.HangRange);
		const facing = outward.clone().applyAxisAngle(UpAxis, (random() - 0.5) * Curtain.Turn * 2);
		const across = new Vector3().crossVectors(UpAxis, facing).multiplyScalar(Curtain.Width * context.growth);
		const tint = context.tint();
		const normal = outward.clone().multiplyScalar(CurtainLight.Outward).addScaledVector(UpAxis, CurtainLight.Up).normalize();
		const shade = (position: Vector3) => ({ normal, colour: tint.clone().multiplyScalar(CurtainLight.Lowest + (1 - CurtainLight.Lowest) * Math.min(1, position.y / volume.top)) });
		writeStrip(writer, { path: hangPath(top, outward, hang), across, region: AtlasRegions[style.region], order: random() }, shade);
	}
}

export function writeSpray(writer: GeometryWriter, site: LeafSite, context: FoliageContext) {
	const { random, style } = context;
	const direction = site.heading.clone().addScaledVector(UpAxis, style.upward).normalize();
	const length = site.reach * style.clumpRadius * context.growth;
	const centre = site.at.clone().addScaledVector(direction, length * (0.5 - Spray.BaseBehind));
	const tint = context.tint();
	for (let card = 0; card < context.cards; card++) {
		const roll = (card / context.cards) * Math.PI + (random() - 0.5) * Spray.Roll;
		const across = deviate(direction, Math.PI / 2, roll).multiplyScalar((length * style.cardSize) / 2);
		const down = direction.clone().multiplyScalar(-length / 2);
		const normal = new Vector3().crossVectors(direction, across).normalize();
		writeCard(writer, { centre, across, down, region: AtlasRegions[style.region], order: random(), spin: null }, clumpShading(context, centre, length, normal, tint));
	}
}
