const PortraitPhoneQuery = '(orientation: portrait) and (max-width: 1023px)';
const LandscapePhoneQuery = '(orientation: landscape) and (max-height: 500px)';

export type DeckPlacement = 'below' | 'beside' | 'none';

export class Orientation {
	isPortraitPhone = $state(false);
	isLandscapePhone = $state(false);

	get deckPlacement(): DeckPlacement {
		if (this.isPortraitPhone) return 'below';
		if (this.isLandscapePhone) return 'beside';
		return 'none';
	}

	watch() {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
		const portrait = window.matchMedia(PortraitPhoneQuery);
		const landscape = window.matchMedia(LandscapePhoneQuery);
		const follow = () => {
			this.isPortraitPhone = portrait.matches;
			this.isLandscapePhone = landscape.matches;
		};
		follow();
		portrait.addEventListener('change', follow);
		landscape.addEventListener('change', follow);
		return () => {
			portrait.removeEventListener('change', follow);
			landscape.removeEventListener('change', follow);
		};
	}
}
