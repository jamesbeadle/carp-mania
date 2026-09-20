import { MagicHours } from '$lib/domain/fishing/magicHours';
import { SwimMoveWords } from '$lib/domain/fishing/movingSwims';
import { ShowingFish } from '$lib/domain/fishing/showingFish';
import { StrikeWindow } from '$lib/domain/fishing/strikeWindow';
import { hoursOf, MultiDay, TicketKindCatalogue, TicketKinds } from '$lib/domain/fishing/ticketBook';
import { MaximumRods, SetupSlots } from '$lib/domain/tackle/rodSetup';
import type { RuleChapter } from './ruleBookTypes';

const ticketLines = TicketKinds.map((kind) => `${TicketKindCatalogue[kind].label}: ${TicketKindCatalogue[kind].words}`).join(' ');
const magicLines = MagicHours.map((window) => `${window.words} (${window.fromHour}:00 to ${window.toHour === 24 ? 'midnight' : `${window.toHour}:00`}).`).join(' ');
const dayTicketHours = hoursOf('day');

export const FishingASession: RuleChapter = {
	id: 'fishing',
	title: 'Fishing a session',
	blurb: 'From the ticket office to the mat, step by step.',
	questions: [
		{
			question: 'How do I start fishing?',
			answer: `Open a water — your own from My lake, or any open fishery from Find water — and buy a ticket. Then pick a swim by clicking a peg on the bank or its name in the list, set up your rods, and cast. The screen tells you what to do next at every step.`
		},
		{
			question: 'What tickets are there, and how long do they last?',
			answer: `${ticketLines} A multi-day ticket runs from ${MultiDay.FewestDays} to ${MultiDay.MostDays} days. Owners set their own prices, and a day ticket is priced per ${dayTicketHours} hours.`
		},
		{
			question: 'How many rods can I fish?',
			answer: `Up to ${MaximumRods}. Each rod has ${SetupSlots.length} parts to choose — ${SetupSlots.join(', ')} — and you can copy one rod's setup to the others. Your setup is remembered for next time.`
		},
		{
			question: 'How do I cast, and does it matter where?',
			answer: `Click or tap the water once for each rod. The spot you land on decides the bottom (gravel, silt, clay, rock), the depth and the feature you are on, and the rod card tells you which. Island margins, gravel bars, snags, reed lines and lily pads all fish better than open water, and every named carp has a favourite spot. An island blocks a cast, so pick a swim with a clear line to the water you want.`
		},
		{
			question: 'When do the fish bite?',
			answer: `Bites come at dawn and dusk more than the middle of the day, and the size of what bites follows the clock too. ${magicLines} The weather on the day and the season shift it: summer bites come fast in the shallows, winter fish sit in the deepest water.`
		},
		{
			question: 'What do I do when the alarm goes?',
			answer: `Strike — press the button or Enter — within ${StrikeWindow.BaseSeconds} seconds, and up to ${StrikeWindow.ExtraSecondsAtFullWatercraft} seconds longer as your watercraft rises. Miss it and the fish is gone. Some bites are nuisance fish, not carp: strike anyway and see.`
		},
		{
			question: 'How do I land the fish?',
			answer: `Hold Reel (or the Space bar) while the fish tires and watch the tension bar. It warns you a beat before the fish runs: let go and let it take line, then reel again. Too tight snaps the line; too slack and the hook falls out. When the fish is beaten it goes on the mat, is weighed and photographed, and any personal best or record is called there and then.`
		},
		{
			question: 'Can I move to another swim during a session?',
			answer: `Yes. Move swim brings the rods in and walks you round; it costs ${SwimMoveWords.Duration} of the session. Pick the new peg on the bank or from the list, then tackle up and cast again.`
		},
		{
			question: 'What are the ripples and splashes on the water?',
			answer: `Fish showing. From watercraft ${ShowingFish.WatercraftShowsFishFrom} you see where fish have crashed out this hour — up to ${ShowingFish.MostAtOnce} at a time — and a bait cast there is on the fish. Below that skill you hear them but cannot see where.`
		},
		{
			question: 'Which keys do what?',
			answer: `Click a peg to choose a swim; click the water to cast the next rod; 1, 2 and 3 reel a rod in; M moves swim; Enter strikes; hold Space to reel and release it to give line on a run.`
		}
	]
};
