import { Color, DataUtils, HalfFloatType, MathUtils, PerspectiveCamera, Vector3, WebGLRenderTarget, type Scene, type WebGLRenderer } from 'three';
import { Glow, type HazeColours } from './aerialHaze';

const Probe = { Pixels: 4, FieldOfViewDegrees: 12, ElevationDegrees: 3, Farthest: 20000, Channels: 4 } as const;
const QuarterTurn = Math.PI / 2;

export class HorizonProbe {
	private readonly target = new WebGLRenderTarget(Probe.Pixels, Probe.Pixels, { type: HalfFloatType });
	private readonly camera = new PerspectiveCamera(Probe.FieldOfViewDegrees, 1, 1, Probe.Farthest);
	private readonly pixels = new Uint16Array(Probe.Pixels * Probe.Pixels * Probe.Channels);

	constructor(private readonly renderer: WebGLRenderer) {}

	measure(skyScene: Scene, sunDirection: Vector3): HazeColours {
		const previous = this.renderer.getRenderTarget();
		const sunAzimuth = Math.atan2(sunDirection.x, sunDirection.z);
		const sunward = this.colourToward(skyScene, sunAzimuth + Glow.ProbeTurn).lerp(this.colourToward(skyScene, sunAzimuth - Glow.ProbeTurn), 1 / 2);
		const away = this.colourToward(skyScene, sunAzimuth + QuarterTurn).lerp(this.colourToward(skyScene, sunAzimuth - QuarterTurn), 1 / 2);
		this.renderer.setRenderTarget(previous);
		const probeFacing = Math.max(Glow.LeastFacing, this.directionToward(sunAzimuth + Glow.ProbeTurn).dot(sunDirection));
		const glow = sunward.sub(away).multiplyScalar(1 / Math.pow(probeFacing, Glow.Sharpness));
		return { away, glow: new Color(Math.max(0, glow.r), Math.max(0, glow.g), Math.max(0, glow.b)) };
	}

	dispose() {
		this.target.dispose();
	}

	private directionToward(azimuth: number) {
		const elevation = MathUtils.degToRad(Probe.ElevationDegrees);
		const flat = Math.cos(elevation);
		return new Vector3(Math.sin(azimuth) * flat, Math.sin(elevation), Math.cos(azimuth) * flat);
	}

	private colourToward(skyScene: Scene, azimuth: number) {
		const { camera } = this;
		camera.lookAt(this.directionToward(azimuth));
		this.renderer.setRenderTarget(this.target);
		this.renderer.render(skyScene, camera);
		this.renderer.readRenderTargetPixels(this.target, 0, 0, Probe.Pixels, Probe.Pixels, this.pixels);
		return this.averageColour();
	}

	private averageColour() {
		const sums = [0, 0, 0];
		const pixelCount = Probe.Pixels * Probe.Pixels;
		for (let index = 0; index < pixelCount; index++) {
			sums.forEach((_, channel) => (sums[channel] += DataUtils.fromHalfFloat(this.pixels[index * Probe.Channels + channel])));
		}
		const [red, green, blue] = sums.map((sum) => sum / pixelCount);
		return new Color(red, green, blue);
	}
}
