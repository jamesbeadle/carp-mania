import { ConeGeometry, CylinderGeometry, DoubleSide, Group, Mesh, MeshStandardMaterial } from 'three';
import { BuildingLook, surface } from './buildingLook';
import { mergedBoxes, type BoxSpec } from './mergedBoxes';

const Table = { Length: 1.8, Top: 0.75, TopDepth: 0.75, Seat: 0.45, SeatDepth: 0.28, SeatOut: 0.62, Board: 0.05, Leg: 0.07, LegLean: 0.5, LegFromEnd: 0.3 } as const;
const Bench = { Length: 1.6, Seat: 0.45, Depth: 0.4, Back: 0.5, Board: 0.05, Leg: 0.07 } as const;
const Parasol = { Pole: 0.035, Height: 2.3, Radius: 1.3, Rise: 0.45, Sides: 8 } as const;
const ParasolCloth = ['#f1e6c8', '#2f6a3a', '#b8412e'] as const;

function tableLegs(): BoxSpec[] {
	const length = Math.hypot(Table.Top, Table.SeatOut);
	return [-1, 1].flatMap((end) => [-1, 1].map((side): BoxSpec => ({ size: [Table.Leg, length, Table.Leg], at: [end * (Table.Length / 2 - Table.LegFromEnd), Table.Top / 2, (side * Table.SeatOut) / 2], tilt: -side * Table.LegLean })));
}

export function picnicTable() {
	const top: BoxSpec = { size: [Table.Length, Table.Board, Table.TopDepth], at: [0, Table.Top, 0] };
	const seats = [-1, 1].map((side): BoxSpec => ({ size: [Table.Length, Table.Board, Table.SeatDepth], at: [0, Table.Seat, side * Table.SeatOut] }));
	return mergedBoxes([top, ...seats, ...tableLegs()], surface(BuildingLook.Timber));
}

export function bench() {
	const seat: BoxSpec = { size: [Bench.Length, Bench.Board, Bench.Depth], at: [0, Bench.Seat, 0] };
	const back: BoxSpec = { size: [Bench.Length, Bench.Back, Bench.Board], at: [0, Bench.Seat + Bench.Back / 2, -Bench.Depth / 2], tilt: -0.15 };
	const legs = [-1, 1].map((end): BoxSpec => ({ size: [Bench.Leg, Bench.Seat, Bench.Depth], at: [(end * (Bench.Length - Bench.Leg)) / 2, Bench.Seat / 2, 0] }));
	return mergedBoxes([seat, back, ...legs], surface(BuildingLook.DarkTimber));
}

export function parasol(clothIndex: number) {
	const pole = new Mesh(new CylinderGeometry(Parasol.Pole, Parasol.Pole, Parasol.Height, 8).translate(0, Parasol.Height / 2, 0), surface(BuildingLook.Trim, 0.5));
	const cloth = new Mesh(new ConeGeometry(Parasol.Radius, Parasol.Rise, Parasol.Sides, 1, true).translate(0, Parasol.Height, 0), new MeshStandardMaterial({ color: ParasolCloth[clothIndex % ParasolCloth.length], roughness: 0.8, side: DoubleSide }));
	cloth.castShadow = true;
	return new Group().add(pole, cloth);
}
