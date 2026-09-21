import type { RuleChapter } from './ruleBookTypes';

export const TheWorld: RuleChapter = {
	id: 'world',
	title: 'The world',
	blurb: 'Other waters, other anglers and the boards.',
	questions: [
		{
			question: 'Can I fish other players’ waters?',
			answer: `Yes — every open fishery in the game is on Find water and pinned on the globe under The world. Buy a ticket and the money goes to that owner. The water's page shows its stock, its best fish, its ticket prices, recent catches and who is on the bank right now.`
		},
		{
			question: 'Are there matches or prizes between players?',
			answer: `No. Carp Mania has no matches, bounties or prize pots, so no money can pass from one player to another: what you earn comes from your own water's tickets and takings and from the dealer, and what you spend goes to the shops and the farms. The boards are the competition — the records, the leaderboards and the Hall of Fame.`
		},
		{
			question: 'What are the Hall of Fame and the leaderboards?',
			answer: `The Hall of Fame is what the game remembers: the greatest fish ever caught, the anglers who had them, the waters that grew them and the fish that have died. The leaderboards rank living anglers by personal best and by skill, for the world and for each region. Anglers lists every rod in the game; open one for their public page.`
		},
		{
			question: 'What is a carp’s page?',
			answer: `Every named fish has a dossier: its strain, weight, age and condition, where it lives, its growth, every capture with who had it and on what, whether it is famous, and how wary it is after recent captures. A fish caught often in the last ten fishery days is harder to catch.`
		},
		{
			question: 'What is on the news page and the noticeboard?',
			answer: `News is the live feed of the world — big catches, records, sales and awards as they happen, with a line to the water on the globe. The noticeboard is your own inbox: notes pinned when something happens to you or your water, such as a record taken from you, a fish arriving or works finishing.`
		},
		{
			question: 'Can I own more than one water?',
			answer: `Yes. Buy another water from the estate switcher on My lake and run each from its own lodge; fish can be moved between your own waters from the Stock tab.`
		}
	]
};
