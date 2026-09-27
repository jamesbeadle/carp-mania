import { BoxGeometry, ConeGeometry, Group, Mesh, MeshStandardMaterial } from 'three';

export const BuildingLook = { Timber: '#6e4d31', DarkTimber: '#4a3322', Render: '#d9d2c3', Slate: '#3b4046', Tile: '#8a4a32', GreenRoof: '#3d5a34', Glass: '#9fc3d6', Gravel: '#8f8575', Door: '#2b1f16', Sign: '#3ee83a' } as const;

const materials = new Map<string, MeshStandardMaterial>();
const Pane = { SillShare: 0.35, HeightShare: 0.35, Thickness: 0.08, Proud: 0.03, Widest: 1.4, ShareOfBay: 0.5 } as const;

export function surface(colour: string, roughness = 0.85) {
	const key = `${colour}:${roughness}`;
	const known = materials.get(key);
	if (known) return known;
	const made = new MeshStandardMaterial({ color: colour, roughness });
	materials.set(key, made);
	return made;
}

export function block(width: number, height: number, depth: number, colour: string, lift = 0) {
	const mesh = new Mesh(new BoxGeometry(width, height, depth), surface(colour));
	mesh.position.setY(lift + height / 2);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	return mesh;
}

export function pitchedRoof(width: number, depth: number, rise: number, colour: string, lift: number) {
	const roof = new Mesh(new ConeGeometry(1, 1, 4, 1), surface(colour, 0.7));
	roof.scale.set((width / 2) * Math.SQRT2 * 1.08, rise, (depth / 2) * Math.SQRT2 * 1.08);
	roof.rotateY(Math.PI / 4);
	roof.position.setY(lift + rise / 2);
	roof.castShadow = true;
	return roof;
}

export function windowsAlong(width: number, height: number, depth: number, lift: number, count: number) {
	const row = new Group();
	const pane = Math.min(Pane.Widest, (width / count) * Pane.ShareOfBay);
	for (let index = 0; index < count; index++) {
		const sill = lift + height * Pane.SillShare;
		const glass = block(pane, height * Pane.HeightShare, Pane.Thickness, BuildingLook.Glass, sill);
		glass.position.set(-width / 2 + (index + 0.5) * (width / count), sill + (height * Pane.HeightShare) / 2, depth / 2 + Pane.Proud);
		row.add(glass);
	}
	return row;
}

export function house(width: number, depth: number, wallHeight: number, walls: string, roof: string, windows: number) {
	const group = new Group();
	group.add(block(width, wallHeight, depth, walls), pitchedRoof(width, depth, wallHeight * 0.7, roof, wallHeight), windowsAlong(width, wallHeight, depth, 0, windows));
	const door = block(1, wallHeight * 0.65, 0.1, BuildingLook.Door);
	door.position.setZ(depth / 2 + Pane.Proud);
	return group.add(door);
}
