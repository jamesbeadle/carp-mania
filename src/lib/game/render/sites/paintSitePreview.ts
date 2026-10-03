import type { FacilitySite } from '$lib/domain/layout/facilitySite';
import { paintSite } from './paintSite';
import { paintInSiteFrame } from './siteFrame';

export interface SitePreview {
	site: FacilitySite;
	pixelsPerFoot: number;
}

const PreviewOpacity = 0.85;
const StillPreview = 0;

export function paintSitePreview(context: CanvasRenderingContext2D, preview: SitePreview) {
	context.save();
	context.globalAlpha = PreviewOpacity;
	paintInSiteFrame(context, preview.site, preview.pixelsPerFoot, () => paintSite(context, preview.site, StillPreview));
	context.restore();
}
