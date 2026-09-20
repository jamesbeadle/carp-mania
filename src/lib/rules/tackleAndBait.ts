import { BaseCastFeet } from '$lib/domain/tackle/castDistance';
import { PrototypesPerBrandPerFisheryYear } from '$lib/domain/tackle/prototypes';
import { ReelCatalogue } from '$lib/domain/tackle/reels';
import { RodLengthCastFactor } from '$lib/domain/tackle/rods';
import { SponsorshipTerms } from '$lib/domain/tackle/sponsorship';
import { TierLabels, TierMinimumRating, Tiers } from '$lib/domain/tackle/brands';
import type { RuleChapter } from './ruleBookTypes';

const tierLines = Tiers.map((tier) => `${TierLabels[tier]} from rating ${TierMinimumRating[tier]}`).join(', ');
const discountPercent = Math.round(SponsorshipTerms.Discount * 100);
const longestRodFactor = Math.max(...Object.values(RodLengthCastFactor));
const longestReelFactor = Math.max(...Object.values(ReelCatalogue).map((reel) => reel.castFactor));
const longestCastFeet = Math.round(BaseCastFeet * longestRodFactor * longestReelFactor);

export const TackleAndBait: RuleChapter = {
	id: 'tackle',
	title: 'Tackle and bait',
	blurb: 'What to buy, what wears out, and how to match it to the water.',
	questions: [
		{
			question: 'Where do I buy tackle?',
			answer: `The tackle shop sells rods, reels, line, hooks, rigs, leads, tubing and bait by brand, and every fishery with a shop sells at its own counter too. What you own is in My tackle box, by kind.`
		},
		{
			question: 'What are the tiers, and why can I not buy everything?',
			answer: `Brands come in ${Tiers.length} tiers — ${tierLines}. A brand will not sell its best kit to an angler with no record; your rating opens the shelves. Custom-tier kit is only sold at a water whose own shop has earned it.`
		},
		{
			question: 'Does tackle run out?',
			answer: `Line, hooks, rigs, leads, tubing and bait are used up as you fish and are bought by the pack. Rods and reels last until one snaps. Bait can spoil if it sits too long. The tackle box shows how much of each you have left, and the tackle-up screen warns when a rod is short of something.`
		},
		{
			question: 'How do I choose line, hooks and rigs?',
			answer: `Match the water. Clear line hides in clear water and coloured line in coloured water; matt hooks show less than shiny ones; a rig that sits up suits silt and weed, and a flat rig suits clean gravel. A rod that lands up to 35 lb will not land a forty. The tackle-up screen scores each rod against the water once your craft reaches the readout threshold — before that, fish it by feel.`
		},
		{
			question: 'How far can I cast?',
			answer: `A 12 ft rod with an ordinary carp reel throws about ${BaseCastFeet} ft (${Math.round(BaseCastFeet / 3)} yards). A longer rod and a bigger reel throw further — a 13 ft rod on a big pit reel reaches about ${longestCastFeet} ft — and a shorter rod, a small reel or a chod rig cost you distance. While a rod is waiting to be cast, a dashed ring on the water shows how far it will reach from your peg; click beyond it and the bait lands short, on the ring.`
		},
		{
			question: 'Which bait should I use?',
			answer: `The one the water has been fed on. Owners feed their lakes with boilies, pellets, particles and more, and the fish trust what they are used to. Bait brands differ in how much fish like them; the shop tells you.`
		},
		{
			question: 'What is a sponsorship?',
			answer: `A brand backing you. Win a brand's bounty and the whole of its tier opens to you with ${discountPercent}% off everything for a fishery year. Some bounties pay brand credit to spend at that shelf instead.`
		},
		{
			question: 'What is a prototype?',
			answer: `A one-of-one piece of kit a brand builds by hand — better than anything on sale, with a number and the brand's name on it. Each brand makes ${PrototypesPerBrandPerFisheryYear} a fishery year and puts them up as bounty prizes. The Hall of Fame lists who holds them.`
		}
	]
};
