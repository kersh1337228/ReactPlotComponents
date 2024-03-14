import HistogramBase, {HistogramStyle} from "./HistogramBase"
import {PointGeometrical} from "../../../../utils/types/plotData"
import React from "react";
import NumberRange from "../../../../utils/classes/iterable/NumberRange";
import xAxisBase from "../../axes/axis/xAxis/xAxisBase";
import {range} from "../../../../utils/functions/numberProcessing";

export default class HistogramPointGeometrical extends HistogramBase<PointGeometrical> {
	public constructor(
		data: PointGeometrical[], name: string = '',
		style: HistogramStyle = { color: { pos: '#53e9b5', neg: '#da2c4d' } }
	) {
		const [xs, ys] = [
			Array.from(data, point => point[0]), Array.from(
				data, point => point[1]
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
		}, name, style, '', columnWidth)
	}
	public pointAt(i: number): PointGeometrical {
		return this.global.data[i]
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
