import { StartingFloat } from '$lib/domain/economy';
import { formatMoney } from '$lib/format/money';

export const TheGameHasGrown = `The game has grown. ${formatMoney(StartingFloat.GiftToExistingPlayers)} has landed in your account; your water is exactly as you left it. Put it on the map.`;
