import { seededRandom } from '$lib/domain/random';
import { moonArcPosition, sunArcPosition, type SkyLook } from './skyPalette';

interface Star {
	across: number;
	up: number;
	size: number;
	twinkleOffset: number;
}

const Stars = { Count: 90, Seed: 1979, LargestRadius: 1.4, TwinkleSpeed: 1.7, SkyFraction: 0.85 } as const;
const Sun = { Radius: 26, GlowRadius: 120, HorizonMargin: 0.08, HighestAt: 0.14, Colour: 'hsl(44 100% 88%)' } as const;
const Moon = { Radius: 18, Colour: 'hsl(48 30% 90%)', ShadowOffset: 7 } as const;
const Glow = { Colour: 'hsla(40 100% 80% / 0.35)', Faded: 'hsla(40 100% 80% / 0)' } as const;

const stars: Star[] = starsFrom(seededRandom(Stars.Seed));

function starsFrom(random: () => number): Star[] {
	return Array.from({ length: Stars.Count }, () => ({ across: random(), up: random() * Stars.SkyFraction, size: 0.4 + random() * (Stars.LargestRadius - 0.4), twinkleOffset: random() * Math.PI * 2 }));
}

export function drawStars(context: CanvasRenderingContext2D, width: number, height: number, alpha: number, timeSeconds: number) {
	if (alpha <= 0) return;
	context.save();
	for (const star of stars) {
		const twinkle = 0.6 + 0.4 * Math.sin(timeSeconds * Stars.TwinkleSpeed + star.twinkleOffset);
		context.globalAlpha = alpha * twinkle;
		context.fillStyle = 'white';
		context.beginPath();
		context.arc(star.across * width, star.up * height, star.size, 0, Math.PI * 2);
		context.fill();
	}
	context.restore();
}

export function drawSunAndMoon(context: CanvasRenderingContext2D, width: number, height: number, hour: number, look: SkyLook) {
	const sun = sunArcPosition(hour);
	if (sun.isUp) drawSun(context, sun.across * width, skyHeightAt(height, sun.altitude));
	const moon = moonArcPosition(hour);
	if (moon.isUp && look.daylight < 1) drawMoon(context, moon.across * width, skyHeightAt(height, moon.altitude), 1 - look.daylight, look.top);
}

function skyHeightAt(height: number, altitude: number) {
	const horizon = height * (1 - Sun.HorizonMargin);
	return horizon - altitude * (horizon - height * Sun.HighestAt);
}

function drawSun(context: CanvasRenderingContext2D, x: number, y: number) {
	const glow = context.createRadialGradient(x, y, Sun.Radius, x, y, Sun.GlowRadius);
	glow.addColorStop(0, Glow.Colour);
	glow.addColorStop(1, Glow.Faded);
	context.fillStyle = glow;
	context.fillRect(x - Sun.GlowRadius, y - Sun.GlowRadius, Sun.GlowRadius * 2, Sun.GlowRadius * 2);
	context.fillStyle = Sun.Colour;
	context.beginPath();
	context.arc(x, y, Sun.Radius, 0, Math.PI * 2);
	context.fill();
}

function drawMoon(context: CanvasRenderingContext2D, x: number, y: number, alpha: number, skyColour: string) {
	context.save();
	context.globalAlpha = alpha;
	context.fillStyle = Moon.Colour;
	context.beginPath();
	context.arc(x, y, Moon.Radius, 0, Math.PI * 2);
	context.fill();
	context.fillStyle = skyColour;
	context.beginPath();
	context.arc(x - Moon.ShadowOffset, y - Moon.ShadowOffset * 0.4, Moon.Radius, 0, Math.PI * 2);
	context.fill();
	context.restore();
}
