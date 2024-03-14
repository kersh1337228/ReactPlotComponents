import {DateTime, Duration} from "../dataTypes/dateTime"
import TypedRange from "./TypedRange"
import Drawing from "../../../components/plot_refactor/drawings/Drawing/Drawing"
import {plotDataType} from "../../functions/plotDataProcessing"
import {ObjectTimeSeries, PointTimeSeries, TimeSeries} from "../../types/plotData"

export default class DateTimeRange extends TypedRange<DateTime> {
	constructor(
		start: DateTime | Date | string,
		end: DateTime | Date | string,
		public readonly freq: Duration = Duration.days(1)
	) {
		super()
		const [first, last] = [new DateTime(start), new DateTime(end)]
		for(let i = first.object; i <= last.object; i = new Date(i.getTime() + freq.milliseconds))
			this.container.push(new DateTime(i))
	}
	public format(format_string: string): string[] {
		return this.container.map(dt => dt.format(format_string))
	}
	public at(i: number): DateTime | undefined { return this.container.at(i) }
	public slice(begin: number, end: number): DateTimeRange {
		return new DateTimeRange(
			this.container[begin], this.container[end - 1 < 0 ? 0 : end - 1], this.freq
		)
	}
}

export function plotDateTimeRange(drawings: Drawing<TimeSeries, any, any>[]): DateTimeRange {
	const dates = [...new Set(([] as Array<number>).concat(...drawings.map((drawing) =>
		plotDataType(drawing.global.data) === 'PointTimeSeries' ?
			Array.from(drawing.global.data as PointTimeSeries[], arr => new Date(arr[0]).getTime()) :
			Array.from(drawing.global.data as ObjectTimeSeries[], arr => new Date(arr.timestamp).getTime())
	)).sort((a, b) => a > b ? 1 : a < b ? -1 : 0))]
	let freq = Infinity
	for (let i = 1; i < dates.length; ++i)
		freq = dates[i] - dates[i - 1] < freq ? dates[i] - dates[i - 1] : freq
	return new DateTimeRange(
		new Date(dates[0]),
		new Date(dates.at(-1) as number),
		Duration.milliseconds(freq)
	)
}
