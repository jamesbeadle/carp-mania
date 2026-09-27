import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry } from 'three';

export const PodSize = { RodSpacing: 0.3, FrontDistance: 0.95, FrontHeight: 0.72, BackHeight: 0.36, BarRadius: 0.012 } as const;
export const AlarmColours = ['#ff3b30', '#3ee83a', '#1f7bff'] as const;
const Alarm = { Width: 0.05, Height: 0.07, Depth: 0.1, LedRadius: 0.008 } as const;
const Hanger = { Radius: 0.014, Height: 0.045, Drop: 0.2, Lift: 0.25, Along: 0.35 } as const;
const PodMetal = new MeshStandardMaterial({ color: '#1a1c1a', metalness: 0.6, roughness: 0.45 });
const AlarmBody = new MeshStandardMaterial({ color: '#0d0f0d', roughness: 0.5 });

export interface AlarmParts {
	group: Group;
	led: MeshStandardMaterial;
	hanger: Mesh;
	hangerRest: number;
}

export function bar(width: number, height: number, depth: number) {
	const geometry = new CylinderGeometry(PodSize.BarRadius, PodSize.BarRadius, width, 8);
	geometry.rotateZ(Math.PI / 2);
	const mesh = new Mesh(geometry, PodMetal);
	mesh.position.set(0, height, depth);
	return mesh;
}

export function leg(fromHeight: number, depth: number, splay: number) {
	const length = Math.hypot(fromHeight, splay);
	const geometry = new CylinderGeometry(PodSize.BarRadius * 0.8, PodSize.BarRadius * 0.8, length, 6);
	const mesh = new Mesh(geometry, PodMetal);
	mesh.position.set(0, fromHeight / 2, depth + splay / 2);
	mesh.rotation.set(Math.atan2(splay, fromHeight), 0, 0);
	return mesh;
}

export function alarm(colour: string, across: number): AlarmParts {
	const group = new Group();
	const body = new Mesh(new BoxGeometry(Alarm.Width, Alarm.Height, Alarm.Depth), AlarmBody);
	const led = new MeshStandardMaterial({ color: colour, emissive: colour, emissiveIntensity: 0.4 });
	const lamp = new Mesh(new SphereGeometry(Alarm.LedRadius, 10, 8), led);
	lamp.position.set(0, Alarm.Height * 0.15, -Alarm.Depth / 2);
	group.add(body, lamp);
	group.position.set(across, PodSize.FrontHeight - Alarm.Height / 2, PodSize.FrontDistance);
	const hanger = new Mesh(new CylinderGeometry(Hanger.Radius, Hanger.Radius, Hanger.Height, 10), new MeshStandardMaterial({ color: colour, roughness: 0.4 }));
	const hangerRest = PodSize.BackHeight - Hanger.Drop + Hanger.Lift;
	hanger.position.set(across, hangerRest, Hanger.Along);
	return { group, led, hanger, hangerRest };
}
