import { LegalContact, type LegalDocument } from './legalPages';

const { email, site, minimumAge, updatedOn } = LegalContact;

export const PrivacyPolicy: LegalDocument = {
	title: 'Privacy',
	summary: `Carp Mania is a free browser game. This page says what we hold about you, why, who else sees it, and how to get it changed or deleted. The short version: we keep what the game needs to work, we don't sell it, and there are no adverts and no trackers.`,
	updatedOn,
	sections: [
		{
			heading: 'Who we are',
			paragraphs: [`"We" means the people who run Carp Mania at ${site}. For anything about your data, write to ${email}. We answer within a month, and usually much sooner.`]
		},
		{
			heading: 'What we hold about you',
			paragraphs: [
				`When you sign in with Google, Google tells us the email address, the name and the profile picture on your Google account. We keep all three: the email address identifies your account, the name becomes your angler's name in the game, and the picture becomes your avatar. We never see your Google password.`,
				`Everything you do in the game is stored so it can carry on where you left off: your waters and their layouts, the fish in them and what happens to them, your catches, day tickets, matches, sales and bids, your in-game money, the notes on your noticeboard, the waters you favourite, the region you chose for your fishery, and the spot where you pinned it on the globe. The region and the pin are places you pick for your water; the game never reads your device's location.`,
				`Our hosting providers keep ordinary server logs — the address your connection comes from, the browser you use and the pages you ask for — for security and to keep the service running. We don't run analytics, advertising or tracking scripts.`
			]
		},
		{
			heading: 'What we use it for',
			paragraphs: [
				`To run the game you asked for: signing you in, keeping your fishery going while you're away, showing your catches and matches to the other players, and pinning a note on your noticeboard when something happens on your water. That is the contract between us.`,
				`To keep the game fair and working: spotting abuse, fixing bugs and understanding why something broke. That is our legitimate interest in running a game people can trust.`,
				`Nothing else. We don't sell or rent your details, we don't build profiles of you, and we don't send marketing.`
			]
		},
		{
			heading: 'What other players can see',
			paragraphs: [
				`Carp Mania is a shared world. Other signed-in players can see your angler's name and picture, the waters you have opened to anglers and the fish in them, your catches, records and scrapbooks, the matches you host or enter, and the events the world feed reports — a big fish, a sale, a new water, a retirement. Your email address is never shown to anyone.`,
				`A water you keep private is visible only to you, though a fish you put up for sale is seen by everyone while the listing runs. Nothing in the game is visible to people who aren't signed in.`
			]
		},
		{
			heading: 'Cookies and your browser',
			paragraphs: [
				`Signing in sets a session cookie so the game knows it is you on every page. It is strictly necessary — the game cannot work without it — and it goes when you sign out.`,
				`Your browser also keeps one small setting of ours in its local storage: whether the sound is muted and how loud it is. It never leaves your device. We use no advertising or analytics cookies, which is why the game never asks you to accept any.`
			]
		},
		{
			heading: 'Who else handles your data',
			paragraphs: [
				`A few providers run the game for us, and each does only what we ask: Supabase stores the database and handles sign-in, Vercel hosts the site, and Google signs you in and serves the fonts the site uses — which means Google sees the address your connection comes from when a page loads.`,
				`These providers may keep data outside the United Kingdom, including in the United States. Where they do, they work under the standard contractual clauses recognised by UK data protection law.`
			]
		},
		{
			heading: 'How long we keep it',
			paragraphs: [
				`For as long as you have an account. The game's history is part of a shared world — a record set on someone else's water, a fish sold between fisheries, a line in the hall of fame — so when you ask us to delete your account we remove the account, your profile, your waters and everything private to you, while catch reports and records that other players already saw stay in the world with the angler's name as it appeared at the time. If you'd rather they didn't carry your name, say so and we'll change it to "a retired angler".`,
				`Server logs are kept by our providers for a limited time on their standard schedules and then dropped.`
			]
		},
		{
			heading: 'Your rights',
			paragraphs: [
				`You can ask us for a copy of what we hold about you, ask us to correct it (your angler's name, for instance, which comes from Google and doesn't update by itself), ask us to delete your account, object to how we use your data, or ask for it in a form you can take elsewhere. Write to ${email}.`,
				`If you think we've got something wrong, you can also complain to the Information Commissioner's Office at ico.org.uk — though we'd rather you gave us the chance to put it right first.`
			]
		},
		{
			heading: 'Children',
			paragraphs: [
				`Carp Mania is for players aged ${minimumAge} and over. We don't knowingly hold data about anyone younger; if you think a child under ${minimumAge} has an account, tell us and we'll remove it.`
			]
		},
		{
			heading: 'Security',
			paragraphs: [
				`The site runs over HTTPS. Sign-in is handled by Google and Supabase, so we never see or store a password, and every player's private data sits behind database access rules that stop one account reading another's. No system is perfectly secure, but if we ever learn of a breach that affects you, we'll tell you.`
			]
		},
		{
			heading: 'Changes to this page',
			paragraphs: [`When this page changes we update the date at the top, and if the change matters we say so in the game.`]
		}
	]
};
