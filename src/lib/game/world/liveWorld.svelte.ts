import type { WorldActivity } from '$lib/contracts/WorldActivity';
import type { WorldPin } from '$lib/contracts/WorldPin';
import { activityFrom } from '$lib/domain/world/worldActivity';
import type { WorldEvent } from '$lib/domain/worldTypes';
import type { GlobeArc } from '$lib/game/globe/drawArcs';
import type { GlobePulse } from '$lib/game/globe/drawPulses';
import { arcFor, liveArcs, livePulses, pulseFor } from './realtimeFeed';

export class LiveWorld {
	feed = $state<WorldActivity[]>([]);
	arcs = $state<GlobeArc[]>([]);
	pulses = $state<GlobePulse[]>([]);
	private pins: WorldPin[] = [];

	constructor(feed: WorldActivity[]) {
		this.feed = feed;
	}

	usePins(pins: WorldPin[]) {
		this.pins = pins;
	}

	receive(event: WorldEvent, now = Date.now()) {
		if (this.hasSeen(event.id)) return;
		const findPin = (lakeId: string) => this.pins.find((pin) => pin.id === lakeId) ?? null;
		this.feed = [activityFrom(event, findPin), ...this.feed];
		this.arcs = withNew(liveArcs(this.arcs, now), arcFor(event, findPin, now));
		this.pulses = withNew(livePulses(this.pulses, now), pulseFor(event, findPin, now));
	}

	remember(older: WorldActivity[]) {
		this.feed = [...this.feed, ...older.filter((activity) => !this.hasSeen(activity.id))];
	}

	private hasSeen(activityId: string) {
		return this.feed.some((activity) => activity.id === activityId);
	}
}

function withNew<Item>(items: Item[], item: Item | null): Item[] {
	return item ? [...items, item] : items;
}
