import { AnglersWords } from './anglersWords';
import { FairPlay } from './fairPlay';
import { FishingASession } from './fishingASession';
import type { RuleChapter } from './ruleBookTypes';
import { RunningAWater } from './runningAWater';
import { TackleAndBait } from './tackleAndBait';
import { TheGameInAMinute } from './theGameInAMinute';
import { TheWorld } from './theWorld';
import { YourAngler } from './yourAngler';

export const RuleBookPath = '/rules';
export const RuleBook: RuleChapter[] = [TheGameInAMinute, AnglersWords, FishingASession, TackleAndBait, YourAngler, RunningAWater, TheWorld, FairPlay];

export function chaptersMatching(query: string): RuleChapter[] {
	const words = query.trim().toLowerCase();
	if (words.length === 0) return RuleBook;
	return RuleBook.map((chapter) => ({ ...chapter, questions: chapter.questions.filter((entry) => isAbout(entry.question, entry.answer, words)) })).filter((chapter) => chapter.questions.length > 0);
}

function isAbout(question: string, answer: string, words: string) {
	return question.toLowerCase().includes(words) || answer.toLowerCase().includes(words);
}
