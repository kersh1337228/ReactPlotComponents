import Axis from "../Axis"
import React from "react"
import {axisSize} from "../../../../../utils/constants/plot"
import {AxesReal} from "../../Axes"
import NumberRange from "../../../../../utils/classes/iterable/NumberRange"
import DateTimeRange from "../../../../../utils/classes/iterable/DateTimeRange"
import {truncate} from "../../../../../utils/functions/numberProcessing"
import {Callback} from "../../../../../utils/types/callable"
import {AxesGroupReal} from "../../../axesGroup/AxesGroup"

export default abstract class xAxisBase<
	T extends NumberRange | DateTimeRange,
	U extends AxesReal | AxesGroupReal
> extends Axis<U> {
    public data: { global: T, local: T}
    protected constructor(axes: U, data: T, name: string = '') {
        super(axes, 'x', name)
        this.data = { global: data, local: data }
    }
	public init(): void {
		// Global
		this.metadata.global.min = Math.min.apply(
			null, this.axes.drawings.map(drawing => drawing.global.x.min)
		)
		this.metadata.global.max = Math.max.apply(
			null, this.axes.drawings.map(drawing => drawing.global.x.max)
		)
		this.metadata.global.scale = (this.axes.right - this.axes.left) / (
			this.metadata.global.max - this.metadata.global.min
		)
		this.metadata.global.translate = this.axes.left - (this.axes.right - this.axes.left) /
			(this.metadata.global.max - this.metadata.global.min) * this.metadata.global.min
		// Local
		this.metadata.local = { ...this.metadata.global }
		if (this.metadata.global.max > this.metadata.delta.max) {
			this.metadata.local.min = this.metadata.global.max - this.metadata.delta.max
			this.metadata.delta.scale = (this.axes.right - this.axes.left) * (
				1 / this.metadata.delta.max -
				1 / (this.metadata.global.max - this.metadata.global.min)
			)
			this.metadata.delta.translate = (this.axes.right - this.axes.left) * (
				this.metadata.global.min / (this.metadata.global.max - this.metadata.global.min) -
				this.metadata.local.min / this.metadata.delta.max
			)
		}
	}
    // Coordinates transform
	public async reScale(ds: number, callback?: Callback): Promise<void> {
		this.metadata.delta.scale = truncate(
			this.metadata.delta.scale + ds,
			(this.axes.right - this.axes.left) * (
				1 / this.metadata.delta.max -
				1 / (this.metadata.global.max - this.metadata.global.min)
			),
			(this.axes.right - this.axes.left) * (
				1 / this.metadata.delta.min -
				1 / (this.metadata.global.max - this.metadata.global.min)
			)
		)
		// Scale
		this.metadata.local.min = truncate(
			this.metadata.local.max - 1 / (1 / (
				this.metadata.global.max - this.metadata.global.min
			) + this.metadata.delta.scale / (this.axes.right - this.axes.left)),
			this.metadata.global.min,
			this.metadata.global.max - this.metadata.delta.min
		)
		// Translate
		const dt = this.axes.left - this.metadata.local.min * this.scale - this.translate
		this.metadata.delta.translate += dt
		const multiplier = (this.axes.right - this.axes.left) / (
			this.axes.right - this.axes.left + this.metadata.delta.scale *
			(this.metadata.global.max - this.metadata.global.min)
		)
		const offset = multiplier * this.metadata.delta.translate / this.metadata.global.scale
		this.metadata.local.max = truncate(
			multiplier * this.metadata.global.max - offset,
			this.metadata.global.min + this.metadata.delta.min,
			this.metadata.global.max
		)
		this.metadata.local.min = truncate(
			multiplier * this.metadata.global.min - offset,
			this.metadata.global.min,
			this.metadata.global.max - this.metadata.delta.min
		)
		// Applying changes
		await this.axes.coordinatesTransform({
			start: this.metadata.local.min / this.metadata.global.max,
			end: this.metadata.local.max / this.metadata.global.max,
		}, callback)
	}
	public async reTranslate(dt: number, callback?: Callback): Promise<void> {
		// Translate
		this.metadata.delta.translate += dt
		const multiplier = (this.axes.right - this.axes.left) / (
			this.axes.right - this.axes.left + this.metadata.delta.scale *
			(this.metadata.global.max - this.metadata.global.min)
		)
		let offset = multiplier * this.metadata.delta.translate /
			this.metadata.global.scale
		// Correction to be inside of bounds
		this.metadata.delta.translate -= (Math.min(
			0, this.metadata.global.max * (1 - multiplier) + offset
		) + Math.max(
			0, this.metadata.global.min * (1 - multiplier) + offset
		)) * this.scale
		// Applying
		offset = multiplier * this.metadata.delta.translate /
			this.metadata.global.scale
		this.metadata.local.max = truncate(
			multiplier * this.metadata.global.max - offset,
			this.metadata.global.min + this.metadata.delta.min,
			this.metadata.global.max
		)
		this.metadata.local.min = truncate(
			multiplier * this.metadata.global.min - offset,
			this.metadata.global.min,
			this.metadata.global.max - this.metadata.delta.min
		)
		await this.axes.coordinatesTransform({
			start: this.metadata.local.min / this.metadata.global.max,
			end: this.metadata.local.max / this.metadata.global.max,
		}, callback)
	}
	public coordinatesTransform(): void {
        this.data.local = this.data.global.slice(
            Math.floor(this.data.global.length * this.axes.state.dataRange.start),
            Math.ceil(this.data.global.length * this.axes.state.dataRange.end)
        ) as T
    }
    // Display
    public setWindow(): void {
	    super.setWindow()
        if (this.canvases.scale.ref.current && this.canvases.tooltip.ref.current) {
            this.canvases.scale.ref.current.width = this.axes.width
            this.canvases.scale.ref.current.height = axisSize.height
            this.canvases.tooltip.ref.current.width = this.axes.width
            this.canvases.tooltip.ref.current.height = axisSize.height
        }
    }
    public render(): React.ReactNode {
        return this.axes.props.xAxis ? <>
            <canvas
                ref={this.canvases.scale.ref}
                className={'axes x scale'}
                style={{ width: this.axes.width, height: axisSize.height }}
            ></canvas>
            <canvas
                ref={this.canvases.tooltip.ref}
                className={'axes x tooltip'}
                style={{ width: this.axes.width, height: axisSize.height }}
                onMouseMove={this.mouseMoveHandler}
                onMouseOut={this.mouseOutHandler}
                onMouseDown={this.mouseDownHandler}
                onMouseUp={this.mouseUpHandler}
            ></canvas>
        </> : null
    }
}
