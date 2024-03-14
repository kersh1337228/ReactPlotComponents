export default abstract class TypedRange<T> {
	protected readonly container: T[]
	constructor(init: T[] = []) { this.container = init }
	public at(i: number): T | undefined { return this.container.at(i) }
	public abstract slice(begin: number, end: number): TypedRange<T>
	public abstract format(format_string: string): string[]
	public [Symbol.iterator]() {
		let i = -1
		return {
			next: () => ({
				value: this.container[++i],
				done: !(i in this.container)
			})
		}
	}
	public get length() { return this.container.length }
}
