import LineBase, {LineStyle} from "./LineBase"
import {PointGeometrical} from "../../../../utils/types/plotData"
import React from "react";
import NumberRange from "../../../../utils/classes/iterable/NumberRange"
import xAxisBase from "../../axes/axis/xAxis/xAxisBase"

export default class LinePointGeometrical extends LineBase<PointGeometrical> {
	public constructor(
		data: PointGeometrical[], name: string = '',
		style: LineStyle = { color: '#000000', width: 1 }
	) {
		const [xs, ys] = [
			Array.from(data, point => point[0]), Array.from(
				data, point => point[1]
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
		}, name, style)
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
