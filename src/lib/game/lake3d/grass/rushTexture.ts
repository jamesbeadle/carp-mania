import { CanvasTexture, SRGBColorSpace } from 'three';
import { seededRandom } from '$lib/domain/random';

const Rushes = { Width: 128, Height: 256, Blades: 26, Seed: 61, Widest: 3.2, HeadShare: 0.3 } as const;
const BladeTones = ['#dbe6c4', '#c8d8aa', '#e9efd8', '#b8c894'];
const HeadTone = '#6b5442';
const Head = { Length: 26, Width: 4.5 } as const;

function drawBlade(context: CanvasRenderingContext2D, random: () => number) {
	const root = Rushes.Width * (0.25 + random() * 0.5);
	const lean = (random() - 0.5) * Rushes.Width * 0.35;
	const top = Rushes.Height * (0.02 + random() * 0.35);
	const width = 1.2 + random() * Rushes.Widest;
	context.fillStyle = BladeTones[Math.floor(random() * BladeTones.length)];
	context.beginPath();
	context.moveTo(root - width / 2, Rushes.Height);
	context.quadraticCurveTo(root + lean * 0.2, (top + Rushes.Height) / 2, root + lean, top);
	context.quadraticCurveTo(root + lean * 0.2 + width / 3, (top + Rushes.Height) / 2, root + width / 2, Rushes.Height);
	context.fill();
	const hasHead = random() < Rushes.HeadShare;
	if (hasHead) drawHead(context, root + lean * 0.75, top + Head.Length);
}

function drawHead(context: CanvasRenderingContext2D, x: number, y: number) {
	context.fillStyle = HeadTone;
	context.beginPath();
	context.ellipse(x, y, Head.Width / 2, Head.Length / 2, 0, 0, Math.PI * 2);
	context.fill();
}

export function rushTexture() {
	const canvas = document.createElement('canvas');
	canvas.width = Rushes.Width;
	canvas.height = Rushes.Height;
	const context = canvas.getContext('2d');
	const random = seededRandom(Rushes.Seed);
	for (let index = 0; context && index < Rushes.Blades; index++) drawBlade(context, random);
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}
