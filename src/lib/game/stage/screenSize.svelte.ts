const PhoneQuery = '(max-width: 1023px)';

export class ScreenSize {
	isPhone = $state(false);

	watch() {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
		const query = window.matchMedia(PhoneQuery);
		const follow = () => (this.isPhone = query.matches);
		follow();
		query.addEventListener('change', follow);
		return () => query.removeEventListener('change', follow);
	}
}
