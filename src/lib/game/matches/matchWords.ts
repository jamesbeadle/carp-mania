import type { Match, MatchPhase, TrophyKind } from '$lib/domain/matches/matchTypes';
import { formatWhen } from '$lib/format/dates';
import { timeLeft } from '$lib/format/timeLeft';

const MillisecondsPerHour = 60 * 60 * 1000;

export const MatchPhaseWords: Record<MatchPhase, string> = {
	upcoming: 'Coming up',
	in_play: 'In play',
	ended: 'Ended — settling up',
	settled: 'Settled',
	cancelled: 'Called off'
};

export const TrophyWords: Record<TrophyKind, string> = { most_catches: 'Most catches', biggest_fish: 'Biggest fish' };

export function hoursOf(match: Pick<Match, 'starts_at' | 'ends_at'>) {
	return Math.round((new Date(match.ends_at).getTime() - new Date(match.starts_at).getTime()) / MillisecondsPerHour);
}

export function timelineOf(match: Pick<Match, 'starts_at' | 'ends_at'>, phase: MatchPhase, now: Date) {
	if (phase === 'upcoming') return `starts in ${timeLeft(match.starts_at, now)} · ${formatWhen(match.starts_at)}, ${hoursOf(match)} hours`;
	if (phase === 'in_play') return `ends in ${timeLeft(match.ends_at, now)}`;
	return `${formatWhen(match.starts_at)} to ${formatWhen(match.ends_at)}`;
}

export function pegsWords(entryCount: number, pegs: number) {
	return `${entryCount} of ${pegs} pegs taken`;
}
