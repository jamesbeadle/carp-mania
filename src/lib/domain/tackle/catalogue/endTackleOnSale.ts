import { BrandCatalogue, type BrandName } from '../brands';
import { RigCatalogue, RigNames, type RigName } from '../rigs';
import { PackSizes, type LeadItem, type RigItem, type TubingItem } from '../tackleItem';
import { TubingColours, type TubingColour } from '../tubing';

interface Maker {
	brand: BrandName;
	pricePerPack: number;
}

const RigMakers: Maker[] = [
	{ brand: 'bankside_basics', pricePerPack: 6 },
	{ brand: 'marlow', pricePerPack: 10 },
	{ brand: 'halcyon', pricePerPack: 18 },
	{ brand: 'vellum_and_steel', pricePerPack: 35 }
];
const LeadMakers: Maker[] = [
	{ brand: 'bankside_basics', pricePerPack: 8 },
	{ brand: 'quarryman', pricePerPack: 12 }
];
const TubingMakers: Maker[] = [
	{ brand: 'bankside_basics', pricePerPack: 5 },
	{ brand: 'marlow', pricePerPack: 8 }
];
const TubingColourWords: Record<TubingColour, string> = { black: 'black', yellow: 'yellow', brown: 'brown', green: 'green' };

export const RigsOnSale: RigItem[] = RigMakers.flatMap((maker) => RigNames.map((rig) => rigItem(maker, rig)));
export const LeadsOnSale: LeadItem[] = LeadMakers.map(leadItem);
export const TubingOnSale: TubingItem[] = TubingMakers.flatMap((maker) => TubingColours.map((colour) => tubingItem(maker, colour)));

function baseOf(maker: Maker, id: string, label: string, packQuantity: number) {
	const brand = BrandCatalogue[maker.brand];
	const { tier, minimumRating } = brand;
	return { id, brand: maker.brand, tier, label: `${brand.label} ${label}`, price: maker.pricePerPack, minimumRating, packQuantity };
}

function rigItem(maker: Maker, rig: RigName): RigItem {
	const rigLabel = RigCatalogue[rig].label.toLowerCase();
	return { ...baseOf(maker, `${maker.brand}-rig-${rig}`, `${rigLabel}, tied`, PackSizes.Rigs), kind: 'rig', rig };
}

function leadItem(maker: Maker): LeadItem {
	return { ...baseOf(maker, `${maker.brand}-lead`, 'leads', PackSizes.Leads), kind: 'lead' };
}

function tubingItem(maker: Maker, colour: TubingColour): TubingItem {
	return { ...baseOf(maker, `${maker.brand}-tubing-${colour}`, `${TubingColourWords[colour]} tungsten tubing`, PackSizes.Tubing), kind: 'tubing', tubing: colour };
}
