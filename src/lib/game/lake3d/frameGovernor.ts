const Pace = { SlowSeconds: 1 / 30, QuickSeconds: 1 / 50, LongestCountedSeconds: 5 } as const;
const Hold = { WarmUpSeconds: 3, SlowBeforeLoweringSeconds: 1, QuickBeforeRaisingSeconds: 6 } as const;
const Smoothing = 0.1;
const MiddlePace = (Pace.SlowSeconds + Pace.QuickSeconds) / 2;

export const RenderScales = [1, 0.85, 0.7, 0.55, 0.45] as const;
const LowestNotch = RenderScales.length - 1;

export class FrameGovernor {
	private notch = 0;
	private averageSeconds = Pace.QuickSeconds;
	private ageSeconds = 0;
	private slowSeconds = 0;
	private quickSeconds = 0;

	get scale(): number {
		return RenderScales[this.notch];
	}

	note(frameSeconds: number): boolean {
		if (frameSeconds > Pace.LongestCountedSeconds) return false;
		this.ageSeconds += frameSeconds;
		this.averageSeconds += (frameSeconds - this.averageSeconds) * Smoothing;
		if (this.ageSeconds < Hold.WarmUpSeconds) return false;
		const isSlow = this.averageSeconds > Pace.SlowSeconds;
		const isQuick = this.averageSeconds < Pace.QuickSeconds;
		this.slowSeconds = isSlow ? this.slowSeconds + frameSeconds : 0;
		this.quickSeconds = isQuick ? this.quickSeconds + frameSeconds : 0;
		if (this.slowSeconds > Hold.SlowBeforeLoweringSeconds) return this.lower();
		if (this.quickSeconds > Hold.QuickBeforeRaisingSeconds) return this.raise();
		return false;
	}

	private lower() {
		if (this.notch === LowestNotch) return false;
		this.notch += 1;
		return this.settle();
	}

	private raise() {
		if (this.notch === 0) return false;
		this.notch -= 1;
		return this.settle();
	}

	private settle() {
		this.slowSeconds = 0;
		this.quickSeconds = 0;
		this.averageSeconds = MiddlePace;
		return true;
	}
}
