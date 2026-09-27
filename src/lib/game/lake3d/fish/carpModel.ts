import { DoubleSide, Group, Mesh, SphereGeometry, MeshStandardMaterial } from 'three';
import type { CarpStrain } from '$lib/domain/types';
import { FishPalette } from '../../scene/fishPalette';
import { colourOf } from '../cssColour';
import { carpBodyGeometry, FinOutlines, finGeometry } from './carpShape';
import { carpSkinTexture } from './carpSkin';
import { swimmingMaterial, type SwimBeat } from './swimmingMaterial';

const Eye = { Radius: 0.018, Along: 0.4, Up: 0.035, Out: 0.052 } as const;
const PairedFins = { Splay: 0.5, Out: 0.045 } as const;
const skins = new Map<CarpStrain, ReturnType<typeof carpSkinTexture>>();

function skinFor(strain: CarpStrain) {
	const known = skins.get(strain);
	if (known) return known;
	const made = carpSkinTexture(strain);
	skins.set(strain, made);
	return made;
}

function pairedFins(outline: [number, number][], material: MeshStandardMaterial) {
	return [-1, 1].map((side) => {
		const fin = new Mesh(finGeometry(outline), material);
		fin.rotation.set(0, 0, side * PairedFins.Splay);
		fin.position.setX(side * PairedFins.Out);
		return fin;
	});
}

function eyes() {
	const commonCarp = FishPalette.common;
	const material = new MeshStandardMaterial({ color: colourOf(commonCarp.eye), roughness: 0.2 });
	return [-1, 1].map((side) => {
		const eye = new Mesh(new SphereGeometry(Eye.Radius, 10, 8), material);
		eye.position.set(side * Eye.Out, Eye.Up, Eye.Along);
		return eye;
	});
}

export function createCarp(strain: CarpStrain, beat: SwimBeat) {
	const colours = FishPalette[strain];
	const body = new Mesh(carpBodyGeometry(), swimmingMaterial({ map: skinFor(strain), roughness: 0.42, metalness: 0.15 }, beat));
	const finMaterial = swimmingMaterial({ color: colourOf(colours.fin), roughness: 0.7, side: DoubleSide, transparent: true, opacity: 0.92 }, beat);
	const fins = [FinOutlines.tail, FinOutlines.dorsal, FinOutlines.anal].map((outline) => new Mesh(finGeometry(outline), finMaterial));
	const group = new Group();
	group.add(body, ...fins, ...pairedFins(FinOutlines.pectoral, finMaterial), ...pairedFins(FinOutlines.pelvic, finMaterial), ...eyes());
	group.traverse((part) => (part.castShadow = true));
	return group;
}
