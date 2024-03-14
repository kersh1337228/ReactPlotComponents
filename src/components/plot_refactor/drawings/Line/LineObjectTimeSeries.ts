import LineBase, {LineStyle} from "./LineBase"
import {ObjectTimeSeries, PointGeometrical} from "../../../../utils/types/plotData"
import React from "react"
import xAxisBase from "../../axes/axis/xAxis/xAxisBase";
import {DataRange} from "../../../../utils/types/display";

export default class LineObjectTimeSeries extends LineBase<ObjectTimeSeries> {
	public constructor(
		data: ObjectTimeSeries[], name: string = '',
		style: LineStyle = { color: '#000000', width: 1 },
		public value_field: string
	) {
		const ys = Array.from(
			data, point => point[value_field]
		).filter(y => y !== null) as number[]
		super({
			data, x: {
				min: 0, max: data.length
			}, y: {
				min: Math.min.apply(null, ys),
				max: Math.max.apply(null, ys)
			}
		}, name, style, value_field)
	}
	public pointAt(i: number): PointGeometrical {
		return [i + 0.55, this.global.data[i][this.value_field]]
	}
	public async coordinatesTransform(dataRange: DataRange): Promise<void> {
		super.coordinatesTransform(dataRange)
		const ys = Array.from(
			this.local.data, point => point[this.value_field] as number
		).filter(volume => volume !== null)
		this.local.y.min = Math.min.apply(null, ys)
		this.local.y.max = Math.max.apply(null, ys)
	}
	public showTooltip(x: number): React.ReactNode {
		return super.showTooltip(Math.floor((
			x * this.axes.state.canvases.plot.density -
			(this.axes.state.axes.x as xAxisBase<any, any>).translate
		) / (this.axes.state.axes.x as xAxisBase<any, any>).scale))
	}
}
