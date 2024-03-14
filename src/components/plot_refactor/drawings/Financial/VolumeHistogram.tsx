import React from "react"
import {PointGeometrical, Quotes} from "../../../../utils/types/plotData"
import {HistogramStyle} from "../Histogram/HistogramBase"
import HistogramObjectTimeSeries from "../Histogram/HistogramObjectTimeSeries"
import {DataRange} from "../../../../utils/types/display"
import './Financial.css'
import {numberPower} from "../../../../utils/functions/numberProcessing";
import xAxisBase from "../../axes/axis/xAxis/xAxisBase";

export default class VolumeHistogram extends HistogramObjectTimeSeries {
	constructor(
		data: Quotes[], name: string = '',
		style: HistogramStyle = { color: { pos: '#53e9b5', neg: '#da2c4d' } }
	) {
		super(data, name, style, 'volume')
		// Pre-drawing paths
		this.paths = { pos: new Path2D(), neg: new Path2D() }
		data.forEach((d, i) => {
			const {open, close, volume} = d
			if (volume) {
				const column = new Path2D()
				column.rect(i + 0.1, 0, 0.9, volume)
				// Appending
				const type = (close as number) > (open as number) ? 'pos' : 'neg'
				this.paths[type].addPath(column)
			}
		})
	}
	public async coordinatesTransform(dataRange: DataRange): Promise<void> {
		super.coordinatesTransform(dataRange)
		const volumes = Array.from(
			this.local.data, obj => obj.volume as number
		).filter(volume => volume !== null)
		this.local.y.min = 0
		this.local.y.max = Math.max.apply(null, volumes)
	}
	public showTooltip(x: number): React.ReactNode {  // index (i) is actually passed instead of coordinate (x)
		const {open, close, volume} = this.global.data[Math.floor((
			x * this.axes.state.canvases.plot.density -
			(this.axes.state.axes.x as xAxisBase<any, any>).translate
		) / (this.axes.state.axes.x as xAxisBase<any, any>).scale)]
		const type = (close as number) > (open as number) ? 'pos' : 'neg'
		// Popup tooltip
		return volume !== null ? (
			<div key={this.name} className={'drawingTooltips'}>
			<span key={this.name} className={'marketData'}>
				volume: <span className={`value ${type}`}>{numberPower(volume, 2)}</span>
			</span>
			</div>
		) : undefined
	}
}
