export const BidTerms = { IncrementShare: 0.02, MinimumIncrement: 10, RoundUpTo: 10 } as const;

export function nextBidAfter(currentBid: number | null, startingPrice: number) {
	if (currentBid === null) return roundUp(startingPrice);
	const increment = Math.max(BidTerms.MinimumIncrement, currentBid * BidTerms.IncrementShare);
	return roundUp(currentBid + increment);
}

export function landedCost(bidAmount: number, transportCost: number) {
	return bidAmount + transportCost;
}

function roundUp(amount: number) {
	return Math.ceil(amount / BidTerms.RoundUpTo) * BidTerms.RoundUpTo;
}
