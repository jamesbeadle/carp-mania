export interface WhileYouWereAway {
	daysSimulated: number;
	anglersVisited: number;
	fishCaught: number;
	feesCollected: number;
	lodgeTakings: number;
	bailiffWages: number;
	aeratorRunning: number;
	carpTakenByPike: string[];
	carpDiedOfOldAge: string[];
	carpArrived: string[];
	heatwaveDays: number;
	visitorsBigFish: string[];
	worksCompleted: string[];
	frySpawned: number;
}

export function nothingHappened(): WhileYouWereAway {
	return { daysSimulated: 0, anglersVisited: 0, fishCaught: 0, feesCollected: 0, lodgeTakings: 0, bailiffWages: 0, aeratorRunning: 0, carpTakenByPike: [], carpDiedOfOldAge: [], carpArrived: [], heatwaveDays: 0, visitorsBigFish: [], worksCompleted: [], frySpawned: 0 };
}
