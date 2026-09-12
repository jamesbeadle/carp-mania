import { seededRandom } from '$lib/domain/random';

interface Puff {
	offsetX: number;
	offsetY: number;
	radius: number;
}

interface Cloud {
	across: number;
	up: number;
	scale: number;
	puffs: Puff[];
}

const Clouds = { Count: 7, Seed: 404, PuffsEach: 4, BaseRadius: 28, DriftPerSecond: 0.004, WindDriftPerSecond: 0.02, SkyFraction: 0.5, WrapMargin: 0.2 } as const;
const CloudColour = { Day: 'hsla(0 0% 100% / 0.85)', Night: 'hsla(225 30% 40% / 0.6)', Storm: 'hsla(220 15% 62% / 0.9)' } as const;

export function createClouds(): Cloud[] {
	const random = seededRandom(Clouds.Seed);
	return Array.from({ length: Clouds.Count }, () => ({
		across: random() * (1 + Clouds.WrapMargin * 2) - Clouds.WrapMargin,
		up: random() * Clouds.SkyFraction,
		scale: 0.6 + random() * 0.9,
		puffs: Array.from({ length: Clouds.PuffsEach }, (_, index) => ({ offsetX: (index - 1.5) * 0.7, offsetY: (random() - 0.5) * 0.5, radius: 0.7 + random() * 0.6 }))
	}));
}

export function driftClouds(clouds: Cloud[], windStrength: number, secondsElapsed: number) {
	const drift = (Clouds.DriftPerSecond + windStrength * Clouds.WindDriftPerSecond) * secondsElapsed;
	for (const cloud of clouds) {
		cloud.across += drift * cloud.scale;
		if (cloud.across > 1 + Clouds.WrapMargin) cloud.across = -Clouds.WrapMargin;
	}
}

export function drawClouds(context: CanvasRenderingContext2D, width: number, height: number, clouds: Cloud[], cover: number, daylight: number, isStormy: boolean) {
	const visibleCount = Math.round(cover * clouds.length);
	if (visibleCount === 0) return;
	context.save();
	context.fillStyle = cloudColourFor(daylight, isStormy);
	for (const cloud of clouds.slice(0, visibleCount)) drawCloud(context, cloud, width, height);
	context.restore();
}

function cloudColourFor(daylight: number, isStormy: boolean) {
	if (isStormy) return CloudColour.Storm;
	return daylight > 0.5 ? CloudColour.Day : CloudColour.Night;
}

function drawCloud(context: CanvasRenderingContext2D, cloud: Cloud, width: number, height: number) {
	const radius = Clouds.BaseRadius * cloud.scale;
	const centreX = cloud.across * width;
	const centreY = cloud.up * height;
	context.beginPath();
	for (const puff of cloud.puffs) {
		context.moveTo(centreX + puff.offsetX * radius + puff.radius * radius, centreY + puff.offsetY * radius);
		context.arc(centreX + puff.offsetX * radius, centreY + puff.offsetY * radius, puff.radius * radius, 0, Math.PI * 2);
	}
	context.fill();
}
