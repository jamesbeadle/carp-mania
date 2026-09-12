export interface Fisherman {
	id: string;
	profile_id: string;
	generation: number;
	name: string;
	born_age: number;
	retires_at_age: number;
	started_at: string;
	retired_at: string | null;
	final_skill: number | null;
	final_experience: number | null;
	catches: number | null;
	personal_best_lb: number | null;
}
