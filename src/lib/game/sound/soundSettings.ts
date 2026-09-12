export interface SoundSettings {
	isMuted: boolean;
	volume: number;
}

const StorageKey = 'carp-mania.sound';
const Defaults: SoundSettings = { isMuted: false, volume: 0.7 };

export function loadSoundSettings(): SoundSettings {
	try {
		const stored = localStorage.getItem(StorageKey);
		if (!stored) return Defaults;
		const parsed = JSON.parse(stored) as Partial<SoundSettings>;
		return { isMuted: parsed.isMuted === true, volume: typeof parsed.volume === 'number' ? clampVolume(parsed.volume) : Defaults.volume };
	} catch {
		return Defaults;
	}
}

export function saveSoundSettings(settings: SoundSettings) {
	try {
		localStorage.setItem(StorageKey, JSON.stringify(settings));
	} catch {
		return;
	}
}

export function clampVolume(volume: number) {
	return Math.min(1, Math.max(0, volume));
}
