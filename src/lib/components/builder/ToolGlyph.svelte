<script lang="ts">
	import type { BuilderTool } from '$lib/game/builder/toolCatalogue';

	let { tool, size = 22 }: { tool: BuilderTool; size?: number } = $props();

	const Paths: Record<BuilderTool, string> = {
		select: 'M5 3l14 8-6 2-3 6z',
		island: 'M4 14c2-6 14-6 16 0-2 4-14 4-16 0zM12 8v-4M10 5l2-1 2 1',
		bar: 'M3 17c3-6 6-6 9 0s6 6 9 0M3 20h18',
		deepen: 'M4 6h16M12 9v10M8 15l4 4 4-4',
		dredge: 'M12 3v9M8 12h8l-1 6H9zM12 21v-3',
		shelf: 'M3 8h6v4h6v4h6',
		reeds: 'M7 21V8M12 21V4M17 21V9M7 8c-2 0-3 2-3 4M17 9c2 0 3 2 3 4',
		lilies: 'M6 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0M14 15a3 3 0 1 0 6 0 3 3 0 1 0-6 0M9 17l1 3',
		snag: 'M12 21V9M12 13l-5-4M12 11l5-5M7 9L5 6M17 6l2-3',
		sanctuary: 'M4 18c3-3 5-3 8 0s5 3 8 0M12 3l2 4h-4zM12 7v5',
		swim: 'M12 3v18M8 21h8M12 7l6 3-6 3',
		redraw: 'M3 16c4-8 8-8 12-4M15 12l4-4M17 5l2 2M5 20l3-1-2-2z',
		shore: 'M3 12c3-4 6-4 9 0s6 4 9 0M3 18c3-4 6-4 9 0s6 4 9 0',
		extend: 'M4 20l7-7M4 20v-6M4 20h6M14 4h6v6M20 4l-7 7',
		land: 'M3 3h18v18H3zM12 8v8M8 12h8',
		facility: 'M3 11l9-7 9 7M6 10v10h12V10M10 20v-5h4v5'
	};
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
	<path d={Paths[tool]} />
</svg>
