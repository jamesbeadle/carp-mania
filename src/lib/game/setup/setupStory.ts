import { WizardStep, type SetupStep } from '$lib/contracts/SetupProgress';

export interface Chapter {
	heading: string;
	line: string;
	sign: string;
}

export const SetupStory: Record<SetupStep, Chapter> = {
	[WizardStep.ChoosePlot]: { heading: 'Chapter one · Somewhere to start', line: 'You have some money, a map of the world and a feeling about water. Pick a region and put a pin where the fishery will be.', sign: 'PLOTS IN EVERY REGION' },
	[WizardStep.BuySite]: { heading: 'Chapter two · The plot', line: 'The agent has a few sites on the books. A gravel pit, a quarry, a farm pond — each one fishes differently and costs differently.', sign: 'VIEWING BY APPOINTMENT' },
	[WizardStep.Name]: { heading: 'Chapter three · A name', line: 'Every water needs a name the anglers will say with a bit of longing.', sign: 'UNDER OFFER' },
	[WizardStep.Survey]: { heading: 'Chapter four · Walk the bank', line: 'Lay out the swims and look at the depths. This is how the water will fish.', sign: 'SOLD · SURVEY IN HAND' },
	[WizardStep.Stock]: { heading: 'Chapter five · The first fish', line: 'The fish farm lorry is waiting. What goes in now will be the prize fish of years to come.', sign: 'SOLD · STOCKING' },
	[WizardStep.OpenTheGates]: { heading: 'Chapter six · Open the gates', line: 'Set a day-ticket price, hang the sign on the gate, and let the first anglers through.', sign: 'OPENING SOON' }
};

export const AnotherWaterStory: Chapter = { heading: 'The estate grows', line: 'One water is a hobby. Two is a business. Find the next one on the map.', sign: 'MORE PLOTS AVAILABLE' };
