import type { RandomFraction } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';

export type WoodlandField = (point: WorldPoint) => number;

const Wave = { Second: 1.7, SecondTilt: 0.8, Squash: 0.8, Weight: 0.25, Middle: 0.5 } as const;
const FullTurn = Math.PI * 2;

export function woodlandField(wavelength: number, random: RandomFraction): WoodlandField {
	const phases = [random() * FullTurn, random() * FullTurn, random() * FullTurn];
	const tilt = random() * Math.PI;
	const across = Math.cos(tilt);
	const down = Math.sin(tilt);
	return (point) => {
		const x = point.x * across - point.z * down;
		const z = point.x * down + point.z * across;
		const first = Math.sin(x / wavelength + phases[0]) * Math.cos(z / (wavelength * Wave.Squash) + phases[1]);
		const second = Math.sin((x * Wave.SecondTilt - z) / (wavelength * Wave.Second) + phases[2]);
		return Wave.Middle + (first + second) * Wave.Weight;
	};
}

export interface WoodlandFields {
	density: WoodlandField;
	birch: WoodlandField;
	conifer: WoodlandField;
	pine: WoodlandField;
	poplar: WoodlandField;
	treeLine: WoodlandField;
}

const Wavelengths = { Density: 42, Birch: 26, Conifer: 38, Pine: 60, Poplar: 30, TreeLine: 19 } as const;

export function woodlandFields(random: RandomFraction): WoodlandFields {
	return {
		density: woodlandField(Wavelengths.Density, random),
		birch: woodlandField(Wavelengths.Birch, random),
		conifer: woodlandField(Wavelengths.Conifer, random),
		pine: woodlandField(Wavelengths.Pine, random),
		poplar: woodlandField(Wavelengths.Poplar, random),
		treeLine: woodlandField(Wavelengths.TreeLine, random)
	};
}
