import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry, TorusGeometry } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export const PodSize = { RodSpacing: 0.3, FrontDistance: 0.95, FrontHeight: 0.72, BackHeight: 0.36, BarRadius: 0.011 } as const;
export const AlarmColours = ['#ff3b30', '#3ee83a', '#1f7bff'] as const;
const Alarm = { Width: 0.052, Height: 0.075, Depth: 0.11, Rounding: 0.012, LedRadius: 0.009, Face: 0.004, RestWidth: 0.045, RestRise: 0.012 } as const;
const Hanger = { Radius: 0.015, Height: 0.045, Drop: 0.2, Lift: 0.25, Along: 0.35, Chain: 0.12 } as const;
const PodMetal = new MeshStandardMaterial({ color: '#8d9296', metalness: 0.9, roughness: 0.28 });
const Rubber = new MeshStandardMaterial({ color: '#141414', roughness: 0.8 });
const AlarmShell = new MeshStandardMaterial({ color: '#16181a', roughness: 0.35, metalness: 0.2 });
const Chrome = new MeshStandardMaterial({ color: '#d5dade', metalness: 1, roughness: 0.15 });

export interface AlarmParts {
	group: Group;
	led: MeshStandardMaterial;
	hanger: Group;
	hangerRest: number;
}

export function bar(width: number, height: number, depth: number) {
	const geometry = new CylinderGeometry(PodSize.BarRadius, PodSize.BarRadius, width, 14).rotateZ(Math.PI / 2);
	const mesh = new Mesh(geometry, PodMetal);
	mesh.position.set(0, height, depth);
	return mesh;
}

export function leg(fromHeight: number, depth: number, splay: number) {
	const length = Math.hypot(fromHeight, splay);
	const mesh = new Mesh(new CylinderGeometry(PodSize.BarRadius * 0.8, PodSize.BarRadius * 0.8, length, 10), PodMetal);
	mesh.position.set(0, fromHeight / 2, depth + splay / 2);
	mesh.rotation.set(Math.atan2(splay, fromHeight), 0, 0);
	return mesh;
}

function rodRest() {
	const rest = new Mesh(new TorusGeometry(Alarm.RestWidth / 2, Alarm.RestRise, 8, 16, Math.PI), Rubber);
	rest.rotation.set(0, Math.PI / 2, Math.PI);
	rest.position.setY(Alarm.Height / 2 + Alarm.RestRise);
	return rest;
}

function hangerOn(colour: string) {
	const bobbin = new Mesh(new CylinderGeometry(Hanger.Radius, Hanger.Radius * 0.85, Hanger.Height, 16), new MeshStandardMaterial({ color: colour, roughness: 0.3, emissive: colour, emissiveIntensity: 0.08 }));
	const chain = new Mesh(new CylinderGeometry(0.0015, 0.0015, Hanger.Chain, 4), Chrome);
	chain.position.setY(-Hanger.Chain / 2 - Hanger.Height / 2);
	return new Group().add(bobbin, chain);
}

export function alarm(colour: string, across: number): AlarmParts {
	const body = new Mesh(new RoundedBoxGeometry(Alarm.Width, Alarm.Height, Alarm.Depth, 3, Alarm.Rounding), AlarmShell);
	const face = new Mesh(new RoundedBoxGeometry(Alarm.Width * 0.8, Alarm.Height * 0.55, Alarm.Face, 2, Alarm.Face / 2), Chrome);
	face.position.set(0, -Alarm.Height * 0.12, -Alarm.Depth / 2);
	const led = new MeshStandardMaterial({ color: colour, emissive: colour, emissiveIntensity: 0.4, roughness: 0.2 });
	const lamp = new Mesh(new SphereGeometry(Alarm.LedRadius, 16, 12), led);
	lamp.position.set(0, Alarm.Height * 0.2, -Alarm.Depth / 2);
	const group = new Group().add(body, face, lamp, rodRest());
	group.position.set(across, PodSize.FrontHeight - Alarm.Height / 2, PodSize.FrontDistance);
	const hanger = hangerOn(colour);
	const hangerRest = PodSize.BackHeight - Hanger.Drop + Hanger.Lift;
	hanger.position.set(across, hangerRest, Hanger.Along);
	return { group, led, hanger, hangerRest };
}
