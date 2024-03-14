import Drawing from "../Drawing/Drawing"
import {PointGeometrical, Quotes} from "../../../../utils/types/plotData"
import {round} from "../../../../utils/functions/numberProcessing"
import {DataRange} from "../../../../utils/types/display"
import xAxisBase from "../../axes/axis/xAxis/xAxisBase"
import './Financial.css'

export interface CandlePath {
	wick: { neg: Path2D, pos: Path2D },
	body: { neg: Path2D, pos: Path2D }
}
export interface CandleStyle { color: { pos: string, neg: string }, width: number }

export default class Candle extends Drawing<Quotes, CandlePath, CandleStyle> {
	public constructor(
		data: Quotes[], name: string = '',
		style: CandleStyle = { color: { pos: '#53e9b5', neg: '#da2c4d' }, width: 1 }
	) {
		super({
			data, x: {
				min: 0, max: data.length
			}, y: {
				min: Math.min.apply(null, Array.from(
					data, obj => obj.low
				).filter(low => low !== null) as number[]),
				max: Math.max.apply(null, Array.from(
					data, obj => obj.high
				).filter(high => high !== null) as number[])
			}
		}, {
			wick: { neg: new Path2D(), pos: new Path2D() },
			body: { neg: new Path2D(), pos: new Path2D() }
		}, name, style)
		// Pre-drawing paths
		data.forEach((q, i) => {
			const {open, high, low, close} = q
			if (close !== null) {
				const [wick, body] = [new Path2D(), new Path2D()]
				// Candle wick
				wick.moveTo(i + 0.55, low as number)
				wick.lineTo(i + 0.55, high as number)
				wick.closePath()
				// Candle body
				body.rect(i + 0.1, open as number, 0.9, close - (open as number))
				// Appending
				const type = close > (open as number) ? 'pos' : 'neg'
				this.paths.wick[type].addPath(wick)
				this.paths.body[type].addPath(body)
			}
		})
	}
	public pointAt(i: number): PointGeometrical {
		return [i + 0.55, this.global.data[i].close]
	}
	public async coordinatesTransform(dataRange: DataRange): Promise<void> {
		super.coordinatesTransform(dataRange)
		this.local.y.min = Math.min.apply(null, Array.from(
			this.local.data, obj => obj.low as number
		).filter(low => low !== null))
		this.local.y.max = Math.max.apply(null, Array.from(
			this.local.data, obj => obj.high as number
		).filter(high => high !== null))
	}
	public async plot(): Promise<void> {
		const ctx = (
			this.axes.state.canvases.plot.ref.current as HTMLCanvasElement
		).getContext('2d') as CanvasRenderingContext2D
		if (this.visible) {
			ctx.save()
			ctx.fillStyle = this.style.color.neg
			ctx.fill(this.axes.applyTransform(this.paths.body.neg))
			ctx.fillStyle = this.style.color.pos
			ctx.fill(this.axes.applyTransform(this.paths.body.pos))
			ctx.lineWidth = this.style.width
			ctx.strokeStyle = this.style.color.neg
			ctx.stroke(this.axes.applyTransform(this.paths.wick.neg))
			ctx.strokeStyle = this.style.color.pos
			ctx.stroke(this.axes.applyTransform(this.paths.wick.pos))
			ctx.restore()
		}
	}
	public showTooltip(x: number): React.ReactNode {
		const i = Math.floor((
			x * this.axes.state.canvases.plot.density -
			(this.axes.state.axes.x as xAxisBase<any, any>).translate
		) / (this.axes.state.axes.x as xAxisBase<any, any>).scale)
		const {open, high, low, close} = this.global.data[i]
		const type = (close as number) > (open as number) ? 'pos' : 'neg'
		return close !== null ? (
			<div key={this.name} className={'drawingTooltips'}>
				<span className={'marketData'}>open: <span className={`value ${type}`}>
					{round(open as number, 2)}
				</span></span>
				<span className={'marketData'}>high: <span className={`value ${type}`}>
					{round(high as number, 2)}
				</span></span>
				<span className={'marketData'}>low: <span className={`value ${type}`}>
					{round(low as number, 2)}
				</span></span>
				<span className={'marketData'}>close: <span className={`value ${type}`}>
					{round(close, 2)}
				</span></span>
			</div>
		) : undefined
	}
	public showStyle(): React.ReactElement {
		return (
			<div key={this.name}>
				<label htmlFor={'visible'}>{this.name}</label>
				<input type={'checkbox'} name={'visible'}
				       onChange={event => {
					       this.visible = event.target.checked
					       this.axes.plot()
				       }} defaultChecked={this.visible}
				/>
				<ul>
					<li>Positive color: <input
						type={'color'} defaultValue={this.style.color.pos}
						onChange={event => {
							this.style.color.pos = event.target.value
							this.axes.plot()
						}}
					/></li>
					<li>Negative color: <input
						type={'color'} defaultValue={this.style.color.neg}
						onChange={event => {
							this.style.color.neg = event.target.value
							this.axes.plot()
						}}
					/></li>
				</ul>
			</div>
		)
	}
}
