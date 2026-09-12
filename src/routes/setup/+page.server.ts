import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { clampedStep, WizardStep, type SetupProgress, type SetupStep } from '$lib/contracts/SetupProgress';
import { hasChosenPlot } from '$lib/domain/sites/chosenPlot';
import { isRegionCode, type RegionCode } from '$lib/domain/world/regionCodes';
import { BuyCarpFromFishFarm } from '$lib/server/commands/BuyCarpFromFishFarm';
import { BuySite } from '$lib/server/commands/BuySite';
import { ChoosePlot } from '$lib/server/commands/ChoosePlot';
import { OpenTheGates } from '$lib/server/commands/OpenTheGates';
import { RenameLake } from '$lib/server/commands/RenameLake';
import { GetFishFarmStock } from '$lib/server/queries/GetFishFarmStock';
import { GetMyFishery } from '$lib/server/queries/GetMyFishery';
import { GetRegionGuide } from '$lib/server/queries/GetRegionGuide';
import { GetSetupProgress } from '$lib/server/queries/GetSetupProgress';

const HomeOnceOpen = '/home';
const AnotherWaterParam = 'another';
const DefaultRegion: RegionCode = 'uk_ireland';
const StepPostedTo: Record<string, SetupStep> = { rename: WizardStep.Name, buyFromFarm: WizardStep.Stock, open: WizardStep.OpenTheGates };

export const load: PageServerLoad = async ({ locals, url }) => {
	const progress = await GetSetupProgress(locals);
	if (isNothingLeftToSetUp(progress, url)) redirect(303, HomeOnceOpen);
	const step = clampedStep(progress, requestedStep(url, progress));
	const region = regionToGuide(url, progress.profile.plot_region);
	const [guide, fishery, farmStock] = await Promise.all([
		GetRegionGuide(locals, region),
		progress.lake ? GetMyFishery(locals) : null,
		progress.lake ? GetFishFarmStock(locals, region) : []
	]);
	return { progress, step, guide, fishery, farmStock };
};

function isNothingLeftToSetUp(progress: SetupProgress, url: URL) {
	const isBuyingAnother = url.searchParams.get(AnotherWaterParam) !== null || hasChosenPlot(progress.profile);
	return progress.lake === null && progress.openWaters.length > 0 && !isBuyingAnother && postedActionName(url) === '';
}

function requestedStep(url: URL, progress: SetupProgress) {
	const explicit = url.searchParams.get('step');
	if (explicit !== null) return Number(explicit);
	return StepPostedTo[postedActionName(url)] ?? progress.step;
}

function postedActionName(url: URL) {
	const actionKey = [...url.searchParams.keys()].find((key) => key.startsWith('/'));
	return actionKey?.slice(1) ?? '';
}

function regionToGuide(url: URL, homeRegion: RegionCode | null): RegionCode {
	const requested = url.searchParams.get('region') ?? '';
	if (isRegionCode(requested)) return requested;
	return homeRegion ?? DefaultRegion;
}

export const actions: Actions = {
	choosePlot: ({ locals, request }) => request.formData().then((formData) => ChoosePlot(locals, formData)),
	buySite: ({ locals, request }) => request.formData().then((formData) => BuySite(locals, formData)),
	rename: ({ locals, request }) => request.formData().then((formData) => RenameLake(locals, formData)),
	buyFromFarm: ({ locals, request }) => request.formData().then((formData) => BuyCarpFromFishFarm(locals, formData)),
	open: ({ locals, request }) => request.formData().then((formData) => OpenTheGates(locals, formData))
};
