<script lang="ts">
	import type { Facility } from '$lib/domain/layout/layoutTypes';
	import { FacilityGlyphBox, FacilityGlyphPaths } from '$lib/game/render/facilityGlyphs';

	let { facility, size = 16 }: { facility: Facility; size?: number } = $props();
</script>

<svg viewBox="0 0 {FacilityGlyphBox} {FacilityGlyphBox}" width={size} height={size} aria-hidden="true" class="shrink-0 fill-current"><path d={FacilityGlyphPaths[facility]} fill-rule="evenodd" /></svg>
