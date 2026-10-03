import { Group, MeshStandardMaterial } from 'three';
import { carParkPlanFor, ParkingBaySize, type CarParkPlan, type ParkingBay } from '$lib/domain/groundworks/sites/carParkPlan';
import type { CarParkSpec } from '$lib/domain/layout/facilitySite';
import { carsOnATypicalDay } from '../../scene/parkedCars';
import { MetresPerFoot } from '../lakeFrame';
import { block, BuildingLook, surface } from './buildingLook';
import { mergedBoxes, type BoxSpec } from './mergedBoxes';
import { car, CarPaints } from './parkedCar3d';

const Surface = { Height: 0.08, Tarmac: '#3a3d42' } as const;
const Line = { Width: 0.1, Lift: 0.005, Gravel: '#5a4330', Tarmac: '#f2f2ec' } as const;
const Lamp = { Post: 0.12, Height: 5, Head: 0.5, Inset: 1 } as const;
const LampLight = { Colour: '#ffe9b0', Glow: 0.9 } as const;
const HalfTurn = Math.PI;

const metres = (feet: number) => feet * MetresPerFoot;

function bayLines(plan: CarParkPlan): BoxSpec[] {
	const length = metres(ParkingBaySize.LengthFeet);
	const halfWidth = metres(ParkingBaySize.WidthFeet) / 2;
	return plan.bays.flatMap((bay) => [-halfWidth, halfWidth].map((side): BoxSpec => ({ size: [Line.Width, 0.01, length], at: [metres(bay.acrossFeet) + side, Surface.Height + Line.Lift, metres(bay.downFeet)] })));
}

function parkedCar(bay: ParkingBay, index: number) {
	const parked = car(CarPaints[(index * 3) % CarPaints.length]);
	parked.position.set(metres(bay.acrossFeet), Surface.Height, metres(bay.downFeet));
	if (!bay.isFacingDown) parked.rotateY(HalfTurn);
	return parked;
}

function lampPosts(plan: CarParkPlan) {
	const ends = [-1, 1].map((side) => side * (metres(plan.widthFeet) / 2 - Lamp.Inset));
	const spots = plan.aislesDownFeet.flatMap((aisle) => ends.map((across) => [across, metres(aisle)] as const));
	const posts = mergedBoxes(spots.map(([x, z]) => ({ size: [Lamp.Post, Lamp.Height, Lamp.Post], at: [x, Lamp.Height / 2, z] })), surface(BuildingLook.Iron, 0.4));
	const glowing = new MeshStandardMaterial({ color: LampLight.Colour, emissive: LampLight.Colour, emissiveIntensity: LampLight.Glow });
	const heads = mergedBoxes(spots.map(([x, z]) => ({ size: [Lamp.Head, Lamp.Head / 2, Lamp.Head], at: [x, Lamp.Height, z] })), glowing);
	return new Group().add(posts, heads);
}

export function carPark(spec: CarParkSpec) {
	const plan = carParkPlanFor(spec);
	const isTarmac = spec.surface === 'tarmac';
	const pad = block(metres(plan.widthFeet), Surface.Height, metres(plan.depthFeet), isTarmac ? Surface.Tarmac : BuildingLook.Gravel);
	const lines = mergedBoxes(bayLines(plan), surface(isTarmac ? Line.Tarmac : Line.Gravel, 0.6));
	const cars = plan.bays.slice(0, carsOnATypicalDay(spec)).map(parkedCar);
	const park = new Group().add(pad, lines, ...cars);
	if (spec.isLit) park.add(lampPosts(plan));
	return park;
}
