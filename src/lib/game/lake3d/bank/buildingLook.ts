import { Mesh, MeshStandardMaterial } from 'three';
import { finishTexture, type Finish } from './buildingTextures';
import { scaledBox } from './scaledBox';

export const BuildingLook = { Timber: '#6e4d31', DarkTimber: '#4a3322', Render: '#d6cbb6', Slate: '#3b4046', Tile: '#8a4a32', GreenRoof: '#3d5a34', Brick: '#7a4a3a', Gravel: '#8f8575', Door: '#2b3a2e', Sign: '#3ee83a', Trim: '#ece6da', Iron: '#2a2c2e' } as const;

const FinishOf: Partial<Record<string, Finish>> = { [BuildingLook.Timber]: 'boards', [BuildingLook.DarkTimber]: 'boards', [BuildingLook.Render]: 'render', [BuildingLook.Slate]: 'tiles', [BuildingLook.Tile]: 'tiles', [BuildingLook.GreenRoof]: 'tiles', [BuildingLook.Gravel]: 'gravel', [BuildingLook.Brick]: 'bricks' };
const materials = new Map<string, MeshStandardMaterial>();
const Matt = 0.85;

export function surface(colour: string, roughness = Matt) {
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
