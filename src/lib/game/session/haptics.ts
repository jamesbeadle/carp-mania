const BitePattern = [180, 90, 180, 90, 260];

export function buzzForBite() {
	if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
	navigator.vibrate(BitePattern);
}
