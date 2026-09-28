import { paintDot } from '../grass/bladeStroke';
import { pickColour } from '../grass/coverPalette';
import { paintLeaf, pixels, spotInBlob, type BlobSpot, type BushBrush } from './bushBrush';

const Canes = { Count: 9, Width: 2.2, Arch: 0.34, Reach: 0.46 } as const;
const Leaflets = { Clusters: 120, Reach: 0.44, Length: 17, Swing: 0.5, Smallest: 0.7 } as const;
const Blooms = { Clusters: 5, PerCluster: 3, Spread: 5, Radius: 1.7, TopShare: 0.42, OuterFrom: 0.55, Attempts: 40 } as const;
const Trefoil = [{ x: -0.42, y: 0 }, { x: 0, y: -0.3 }, { x: 0.42, y: 0 }];

function paintCane(brush: BushBrush) {
	const { context, size, random, palette } = brush;
	const root = { x: size * (1 / 4 + random() / 2), y: size };
	const tip = spotInBlob(brush, Canes.Reach, 1 / 4);
	const crest = { x: (root.x + tip.x) / 2, y: Math.min(root.y, tip.y) - size * Canes.Arch * random() };
	context.strokeStyle = pickColour(palette.brambleCanes, random);
	context.lineWidth = Canes.Width * pixels(brush);
	context.lineCap = 'round';
	context.beginPath();
	context.moveTo(root.x, root.y);
	context.quadraticCurveTo(crest.x, crest.y, tip.x, tip.y);
	context.stroke();
}

function paintTrefoil(brush: BushBrush, at: BlobSpot) {
	const { random, palette } = brush;
	const length = Leaflets.Length * pixels(brush) * (Leaflets.Smallest + random() * Leaflets.Swing);
	Trefoil.forEach((leaflet) => paintLeaf(brush, { x: at.x + leaflet.x * length, y: at.y + leaflet.y * length, depth: at.depth }, length, palette.brambleLeaves));
}

function sunnyEdgeSpot(brush: BushBrush) {
	const { size } = brush;
	let spot = spotInBlob(brush, Leaflets.Reach, 1 / 4);
	for (let attempt = 0; attempt < Blooms.Attempts; attempt++) {
		if (spot.depth > Blooms.OuterFrom && spot.y < size * Blooms.TopShare) return spot;
		spot = spotInBlob(brush, Leaflets.Reach, 1 / 4);
	}
	return spot;
}

function paintBlooms(brush: BushBrush) {
	const { context, random, palette } = brush;
	const { fruit } = palette;
	if (fruit.length === 0) return;
	for (let cluster = 0; cluster < Blooms.Clusters; cluster++) {
		const centre = sunnyEdgeSpot(brush);
		for (let bloom = 0; bloom < Blooms.PerCluster; bloom++) {
			const at = { x: centre.x + (random() - 1 / 2) * Blooms.Spread * 2 * pixels(brush), y: centre.y + (random() - 1 / 2) * Blooms.Spread * pixels(brush) };
			paintDot(context, at, Blooms.Radius * pixels(brush), pickColour(fruit, random));
		}
	}
}

export function paintBramble(brush: BushBrush, isFlowering: boolean) {
	const { palette } = brush;
	for (let cane = 0; cane < Canes.Count; cane++) paintCane(brush);
	const clusters = Math.round(Leaflets.Clusters * palette.brambleLeafShare);
	for (let cluster = 0; cluster < clusters; cluster++) paintTrefoil(brush, spotInBlob(brush, Leaflets.Reach));
	if (isFlowering) paintBlooms(brush);
}
