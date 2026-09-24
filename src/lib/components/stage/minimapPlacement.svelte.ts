const CornerGapPixels = 12;
const NoRoom = 0;

interface Grab {
	pointerId: number;
	x: number;
	y: number;
}

function keptWithin(offset: number, room: number) {
	const furthest = Math.max(room, NoRoom);
	return Math.min(Math.max(offset, NoRoom), furthest);
}

export class MinimapPlacement {
	right = $state(CornerGapPixels);
	bottom = $state(CornerGapPixels);
	isMapShown = $state(true);
	private grab: Grab | null = null;

	pickUp(event: PointerEvent) {
		const handle = event.currentTarget as HTMLElement;
		handle.setPointerCapture(event.pointerId);
		this.grab = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
	}

	carry(event: PointerEvent, panel: HTMLElement) {
		const grab = this.grab;
		if (!grab || grab.pointerId !== event.pointerId) return;
		const stage = panel.offsetParent as HTMLElement | null;
		if (!stage) return;
		const roomAcross = stage.clientWidth - panel.offsetWidth;
		const roomUp = stage.clientHeight - panel.offsetHeight;
		this.right = keptWithin(this.right - (event.clientX - grab.x), roomAcross);
		this.bottom = keptWithin(this.bottom - (event.clientY - grab.y), roomUp);
		this.grab = { ...grab, x: event.clientX, y: event.clientY };
	}

	putDown() {
		this.grab = null;
	}

	toggleMap() {
		this.isMapShown = !this.isMapShown;
	}
}
