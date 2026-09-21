export type EffectKey = 'reach' | 'landing' | 'forgiveness' | 'retrieve' | 'strength' | 'stealth' | 'hold' | 'presentation' | 'staying_put' | 'appeal' | 'natural' | 'keeps';

export interface ItemEffect {
	key: EffectKey;
	label: string;
	share: number;
	words: string;
}

export const EffectLabels: Record<EffectKey, string> = {
	reach: 'Reach',
	landing: 'Landing power',
	forgiveness: 'Forgiveness',
	retrieve: 'Retrieve',
	strength: 'Strength',
	stealth: 'Stealth',
	hold: 'Hook hold',
	presentation: 'Presentation',
	staying_put: 'Stays put',
	appeal: 'Appeal',
	natural: 'Natural appeal',
	keeps: 'Keeps'
};

export function effect(key: EffectKey, share: number, words: string): ItemEffect {
	return { key, label: EffectLabels[key], share: Math.min(1, Math.max(0, share)), words };
}
