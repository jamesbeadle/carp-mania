import { Color, DataUtils, HalfFloatType, MathUtils, PerspectiveCamera, Vector3, WebGLRenderTarget, type Scene, type WebGLRenderer } from 'three';
import { Glow, type HazeColours } from './aerialHaze';

const Probe = { Pixels: 4, Views: 4, FieldOfViewDegrees: 12, ElevationDegrees: 3, Farthest: 20000, Channels: 4 } as const;
const View = { SunwardLeft: 0, SunwardRight: 1, AwayLeft: 2, AwayRight: 3 } as const;
const QuarterTurn = Math.PI / 2;
const Halfway = 1 / 2;
const TargetWidth = Probe.Pixels * Probe.Views;

export class HorizonProbe {
	private readonly target = new WebGLRenderTarget(TargetWidth, Probe.Pixels, { type: HalfFloatType });
	private readonly camera = new PerspectiveCamera(Probe.FieldOfViewDegrees, 1, 1, Probe.Farthest);

	constructor(private readonly renderer: WebGLRenderer) {}

	measure(skyScene: Scene, sunDirection: Vector3): HazeColours {
		const sunAzimuth = this.paintViews(skyScene, sunDirection);
		const pixels = this.freshPixels();
		this.renderer.readRenderTargetPixels(this.target, 0, 0, TargetWidth, Probe.Pixels, pixels);
		return this.coloursOf(pixels, sunAzimuth, sunDirection);
	}

	async measureLater(skyScene: Scene, sunDirection: Vector3): Promise<HazeColours> {
		const sunAzimuth = this.paintViews(skyScene, sunDirection);
		const pixels = this.freshPixels();
		await this.renderer.readRenderTargetPixelsAsync(this.target, 0, 0, TargetWidth, Probe.Pixels, pixels);
		return this.coloursOf(pixels, sunAzimuth, sunDirection);
	}

	dispose() {
		this.target.dispose();
	}

	private freshPixels() {
		return new Uint16Array(TargetWidth * Probe.Pixels * Probe.Channels);
	}

	private paintViews(skyScene: Scene, sunDirection: Vector3) {
		const sunAzimuth = Math.atan2(sunDirection.x, sunDirection.z);
		const azimuths = [sunAzimuth + Glow.ProbeTurn, sunAzimuth - Glow.ProbeTurn, sunAzimuth + QuarterTurn, sunAzimuth - QuarterTurn];
		const previous = this.renderer.getRenderTarget();
		azimuths.forEach((azimuth, view) => this.paintView(skyScene, azimuth, view));
		this.target.scissorTest = false;
		this.target.viewport.set(0, 0, TargetWidth, Probe.Pixels);
		this.renderer.setRenderTarget(previous);
		return sunAzimuth;
	}

	private paintView(skyScene: Scene, azimuth: number, view: number) {
		this.camera.lookAt(this.directionToward(azimuth));
		this.target.viewport.set(view * Probe.Pixels, 0, Probe.Pixels, Probe.Pixels);
		this.target.scissor.set(view * Probe.Pixels, 0, Probe.Pixels, Probe.Pixels);
		this.target.scissorTest = true;
		this.renderer.setRenderTarget(this.target);
		this.renderer.render(skyScene, this.camera);
	}

	private coloursOf(pixels: Uint16Array, sunAzimuth: number, sunDirection: Vector3): HazeColours {
		const sunward = this.averageOf(pixels, View.SunwardLeft).lerp(this.averageOf(pixels, View.SunwardRight), Halfway);
		const away = this.averageOf(pixels, View.AwayLeft).lerp(this.averageOf(pixels, View.AwayRight), Halfway);
		const probeFacing = Math.max(Glow.LeastFacing, this.directionToward(sunAzimuth + Glow.ProbeTurn).dot(sunDirection));
		const glow = sunward.sub(away).multiplyScalar(1 / Math.pow(probeFacing, Glow.Sharpness));
		return { away, glow: new Color(Math.max(0, glow.r), Math.max(0, glow.g), Math.max(0, glow.b)) };
	}

	private directionToward(azimuth: number) {
		const elevation = MathUtils.degToRad(Probe.ElevationDegrees);
		const flat = Math.cos(elevation);
		return new Vector3(Math.sin(azimuth) * flat, Math.sin(elevation), Math.cos(azimuth) * flat);
	}

	private averageOf(pixels: Uint16Array, view: number) {
		const sums = [0, 0, 0];
		for (let row = 0; row < Probe.Pixels; row++) {
			for (let column = 0; column < Probe.Pixels; column++) {
				const at = (row * TargetWidth + view * Probe.Pixels + column) * Probe.Channels;
				sums.forEach((_, channel) => (sums[channel] += DataUtils.fromHalfFloat(pixels[at + channel])));
			}
		}
		const [red, green, blue] = sums.map((sum) => sum / (Probe.Pixels * Probe.Pixels));
		return new Color(red, green, blue);
	}
}
