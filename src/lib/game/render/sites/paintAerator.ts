import type { SiteSize } from '$lib/domain/groundworks/sites/buildingSizes';
import { SitePalette } from './sitePalette';

const Splash = { Rings: 3, RingStepFeet: 4, LineFeet: 0.8, SecondsPerRing: 1.6 } as const;

export function paintAerator(context: CanvasRenderingContext2D, size: SiteSize, timeSeconds: number) {
	const radius = size.widthFeet / 2;
	context.strokeStyle = SitePalette.Splash;
	context.lineWidth = Splash.LineFeet;
	for (let ring = 0; ring < Splash.Rings; ring++) {
		const growth = ((timeSeconds / Splash.SecondsPerRing + ring / Splash.Rings) % 1) * Splash.RingStepFeet * Splash.Rings;
		context.globalAlpha = 1 - growth / (Splash.RingStepFeet * Splash.Rings);
		context.beginPath();
		context.arc(0, 0, radius + growth, 0, Math.PI * 2);
		context.stroke();
	}
	context.globalAlpha = 1;
	context.fillStyle = SitePalette.AeratorDeck;
	context.beginPath();
	context.arc(0, 0, radius, 0, Math.PI * 2);
	context.fill();
}
