import { CanvasTexture, SRGBColorSpace } from 'three';

const Pad = { Pixels: 128, Veins: 16, NotchWidth: 0.32, Rim: 5 } as const;
const Tones = { Leaf: '#e4efd6', Centre: '#f6faef', Vein: 'rgba(120, 150, 100, 0.55)', Rim: 'rgba(150, 120, 90, 0.6)' } as const;

function padPath(context: CanvasRenderingContext2D, radius: number) {
	const middle = Pad.Pixels / 2;
	context.beginPath();
	context.moveTo(middle, middle);
	context.arc(middle, middle, radius, -Math.PI / 2 + Pad.NotchWidth / 2, (Math.PI * 3) / 2 - Pad.NotchWidth / 2);
	context.closePath();
}

function paintVeins(context: CanvasRenderingContext2D, radius: number) {
	const middle = Pad.Pixels / 2;
	context.strokeStyle = Tones.Vein;
	context.lineWidth = 1.2;
	for (let vein = 0; vein < Pad.Veins; vein++) {
		const angle = -Math.PI / 2 + Pad.NotchWidth + (vein / (Pad.Veins - 1)) * (Math.PI * 2 - Pad.NotchWidth * 2);
		context.beginPath();
		context.moveTo(middle, middle);
		context.lineTo(middle + Math.cos(angle) * radius, middle + Math.sin(angle) * radius);
		context.stroke();
	}
}

export function lilyPadTexture() {
	const canvas = document.createElement('canvas');
	canvas.width = Pad.Pixels;
	canvas.height = Pad.Pixels;
	const context = canvas.getContext('2d');
	const radius = Pad.Pixels / 2 - 2;
	if (context) {
		const middle = Pad.Pixels / 2;
		const shade = context.createRadialGradient(middle, middle, 0, middle, middle, radius);
		shade.addColorStop(0, Tones.Centre);
		shade.addColorStop(1, Tones.Leaf);
		padPath(context, radius);
		context.fillStyle = shade;
		context.fill();
		context.strokeStyle = Tones.Rim;
		context.lineWidth = Pad.Rim;
		context.stroke();
		paintVeins(context, radius - Pad.Rim);
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}
