import HistogramBase, {HistogramStyle} from "./HistogramBase"
import {PointGeometrical, PointTimeSeries} from "../../../../utils/types/plotData"
import xAxisBase from "../../axes/axis/xAxis/xAxisBase";
import {DataRange} from "../../../../utils/types/display";

export default class HistogramPointTimeSeries extends HistogramBase<PointTimeSeries> {
	public constructor(
		data: PointTimeSeries[], name: string = '',
		style: HistogramStyle = { color: { pos: '#53e9b5', neg: '#da2c4d' } }
	) {
		const ys = Array.from(
			data, point => point[1]
		).filter(y => y !== null) as number[]
		super({
			data, x: {
				min: 0, max: data.length
			}, y: {
				min: Math.min.apply(null, ys),
				max: Math.max.apply(null, ys)
			}
		}, name, style)
	}
	public pointAt(i: number): PointGeometrical {
		return [i + 0.55, this.global.data[i][1]]
	}
	public async coordinatesTransform(dataRange: DataRange): Promise<void> {
		super.coordinatesTransform(dataRange)
		const ys = Array.from(
			this.local.data, point => point[1] as number
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
