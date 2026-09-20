import { LegalContact } from '$lib/legal/legalPages';
import type { RuleChapter } from './ruleBookTypes';

export const FairPlay: RuleChapter = {
	id: 'fair-play',
	title: 'Fair play',
	blurb: 'The few rules that keep the game honest.',
	questions: [
		{
			question: 'Why can I not trade fish or tackle with another player?',
			answer: `Because a second account could be used to feed a first one. Fish leave a water through the dealer only, tackle is bought from the shops only, and prize money comes from matches and bounties that any angler can win. Everything you own, you earned in the game.`
		},
		{
			question: 'Is there anything to buy with real money?',
			answer: `No. The game is free, there are no adverts, and there is nothing for sale.`
		},
		{
			question: 'How old do I have to be?',
			answer: `${LegalContact.minimumAge} or over. The terms and the privacy page say what we keep about you and why; the short version is that we keep what the game needs, we don't sell it, and you can ask for it to be deleted.`
		},
		{
			question: 'Something looks wrong — where do I say?',
			answer: `Write to ${LegalContact.email}. A bug, a fish that should not be where it is, a record that looks off — all of it is welcome.`
		}
	]
};
