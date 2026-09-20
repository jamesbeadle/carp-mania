import { error, json } from '@sveltejs/kit';
import { isTackleLossKind, MostLossesAVisit, tackleLostBy, type TackleLossKind } from '$lib/domain/tackle/losses';
import { isPrototypeItemId } from '$lib/domain/tackle/prototypes';
import { isRodSetup, kitFor, type RodKit } from '$lib/domain/tackle/rodSetup';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { requireUser } from '../gates/requireUser';
import { loadVisitOf } from '../queries/loadVisitForCatch';

const HttpStatus = { BadRequest: 400 } as const;
const LongestCastMetres = 120;

interface LossReport {
	visitId: string;
	kind: TackleLossKind;
	castDistanceMetres: number;
	hoursFished: number;
	kit: RodKit;
}

function readLossReport(body: unknown): LossReport | null {
	const candidate = body as { visitId?: unknown; kind?: unknown; castDistanceMetres?: unknown; hoursFished?: unknown; setup?: unknown } | null;
	if (!candidate || typeof candidate.visitId !== 'string') return null;
	if (!isTackleLossKind(candidate.kind) || !isRodSetup(candidate.setup)) return null;
	const castDistanceMetres = Number(candidate.castDistanceMetres) || 0;
	const hoursFished = Number(candidate.hoursFished) || 0;
	return { visitId: candidate.visitId, kind: candidate.kind, castDistanceMetres, hoursFished, kit: kitFor(candidate.setup) };
}

export async function LoseTackle(locals: App.Locals, body: unknown) {
	const user = requireUser(locals);
	const report = readLossReport(body);
	if (!report) error(HttpStatus.BadRequest, 'That loss is not one the bailiff can read');
	const visit = await loadVisitOf(user.id, report.visitId);
	if (!visit) error(HttpStatus.BadRequest, 'No day ticket for this visit');
	const isBaitOnly = report.kind === 'bait_fished';
	if (!isBaitOnly && (visit.tackle_losses ?? 0) >= MostLossesAVisit) error(HttpStatus.BadRequest, 'Nobody loses that much tackle in a day');
	const castMetres = Math.min(LongestCastMetres, Math.max(0, report.castDistanceMetres));
	const trusted = trustedSupabase();
	for (const line of tackleLostBy(report.kind, report.kit, castMetres, report.hoursFished)) {
		const used = { player: user.id, item: line.itemId, amount: line.quantity };
		await trusted.rpc('use_tackle', used);
		if (isPrototypeItemId(line.itemId)) await trusted.rpc('strike_prototype', { player: user.id, item: used.item });
	}
	if (!isBaitOnly) await trusted.from('lake_visits').update({ tackle_losses: (visit.tackle_losses ?? 0) + 1 }).eq('id', visit.id);
	return json({ isRecorded: true });
}
