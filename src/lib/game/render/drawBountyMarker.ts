import type { Swim } from '$lib/domain/types';
import { BankPalette } from '../scene/palette';
import { swimScenePoint } from './drawSwims';

const Marker = { Lift: 30, Radius: 9, Bob: 3, BobsPerSecond: 0.8, Font: 'bold 11px sans-serif' } as const;
const PoundSign = '£';
const FullTurn = Math.PI * 2;

export function drawBountyMarker(context: CanvasRenderingContext2D, swims: Swim[], bountySwimId: string | null, timeSeconds: number) {
	const swim = swims.find((candidate) => candidate.id === bountySwimId);
	if (!swim) return;
	const point = swimScenePoint(swim);
	const { Bob, BobsPerSecond, Radius } = Marker;
	const bob = Math.sin(timeSeconds * FullTurn * BobsPerSecond) * Bob;
	const centre = { x: point.x, y: point.y - Marker.Lift + bob };
	context.save();
	context.fillStyle = BankPalette.BountyMarker;
	context.beginPath();
	context.arc(centre.x, centre.y, Radius, 0, FullTurn);
	context.fill();
	context.fillStyle = BankPalette.BountyMarkerFace;
	context.font = Marker.Font;
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillText(PoundSign, centre.x, centre.y + 1);
	context.restore();
}
