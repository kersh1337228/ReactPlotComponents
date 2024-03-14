import TypedRange from "./TypedRange"
import Drawing from "../../../components/plot_refactor/drawings/Drawing/Drawing"
import {Geometrical} from "../../types/plotData"

export default class NumberRange extends TypedRange<number> {
	constructor(arrays: number[][]) {
		super([...new Set(([] as Array<number>).concat(...arrays).sort(
			(a, b) => a < b ? -1 : a > b ? 1 : 0
		))])
	}
	public format(format_string: string): string[] {
		const matches = [...format_string.matchAll(/%\.(\d*)f/g)]
		return this.container.map(num => {
			let fstr = format_string
			matches.forEach(match => {
				fstr = fstr.replace(match[0], String(Math.round((
					num + Number.EPSILON
				) * 10 ** parseInt(match[1])) / 10 ** parseInt(match[1])))
			})
			return fstr
		})
	}
	public at(i: number): number | undefined {
		return this.container.at(i)
	}
	public slice(begin: number, end: number): NumberRange {
		return new NumberRange([this.container.slice(begin, end)])
	}
	public nearest(x: number, tolerance: number = Infinity): number | undefined {
		const nearest_value = [...this.container].sort(
			(a, b) => Math.abs(a - x) < Math.abs(b - x) ? -1 : 1
		).at(0) as number
		return Math.abs(nearest_value - x) < tolerance ? nearest_value : undefined
	}
	public indexOf(value: number, tolerance: number = Infinity): number | undefined {
		const nearest_value = this.nearest(value, tolerance)
		return nearest_value ? this.container.indexOf(nearest_value) : undefined
	}
}

export function plotNumberRange(drawings: Drawing<Geometrical, any, any>[]): NumberRange {
	return new NumberRange(drawings.map(
		drawing => drawing.points.map(point => point[0])
	))
}
