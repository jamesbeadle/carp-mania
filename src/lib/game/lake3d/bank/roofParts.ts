import { ExtrudeGeometry, Group, Mesh, Shape, Vector2 } from 'three';
import { BuildingLook, surface } from './buildingLook';
import { mergedBoxes, type BoxSpec } from './mergedBoxes';

export interface RoofSpan {
	width: number;
	depth: number;
	rise: number;
	lift: number;
}

const Roof = { Overhang: 0.35, EavesDrop: 0.05, Glossier: 0.7 } as const;
const Trim = { Fascia: 0.18, Board: 0.05, Barge: 0.2, Ridge: 0.14, RidgeWidth: 0.22, Gutter: 0.1 } as const;

function eaves(span: RoofSpan) {
	return { half: span.depth / 2 + Roof.Overhang, length: span.width + Roof.Overhang * 2, bottom: span.lift - Roof.EavesDrop };
}

function roofShell(span: RoofSpan, colour: string, gableColour: string) {
	const { half, length } = eaves(span);
	const profile = new Shape([new Vector2(-half, -Roof.EavesDrop), new Vector2(half, -Roof.EavesDrop), new Vector2(0, span.rise)]);
	const geometry = new ExtrudeGeometry(profile, { depth: length, bevelEnabled: false }).translate(0, 0, -length / 2).rotateY(Math.PI / 2);
	const roof = new Mesh(geometry, [surface(gableColour), surface(colour, Roof.Glossier)]);
	roof.position.setY(span.lift);
	roof.castShadow = true;
	return roof;
}

function bargeBoards(span: RoofSpan) {
	const { half, length } = eaves(span);
	const slope = Math.atan2(span.rise + Roof.EavesDrop, half);
	const boardLength = Math.hypot(half, span.rise + Roof.EavesDrop);
	const middle = span.lift + (span.rise - Roof.EavesDrop) / 2;
	return [-1, 1].flatMap((end) => [-1, 1].map((side): BoxSpec => ({ size: [Trim.Board, Trim.Barge, boardLength], at: [(end * length) / 2, middle, (side * half) / 2], tilt: side * slope })));
}

function roofTrim(span: RoofSpan) {
	const { half, length, bottom } = eaves(span);
	const fascias = [-1, 1].map((side): BoxSpec => ({ size: [length, Trim.Fascia, Trim.Board], at: [0, bottom - Trim.Fascia / 2, side * half] }));
	const ridge: BoxSpec = { size: [length, Trim.Ridge, Trim.RidgeWidth], at: [0, span.lift + span.rise, 0] };
	return [...fascias, ...bargeBoards(span), ridge];
}

function gutters(span: RoofSpan) {
	const { half, length, bottom } = eaves(span);
	return [-1, 1].map((side): BoxSpec => ({ size: [length, Trim.Gutter, Trim.Gutter], at: [0, bottom - Trim.Fascia, side * (half + Trim.Gutter / 2)] }));
}

export function pitchedRoof(span: RoofSpan, colour: string, gableColour = colour) {
	return new Group().add(roofShell(span, colour, gableColour), mergedBoxes(roofTrim(span), surface(BuildingLook.Trim)), mergedBoxes(gutters(span), surface(BuildingLook.Iron, 0.4)));
}
