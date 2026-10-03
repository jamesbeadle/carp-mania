import { carParkPlanFor, ParkingBaySize, type CarParkPlan } from '$lib/domain/groundworks/sites/carParkPlan';
import type { CarParkSpec } from '$lib/domain/layout/facilitySite';
import { carsOnATypicalDay } from '../../scene/parkedCars';
import { paintParkedCar } from './paintParkedCar';
import { SitePalette, SurfacePalette } from './sitePalette';

const Marking = { WidthFeet: 0.6 } as const;
const Kerb = { WidthFeet: 1.2, Rounding: 3 } as const;
const Lamp = { PostFeet: 1.4, GlowFeet: 14, InsetFeet: 3 } as const;

export function paintCarPark(context: CanvasRenderingContext2D, spec: CarParkSpec) {
	const plan = carParkPlanFor(spec);
	paintSurface(context, spec, plan);
	paintBayMarkings(context, spec, plan);
	plan.bays.slice(0, carsOnATypicalDay(spec)).forEach((bay, index) => paintParkedCar(context, bay, index));
	if (spec.isLit) paintLamps(context, plan);
}

function paintSurface(context: CanvasRenderingContext2D, spec: CarParkSpec, plan: CarParkPlan) {
	const left = -plan.widthFeet / 2;
	const top = -plan.depthFeet / 2;
	context.fillStyle = SurfacePalette[spec.surface].ground;
	context.strokeStyle = SitePalette.Kerb;
	context.lineWidth = Kerb.WidthFeet;
	context.beginPath();
	context.roundRect(left, top, plan.widthFeet, plan.depthFeet, Kerb.Rounding);
	context.fill();
	context.stroke();
}

function paintBayMarkings(context: CanvasRenderingContext2D, spec: CarParkSpec, plan: CarParkPlan) {
	context.strokeStyle = SurfacePalette[spec.surface].marking;
	context.lineWidth = Marking.WidthFeet;
	context.beginPath();
	for (const bay of plan.bays) {
		const left = bay.acrossFeet - ParkingBaySize.WidthFeet / 2;
		const right = bay.acrossFeet + ParkingBaySize.WidthFeet / 2;
		const top = bay.downFeet - ParkingBaySize.LengthFeet / 2;
		const bottom = bay.downFeet + ParkingBaySize.LengthFeet / 2;
		const backY = bay.isFacingDown ? top : bottom;
		context.moveTo(left, top);
		context.lineTo(left, bottom);
		context.moveTo(right, top);
		context.lineTo(right, bottom);
		context.moveTo(left, backY);
		context.lineTo(right, backY);
	}
	context.stroke();
}

function paintLamps(context: CanvasRenderingContext2D, plan: CarParkPlan) {
	const ends = [-plan.widthFeet / 2 + Lamp.InsetFeet, plan.widthFeet / 2 - Lamp.InsetFeet];
	for (const aisle of plan.aislesDownFeet) for (const across of ends) paintLamp(context, across, aisle);
}

function paintLamp(context: CanvasRenderingContext2D, across: number, down: number) {
	const glow = context.createRadialGradient(across, down, 0, across, down, Lamp.GlowFeet);
	glow.addColorStop(0, SitePalette.LampGlow);
	glow.addColorStop(1, SitePalette.Clear);
	context.fillStyle = glow;
	context.fillRect(across - Lamp.GlowFeet, down - Lamp.GlowFeet, Lamp.GlowFeet * 2, Lamp.GlowFeet * 2);
	context.fillStyle = SitePalette.LampPost;
	context.beginPath();
	context.arc(across, down, Lamp.PostFeet, 0, Math.PI * 2);
	context.fill();
}
