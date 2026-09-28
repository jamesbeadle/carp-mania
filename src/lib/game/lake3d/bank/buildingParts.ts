import { ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, Shape, Vector2 } from 'three';
import { finishTexture, type Finish } from './buildingTextures';
import { scaledBox } from './scaledBox';

export const BuildingLook = { Timber: '#6e4d31', DarkTimber: '#4a3322', Render: '#d9d2c3', Slate: '#3b4046', Tile: '#8a4a32', GreenRoof: '#3d5a34', Glass: '#9fc3d6', Gravel: '#8f8575', Door: '#2b1f16', Sign: '#3ee83a', Trim: '#ece6da' } as const;

const materials = new Map<string, MeshStandardMaterial>();
const Pane = { SillShare: 0.35, HeightShare: 0.35, Thickness: 0.08, Proud: 0.03, Widest: 1.4, ShareOfBay: 0.5, Frame: 0.08 } as const;

const FinishOf: Partial<Record<string, Finish>> = { [BuildingLook.Timber]: 'boards', [BuildingLook.DarkTimber]: 'boards', [BuildingLook.Render]: 'render', [BuildingLook.Slate]: 'tiles', [BuildingLook.Tile]: 'tiles', [BuildingLook.GreenRoof]: 'tiles', [BuildingLook.Gravel]: 'gravel' };
const RoofRise = 0.6;
const Roof = { Overhang: 0.35, EavesDrop: 0.05 } as const;

const GlossOf: Partial<Record<string, number>> = { [BuildingLook.Glass]: 0.08 };

export function surface(colour: string, roughness = GlossOf[colour] ?? 0.85) {
	const key = `${colour}:${roughness}`;
	const known = materials.get(key);
	if (known) return known;
	const finish = FinishOf[colour];
	const made = new MeshStandardMaterial({ color: colour, roughness, map: finish ? finishTexture(finish) : null });
	materials.set(key, made);
	return made;
}

export function block(width: number, height: number, depth: number, colour: string, lift = 0) {
	const mesh = new Mesh(scaledBox(width, height, depth), surface(colour));
	mesh.position.setY(lift + height / 2);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	return mesh;
}

export function pitchedRoof(width: number, depth: number, rise: number, colour: string, lift: number, gableColour = colour) {
	const halfSpan = depth / 2 + Roof.Overhang;
	const profile = new Shape([new Vector2(-halfSpan, -Roof.EavesDrop), new Vector2(halfSpan, -Roof.EavesDrop), new Vector2(0, rise)]);
	const length = width + Roof.Overhang * 2;
	const geometry = new ExtrudeGeometry(profile, { depth: length, bevelEnabled: false }).translate(0, 0, -length / 2).rotateY(Math.PI / 2);
	const roof = new Mesh(geometry, [surface(gableColour), surface(colour, 0.7)]);
	roof.position.setY(lift);
	roof.castShadow = true;
	return roof;
}

export function windowsAlong(width: number, height: number, depth: number, lift: number, count: number) {
	const row = new Group();
	const pane = Math.min(Pane.Widest, (width / count) * Pane.ShareOfBay);
	for (let index = 0; index < count; index++) {
		const sill = lift + height * Pane.SillShare;
		const across = -width / 2 + (index + 0.5) * (width / count);
		const glassHeight = height * Pane.HeightShare;
		const frame = block(pane + Pane.Frame * 2, glassHeight + Pane.Frame * 2, Pane.Thickness, BuildingLook.Trim, sill - Pane.Frame);
		frame.position.set(across, sill + glassHeight / 2, depth / 2 + Pane.Proud / 2);
		const glass = block(pane, glassHeight, Pane.Thickness, BuildingLook.Glass, sill);
		glass.position.set(across, sill + glassHeight / 2, depth / 2 + Pane.Proud);
		row.add(frame, glass);
	}
	return row;
}

export function house(width: number, depth: number, wallHeight: number, walls: string, roof: string, windows: number) {
	const group = new Group();
	group.add(block(width, wallHeight, depth, walls), pitchedRoof(width, depth, wallHeight * RoofRise, roof, wallHeight, walls), windowsAlong(width, wallHeight, depth, 0, windows));
	const door = block(1, wallHeight * 0.65, 0.1, BuildingLook.Door);
	door.position.setZ(depth / 2 + Pane.Proud);
	return group.add(door);
}
