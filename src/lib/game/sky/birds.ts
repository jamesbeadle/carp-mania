interface Bird {
	offsetX: number;
	offsetY: number;
	flapOffset: number;
}

interface Flock {
	x: number;
	y: number;
	speed: number;
	size: number;
	isFlyingRight: boolean;
	birds: Bird[];
}

export interface Birdlife {
	flocks: Flock[];
	secondsUntilNextFlock: number;
}

const Flocks = { FewestBirds: 3, MostBirds: 7, SlowestSpeed: 45, FastestSpeed: 80, SmallestSize: 4, LargestSize: 7, Spread: 9, SkyFraction: 0.45, SecondsBetween: 9, SecondsJitter: 12 } as const;
const Wing = { FlapSpeed: 8, Lift: 0.55, Colour: 'hsla(230 20% 12% / 0.85)', LineWidth: 1.4 } as const;

export function createBirdlife(): Birdlife {
	return { flocks: [], secondsUntilNextFlock: 2 };
}

export function moveBirds(birdlife: Birdlife, width: number, height: number, daylight: number, secondsElapsed: number) {
	for (const flock of birdlife.flocks) flock.x += (flock.isFlyingRight ? 1 : -1) * flock.speed * secondsElapsed;
	birdlife.flocks = birdlife.flocks.filter((flock) => flock.x > -width * 0.3 && flock.x < width * 1.3);
	birdlife.secondsUntilNextFlock -= secondsElapsed;
	if (birdlife.secondsUntilNextFlock > 0 || daylight < 0.4) return;
	birdlife.flocks.push(spawnFlock(width, height));
	birdlife.secondsUntilNextFlock = Flocks.SecondsBetween + Math.random() * Flocks.SecondsJitter;
}

function spawnFlock(width: number, height: number): Flock {
	const isFlyingRight = Math.random() < 0.5;
	const count = Flocks.FewestBirds + Math.floor(Math.random() * (Flocks.MostBirds - Flocks.FewestBirds + 1));
	return {
		x: isFlyingRight ? -width * 0.15 : width * 1.15,
		y: height * (0.05 + Math.random() * Flocks.SkyFraction),
		speed: Flocks.SlowestSpeed + Math.random() * (Flocks.FastestSpeed - Flocks.SlowestSpeed),
		size: Flocks.SmallestSize + Math.random() * (Flocks.LargestSize - Flocks.SmallestSize),
		isFlyingRight,
		birds: Array.from({ length: count }, (_, index) => ({ offsetX: -index * Flocks.Spread, offsetY: Math.abs(index - (count - 1) / 2) * Flocks.Spread * 0.6, flapOffset: Math.random() * Math.PI * 2 }))
	};
}

export function drawBirds(context: CanvasRenderingContext2D, birdlife: Birdlife, timeSeconds: number) {
	context.save();
	context.strokeStyle = Wing.Colour;
	context.lineWidth = Wing.LineWidth;
	context.lineCap = 'round';
	for (const flock of birdlife.flocks) drawFlock(context, flock, timeSeconds);
	context.restore();
}

function drawFlock(context: CanvasRenderingContext2D, flock: Flock, timeSeconds: number) {
	const direction = flock.isFlyingRight ? 1 : -1;
	for (const bird of flock.birds) {
		const x = flock.x + bird.offsetX * direction;
		const y = flock.y + bird.offsetY;
		const lift = Math.sin(timeSeconds * Wing.FlapSpeed + bird.flapOffset) * Wing.Lift;
		context.beginPath();
		context.moveTo(x - flock.size, y - lift * flock.size);
		context.quadraticCurveTo(x - flock.size / 2, y + flock.size * 0.35, x, y);
		context.quadraticCurveTo(x + flock.size / 2, y + flock.size * 0.35, x + flock.size, y - lift * flock.size);
		context.stroke();
	}
}
