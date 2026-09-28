export interface PixelRegion {
	left: number;
	top: number;
	width: number;
	height: number;
}

export interface Tone {
	lightness: number;
	warmth: number;
}

const Channel = { Most: 255, WarmthRed: 0.1, WarmthBlue: 0.22 } as const;
const LeafShape = { Widest: 0.4, ShadedHalf: 0.88, LitHalf: 1.12 } as const;
const Rib = { Darkening: 0.72, Width: 0.12 } as const;

function toneStyle(tone: Tone) {
	const channel = (value: number) => Math.round(Math.min(1, Math.max(0, value)) * Channel.Most);
	const { lightness, warmth } = tone;
	return `rgb(${channel(lightness * (1 + warmth * Channel.WarmthRed))},${channel(lightness)},${channel(lightness * (1 - warmth * Channel.WarmthBlue))})`;
}

export class AtlasPainter {
	constructor(
		private readonly colour: CanvasRenderingContext2D,
		private readonly mask: CanvasRenderingContext2D
	) {
		mask.fillStyle = 'white';
		mask.strokeStyle = 'white';
		mask.lineCap = 'round';
		colour.lineCap = 'round';
	}

	leaf(x: number, y: number, angle: number, length: number, width: number, tone: Tone) {
		this.leafShape(this.mask, x, y, angle, length, width, true);
		this.colour.fillStyle = toneStyle({ ...tone, lightness: tone.lightness * LeafShape.ShadedHalf });
		this.leafShape(this.colour, x, y, angle, length, width, true);
		this.colour.fillStyle = toneStyle({ ...tone, lightness: tone.lightness * LeafShape.LitHalf });
		this.leafShape(this.colour, x, y, angle, length, width, false);
		this.colour.strokeStyle = toneStyle({ ...tone, lightness: tone.lightness * Rib.Darkening });
		this.colour.lineWidth = Math.max(1, width * Rib.Width);
		this.colour.beginPath();
		this.colour.moveTo(x, y);
		this.colour.lineTo(x + Math.cos(angle) * length * Rib.Darkening, y + Math.sin(angle) * length * Rib.Darkening);
		this.colour.stroke();
	}

	stroke(points: [number, number][], width: number, tone: Tone) {
		this.colour.strokeStyle = toneStyle(tone);
		[this.colour, this.mask].forEach((context) => {
			context.lineWidth = width;
			context.beginPath();
			points.forEach(([x, y], index) => (index === 0 ? context.moveTo(x, y) : context.lineTo(x, y)));
			context.stroke();
		});
	}

	private leafShape(context: CanvasRenderingContext2D, x: number, y: number, angle: number, length: number, width: number, isWhole: boolean) {
		context.save();
		context.translate(x, y);
		context.rotate(angle);
		context.beginPath();
		context.moveTo(0, 0);
		context.quadraticCurveTo(length * LeafShape.Widest, -width, length, 0);
		context.quadraticCurveTo(length * LeafShape.Widest, isWhole ? width : 0, 0, 0);
		context.fill();
		context.restore();
	}
}
