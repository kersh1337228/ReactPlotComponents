import React from "react"
import Drawing, {DrawingData} from "../Drawing/Drawing"
import {PlotData} from "../../../../utils/types/plotData"
import {numberPower} from "../../../../utils/functions/numberProcessing"

export interface HistogramPath { pos: Path2D, neg: Path2D }
export interface HistogramStyle { color: { pos: string, neg: string } }

export default abstract class HistogramBase<T extends PlotData> extends Drawing<T, HistogramPath, HistogramStyle> {
	public constructor(
		global: DrawingData<T>, name: string = '',
		style: HistogramStyle = { color: { pos: '#53e9b5', neg: '#da2c4d' } },
		value_field: string = '',
		protected columnWidth: number = 0.9
	) {
		super(
			global, { pos: new Path2D(), neg: new Path2D() },
			name, style, value_field
		)
		// Pre-drawing paths
		global.data.forEach((d, i) => {
			const [x, y] = this.pointAt(i)
			if (y) {
				const column = new Path2D()
				column.rect(x - this.columnWidth / 2, 0, this.columnWidth, y)
				// Appending
				const type = y > 0 ? 'pos' : 'neg'
				this.paths[type].addPath(column)
			}
		})
	}
	public async plot(): Promise<void> {
		const ctx = (
			this.axes.state.canvases.plot.ref.current as HTMLCanvasElement
		).getContext('2d') as CanvasRenderingContext2D
		if (this.visible) {
			ctx.save()
			ctx.fillStyle = this.style.color.neg
			ctx.fill(this.axes.applyTransform(this.paths.neg))
			ctx.fillStyle = this.style.color.pos
			ctx.fill(this.axes.applyTransform(this.paths.pos))
			ctx.restore()
		}
	}
	public showTooltip(x: number): React.ReactNode {  // index (i) is actually passed instead of coordinate (x)
		const yi = this.pointAt(x)[1]
		// Popup tooltip
		return yi !== null ? (
			<span key={this.name} className={'drawingTooltips'}>
				{this.name}: {numberPower(yi as number, 2)}
			</span>
		) : undefined
	}
	public showStyle(): React.ReactElement {
		return (
			<div key={this.name}>
				<label htmlFor={'visible'}>{this.name}</label>
				<input type={'checkbox'} name={'visible'}
				       onChange={async (event) => {
					       this.visible = event.target.checked
					       await this.axes?.plot()
				       }} defaultChecked={this.visible}
				/>
				<ul>
					<li>Positive color: <input
						type={'color'} defaultValue={this.style.color.pos}
						onChange={async (event) => {
							this.style.color.pos = event.target.value
							await this.axes?.plot()
						}}
					/></li>
					<li>Negative color: <input
						type={'color'} defaultValue={this.style.color.neg}
						onChange={async (event) => {
							this.style.color.neg = event.target.value
							await this.axes?.plot()
						}}
					/></li>
				</ul>
			</div>
		)
	}
}
