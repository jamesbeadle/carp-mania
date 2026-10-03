export function isUnderAny(pathname: string, roots: string[]) {
	return roots.some((root) => pathname === root || pathname.startsWith(`${root}/`));
}
