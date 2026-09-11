const FirstNames = ['Dave', 'Terry', 'Kev', 'Ali', 'Jordan', 'Sam', 'Lee', 'Chris', 'Danny', 'Mo', 'Ash', 'Steve', 'Nat', 'Robbie', 'Priya'];
const Nicknames = ['the Bivvy', 'Big Rod', 'Night Owl', 'Margin Man', 'Zig King', 'Silt Whisperer', 'Boilie Bob', 'Two Rods', 'Dawn Patrol', 'Hemp Head'];

export function randomAnglerName(randomFraction: number, secondRandomFraction: number) {
	const firstName = FirstNames[Math.floor(randomFraction * FirstNames.length)];
	const nickname = Nicknames[Math.floor(secondRandomFraction * Nicknames.length)];
	return `${firstName} "${nickname}"`;
}
