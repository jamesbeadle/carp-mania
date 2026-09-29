import type { ShoreEdge } from './shoreRings';

export interface CellGrid {
	originX: number;
	originZ: number;
	across: number;
	down: number;
	cellMetres: number;
	edgesIn: number[][];
	stepsToAnEdge: Uint16Array;
}

const Unreached = 65535;
const Neighbours = [-1, 0, 1];

function boundsOf(edges: ShoreEdge[], margin: number) {
	const xs = edges.map((edge) => edge.startX);
	const zs = edges.map((edge) => edge.startZ);
	return { originX: Math.min(...xs) - margin, originZ: Math.min(...zs) - margin, farX: Math.max(...xs) + margin, farZ: Math.max(...zs) + margin };
}

function fileEdge(grid: CellGrid, edge: ShoreEdge, id: number) {
	const firstColumn = Math.floor((Math.min(edge.startX, edge.startX + edge.spanX) - grid.originX) / grid.cellMetres);
	const lastColumn = Math.floor((Math.max(edge.startX, edge.startX + edge.spanX) - grid.originX) / grid.cellMetres);
	const firstRow = Math.floor((Math.min(edge.startZ, edge.startZ + edge.spanZ) - grid.originZ) / grid.cellMetres);
	const lastRow = Math.floor((Math.max(edge.startZ, edge.startZ + edge.spanZ) - grid.originZ) / grid.cellMetres);
	for (let row = firstRow; row <= lastRow; row++) {
		for (let column = firstColumn; column <= lastColumn; column++) grid.edgesIn[row * grid.across + column].push(id);
	}
}

function spreadSteps(grid: CellGrid) {
	const steps = grid.stepsToAnEdge;
	let frontier = Array.from(steps.keys()).filter((cell) => steps[cell] === 0);
	for (let step = 1; frontier.length > 0; step++) {
		const unreached = frontier.flatMap((cell) => neighboursOf(grid, cell)).filter((neighbour) => steps[neighbour] === Unreached);
		unreached.forEach((neighbour) => (steps[neighbour] = step));
		frontier = [...new Set(unreached)];
	}
}

function neighboursOf(grid: CellGrid, cell: number) {
	const column = cell % grid.across;
	const row = Math.floor(cell / grid.across);
	const around = Neighbours.flatMap((down) => Neighbours.map((across) => ({ column: column + across, row: row + down })));
	return around.filter((place) => place.column >= 0 && place.row >= 0 && place.column < grid.across && place.row < grid.down).map((place) => place.row * grid.across + place.column);
}

export function cellGridOf(edges: ShoreEdge[], cellMetres: number, margin: number): CellGrid {
	const bounds = boundsOf(edges, margin);
	const across = Math.ceil((bounds.farX - bounds.originX) / cellMetres) + 1;
	const down = Math.ceil((bounds.farZ - bounds.originZ) / cellMetres) + 1;
	const edgesIn = Array.from({ length: across * down }, () => [] as number[]);
	const grid = { originX: bounds.originX, originZ: bounds.originZ, across, down, cellMetres, edgesIn, stepsToAnEdge: new Uint16Array(across * down).fill(Unreached) };
	edges.forEach((edge, id) => fileEdge(grid, edge, id));
	edgesIn.forEach((filed, cell) => (grid.stepsToAnEdge[cell] = filed.length > 0 ? 0 : Unreached));
	spreadSteps(grid);
	return grid;
}
