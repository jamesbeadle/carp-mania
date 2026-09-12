const TickMilliseconds = 5000;

export class StageClock {
	now = $state(new Date());

	start() {
		const ticking = setInterval(() => (this.now = new Date()), TickMilliseconds);
		return () => clearInterval(ticking);
	}
}
