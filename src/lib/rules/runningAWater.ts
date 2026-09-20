import { BailiffTerms } from '$lib/domain/bailiffs/bailiffTeam';
import { Candidates } from '$lib/domain/bailiffs/candidates';
import { PikeRules } from '$lib/domain/economy';
import { DailyFeed } from '$lib/domain/feed';
import { TicketPrice } from '$lib/domain/fishing/ticketBook';
import { WorksInProgress } from '$lib/domain/groundworks/catalogue';
import { DealerTerms } from '$lib/domain/market/dealer';
import { FarmCatalogue } from '$lib/domain/market/farms';
import { BookingWindow } from '$lib/domain/water/bookings';
import type { RuleChapter } from './ruleBookTypes';

const dealerShare = Math.round(DealerTerms.ShareOfGuidePrice * 100);
const bulkShare = Math.round(DealerTerms.BulkShare * 100);
const refundShare = Math.round(WorksInProgress.CancelRefundShare * 100);

export const RunningAWater: RuleChapter = {
	id: 'owner',
	title: 'Running a water',
	blurb: 'The lodge, and everything an owner decides.',
	questions: [
		{
			question: 'How do I set up my fishery?',
			answer: `Six steps: pick a region and drop a pin, choose a site (an old gravel pit, a quarry, a clay pit and so on — each starts with something and comes with a problem), name it, walk the bank to lay out the swims, stock it, and open the gates. Everything after that happens at the lodge, under Run fishery.`
		},
		{
			question: 'Where do fish come from?',
			answer: `The farms. ${FarmCatalogue.length} fish farms around the world sell carp by the pack — a stock farm sells small fish by the hundred, a record grower one or two big old fish a week. Transport, transit time and quarantine are quoted from the farm's gate, and fish lose a little condition on the road. A water also grows its own: fish put on weight with feed, age, and are named the first time an angler lands them.`
		},
		{
			question: 'How do I sell fish?',
			answer: `To the dealer, from the Stock tab. The dealer pays ${dealerShare}% of a fish's guide price for the first ${DealerTerms.FullShareFishPerFisheryDay} fish in a fishery day and ${bulkShare}% after that, and will not take a fish in poor condition. If you own more than one water you can move fish between them instead. Fish leave a water through the dealer only — there is no trading between players, so nobody can be paid by a second account.`
		},
		{
			question: 'What do tickets earn, and how do I price them?',
			answer: `Every ticket an angler buys is paid to the owner. You write the ticket book yourself — day, night, 24-hour and multi-day — at any price from £${TicketPrice.Lowest} to £${TicketPrice.Highest}; the Tickets tab tells you what anglers here will pay and how many are coming. Turn on advance booking and anglers book a peg up to ${BookingWindow.DaysAhead} days ahead; sell a syndicate and a fixed number of members fish free for a year while nobody else fishes at all. You can also ban barbed hooks.`
		},
		{
			question: 'Why do I have to feed the lake?',
			answer: `Because carp only grow on what they eat. A hundred carp eat about ${DailyFeed.KilogramsPerHundredCarp} kg a day; well-fed fish gain up to ${DailyFeed.MaximumConditionGainPerDay} condition a day and hungry fish lose ${DailyFeed.HungerConditionLossPerDay}. Protein grows fish; hemp and particles keep them keen; a heavily fed water bites a little less, a hungry one a little more. Other species in the water — tench, bream, roach — steal a share of the feed and turn some bites into nuisance fish, and can be netted out.`
		},
		{
			question: 'What are pike for?',
			answer: `Pike eat the sick carp — anything in condition below ${PikeRules.SickCarpConditionBelow} — and cannot catch the strong ones, which keeps the stock healthy. They never grow past ${PikeRules.MaximumWeightLb} lb here, they need pike food or they die back, and they eat crayfish, which cleans the water.`
		},
		{
			question: 'What does a bailiff do?',
			answer: `Clears weed, keeps silt down, tidies the banks and makes sure anglers pay. One bailiff keeps about ${BailiffTerms.AcresPerBailiff} acres in order; short of that the water slowly silts up. Wages are about £${BailiffTerms.BaseWage} a day each, ${Candidates.PerWeek} candidates come looking for work every week with a reference that hints at how they will turn out, and sacking is instant and free.`
		},
		{
			question: 'What are groundworks?',
			answer: `The editor for shaping the water: islands, gravel bars, deep holes, margin shelves, reed beds, lily pads, snags, sanctuaries, the swims and the shoreline itself. To change the bank, Redraw is the easy way: click the shoreline where the new bank starts, click along the new line or nowhere at all, and click the shoreline again — the stretch between is replaced by a rounded bank. Shore and Extend drag single points. Each work has a price and takes fishery days to finish; up to ${WorksInProgress.MaximumEarthworks} earthworks run at once, and cancelling one early refunds ${refundShare}%. A swim the new bank would leave in the water, or too far from it, has to be moved with Select or taken out first.`
		},
		{
			question: 'What happens while I am away?',
			answer: `The fishery keeps running a day an hour: anglers come and pay, fish are caught and named, records fall, feed is eaten, works finish, bailiffs earn their wages and the water drifts. When you come back the bailiff's note sums it up and the ledger has every line.`
		}
	]
};
