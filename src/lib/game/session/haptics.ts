const BitePattern = [180, 90, 180, 90, 260];
const NetPattern = [60, 40, 60, 40, 220];
const HonourPattern = [90, 60, 90, 60, 90, 60, 320];
const RunPattern = [40];

export function buzzForBite() {
	buzz(BitePattern);
}

export function buzzForTheNet() {
	buzz(NetPattern);
}

export function buzzForAnHonour() {
	buzz(HonourPattern);
}

export function buzzForARun() {
	buzz(RunPattern);
}

function buzz(pattern: number[]) {
	if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
	navigator.vibrate(pattern);
}
