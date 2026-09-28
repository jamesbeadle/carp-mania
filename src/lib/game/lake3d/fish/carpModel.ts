import { DoubleSide, Group, Mesh, type MeshStandardMaterial, type Texture } from 'three';
import type { CarpStrain } from '$lib/domain/types';
import { FishPalette } from '../../scene/fishPalette';
import { colourOf } from '../cssColour';
import { carpHead } from './carpHead';
import { carpBodyGeometry, FinOutlines, finGeometry } from './carpShape';
import { carpSkinTexture } from './carpSkin';
import { finRayTexture } from './finTexture';
import { swimmingMaterial, type SwimBeat } from './swimmingMaterial';

const PairedFins = { Splay: 0.5, Out: 0.045 } as const;
const SkinRelief = 1.5;
const skins = new Map<CarpStrain, ReturnType<typeof carpSkinTexture>>();
const Fin = { Roughness: 0.6, Opacity: 0.82 } as const;
let finRays: { upright: Texture; tail: Texture } | null = null;

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

function raysFor() {
	finRays ??= { upright: finRayTexture(), tail: finRayTexture(Math.PI / 2) };
	return finRays;
}

function finMaterialOf(strain: CarpStrain, rays: Texture, beat: SwimBeat) {
	const colours = FishPalette[strain];
	return swimmingMaterial({ color: colourOf(colours.fin), map: rays, roughness: Fin.Roughness, side: DoubleSide, transparent: true, opacity: Fin.Opacity }, beat);
}

export function createCarp(strain: CarpStrain, beat: SwimBeat) {
	const skin = skinFor(strain);
	const rays = raysFor();
	const body = new Mesh(carpBodyGeometry(), swimmingMaterial({ map: skin, bumpMap: skin, bumpScale: SkinRelief, roughness: 0.38, metalness: 0.12 }, beat));
	const finMaterial = finMaterialOf(strain, rays.upright, beat);
	const tail = new Mesh(finGeometry(FinOutlines.tail), finMaterialOf(strain, rays.tail, beat));
	const fins = [FinOutlines.dorsal, FinOutlines.anal].map((outline) => new Mesh(finGeometry(outline), finMaterial));
	const group = new Group();
	group.add(body, tail, ...fins, ...pairedFins(FinOutlines.pectoral, finMaterial), ...pairedFins(FinOutlines.pelvic, finMaterial), carpHead());
	group.traverse((part) => (part.castShadow = true));
	return group;
}
