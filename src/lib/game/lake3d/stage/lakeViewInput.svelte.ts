import type { CastControl, CastRequest } from './castControl.svelte';
import type { LakeScene } from './lakeScene';

export interface LakeViewHandlers {
	reachFeetToCast: () => number | null;
	onSwimPicked: (swimId: string) => void;
	onCast: (request: CastRequest) => void;
}

const ClickSlopPixels = 6;
const ZoomPerWheelStep = 1.1;
const AimKeys: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, a: -1, d: 1 };
const PowerKey = ' ';

export class LakeViewInput {
	hoveredSwimId = $state<string | null>(null);
	private pressedAt: { x: number; y: number } | null = null;
	private last = { x: 0, y: 0 };
	private isPowerHeld = false;

	constructor(private readonly scene: () => LakeScene | null, private readonly canvas: () => HTMLCanvasElement, private readonly cast: CastControl, private readonly handlers: LakeViewHandlers) {}

	down(event: PointerEvent) {
		this.canvas().setPointerCapture(event.pointerId);
		this.pressedAt = { x: event.clientX, y: event.clientY };
		this.last = { ...this.pressedAt };
		const reachFeet = this.handlers.reachFeetToCast();
		if (reachFeet !== null) this.cast.begin(event.clientX, event.clientY, reachFeet);
	}

	move(event: PointerEvent) {
		const canvas = this.canvas();
		if (this.cast.isAiming) return this.cast.pull(event.clientX, event.clientY, canvas.clientWidth, canvas.clientHeight);
		if (this.pressedAt) this.scene()?.rig.look(event.clientX - this.last.x, event.clientY - this.last.y);
		this.last = { x: event.clientX, y: event.clientY };
		if (!this.pressedAt) this.hoveredSwimId = this.scene()?.swimIdAt(event.clientX, event.clientY) ?? null;
	}

	up(event: PointerEvent) {
		const pressedAt = this.pressedAt;
		this.pressedAt = null;
		if (this.cast.isAiming) return this.finishCast();
		const isClick = pressedAt !== null && Math.hypot(event.clientX - pressedAt.x, event.clientY - pressedAt.y) < ClickSlopPixels;
		if (!isClick) return;
		const swimId = this.scene()?.swimIdAt(event.clientX, event.clientY);
		if (swimId) this.handlers.onSwimPicked(swimId);
	}

	wheel(event: WheelEvent) {
		event.preventDefault();
		this.scene()?.rig.zoomBy(event.deltaY > 0 ? ZoomPerWheelStep : 1 / ZoomPerWheelStep);
	}

	keyDown(event: KeyboardEvent) {
		const reachFeet = this.handlers.reachFeetToCast();
		if (reachFeet === null) return;
		const step = AimKeys[event.key];
		if (step !== undefined) return (event.preventDefault(), this.ensureAiming(reachFeet), this.cast.turnBy(step));
		if (event.key !== PowerKey) return;
		event.preventDefault();
		this.isPowerHeld = true;
	}

	keyUp(event: KeyboardEvent) {
		if (event.key !== PowerKey || !this.isPowerHeld) return;
		this.isPowerHeld = false;
		this.finishCast();
	}

	tick(secondsElapsed: number) {
		const reachFeet = this.handlers.reachFeetToCast();
		if (this.isPowerHeld && reachFeet !== null) this.cast.holdPower(secondsElapsed, reachFeet);
	}

	private ensureAiming(reachFeet: number) {
		if (!this.cast.isAiming) this.cast.begin(0, 0, reachFeet);
	}

	private finishCast() {
		const request = this.cast.release();
		if (request) this.handlers.onCast(request);
	}
}
