import { StartingFloat } from '$lib/domain/economy';
import { FisheryClock } from '$lib/domain/simulation/elapsedDays';
import { RegionCatalogue } from '$lib/domain/world/regions';
import type { RuleChapter } from './ruleBookTypes';

const regionCount = Object.keys(RegionCatalogue).length;
const realHoursPerFisheryDay = FisheryClock.RealMillisecondsPerFisheryDay / (60 * 60 * 1000);

export const TheGameInAMinute: RuleChapter = {
	id: 'the-game',
	title: 'The game in a minute',
	blurb: 'What Carp Mania is, and the two hats you wear.',
	questions: [
		{
			question: 'What is Carp Mania?',
			answer: `A game about carp fishing played from two sides. You own a fishery — a lake with carp in it that other players pay to fish — and you are an angler who can take your rods to any open water in the game, including your own. Running the water earns you money; fishing it earns you catches, a reputation and a place on the world's boards.`
		},
		{
			question: 'What is a carp, and why does the weight matter so much?',
			answer: `A carp is a big, slow-growing freshwater fish. Anglers measure them in pounds (lb) and ounces (oz): a "double" is 10 lb or more, a "twenty" 20 lb, a "thirty" 30 lb, and a "forty" or a "fifty" is the fish of a lifetime. Every fish in the game has a name once it has been caught, a weight, an age and a history, so the big ones become famous. Weight is the score: your best fish sets half of your rating, and the records and the boards are all by weight.`
		},
		{
			question: 'How does time work?',
			answer: `The fishery runs on its own clock: one fishery day passes every ${realHoursPerFisheryDay === 1 ? 'real hour' : `${realHoursPerFisheryDay} real hours`}, whether you are playing or not. When you come back, the game catches up on everything that happened while you were away — anglers who fished, fish that were caught, feed that was eaten, works that finished — up to ${FisheryClock.MaximumDaysSimulatedPerVisit} fishery days at a time. A fishing session is different: it runs in front of you, minute by minute, and the clock on screen is the session's clock.`
		},
		{
			question: 'What do I start with?',
			answer: `£${StartingFloat.Money.toLocaleString('en-GB')} to find, shape and stock a water of your own, a starter set of rods and tackle, and an angler with beginner skills. The first thing the game asks you to do is pick a region — there are ${regionCount} around the world, each with its own climate, growth ceiling and land price — and put a pin where your fishery will be.`
		},
		{
			question: 'Is it free?',
			answer: `Yes. Carp Mania is free to play, with no adverts and nothing to buy. You sign in with a Google account, and one account is one angler with one line of fishermen.`
		}
	]
};
