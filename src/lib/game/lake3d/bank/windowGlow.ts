import { MeshStandardMaterial } from 'three';

const Glass = { Colour: '#8fb0c0', Lamplight: '#ffc77a', Roughness: 0.06, Metalness: 0.35 } as const;
const Glow = { Brightest: 2.4, Falloff: 2 } as const;

export const WindowGlass = new MeshStandardMaterial({ color: Glass.Colour, roughness: Glass.Roughness, metalness: Glass.Metalness, emissive: Glass.Lamplight, emissiveIntensity: 0 });

export function lightTheWindows(daylight: number) {
	WindowGlass.emissiveIntensity = Glow.Brightest * (1 - daylight) ** Glow.Falloff;
}
