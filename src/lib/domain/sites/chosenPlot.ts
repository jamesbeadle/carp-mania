import type { Profile } from '../types';
import type { RegionCode } from '../world/regionCodes';

export interface ChosenPlot {
	region: RegionCode;
	latitude: number;
	longitude: number;
}

export type ProfileWithPlot = Profile & { home_region: RegionCode; plot_latitude: number; plot_longitude: number };

export function hasChosenPlot(profile: Profile): profile is ProfileWithPlot {
	return profile.home_region !== null && profile.plot_latitude !== null && profile.plot_longitude !== null;
}

export function chosenPlotOf(profile: ProfileWithPlot): ChosenPlot {
	return { region: profile.home_region, latitude: Number(profile.plot_latitude), longitude: Number(profile.plot_longitude) };
}
