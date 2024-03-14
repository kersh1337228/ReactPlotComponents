export function defaultValue<T>(existingVal: T | undefined, defaultVal: T): T {
	return existingVal === undefined ? defaultVal : existingVal
}
