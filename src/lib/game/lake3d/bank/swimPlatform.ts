import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import { Heights } from '../lakeGround';
import { finishTexture } from './buildingTextures';

export const Platform = { Size: 2.4, Thickness: 0.05, Planks: 7, Gap: 0.025 } as const;
const Bearer = { Size: 0.09, Inset: 0.25 } as const;
const Leg = { Radius: 0.045, Depth: 0.7, Inset: 0.12 } as const;
const Marker = { Size: 0.09, Height: 0.75, Band: 0.12, Cap: 0.13 } as const;
const PlatformLook = { Timber: '#7a5a3a', WeatheredTimber: '#8a7458', Bearer: '#4a3524', Band: '#f2f7f2', Cap: '#3ee83a' } as const;
const PlankShades = [PlatformLook.Timber, PlatformLook.WeatheredTimber];

function timber(colour: string) {
	return new MeshStandardMaterial({ color: colour, map: finishTexture('boards'), roughness: 0.9 });
}

function planks() {
	const width = Platform.Size / Platform.Planks - Platform.Gap;
	const materials = PlankShades.map(timber);
	return Array.from({ length: Platform.Planks }, (_, index) => {
		const plank = new Mesh(new BoxGeometry(width, Platform.Thickness, Platform.Size), materials[index % materials.length]);
		plank.position.set(-Platform.Size / 2 + (index + 0.5) * (Platform.Size / Platform.Planks), Heights.Bank + Platform.Thickness / 2, 0);
		plank.receiveShadow = true;
		return plank;
	});
}

function frameUnderneath() {
	const material = timber(PlatformLook.Bearer);
	const bearers = [-1, 1].map((side) => {
		const bearer = new Mesh(new BoxGeometry(Platform.Size, Bearer.Size, Bearer.Size), material);
		bearer.position.set(0, Heights.Bank - Bearer.Size / 2, side * (Platform.Size / 2 - Bearer.Inset));
		return bearer;
	});
	const legs = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([across, along]) => {
		const leg = new Mesh(new CylinderGeometry(Leg.Radius, Leg.Radius, Leg.Depth, 6), material);
		leg.position.set(across * (Platform.Size / 2 - Leg.Inset), Heights.Bank - Leg.Depth / 2, along * (Platform.Size / 2 - Leg.Inset));
		return leg;
	});
	return [...bearers, ...legs];
}

function pegMarker() {
	const post = new Mesh(new BoxGeometry(Marker.Size, Marker.Height, Marker.Size), timber(PlatformLook.Bearer));
	post.position.setY(Heights.Bank + Marker.Height / 2);
	const band = new Mesh(new BoxGeometry(Marker.Size * 1.05, Marker.Band, Marker.Size * 1.05), new MeshStandardMaterial({ color: PlatformLook.Band, roughness: 0.6 }));
	band.position.setY(Heights.Bank + Marker.Height - Marker.Band);
	const cap = new Mesh(new BoxGeometry(Marker.Cap, Marker.Size / 2, Marker.Cap), new MeshStandardMaterial({ color: PlatformLook.Cap, roughness: 0.5 }));
	cap.position.setY(Heights.Bank + Marker.Height + Marker.Size / 4);
	const marker = new Group().add(post, band, cap);
	marker.position.set(-Platform.Size / 2 - Marker.Size, 0, -Platform.Size / 2);
	return marker;
}

export function swimPlatform(facing: number) {
	const platform = new Group().add(...planks(), ...frameUnderneath(), pegMarker());
	platform.rotateY(facing);
	platform.traverse((part) => (part.castShadow = true));
	return platform;
}
