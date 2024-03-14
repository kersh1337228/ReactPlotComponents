import xAxisBase from "./xAxisBase"
import {AxesReal} from "../../Axes"
import NumberRange from "../../../../../utils/classes/iterable/NumberRange"
import {numberPower} from "../../../../../utils/functions/numberProcessing"

export default class xAxis extends xAxisBase<NumberRange, AxesReal> {
    public constructor(
        axes: AxesReal, data: NumberRange, label: string = ''
    ) {
        super(axes, data, label)
        this.scrollSpeed = 1
        const delta = (data.at(-1) as number) - (data.at(0) as number)
        this.metadata.delta.min = Math.min(5, delta)
        this.metadata.delta.max = Math.min(100, delta)
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
        const step = this.axes.width / (this.grid.amount + 1) / this.scale
        Array(this.grid.amount).fill(0).forEach((_, index) => {
            const x = (index + 1) / (this.grid.amount + 1) * this.axes.width
            // Axis tick
            if (ctx) {
                ctx.beginPath()
                ctx.moveTo(x, 0)
                ctx.lineTo(x, (this.canvases.scale.ref.current?.height as number) * 0.1)
                ctx.stroke()
                ctx.closePath()
                ctx.textAlign = 'center'
                ctx.fillText(numberPower(
                    (index + 1) * step + this.translate * (
                        this.spread / this.axes.paddedWidth - 1 / this.scale
                    ) + this.min - this.axes.padding.right *
                    this.axes.width / this.scale, 2
                ), x, (this.canvases.scale.ref.current?.height as number) * 0.3)
            }
            // Grid vertical line
            axesCtx.beginPath()
            axesCtx.moveTo(x, 0)
            axesCtx.lineTo(x, this.axes.height)
            axesCtx.stroke()
            axesCtx.closePath()
        })
        ctx?.restore()
        axesCtx.restore()
    }
    public async showTooltip(x: number): Promise<void> {
        if (this.axes.props.xAxis) {
            const i = (this.data.global as NumberRange).indexOf(
                (x - this.translate) / this.scale
            ) as number
            const xi = this.data.global.at(i) as number
            // Drawing vertical line
            const axesCtx = (
                this.axes.state.canvases.tooltip.ref.current as HTMLCanvasElement
            ).getContext('2d') as CanvasRenderingContext2D
            axesCtx.beginPath()
            axesCtx.moveTo(xi * this.scale + this.translate, 0)
            axesCtx.lineTo(xi * this.scale + this.translate, this.axes.height)
            axesCtx.stroke()
            axesCtx.closePath()
            // Drawing tooltip
            const ctx = ((
                this.canvases.tooltip.ref.current as HTMLCanvasElement
            ).getContext('2d') as CanvasRenderingContext2D)
            ctx.clearRect(
                0, 0, (this.canvases.tooltip.ref.current as HTMLCanvasElement).width,
                (this.canvases.tooltip.ref.current as HTMLCanvasElement).height
            )
            ctx.save()
            ctx.fillStyle = '#323232'
            ctx.fillRect(Math.min(
                this.axes.width - 30,
                Math.max(0, xi * this.scale + this.translate - 15)
            ), 0, 30, 25)
            ctx.font = `${this.font.size}px ${this.font.name}`
            ctx.fillStyle = '#ffffff'
            const text = this.data.global.format('%.2f').at(i)
            ctx.textAlign = 'center'
            ctx.fillText(
                text ? text : '',
                Math.min(
                    this.axes.width - 15,
                    Math.max(15, xi * this.scale + this.translate)
                ),
                (this.canvases.tooltip.ref.current as HTMLCanvasElement).height * 0.3
            )
            ctx.restore()
        }
    }
}
