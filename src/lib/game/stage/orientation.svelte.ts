const PortraitQuery = '(orientation: portrait)';

export type DeckPlacement = 'below' | 'beside';

export class Orientation {
	isPortrait = $state(true);

	get deckPlacement(): DeckPlacement {
		return this.isPortrait ? 'below' : 'beside';
	}

	watch() {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
		const portrait = window.matchMedia(PortraitQuery);
		const follow = () => {
			this.isPortrait = portrait.matches;
		};
		follow();
		portrait.addEventListener('change', follow);
		return () => portrait.removeEventListener('change', follow);
	}
}
