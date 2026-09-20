export type TackleKind = 'rod' | 'reel' | 'line' | 'hook' | 'rig' | 'lead' | 'tubing' | 'bait';

export const TackleKinds: TackleKind[] = ['rod', 'reel', 'line', 'hook', 'rig', 'lead', 'tubing', 'bait'];

export const TackleKindLabels: Record<TackleKind, string> = {
	rod: 'Rods',
	reel: 'Reels',
	line: 'Line',
	hook: 'Hooks',
	rig: 'Rigs',
	lead: 'Leads',
	tubing: 'Tubing',
	bait: 'Bait'
};

export const KindsThatRunOut: TackleKind[] = ['line', 'hook', 'rig', 'lead', 'tubing', 'bait'];

export const UnitWords: Record<TackleKind, string> = {
	rod: 'rod',
	reel: 'reel',
	line: 'm',
	hook: 'hooks',
	rig: 'rigs',
	lead: 'leads',
	tubing: 'lengths',
	bait: 'baits'
};

export function doesKindRunOut(kind: TackleKind) {
	return KindsThatRunOut.includes(kind);
}
