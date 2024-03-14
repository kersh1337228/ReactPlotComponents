import xAxisBase from "./xAxisBase"
import DateTimeRange from "../../../../../utils/classes/iterable/DateTimeRange"
import {AxesReal} from "../../Axes"
import Drawing from "../../../drawings/Drawing/Drawing";
import {TimeSeries} from "../../../../../utils/types/plotData";

export default class xAxisDateTime extends xAxisBase<DateTimeRange, AxesReal> {
	public constructor(
		axes: AxesReal, data: DateTimeRange, label: string = ''
	) {
		super(axes, data, label)
		this.scrollSpeed = 0.01
	}
	// Display
	public async showScale(): Promise<void> {
		// Parent axes context
		const axesCtx = (
			this.axes.state.canvases.plot.ref.current as HTMLCanvasElement
		).getContext('2d') as CanvasRenderingContext2D
		axesCtx.save()
		axesCtx.lineWidth = this.grid.width
		axesCtx.strokeStyle = this.grid.color
		// Axis context
		const ctx = this.canvases.scale.ref.current?.getContext('2d')
		if (ctx) {
			ctx.save()
			ctx.clearRect(
				0, 0, (this.canvases.scale.ref.current as HTMLCanvasElement).width,
				(this.canvases.scale.ref.current as HTMLCanvasElement).height
			)
			ctx.font = `${this.font.size}px ${this.font.name}`
		}
		// Drawing
		const step = this.axes.width / (this.grid.amount + 1) *
			this.axes.state.canvases.plot.density
		Array(this.grid.amount).fill(0).forEach((_, index) => {
			const i = Math.floor((
				(index + 1) * step - this.translate
			) / this.scale)
			// Axis tick
			if (ctx) {
				ctx.beginPath()
				ctx.moveTo((i + 0.55) * this.scale + this.translate, 0)
				ctx.lineTo(
					(i + 0.55) * this.scale + this.translate,
					(this.canvases.scale.ref.current as HTMLCanvasElement).height * 0.1
				)
				ctx.stroke()
				ctx.closePath()
				const text = this.data.global.at(i)?.format('%Y-%m-%d')
				ctx.textAlign = 'center'
				ctx.fillText(
					text ? text : '',
					(i + 0.55) * this.scale + this.translate,
					(this.canvases.scale.ref.current as HTMLCanvasElement).height * 0.3
				)
			}
			// Grid vertical line
			axesCtx.beginPath()
			axesCtx.moveTo((i + 0.55) * this.scale + this.translate, 0)
			axesCtx.lineTo((i + 0.55) * this.scale + this.translate, this.axes.height)
			axesCtx.stroke()
			axesCtx.closePath()
		})
		ctx?.restore()
		axesCtx.restore()
	}
	public async showTooltip(x: number): Promise<void> {
		if (this.axes.props.xAxis) {
			const i = Math.floor((
				x * this.axes.state.canvases.plot.density - this.translate
			) / this.scale)
			// Drawing vertical line
			const axesCtx = (
				this.axes.state.canvases.tooltip.ref.current as HTMLCanvasElement
			).getContext('2d') as CanvasRenderingContext2D
			axesCtx.beginPath()
			axesCtx.moveTo((i + 0.55) * this.scale + this.translate, 0)
			axesCtx.lineTo((i + 0.55) * this.scale + this.translate, this.axes.height)
			axesCtx.stroke()
			axesCtx.closePath()
			// Drawing tooltip
			const ctx = this.canvases.scale.ref.current?.getContext('2d')
			if (ctx) {
				ctx.clearRect(
					0, 0, (this.canvases.tooltip.ref.current as HTMLCanvasElement).width,
					(this.canvases.tooltip.ref.current as HTMLCanvasElement).height
				)
				ctx.save()
				ctx.fillStyle = '#323232'
				ctx.fillRect(Math.min(
					this.axes.width - 60,
					Math.max(0, (i + 0.55) * this.scale + this.translate - 30)
				), 0, 60, 25)
				const text = this.data.global.at(i)?.format('%Y-%m-%d')
				ctx.textAlign = 'center'
				ctx.font = `${this.font.size}px ${this.font.name}`
				ctx.fillStyle = '#ffffff'
				ctx.fillText(
					text ? text : '',
					Math.min(
						this.axes.width - 30,
						Math.max(30, (i + 0.55) * this.scale + this.translate)
					),
					(this.canvases.tooltip.ref.current as HTMLCanvasElement).height * 0.3
				)
				ctx.restore()
			}
		}
	}
}
