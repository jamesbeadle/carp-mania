import type { SiteSize } from '$lib/domain/groundworks/sites/buildingSizes';
import { SitePalette } from './sitePalette';

const Eaves = { ShadowFeet: 2.4, Rounding: 1 } as const;
const Ridge = { WidthFeet: 0.8 } as const;

export function paintBuilding(context: CanvasRenderingContext2D, size: SiteSize, roofTone: string) {
	const left = -size.widthFeet / 2;
	const top = -size.depthFeet / 2;
	context.fillStyle = SitePalette.Shadow;
	context.beginPath();
	context.roundRect(left + Eaves.ShadowFeet, top + Eaves.ShadowFeet, size.widthFeet, size.depthFeet, Eaves.Rounding);
	context.fill();
	context.fillStyle = roofTone;
	context.beginPath();
	context.roundRect(left, top, size.widthFeet, size.depthFeet, Eaves.Rounding);
	context.fill();
	context.fillStyle = SitePalette.RoofShade;
	context.fillRect(left, 0, size.widthFeet, size.depthFeet / 2);
	context.strokeStyle = SitePalette.Ridge;
	context.lineWidth = Ridge.WidthFeet;
	context.beginPath();
	context.moveTo(left, 0);
	context.lineTo(-left, 0);
	context.stroke();
}
