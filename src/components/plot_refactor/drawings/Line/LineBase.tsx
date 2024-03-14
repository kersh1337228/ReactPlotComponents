import React from "react"
import Drawing, {DrawingData} from "../Drawing/Drawing"
import {PlotData} from "../../../../utils/types/plotData"
import {round} from "../../../../utils/functions/numberProcessing"
import xAxisBase from "../../axes/axis/xAxis/xAxisBase"
import yAxis from "../../axes/axis/yAxis/yAxis"

export type LinePath = Path2D
export interface LineStyle { color: string, width: number }

export default abstract class LineBase<T extends PlotData> extends Drawing<T, LinePath, LineStyle> {
	protected constructor(
		global: DrawingData<T>, name: string = '',
		style: LineStyle = { color: '#000000', width: 1 },
		value_field: string = ''
	) {
		super(global, new Path2D(), name, style, value_field)
		// Pre-drawing path
		const line = new Path2D()
		const i0 = [...Array(  // The first index with data present
			this.local.data.length
		).keys()].findIndex(i => this.pointAt(i)[1] !== null)
		line.moveTo(...this.pointAt(i0) as [number, number])
		global.data.slice(i0).forEach((d, i) => {
			const [x, y] = this.pointAt(i0 + i)
			if (y) { line.lineTo(x, y) }
		})
		this.paths.addPath(line)
	}
	public async plot(): Promise<void> {
		const ctx = (
			this.axes.state.canvases.plot.ref.current as HTMLCanvasElement
		).getContext('2d') as CanvasRenderingContext2D
		if (this.visible) {
			ctx.save()
			ctx.lineWidth = this.style.width
			ctx.strokeStyle = this.style.color
			ctx.stroke(this.axes.applyTransform(this.paths))
			ctx.restore()
		}
	}
	public showTooltip(x: number): React.ReactNode {  // index (i) is actually passed instead of coordinate (x)
		// Drawing circle
		const [xi, yi] = this.pointAt(x)
		if (yi) {
			const ctx = (
				this.axes.state.canvases.tooltip.ref.current as HTMLCanvasElement
			).getContext('2d') as CanvasRenderingContext2D
			ctx.save()
			ctx.beginPath()
			ctx.arc(
				xi * (this.axes.state.axes.x as xAxisBase<any, any>).scale +
				(this.axes.state.axes.x as xAxisBase<any, any>).translate,
				yi * (this.axes.state.axes.y as yAxis).scale +
				(this.axes.state.axes.y as yAxis).translate,
				3 * this.axes.state.canvases.plot.density,
				0, 2 * Math.PI
			)
			ctx.fillStyle = this.style.color
			ctx.fill()
			ctx.closePath()
			ctx.restore()
			// Popup tooltip
			return(
				<span key={this.name} className={'drawingTooltips'}>
					{this.name}: {round(yi as number, 2)}
				</span>
			)
		}
	}
	public showStyle(): React.ReactElement {
		return (
			<div key={this.name}>
				<label htmlFor={'visible'}>{this.name}</label>
				<input
					type={'checkbox'} name={'visible'}
					onChange={event => {
						this.visible = event.target.checked
						this.axes.plot()
					}} defaultChecked={this.visible}
				/>
				<ul>
					<li>
						Line color: <input
						defaultValue={this.style.color}
						onChange={event => {
							this.style.color = event.target.value
							this.axes.plot()
						}} type={'color'}/>
					</li>
					<li>
						Line width: <input
						type={'number'} min={1} max={3} step={1}
						defaultValue={this.style.width}
						onChange={event => {
							this.style.width = event.target.valueAsNumber
							this.axes.plot()
						}}/>
					</li>
				</ul>
			</div>
		)
	}
}
