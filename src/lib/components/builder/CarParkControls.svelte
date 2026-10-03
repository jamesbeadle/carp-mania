<script lang="ts">
	import { CarParkRules } from '$lib/domain/groundworks/sites/carParkPlan';
	import { CarParkPrices } from '$lib/domain/groundworks/sites/carParkPrice';
	import { CarParkSurfaces, type CarParkSpec, type CarParkSurface } from '$lib/domain/layout/facilitySite';
	import { formatMoney } from '$lib/format/money';

	interface Props {
		spec: CarParkSpec;
		standing: CarParkSpec | null;
		onChange: (spec: CarParkSpec) => void;
	}

	let { spec, standing, onChange }: Props = $props();

	const SurfaceLabels: Record<CarParkSurface, string> = { gravel: 'Gravel', tarmac: 'Tarmac' };
	const fewestSpaces = $derived(standing?.spaces ?? CarParkRules.MinimumSpaces);
	const withSpacesFrom = (input: HTMLInputElement) => onChange({ ...spec, spaces: Number(input.value) });
	const withLightsFrom = (input: HTMLInputElement) => onChange({ ...spec, isLit: input.checked });
	const isSurfaceLocked = (surface: CarParkSurface) => standing?.surface === 'tarmac' && surface === 'gravel';
</script>

<fieldset class="space-y-3">
	<label class="block">
		<span class="flex items-baseline justify-between"><span class="stat-label">Spaces</span><span class="font-display text-2xl text-volt-300">{spec.spaces}</span></span>
		<input type="range" class="w-full accent-volt-500" min={fewestSpaces} max={CarParkRules.MaximumSpaces} step="1" value={spec.spaces} oninput={(event) => withSpacesFrom(event.currentTarget)} aria-label="Spaces" />
		<input type="number" class="field" required min={fewestSpaces} max={CarParkRules.MaximumSpaces} step="1" value={spec.spaces} oninput={(event) => withSpacesFrom(event.currentTarget)} aria-label="Spaces, typed" />
	</label>
	<div class="flex gap-1" role="radiogroup" aria-label="Surface">
		{#each CarParkSurfaces as surface (surface)}
			{@const isChosen = spec.surface === surface}
			<button type="button" role="radio" aria-checked={isChosen} class="flex-1 rounded-md border border-carbon-600 px-2 py-1 text-sm" class:bg-volt-500={isChosen} class:text-carbon-950={isChosen} disabled={isSurfaceLocked(surface)} onclick={() => onChange({ ...spec, surface })}>
				{SurfaceLabels[surface]} · {formatMoney(CarParkPrices.PerSpace[surface])} a space
			</button>
		{/each}
	</div>
	<label class="flex items-center gap-2 text-sm text-mist-200">
		<input type="checkbox" class="accent-volt-500" checked={spec.isLit} disabled={standing?.isLit === true} onchange={(event) => withLightsFrom(event.currentTarget)} />
		Lights · {formatMoney(CarParkPrices.Lighting)} and {formatMoney(CarParkPrices.LightingPerDay)} a day
	</label>
</fieldset>
