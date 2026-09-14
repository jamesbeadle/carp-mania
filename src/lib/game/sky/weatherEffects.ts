import type { StageConditions } from './stageConditions';

interface Raindrop {
	across: number;
	up: number;
	speed: number;
	length: number;
}

const Rain = { DropCount: 140, SlowestPerSecond: 1.1, FastestPerSecond: 1.7, ShortestLength: 10, LongestLength: 20, Slant: 0.18, Colour: 'hsla(210 40% 85% / 0.35)', LineWidth: 1 } as const;
const Mist = { Colour: 'hsla(210 20% 92% / 0.42)', Faded: 'hsla(210 20% 92% / 0)', FromFraction: 0.45, LiftsFrom: 7, GoneBy: 10, GathersFrom: 19.5, BackBy: 21.5 } as const;
const Heat = { Colour: 'hsla(36 90% 70% / 0.14)', Faded: 'hsla(36 90% 70% / 0)' } as const;
const Overcast = { Veil: 'hsla(215 15% 70% / 0.28)' } as const;

export function createRain(): Raindrop[] {
	return Array.from({ length: Rain.DropCount }, () => ({ across: Math.random(), up: Math.random(), speed: Rain.SlowestPerSecond + Math.random() * (Rain.FastestPerSecond - Rain.SlowestPerSecond), length: Rain.ShortestLength + Math.random() * (Rain.LongestLength - Rain.ShortestLength) }));
}

export function fallRain(drops: Raindrop[], windStrength: number, secondsElapsed: number) {
	for (const drop of drops) {
		drop.up += drop.speed * secondsElapsed;
		drop.across += Rain.Slant * windStrength * secondsElapsed;
		if (drop.up > 1) {
			drop.up = -0.05;
			drop.across = Math.random();
		}
		if (drop.across > 1) drop.across -= 1;
	}
}

export function drawWeather(context: CanvasRenderingContext2D, width: number, height: number, conditions: StageConditions, drops: Raindrop[]) {
	const { weather, hour } = conditions;
	if (weather.kind === 'rain') return drawRain(context, width, height, weather.windStrength, drops);
	if (weather.kind === 'mist') return drawMist(context, width, height, mistStrengthAt(hour));
	if (weather.kind === 'heat') return drawHeatHaze(context, width, height);
	if (weather.kind === 'overcast') return drawOvercastVeil(context, width, height);
}

export function mistStrengthAt(hour: number) {
	if (hour < Mist.LiftsFrom || hour >= Mist.BackBy) return 1;
	if (hour < Mist.GoneBy) return 1 - (hour - Mist.LiftsFrom) / (Mist.GoneBy - Mist.LiftsFrom);
	if (hour < Mist.GathersFrom) return 0;
	return (hour - Mist.GathersFrom) / (Mist.BackBy - Mist.GathersFrom);
}

function drawRain(context: CanvasRenderingContext2D, width: number, height: number, windStrength: number, drops: Raindrop[]) {
	drawOvercastVeil(context, width, height);
	context.save();
	context.strokeStyle = Rain.Colour;
	context.lineWidth = Rain.LineWidth;
	context.beginPath();
	for (const drop of drops) {
		const x = drop.across * width;
		const y = drop.up * height;
		context.moveTo(x, y);
		context.lineTo(x - Rain.Slant * windStrength * drop.length * 3, y - drop.length);
	}
	context.stroke();
	context.restore();
}

function drawMist(context: CanvasRenderingContext2D, width: number, height: number, strength: number) {
	if (strength <= 0) return;
	const fog = context.createLinearGradient(0, height * Mist.FromFraction, 0, height);
	fog.addColorStop(0, Mist.Faded);
	fog.addColorStop(1, Mist.Colour);
	context.save();
	context.globalAlpha = strength;
	context.fillStyle = fog;
	context.fillRect(0, 0, width, height);
	context.restore();
}

function drawHeatHaze(context: CanvasRenderingContext2D, width: number, height: number) {
	const haze = context.createLinearGradient(0, 0, 0, height);
	haze.addColorStop(0, Heat.Colour);
	haze.addColorStop(1, Heat.Faded);
	context.fillStyle = haze;
	context.fillRect(0, 0, width, height);
}

function drawOvercastVeil(context: CanvasRenderingContext2D, width: number, height: number) {
	context.fillStyle = Overcast.Veil;
	context.fillRect(0, 0, width, height);
}
