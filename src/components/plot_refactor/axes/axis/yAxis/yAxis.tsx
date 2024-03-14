import React from "react"
import {axisSize} from "../../../../../utils/constants/plot"
import {AxesReal} from "../../Axes"
import {numberPower} from "../../../../../utils/functions/numberProcessing"
import {Callback} from "../../../../../utils/types/callable"
import Axis from "../Axis"

export default class yAxis extends Axis<AxesReal> {
    constructor(axes: AxesReal, name: string = '') {
        super(axes, 'y', name)
        this.scrollSpeed = 0.001
        this.metadata.delta.min = 1
        this.metadata.delta.max = 999
    }
    public init(): void {
        this.metadata.global.min = Math.min.apply(
            null, this.axes.drawings.map(drawing => drawing.global.y.min)
        )
        this.metadata.global.max = Math.max.apply(
            null, this.axes.drawings.map(drawing => drawing.global.y.max)
        )
        this.metadata.global.scale = (this.axes.bottom - this.axes.top) / (
            this.metadata.global.max - this.metadata.global.min
        )
        this.metadata.global.translate = this.axes.top - (this.axes.bottom - this.axes.top) /
            (this.metadata.global.max - this.metadata.global.min) * this.metadata.global.min
        this.metadata.local = { ...this.metadata.global }
    }
    // Coordinates transform
    public async reScale(ds: number, callback?: Callback): Promise<void> {
        // const [min, max] = [
        //     this.metadata.local.min - ds,
        //     this.metadata.local.max + ds
        // ]
        // this.metadata.local.min = Math.min(min, max)
        // this.metadata.local.max = Math.max(min, max)
        // this.metadata.local.scale = (this.axes.bottom - this.axes.top) / (
        //     this.metadata.local.max - this.metadata.local.min
        // )
        // this.metadata.local.translate = this.axes.top - (this.axes.bottom - this.axes.top) /
        //     (this.metadata.local.max - this.metadata.local.min) * this.metadata.local.min
        // this.axes.setState({
        //     transformMatrix: new DOMMatrix([
        //         (this.axes.state.axes.x as xAxisBase<any, any>).scale, 0, 0,
        //         this.scale,
        //         (this.axes.state.axes.x as xAxisBase<any, any>).translate,
        //         this.translate
        //     ])
        // }, callback)
        if (callback) callback()
    }
    public async reTranslate(dt: number, callback?: Callback): Promise<void> {
        if (callback) callback()
    }
    public coordinatesTransform(): void {
        this.metadata.local.min = Math.min.apply(
            null, this.axes.drawings.map(drawing => drawing.local.y.min)
        )
        this.metadata.local.max =  Math.max.apply(
            null, this.axes.drawings.map(drawing => drawing.local.y.max)
        )
        this.metadata.local.scale = (this.axes.bottom - this.axes.top) / (
            this.metadata.local.max - this.metadata.local.min
        )
        this.metadata.local.translate = this.axes.top - (this.axes.bottom - this.axes.top) / (
            this.metadata.local.max - this.metadata.local.min
        ) * this.metadata.local.min
    }
    // Display
    public setWindow(): void {
        super.setWindow()
        if (this.canvases.scale.ref.current && this.canvases.tooltip.ref.current) {
            this.canvases.scale.ref.current.width = axisSize.width
            this.canvases.scale.ref.current.height = this.axes.height
            this.canvases.tooltip.ref.current.width = axisSize.width
            this.canvases.tooltip.ref.current.height = this.axes.height
        }
    }
    public async showScale(): Promise<void> {
        const axesCtx = (
            this.axes.state.canvases.plot.ref.current as HTMLCanvasElement
        ).getContext('2d') as CanvasRenderingContext2D
        axesCtx.save()
        axesCtx.lineWidth = this.grid.width
        axesCtx.strokeStyle = this.grid.color
        const ctx = (
            this.canvases.scale.ref.current as HTMLCanvasElement
        ).getContext('2d') as CanvasRenderingContext2D
        ctx.save()
        ctx.clearRect(
            0, 0, (this.canvases.scale.ref.current as HTMLCanvasElement).width,
            (this.canvases.scale.ref.current as HTMLCanvasElement).height
        )
        ctx.font = `${this.font.size}px ${this.font.name}`
        const step = this.axes.height / (this.grid.amount + 1) *
            this.axes.state.canvases.plot.density
        Array(this.grid.amount).fill(0).forEach((_, index) => {
            const y = (this.grid.amount - index) * step
            // AxisBase tick
            ctx.beginPath()
            ctx.moveTo(
                (this.canvases.scale.ref.current as HTMLCanvasElement).width *
                (1 - this.axes.padding.right), y
            )
            ctx.lineTo(
                (this.canvases.scale.ref.current as HTMLCanvasElement).width *
                (0.9 - (this.axes.padding.right)), y
            )
            ctx.stroke()
            ctx.closePath()
            ctx.textAlign = 'right'
            const dyt = (-this.axes.height / this.spread - this.scale) * this.spread
            const value = numberPower(
                this.min + dyt / 2 / this.scale -
                (this.axes.height + dyt - y) / this.scale, 2
            )
            ctx.fillText(
                value, axisSize.width * 0.85, y + 4
            )
            // Grid horizontal line
            axesCtx.beginPath()
            axesCtx.moveTo(0, y)
            axesCtx.lineTo(this.axes.width, y)
            axesCtx.stroke()
            axesCtx.closePath()
        })
        ctx.restore()
        axesCtx.restore()
    }
    public async showTooltip(y: number): Promise<void> {
        // Drawing horizontal line
        const axesCtx = (
            this.axes.state.canvases.tooltip.ref.current as HTMLCanvasElement
        ).getContext('2d') as CanvasRenderingContext2D
        axesCtx.beginPath()
        axesCtx.moveTo(0, y * this.axes.state.canvases.plot.density)
        axesCtx.lineTo(this.axes.width, y * this.axes.state.canvases.plot.density)
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
        ctx.fillRect(0, y - 12.5, axisSize.width, 25)
        ctx.font = `${this.font.size}px ${this.font.name}`
        ctx.fillStyle = '#ffffff'
        // Value tooltip
        const dyt = (-this.axes.height / this.spread - this.scale) * this.spread
        const value = numberPower(
            this.min + dyt / 2 / this.scale -
            (this.axes.height + dyt - y) / this.scale, 2
        )
        ctx.fillText(value, axisSize.width * 0.05, y + 3)
        ctx.restore()
    }
    public render(): React.ReactNode {
        return this.axes.props.yAxis === false ? null :
            <>
                <canvas
                    ref={this.canvases.scale.ref}
                    className={'axes y scale'}
                    style={{
                        width: axisSize.width,
                        height: this.axes.height
                    }}
                ></canvas>
                <canvas
                    ref={this.canvases.tooltip.ref}
                    className={'axes y tooltip'}
                    style={{
                        width: axisSize.width,
                        height: this.axes.height
                    }}
                    onMouseMove={this.mouseMoveHandler}
                    onMouseOut={this.mouseOutHandler}
                    onMouseDown={this.mouseDownHandler}
                    onMouseUp={this.mouseUpHandler}
                ></canvas>
            </>
    }
}
