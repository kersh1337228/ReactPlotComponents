import HistogramBase, {HistogramStyle} from "./HistogramBase"
import {PointGeometrical, ObjectGeometrical} from "../../../../utils/types/plotData"
import React from "react";
import NumberRange from "../../../../utils/classes/iterable/NumberRange";
import xAxisBase from "../../axes/axis/xAxis/xAxisBase";
import {range} from "../../../../utils/functions/numberProcessing";

export default class HistogramObjectGeometrical extends HistogramBase<ObjectGeometrical> {
	public constructor(
		data: ObjectGeometrical[], name: string = '',
		style: HistogramStyle = { color: { pos: '#53e9b5', neg: '#da2c4d' } },
		public value_field: string
	) {
		const [xs, ys] = [
			Array.from(data, point => point.timestamp), Array.from(
				data, point => point[value_field]
			).filter(y => y !== null) as number[]
		]
		const columnWidth = Math.min.apply(
			null, range(0, xs.length - 1).map(i => xs[i + 1] - xs[i])
		)
		super({
			data, x: {
				min: Math.min.apply(null, xs),
				max: Math.max.apply(null, xs)
			}, y: {
				min: Math.min.apply(null, ys),
				max: Math.max.apply(null, ys)
			}
		}, name, style, value_field, columnWidth)
	}
	public pointAt(i: number): PointGeometrical {
		const data = this.global.data[i]
		return [data.timestamp, data[this.value_field]]
	}
	public showTooltip(x: number): React.ReactNode {
		return super.showTooltip(
			((this.axes.state.axes.x as xAxisBase<any, any>).data.global as NumberRange).indexOf(
				(x - (this.axes.state.axes.x as xAxisBase<any, any>).translate) /
				(this.axes.state.axes.x as xAxisBase<any, any>).scale
			) as number
		)
	}
}
