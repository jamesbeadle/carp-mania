import { MathUtils } from 'three';
import type { WorldPoint } from '../lakeFrame';
import { Heights } from '../lakeGround';

const Rolling = { RiseMetres: 260, Height: 9, Wavelength: 160 } as const;
const Ridges = { StartBeyond: 120, FullBeyond: 850, Height: 70, Swell: 0.4, SwellWavelength: 320 } as const;
const EdgeSink = 0.02;
const CornerReach = Math.SQRT2;

function rollingAt(point: WorldPoint) {
	const across = point.x / Rolling.Wavelength;
	const down = point.z / Rolling.Wavelength;
	const wave = Math.sin(across * 1.1 + Math.cos(down * 0.8) * 1.4) * 0.55 + Math.sin(down * 1.3 - across * 0.5) * 0.3 + Math.sin((across - down) * 2.9) * 0.15;
	return wave * 0.5 + 0.5;
}

function ridgeAt(angle: number, radius: number) {
	const ridge = Math.sin(angle * 3 + 1.3) * 0.4 + Math.sin(angle * 7 + 0.4) * 0.35 + Math.sin(angle * 13) * 0.25;
	const swell = 1 - Ridges.Swell + Ridges.Swell * Math.sin(radius / Ridges.SwellWavelength + angle * 2);
	return (ridge * 0.5 + 0.5) * swell;
}

export class CountryShape {
	constructor(readonly edgeHalf: number) {}

	metresBeyond(point: WorldPoint) {
		return Math.max(0, Math.max(Math.abs(point.x), Math.abs(point.z)) - this.edgeHalf);
	}

	isBeyondThePlot(point: WorldPoint) {
		return this.metresBeyond(point) > 0;
	}

	heightAt(point: WorldPoint) {
		const beyond = this.metresBeyond(point);
		const radius = Math.hypot(point.x, point.z);
		const ridgeFrom = this.edgeHalf * CornerReach;
		const rolling = rollingAt(point) * Rolling.Height * MathUtils.smoothstep(beyond, 0, Rolling.RiseMetres);
		const ridge = ridgeAt(Math.atan2(point.z, point.x), radius) * Ridges.Height * MathUtils.smoothstep(radius, ridgeFrom + Ridges.StartBeyond, ridgeFrom + Ridges.FullBeyond);
		return Heights.Bank - EdgeSink + rolling + ridge;
	}
}
