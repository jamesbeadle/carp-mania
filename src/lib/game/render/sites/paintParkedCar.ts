import type { ParkingBay } from '$lib/domain/groundworks/sites/carParkPlan';
import { CarPaints, SitePalette } from './sitePalette';

const Car = { WidthFeet: 6, LengthFeet: 14, Rounding: 1.6, WindscreenFeet: 2.6, RoofFeet: 5, CabinInset: 0.6 } as const;
const HalfTurn = Math.PI;

export function paintParkedCar(context: CanvasRenderingContext2D, bay: ParkingBay, index: number) {
	context.save();
	context.translate(bay.acrossFeet, bay.downFeet);
	if (!bay.isFacingDown) context.rotate(HalfTurn);
	const halfWidth = Car.WidthFeet / 2;
	const halfLength = Car.LengthFeet / 2;
	context.fillStyle = SitePalette.Shadow;
	context.beginPath();
	context.roundRect(-halfWidth + 0.5, -halfLength + 0.6, Car.WidthFeet, Car.LengthFeet, Car.Rounding);
	context.fill();
	context.fillStyle = CarPaints[(index * 3) % CarPaints.length];
	context.beginPath();
	context.roundRect(-halfWidth, -halfLength, Car.WidthFeet, Car.LengthFeet, Car.Rounding);
	context.fill();
	paintCabin(context);
	context.restore();
}

function paintCabin(context: CanvasRenderingContext2D) {
	const cabinWidth = Car.WidthFeet - Car.CabinInset * 2;
	const windscreenTop = Car.LengthFeet / 2 - Car.WindscreenFeet - Car.RoofFeet / 2;
	context.fillStyle = SitePalette.Glass;
	context.fillRect(-cabinWidth / 2, windscreenTop - Car.RoofFeet / 2, cabinWidth, Car.RoofFeet + Car.WindscreenFeet);
	context.fillStyle = SitePalette.Roof;
	context.fillRect(-cabinWidth / 2, windscreenTop - Car.RoofFeet / 2, cabinWidth, Car.RoofFeet);
}
