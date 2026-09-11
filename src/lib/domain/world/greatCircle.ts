export interface GlobePoint {
	latitude: number;
	longitude: number;
}

const EarthRadiusKilometres = 6371;

export function greatCircleKilometres(from: GlobePoint, to: GlobePoint) {
	const fromLatitude = toRadians(from.latitude);
	const toLatitude = toRadians(to.latitude);
	const latitudeDelta = toRadians(to.latitude - from.latitude);
	const longitudeDelta = toRadians(to.longitude - from.longitude);
	const halfChord =
		Math.sin(latitudeDelta / 2) ** 2 + Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;
	const angle = 2 * Math.atan2(Math.sqrt(halfChord), Math.sqrt(1 - halfChord));
	return Math.round(EarthRadiusKilometres * angle * 10) / 10;
}

function toRadians(degrees: number) {
	return (degrees * Math.PI) / 180;
}
