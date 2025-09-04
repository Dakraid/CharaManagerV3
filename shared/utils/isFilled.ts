/**
 * Returns true if the provided value is a non-empty string that isn't just whitespace/newlines.
 *
 * Examples:
 * - isFilled("Hello") -> true
 * - isFilled("   ") -> false
 * - isFilled("\n\t") -> false
 * - isFilled(undefined) -> false
 * - isFilled(null) -> false
 */
export function isFilled(value: string | null | undefined): value is string {
	// typeof check ensures the value is a string
	// trim() removes spaces, tabs, and newlines; length > 0 means it's not empty/whitespace-only
	return typeof value === 'string' && value.trim().length > 0;
}

export default isFilled;
