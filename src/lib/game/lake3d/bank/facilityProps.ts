import { Group, MeshStandardMaterial, type Object3D } from 'three';
import { BuildingLook, surface } from './buildingLook';
import { mergedBoxes } from './mergedBoxes';
import { bench, parasol, picnicTable } from './outdoorFurniture';

const Terrace = { Out: 3.2, Spacing: 3.4 } as const;
const Sign = { Post: 0.1, Height: 2.6, Board: 1.3, BoardHeight: 0.6, Out: 1.8, Across: 2.2 } as const;
const SignBoard = new MeshStandardMaterial({ color: BuildingLook.Sign, roughness: 0.4, emissive: BuildingLook.Sign, emissiveIntensity: 0.12 });

function inFront(item: Object3D, across: number, out: number) {
	item.position.set(across, 0, out);
	return item;
}

function rowOf(count: number, makeOne: (index: number) => Object3D, front: number) {
	return Array.from({ length: count }, (_, index) => inFront(makeOne(index), (index - (count - 1) / 2) * Terrace.Spacing, front + Terrace.Out));
}

export function terrace(front: number, tables: number, hasParasols = false) {
	const parasols = hasParasols ? rowOf(tables, parasol, front) : [];
	return new Group().add(...rowOf(tables, picnicTable, front), ...parasols);
}

export function benchOut(front: number, across: number) {
	return inFront(bench(), across, front + Terrace.Out / 2);
}

export function hangingSign(front: number) {
	const post = mergedBoxes([{ size: [Sign.Post, Sign.Height, Sign.Post], at: [0, Sign.Height / 2, 0] }], surface(BuildingLook.DarkTimber));
	const arm = mergedBoxes([{ size: [Sign.Board + 0.3, Sign.Post, Sign.Post], at: [Sign.Board / 2, Sign.Height - 0.1, 0] }], surface(BuildingLook.DarkTimber));
	const board = mergedBoxes([{ size: [Sign.Board, Sign.BoardHeight, 0.05], at: [Sign.Board / 2 + 0.1, Sign.Height - 0.2 - Sign.BoardHeight / 2, 0] }], SignBoard);
	return inFront(new Group().add(post, arm, board), Sign.Across, front + Sign.Out);
}
