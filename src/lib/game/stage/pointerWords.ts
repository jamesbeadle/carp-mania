const CoarsePointer = '(pointer: coarse)';

export function isTouchScreen() {
	if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
	return window.matchMedia(CoarsePointer).matches;
}

export function forTheFinger(words: string) {
	return words.replace(/\bClick\b/g, 'Tap').replace(/\bclick\b/g, 'tap');
}

export function pointerWords(words: string) {
	return isTouchScreen() ? forTheFinger(words) : words;
}
