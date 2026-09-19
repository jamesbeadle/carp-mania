import { error, json } from '@sveltejs/kit';
import { isTackleLossKind, MostLossesAVisit, tackleLostBy, type TackleLossKind } from '$lib/domain/tackle/losses';
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
	kit: RodKit;
}

function readLossReport(body: unknown): LossReport | null {
	const candidate = body as { visitId?: unknown; kind?: unknown; castDistanceMetres?: unknown; setup?: unknown } | null;
	if (!candidate || typeof candidate.visitId !== 'string') return null;
	if (!isTackleLossKind(candidate.kind) || !isRodSetup(candidate.setup)) return null;
	const castDistanceMetres = Number(candidate.castDistanceMetres) || 0;
	return { visitId: candidate.visitId, kind: candidate.kind, castDistanceMetres, kit: kitFor(candidate.setup) };
}

export async function LoseTackle(locals: App.Locals, body: unknown) {
	const user = requireUser(locals);
	const report = readLossReport(body);
	if (!report) error(HttpStatus.BadRequest, 'That loss is not one the bailiff can read');
	const visit = await loadVisitOf(user.id, report.visitId);
	if (!visit) error(HttpStatus.BadRequest, 'No day ticket for this visit');
	if ((visit.tackle_losses ?? 0) >= MostLossesAVisit) error(HttpStatus.BadRequest, 'Nobody loses that much tackle in a day');
	const castMetres = Math.min(LongestCastMetres, Math.max(0, report.castDistanceMetres));
	const trusted = trustedSupabase();
	for (const line of tackleLostBy(report.kind, report.kit, castMetres)) {
		const used = { player: user.id, item: line.itemId, amount: line.quantity };
		await trusted.rpc('use_tackle', used);
	}
	await trusted.from('lake_visits').update({ tackle_losses: (visit.tackle_losses ?? 0) + 1 }).eq('id', visit.id);
	return json({ isRecorded: true });
}
