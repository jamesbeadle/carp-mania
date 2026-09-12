import type { WorldActivity } from '$lib/contracts/WorldActivity';
import { FeedWindow, isActivityInGroup, type FeedGroup } from '$lib/domain/world/feedGroups';

const FirstLines = 8;
const MoreLines = 12;
const Everything = 'everything';

export class FeedView {
	group = $state<FeedGroup | null>(null);
	shown = $state(FirstLines);
	isLoading = $state(false);
	private exhausted = $state<string[]>([]);

	choose(group: FeedGroup | null) {
		this.group = group;
		this.shown = FirstLines;
	}

	linesOf(feed: WorldActivity[]): WorldActivity[] {
		return this.inGroup(feed).slice(0, this.shown);
	}

	hasMoreLoaded(feed: WorldActivity[]) {
		return this.inGroup(feed).length > this.shown;
	}

	get isExhausted() {
		return this.exhausted.includes(this.group ?? Everything);
	}

	showMore() {
		this.shown += MoreLines;
	}

	receivedOlder(count: number) {
		this.shown += count;
		if (count < FeedWindow.PageSize) this.exhausted = [...this.exhausted, this.group ?? Everything];
	}

	private inGroup(feed: WorldActivity[]) {
		return feed.filter((activity) => isActivityInGroup(activity, this.group));
	}
}
