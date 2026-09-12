import type { Lake } from '$lib/domain/types';

export type SkyOver = Pick<Lake, 'id' | 'region' | 'latitude'>;

export const SomewhereInTheWorld: SkyOver = { id: 'somewhere-in-the-world', region: 'uk_ireland', latitude: 52 };
