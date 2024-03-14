// Math round function with fixed digits amount after decimal point
export function round(x: number, digits: number = 0): number {
	return Math.round(
		(x + Number.EPSILON) * 10 ** digits
	) / 10 ** digits
}
// Big number abbreviations
export function numberPower(x: number, digits: number = 0): string {
	const symbols = {1000000000: 'B',  1000000: 'M', 1000: 'K'}
	for (const [value, symbol] of Object.entries(symbols).reverse())
		if (x >= parseInt(value))
			return `${round(x / parseInt(value), digits)}${symbol}`
	return String(round(x, digits))
}
// Keeps number inside of bounds given
export function truncate(
	x: number,
	min: number = -Infinity,
	max: number = Infinity
): number {  // min <= x <= max
	return Math.min(max, Math.max(min, x))
}
// Python-like range function
export function range(start: number, stop: number, step: number = 1): number[] {
	return Array(
		Math.floor((stop - start) / step)
	).fill(0).map((_, i) => start + step * i)
}
