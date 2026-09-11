import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorldPin } from '$lib/contracts/WorldPin';
import type { GlobePoint } from '$lib/domain/world/greatCircle';
import type { WorldEvent } from '$lib/domain/worldTypes';
import { ArcTiming, type GlobeArc } from '$lib/game/globe/drawArcs';
import { PulseTiming, type GlobePulse } from '$lib/game/globe/drawPulses';

export const WorldChannel = 'world';
const WorldEventInserts = { event: 'INSERT', schema: 'public', table: 'world_events' } as const;

export type FindPin = (lakeId: string) => WorldPin | null;

export function subscribeToWorldEvents(supabase: SupabaseClient, onEvent: (event: WorldEvent) => void): () => void {
	const channel = supabase
		.channel(WorldChannel)
		.on('postgres_changes', WorldEventInserts, (change) => onEvent(change.new as WorldEvent))
		.subscribe();
	return () => {
		supabase.removeChannel(channel);
	};
}

export function arcFor(event: WorldEvent, findPin: FindPin, now: number): GlobeArc | null {
	if (event.kind !== 'sale' || !event.other_lake_id) return null;
	const seller = findPin(event.lake_id);
	const buyer = findPin(event.other_lake_id);
	if (!seller || !buyer) return null;
	return { from: pointOf(seller), to: pointOf(buyer), startedAt: now };
}

export function pulseFor(event: WorldEvent, findPin: FindPin, now: number): GlobePulse | null {
	if (event.kind !== 'big_catch' && event.kind !== 'record') return null;
	const pin = findPin(event.lake_id);
	if (!pin) return null;
	return { ...pointOf(pin), kind: event.kind, startedAt: now };
}

export function liveArcs(arcs: GlobeArc[], now: number): GlobeArc[] {
	return arcs.filter((arc) => now - arc.startedAt <= ArcTiming.LifetimeMs);
}

export function livePulses(pulses: GlobePulse[], now: number): GlobePulse[] {
	return pulses.filter((pulse) => now - pulse.startedAt <= PulseTiming.LifetimeMs);
}

function pointOf(pin: WorldPin): GlobePoint {
	return { latitude: pin.latitude, longitude: pin.longitude };
}
