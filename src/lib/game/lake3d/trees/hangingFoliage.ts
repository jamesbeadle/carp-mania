import { Vector3 } from 'three';
import { writeClump, type FoliageContext } from './clumpFoliage';
import { AtlasRegions } from './foliageAtlas';
import type { GeometryWriter } from './geometryWriter';
import { writeStrip } from './leafCards';
import { centredRandom } from './centredRandom';
import { UpAxis } from './limbPaths';
import type { LeafSite } from './treeSkeleton';

const Curtain = { Strands: 4, TopClumpCards: 3, Floor: 0.03, ShortestHang: 0.5, HangRange: 0.45, HalfWidth: 0.02, Steps: 4, Drift: 0.12, Bulge: 0.04, Scatter: 0.7 } as const;
const CurtainLight = { Outward: 0.75, Up: 0.35, Lowest: 0.5 } as const;

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
		const top = site.at.clone().add(new Vector3(centredRandom(random), 0, centredRandom(random)).multiplyScalar(style.clumpRadius * Curtain.Scatter));
		const outward = outwardOf(top);
		const hang = Math.max(0, top.y - Curtain.Floor) * (Curtain.ShortestHang + random() * Curtain.HangRange);
		const tint = context.tint();
		const normal = outward.clone().multiplyScalar(CurtainLight.Outward).addScaledVector(UpAxis, CurtainLight.Up).normalize();
		const shade = (position: Vector3) => ({ normal, colour: tint.clone().multiplyScalar(CurtainLight.Lowest + (1 - CurtainLight.Lowest) * Math.min(1, position.y / volume.top)) });
		writeStrip(writer, { path: hangPath(top, outward, hang), halfWidth: Curtain.HalfWidth * context.growth, region: AtlasRegions[style.region], order: random() }, shade);
	}
}
