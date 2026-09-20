import { BountyDraw, OwnersBounty } from '$lib/domain/bounties/bountyDraw';
import { BountyKindCatalogue, BountyKinds } from '$lib/domain/bounties/bountyKinds';
import { MatchTerms } from '$lib/domain/matches/matchRules';
import type { RuleChapter } from './ruleBookTypes';

const bountyLines = BountyKinds.map((kind) => `${BountyKindCatalogue[kind].label} — ${BountyKindCatalogue[kind].wonBy}`).join('; ');
const matchLengths = MatchTerms.LastsHours.join(', ');

export const TheWorld: RuleChapter = {
	id: 'world',
	title: 'The world',
	blurb: 'Other waters, other anglers, matches, bounties and the boards.',
	questions: [
		{
			question: 'Can I fish other players’ waters?',
			answer: `Yes — every open fishery in the game is on Find water and pinned on the globe under The world. Buy a ticket and the money goes to that owner. The water's page shows its stock, its best fish, its ticket prices, recent catches, the matches on it and any bounty running.`
		},
		{
			question: 'What is a match?',
			answer: `A contest on one water for a set time — ${matchLengths} hours — with an entry fee and a pot. Most fish landed takes one prize and the biggest fish the other; the host chooses the split and can add a stake of their own. Anyone can host a match on their own water or book another owner's water for one. The board updates live while it runs and the results go into the Hall of Fame.`
		},
		{
			question: 'What is a bounty?',
			answer: `A prize put up on one water for a set window of ${BountyDraw.ShortestWindowDays} to ${BountyDraw.LongestWindowDays} fishery days. There are ${BountyKinds.length} kinds: ${bountyLines}. Brands post bounties across the world with sponsorships, brand credit and prototype tackle as the prize; an owner can post one on their own water with prize money from £${OwnersBounty.LeastMoney.toLocaleString('en-GB')} to £${OwnersBounty.MostMoney.toLocaleString('en-GB')}. One bounty runs on a water at a time.`
		},
		{
			question: 'What is the difficulty on a bounty card?',
			answer: `How hard the ask is on that water, from easy to very hard, worked out from the stock, the target and the window — so a "hard" peg prize on a rich water is a real challenge and an "easy" one is a day's fishing with a bonus.`
		},
		{
			question: 'What are the Hall of Fame and the leaderboards?',
			answer: `The Hall of Fame is what the game remembers: the greatest fish ever caught, the anglers who had them, the waters that grew them, the match trophies and the fish that have died. The leaderboards rank living anglers by personal best and by skill, for the world and for each region. Anglers lists every rod in the game; open one for their public page.`
		},
		{
			question: 'What is a carp’s page?',
			answer: `Every named fish has a dossier: its strain, weight, age and condition, where it lives, its growth, every capture with who had it and on what, whether it is famous, and how wary it is after recent captures. A fish caught often in the last ten fishery days is harder to catch.`
		},
		{
			question: 'What is on the news page and the noticeboard?',
			answer: `News is the live feed of the world — big catches, records, sales, matches and bounties as they happen, with a line to the water on the globe. The noticeboard is your own inbox: notes pinned when something happens to you or your water, such as a record taken from you, a match settled, a fish arriving or works finishing.`
		},
		{
			question: 'Can I own more than one water?',
			answer: `Yes. Buy another water from the estate switcher on My lake and run each from its own lodge; fish can be moved between your own waters from the Stock tab.`
		}
	]
};
