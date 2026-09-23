import { Pedigree } from '$lib/domain/anglerRating';
import { SkillLabels, SkillNames } from '$lib/domain/anglerSkills';
import { DiaryClock } from '$lib/domain/legacy/diary';
import { AwardKeys } from '$lib/domain/trophies/awards';
import { AnglerName } from '$lib/domain/anglerName';
import type { RuleChapter } from './ruleBookTypes';

const skillLines = SkillNames.map((skill) => SkillLabels[skill].toLowerCase()).join(', ');

export const YourAngler: RuleChapter = {
	id: 'angler',
	title: 'Your angler',
	blurb: 'Rating, skills, records, awards, and the life of a fisherman.',
	questions: [
		{
			question: 'What name do I fish under?',
			answer: `Your angler name — one word, ${AnglerName.ShortestLength} to ${AnglerName.LongestLength} letters and numbers, and nobody else's. You start as your first name (numbered if someone got there first) and can change it on My angler; the new name follows you onto every catch, record and piece of news. The heir who takes the rods when a fisherman retires gets a name of the same kind.`
		},
		{
			question: 'What is my rating?',
			answer: `The lesser of two numbers. Your craft is the average of your four skills — ${skillLines}. Your pedigree is ${Pedigree.PointsPerPound} points for every pound of the heaviest carp you have landed, so a ${Pedigree.CapLb}-pounder is the lot. A skilful angler with small fish and a lucky angler with one big fish are both held back by the number they are short on.`
		},
		{
			question: 'How do skills go up?',
			answer: `Every fish you land raises them, and faster when the tackle suited the water: a well-hidden line teaches line selection, a rig that fitted the bottom teaches rig selection, the bait the fish wanted teaches bait selection, and finding the fish teaches watercraft. Skills never go down.`
		},
		{
			question: 'What is on My angler?',
			answer: `Your rating dial, your biggest fish with the honours they had on the day, the records you hold right now, your awards, the one to beat above you on the world board, your money, skills and catch history, and your peg bookings. My public page is what other anglers see.`
		},
		{
			question: 'What are records and honours?',
			answer: `A personal best is your heaviest fish. A lake record is the heaviest ever from that water, a region record from that region, and the world record from anywhere. Each is held by the angler who set it until it is beaten, and the noticeboard tells you when yours goes. A catch card carries the honours it had on the day and whether the record still stands.`
		},
		{
			question: 'What are awards?',
			answer: `${AwardKeys.length} milestones a fisherman can reach in a lifetime — the first double, the first thirty, a hundred fish, a fish from five regions, a match won, fifty fish after dark and so on. Awards and the next one within reach are on My angler.`
		},
		{
			question: 'Why does my angler have an age?',
			answer: `Because a fisherman has a lifetime. Yours starts between 20 and 30 years old and ages a year every ${DiaryClock.RealDaysPerYear} real days. From ${DiaryClock.SlowingDownWithinYears} years before retirement they are slowing down, and somewhere between 80 and 100 they retire. Their scrapbook — every catch, best fish and award — is kept for good, and the next fisherman in your line takes up the rods with the water, the money and the tackle intact.`
		},
		{
			question: 'Who is "the one to beat"?',
			answer: `The angler directly above you on the world board by personal best, with how far behind you are and who is chasing you. Beat their best fish and you take their place.`
		}
	]
};
