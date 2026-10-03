import { CylinderGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mergedBoxes, type BoxSpec } from './mergedBoxes';

const Car = { Length: 4.3, Width: 1.8, BodyHeight: 0.6, BodyLift: 0.3, CabinLength: 2.2, CabinHeight: 0.52, CabinInset: 0.13, CabinBack: -0.3, Rounding: 0.14, RoofHeight: 0.07 } as const;
const Wheel = { Radius: 0.33, Width: 0.24, FromEnd: 0.8, Hub: 0.55 } as const;
const Lamp = { Width: 0.32, Height: 0.12, Depth: 0.05, FromSide: 0.25, Lift: 0.66 } as const;
export const CarPaints = ['#8a1d1d', '#1d3f8a', '#d9d9d9', '#2a2a2a', '#3f6a3a', '#9a958c', '#3a7a9a'];
const CarLook = { Glass: '#1a232c', Rubber: '#141414', Chrome: '#c9ced2', Headlamp: '#fff6dc', Tail: '#d8261e' } as const;

function rounded(width: number, height: number, depth: number, material: MeshStandardMaterial, lift: number, along = 0) {
	const mesh = new Mesh(new RoundedBoxGeometry(width, height, depth, 3, Car.Rounding), material);
	mesh.position.set(0, lift + height / 2, along);
	mesh.castShadow = true;
	return mesh;
}

function wheels() {
	const spots = [[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([side, end]) => [(side * (Car.Width - Wheel.Width)) / 2, Wheel.Radius, end * (Car.Length / 2 - Wheel.FromEnd)]);
	const tyre = (radius: number, width: number) => mergeGeometries(spots.map(([x, y, z]) => new CylinderGeometry(radius, radius, width, 18).rotateZ(Math.PI / 2).translate(x, y, z)));
	const tyres = new Mesh(tyre(Wheel.Radius, Wheel.Width), new MeshStandardMaterial({ color: CarLook.Rubber, roughness: 0.9 }));
	const hubs = new Mesh(tyre(Wheel.Radius * Wheel.Hub, Wheel.Width + 0.02), new MeshStandardMaterial({ color: CarLook.Chrome, metalness: 0.9, roughness: 0.25 }));
	return [tyres, hubs];
}

function lamps() {
	const pair = (end: number): BoxSpec[] => [-1, 1].map((side) => ({ size: [Lamp.Width, Lamp.Height, Lamp.Depth], at: [side * (Car.Width / 2 - Lamp.FromSide), Lamp.Lift, end * (Car.Length / 2)] }));
	const glowing = (colour: string) => new MeshStandardMaterial({ color: colour, emissive: colour, emissiveIntensity: 0.4 });
	return [mergedBoxes(pair(1), glowing(CarLook.Headlamp)), mergedBoxes(pair(-1), glowing(CarLook.Tail))];
}

export function car(paint: string) {
	const body = new MeshStandardMaterial({ color: paint, metalness: 0.55, roughness: 0.3 });
	const cabinWidth = Car.Width - Car.CabinInset * 2;
	const cabin = rounded(cabinWidth, Car.CabinHeight, Car.CabinLength, new MeshStandardMaterial({ color: CarLook.Glass, metalness: 0.6, roughness: 0.08 }), Car.BodyLift + Car.BodyHeight - 0.04, Car.CabinBack);
	const roof = rounded(cabinWidth - 0.04, Car.RoofHeight, Car.CabinLength * 0.78, body, Car.BodyLift + Car.BodyHeight + Car.CabinHeight - 0.08, Car.CabinBack);
	return new Group().add(rounded(Car.Width, Car.BodyHeight, Car.Length, body, Car.BodyLift), cabin, roof, ...wheels(), ...lamps());
}
