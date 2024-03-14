import LineBase, {LineStyle} from "./LineBase"
import {PointGeometrical, ObjectGeometrical} from "../../../../utils/types/plotData"
import React from "react";
import NumberRange from "../../../../utils/classes/iterable/NumberRange";
import xAxisBase from "../../axes/axis/xAxis/xAxisBase";

export default class LineObjectGeometrical extends LineBase<ObjectGeometrical> {
	public constructor(
		data: ObjectGeometrical[], name: string = '',
		style: LineStyle = { color: '#000000', width: 1 },
		public value_field: string
	) {
		const [xs, ys] = [
			Array.from(data, point => point.timestamp), Array.from(
				data, point => point[value_field]
			).filter(y => y !== null) as number[]
		]
		super({
			data, x: {
				min: Math.min.apply(null, xs),
				max: Math.max.apply(null, xs)
			}, y: {
				min: Math.min.apply(null, ys),
				max: Math.max.apply(null, ys)
			}
		}, name, style, value_field)
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
