import { isSnag, type LakeLayout } from '$lib/domain/layout/layoutTypes';
import { toScene, type Point } from '../scene/lakeShape';
import { SnagPalette } from '../scene/palette';

const Trunk = { Length: 36, Width: 5, ShadowOffset: 3 } as const;
const Branch = { Length: 14, Width: 2.5 } as const;
const BranchesAlongTrunk = [
	{ fractionAlong: 0.3, angle: 0.75 },
	{ fractionAlong: 0.5, angle: -0.65 },
	{ fractionAlong: 0.72, angle: 1.05 },
	{ fractionAlong: 0.88, angle: -0.5 }
] as const;
const TurnBetweenSnags = 2.4;

export function drawSnags(context: CanvasRenderingContext2D, layout: LakeLayout) {
	layout.features.filter(isSnag).forEach((snag, index) => drawFallenTree(context, toScene(snag.point), index * TurnBetweenSnags));
}

function drawFallenTree(context: CanvasRenderingContext2D, root: Point, angle: number) {
	context.save();
	context.translate(root.x, root.y);
	context.rotate(angle);
	context.lineCap = 'round';
	strokeTrunk(context, SnagPalette.Shadow, Trunk.ShadowOffset);
	strokeTrunk(context, SnagPalette.Trunk, 0);
	context.strokeStyle = SnagPalette.Branch;
	context.lineWidth = Branch.Width;
	for (const branch of BranchesAlongTrunk) strokeBranch(context, branch.fractionAlong, branch.angle);
	context.restore();
}

function strokeTrunk(context: CanvasRenderingContext2D, colour: string, offset: number) {
	context.strokeStyle = colour;
	context.lineWidth = Trunk.Width;
	context.beginPath();
	context.moveTo(-Trunk.Length / 2 + offset, offset);
	context.lineTo(Trunk.Length / 2 + offset, offset);
	context.stroke();
}

function strokeBranch(context: CanvasRenderingContext2D, fractionAlong: number, angle: number) {
	const base = -Trunk.Length / 2 + Trunk.Length * fractionAlong;
	context.beginPath();
	context.moveTo(base, 0);
	context.lineTo(base + Math.cos(angle) * Branch.Length, Math.sin(angle) * Branch.Length);
	context.stroke();
}
