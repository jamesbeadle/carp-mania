import { layoutScaleFor } from '$lib/domain/layout/layoutScale';
import type { FacilitySite } from '$lib/domain/layout/facilitySite';
import { toScene } from '../../scene/lakeShape';
import { SceneSize } from '../../scene/palette';

export function scenePixelsPerFootFor(plotAcres: number) {
	const scale = layoutScaleFor(plotAcres);
	return SceneSize.Width / scale.feetAcross;
}

export function paintInSiteFrame(context: CanvasRenderingContext2D, site: FacilitySite, pixelsPerFoot: number, paint: () => void) {
	const centre = toScene(site.centre);
	context.save();
	context.translate(centre.x, centre.y);
	context.rotate(site.rotation);
	context.scale(pixelsPerFoot, pixelsPerFoot);
	paint();
	context.restore();
}
