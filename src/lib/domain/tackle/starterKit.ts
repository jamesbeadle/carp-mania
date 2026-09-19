import { StarterSetup } from './rodSetup';

export interface KitLine {
	itemId: string;
	quantity: number;
}

const RodsInTheKit = 3;
const SpoolMetres = 1000;
const HooksInTheKit = 20;
const RigsInTheKit = 10;
const LeadsInTheKit = 20;
const TubingInTheKit = 10;
const BaitInTheKit = 300;

export const StarterKit: KitLine[] = [
	{ itemId: StarterSetup.rod, quantity: RodsInTheKit },
	{ itemId: StarterSetup.reel, quantity: RodsInTheKit },
	{ itemId: StarterSetup.line, quantity: SpoolMetres * RodsInTheKit },
	{ itemId: StarterSetup.hook, quantity: HooksInTheKit },
	{ itemId: StarterSetup.rig, quantity: RigsInTheKit },
	{ itemId: StarterSetup.lead, quantity: LeadsInTheKit },
	{ itemId: StarterSetup.tubing, quantity: TubingInTheKit },
	{ itemId: StarterSetup.bait, quantity: BaitInTheKit }
];
