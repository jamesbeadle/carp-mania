import { LegalContact, type LegalDocument } from './legalPages';

const { email, minimumAge, updatedOn } = LegalContact;

export const TermsOfService: LegalDocument = {
	title: 'Terms',
	summary: `The short version: Carp Mania is a free game, the money in it isn't real, play fairly, keep your names decent, and don't be surprised when the game changes — it is still being built.`,
	updatedOn,
	sections: [
		{
			heading: 'The game',
			paragraphs: [
				`Carp Mania is a free browser game about running a carp fishery and fishing other people's. You don't pay to play and there is nothing to buy. The pounds in the game are game points: they have no value outside it, they can't be bought, sold or cashed out, and we can change how many of them there are at any time.`
			]
		},
		{
			heading: 'Your account',
			paragraphs: [
				`You sign in with a Google account, you must be at least ${minimumAge}, and you have one account. It is yours to look after, and what happens on it is your doing. Your angler's name is taken from your Google account when you first sign in; write to ${email} if you want it changed.`
			]
		},
		{
			heading: 'Fair play',
			paragraphs: [
				`Play the game yourself. No bots, scripts or automated play; no exploiting bugs (tell us about them instead, and we'll thank you); no pretending to be someone else; no trying to get at other players' data or the game's servers.`,
				`The names you give things — waters, fish, islands, heirs — are seen by every player, so keep them decent: nothing abusive, obscene, hateful, or aimed at a real person. We can rename or remove anything that breaks this, and we can suspend or close an account that does.`
			]
		},
		{
			heading: 'The shared world',
			paragraphs: [
				`What you do affects other players. When you sell a fish or open your water to anglers, you are making a deal with them inside the game, and the game's rules settle it: a sale that goes through goes through, and a ticket sold is a ticket sold. We don't referee disputes between players, but we will act on cheating.`
			]
		},
		{
			heading: 'Things will change',
			paragraphs: [
				`Carp Mania is being built in the open and it changes often. Rules, prices, weights, seasons, the way fish grow and die — all of it may change, and sometimes a change will alter your water, your fish or your money. We'll be as fair as we can about it and we'll tell you about the big ones, but we can't promise the game stays as it is or that your progress keeps its value.`
			]
		},
		{
			heading: 'Your names and creations',
			paragraphs: [
				`The names, layouts and other things you make in the game stay yours, and you give us permission to store them and show them to other players as part of the game — including, as the privacy page explains, in the shared history that remains after you leave.`
			]
		},
		{
			heading: 'Availability',
			paragraphs: [
				`We run the game as it is and as it is available. It may go down, lose data or stop altogether; we may take it offline for maintenance without notice; and if we decide to close it we'll give as much warning as we can. We don't promise it will be free of mistakes.`
			]
		},
		{
			heading: 'Liability',
			paragraphs: [
				`Carp Mania is a free game, and we are responsible to you only as far as the law requires. Nothing here limits our liability for death or personal injury caused by our negligence, for fraud, or for anything else the law says can't be limited. Beyond that, we aren't liable for lost progress, lost in-game money, or any loss that comes from relying on the game.`
			]
		},
		{
			heading: 'Ending things',
			paragraphs: [
				`You can stop playing whenever you like, and you can ask us to delete your account by writing to ${email}. We can suspend or close an account for breaking these terms, and we'll say why unless saying so would help somebody else break them.`
			]
		},
		{
			heading: 'The legal bit',
			paragraphs: [
				`These terms are governed by the law of England and Wales, and the courts of England and Wales have jurisdiction — without taking away any rights you have as a consumer where you live. If one part of these terms turns out to be unenforceable, the rest still stands.`
			]
		},
		{
			heading: 'Changes to these terms',
			paragraphs: [
				`When these terms change we update the date at the top and, for anything that matters, say so in the game. Carrying on playing after that means you accept the new terms. Questions to ${email}.`
			]
		}
	]
};
