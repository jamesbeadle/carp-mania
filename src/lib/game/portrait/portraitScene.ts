export const PortraitCanvas = { Size: 120, Centre: 60 } as const;

export const SceneColours = {
	SkyTop: '#0f2a3a',
	SkyLow: '#3d6f73',
	Water: '#173c3f',
	WaterGlint: '#5ee3ff',
	Reeds: '#203a21',
	Ink: '#141914',
	Lips: '#9a4a3a',
	Zip: '#0c0f0c',
	Shade: '#000000'
} as const;

export function backdrop() {
	return `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SceneColours.SkyTop}"/><stop offset="1" stop-color="${SceneColours.SkyLow}"/></linearGradient></defs>
<rect width="120" height="120" fill="url(#sky)"/>
<rect y="78" width="120" height="42" fill="${SceneColours.Water}"/>
<path d="M8 86h18M84 92h24M30 100h14" stroke="${SceneColours.WaterGlint}" stroke-opacity=".35" stroke-width="1.5" stroke-linecap="round"/>
<path d="M0 80c4-14 6-20 8-22M6 80c1-10 3-16 6-20M110 80c1-12 4-18 8-22M114 80c2-8 3-12 6-14" stroke="${SceneColours.Reeds}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
}

export function shoulders(jacketColour: string, skinColour: string) {
	return `<rect x="52" y="64" width="16" height="22" rx="5" fill="${skinColour}"/>
<rect x="52" y="64" width="16" height="10" fill="${SceneColours.Shade}" opacity=".12"/>
<path d="M16 120c2-22 18-34 44-34s42 12 44 34Z" fill="${jacketColour}"/>
<path d="M44 88l16 12 16-12" fill="none" stroke="${SceneColours.Shade}" stroke-opacity=".25" stroke-width="3"/>
<path d="M60 100v20" stroke="${SceneColours.Zip}" stroke-opacity=".55" stroke-width="2"/>`;
}

export function face(skinColour: string, hairColour: string) {
	return `<ellipse cx="42" cy="56" rx="4" ry="6" fill="${skinColour}"/><ellipse cx="78" cy="56" rx="4" ry="6" fill="${skinColour}"/>
<ellipse cx="60" cy="54" rx="18" ry="21" fill="${skinColour}"/>
<path d="M49 48h7M64 48h7" stroke="${hairColour}" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="53" cy="54" r="2.2" fill="${SceneColours.Ink}"/><circle cx="67" cy="54" r="2.2" fill="${SceneColours.Ink}"/>
<path d="M60 56l-2.5 7h5" fill="none" stroke="${SceneColours.Shade}" stroke-opacity=".3" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M54 67c3 3 9 3 12 0" fill="none" stroke="${SceneColours.Lips}" stroke-width="2" stroke-linecap="round"/>`;
}
