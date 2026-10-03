import { NameCheckParam, type NameAvailability } from '$lib/contracts/AnglerLicence';

const NameCheckPath = '/welcome/name';
const PauseBeforeAsking = 350;

export class NameCheck {
	availability = $state<NameAvailability | null>(null);
	isChecking = $state(false);
	private pending: ReturnType<typeof setTimeout> | null = null;
	private inFlight: AbortController | null = null;

	isFree(name: string) {
		return this.availability?.name === name.trim() && this.availability.isFree;
	}

	check(name: string) {
		this.cancel();
		this.isChecking = true;
		this.pending = setTimeout(() => this.ask(name.trim()), PauseBeforeAsking);
	}

	cancel() {
		if (this.pending) clearTimeout(this.pending);
		this.inFlight?.abort();
	}

	private async ask(name: string) {
		this.inFlight = new AbortController();
		const query = new URLSearchParams({ [NameCheckParam]: name });
		const { signal } = this.inFlight;
		const response = await fetch(`${NameCheckPath}?${query}`, { signal }).catch(() => null);
		if (signal.aborted) return;
		this.isChecking = false;
		if (!response?.ok) return;
		this.availability = (await response.json().catch(() => null)) as NameAvailability | null;
	}
}
