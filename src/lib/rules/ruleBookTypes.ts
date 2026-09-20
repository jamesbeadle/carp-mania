export interface RuleQuestion {
	question: string;
	answer: string;
}

export interface RuleChapter {
	id: string;
	title: string;
	blurb: string;
	questions: RuleQuestion[];
}
